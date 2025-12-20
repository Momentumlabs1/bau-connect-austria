import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[VERIFY-WALLET-RECHARGE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!stripeKey || !supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      throw new Error("Missing required environment variables");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Nicht authentifiziert");

    const token = authHeader.replace("Bearer ", "");

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("Nicht authentifiziert");

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("sessionId fehlt");

    logStep("Start", { userId: user.id, sessionId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    logStep("Session retrieved", {
      payment_status: session.payment_status,
      mode: session.mode,
      metadata: session.metadata,
    });

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ ok: false, status: session.payment_status }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    if (session.metadata?.type !== "WALLET_RECHARGE") {
      throw new Error("Diese Session ist keine Wallet-Aufladung");
    }

    if (session.metadata?.userId !== user.id) {
      throw new Error("Session gehört nicht zu diesem Nutzer");
    }

    const amount = Number(session.metadata?.amount || 0);
    const voucherCode = String(session.metadata?.voucherCode || "");
    const discountApplied = Number(session.metadata?.discountApplied || 0);

    if (!amount || amount <= 0) throw new Error("Ungültiger Betrag in Session-Metadata");

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Idempotenz: bereits gebucht?
    const { data: existingTx } = await supabaseAdmin
      .from("transactions")
      .select("id, balance_after")
      .eq("handwerker_id", user.id)
      .eq("type", "WALLET_RECHARGE")
      .contains("metadata", { stripe_session_id: session.id })
      .maybeSingle();

    if (existingTx) {
      logStep("Already processed", { transactionId: existingTx.id });
      return new Response(
        JSON.stringify({ ok: true, newBalance: existingTx.balance_after, alreadyProcessed: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const { data: contractor, error: contractorError } = await supabaseAdmin
      .from("contractors")
      .select("wallet_balance")
      .eq("id", user.id)
      .maybeSingle();

    if (contractorError) throw contractorError;

    const currentBalance = Number(contractor?.wallet_balance) || 0;
    const newBalance = currentBalance + amount;

    const { error: updateError } = await supabaseAdmin
      .from("contractors")
      .update({ wallet_balance: newBalance })
      .eq("id", user.id);

    if (updateError) throw updateError;

    const description = voucherCode
      ? `Wallet-Aufladung via Stripe (Code: ${voucherCode}, Rabatt: €${discountApplied.toFixed(2)})`
      : `Wallet-Aufladung via Stripe Checkout`;

    const { error: txError } = await supabaseAdmin.from("transactions").insert({
      handwerker_id: user.id,
      type: "WALLET_RECHARGE",
      amount,
      balance_after: newBalance,
      description,
      metadata: {
        stripe_session_id: session.id,
        payment_status: session.payment_status,
        voucher_code: voucherCode,
        discount_applied: discountApplied,
      },
    });

    if (txError) {
      // Balance ist schon aktualisiert, daher nur loggen
      logStep("Transaction insert failed (non-fatal)", { error: txError });
    }

    // Gutschein-Nutzung erhöhen (falls verwendet)
    if (voucherCode) {
      const { data: promo } = await supabaseAdmin
        .from("promo_codes")
        .select("used_count")
        .eq("code", voucherCode)
        .maybeSingle();

      if (promo) {
        await supabaseAdmin
          .from("promo_codes")
          .update({ used_count: Number(promo.used_count || 0) + 1 })
          .eq("code", voucherCode);
      }
    }

    logStep("Completed", { currentBalance, amount, newBalance });

    return new Response(
      JSON.stringify({ ok: true, newBalance }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message });
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
