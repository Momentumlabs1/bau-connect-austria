import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0?target=deno";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Authentifizierung prüfen
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Nicht authentifiziert");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("Nicht authentifiziert");

    const { amount, voucherCode } = await req.json();

    // Validierung: Mindestbetrag €50
    if (!amount || amount < 50) {
      throw new Error("Mindestbetrag: €50");
    }

    let finalAmount = amount;
    let discountApplied = 0;
    let voucherInfo = null;

    // Gutschein-Code prüfen (falls vorhanden)
    if (voucherCode) {
      const { data: promo } = await supabaseClient
        .from('promo_codes')
        .select('*')
        .eq('code', voucherCode.toUpperCase())
        .eq('active', true)
        .single();

      if (promo) {
        // Gültigkeit prüfen
        const now = new Date();
        const validFrom = promo.valid_from ? new Date(promo.valid_from) : null;
        const validUntil = promo.valid_until ? new Date(promo.valid_until) : null;
        
        const isValid = 
          (!validFrom || now >= validFrom) &&
          (!validUntil || now <= validUntil) &&
          (!promo.max_uses || promo.used_count < promo.max_uses);

        if (isValid && promo.discount_type === 'percentage') {
          discountApplied = (amount * promo.discount_value) / 100;
          finalAmount = amount - discountApplied;
          voucherInfo = {
            code: promo.code,
            discount_percentage: promo.discount_value,
            original_amount: amount,
            discount_amount: discountApplied,
            final_amount: finalAmount
          };
          
          console.log(`💎 Voucher applied: ${promo.code} (${promo.discount_value}% off) - Final: €${finalAmount}`);
        }
      }
    }

    console.log(`💳 Creating wallet checkout for user ${user.id}, amount: €${amount}, final: €${finalAmount}`);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Stripe Customer prüfen/erstellen
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Checkout Session erstellen
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{
        price_data: {
          currency: 'eur',
          unit_amount: Math.round(finalAmount * 100), // Cents - reduzierter Betrag
          product_data: { 
            name: voucherInfo 
              ? `BauConnect Wallet-Aufladung (${voucherInfo.discount_percentage}% Rabatt)`
              : `BauConnect Wallet-Aufladung`,
            description: voucherInfo
              ? `€${amount} Guthaben - Gutschein: ${voucherInfo.code} (${voucherInfo.discount_percentage}% Rabatt)`
              : `€${amount} Guthaben`
          }
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.get("origin")}/wallet-success?amount=${amount}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/handwerker/dashboard`,
      metadata: {
        type: 'WALLET_RECHARGE',
        userId: user.id,
        amount: amount.toString(), // Voller Betrag für Wallet (nicht reduziert!)
        voucherCode: voucherCode || '',
        discountApplied: discountApplied.toString()
      }
    });

    console.log(`✅ Checkout session created: ${session.id}`);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('❌ Error creating checkout:', error);
    const errorMessage = error instanceof Error ? error.message : 'Interner Fehler';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
