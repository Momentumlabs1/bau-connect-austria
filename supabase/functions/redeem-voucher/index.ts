import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Keine Authentifizierung' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Ungültige Authentifizierung' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { code, amount } = await req.json();

    if (!code || typeof code !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Gutschein-Code erforderlich' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🎟️ Redeeming voucher: ${code} for user: ${user.id}`);

    // Check if promo code exists and is valid
    const { data: promoCode, error: promoError } = await supabaseClient
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('active', true)
      .single();

    if (promoError || !promoCode) {
      console.error('❌ Promo code not found:', promoError);
      return new Response(
        JSON.stringify({ error: 'Ungültiger Gutschein-Code' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if promo code is expired
    if (promoCode.valid_until && new Date(promoCode.valid_until) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Gutschein ist abgelaufen' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if promo code has reached max uses
    if (promoCode.max_uses && promoCode.used_count >= promoCode.max_uses) {
      return new Response(
        JSON.stringify({ error: 'Gutschein wurde bereits zu oft verwendet' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get contractor profile
    const { data: contractor, error: contractorError } = await supabaseClient
      .from('contractors')
      .select('wallet_balance')
      .eq('id', user.id)
      .single();

    if (contractorError || !contractor) {
      console.error('❌ Contractor not found:', contractorError);
      return new Response(
        JSON.stringify({ error: 'Handwerker-Profil nicht gefunden' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate discount amount
    let discountAmount = 0;
    let discountPercentage = 0;
    
    if (promoCode.discount_type === 'fixed') {
      discountAmount = promoCode.discount_value;
    } else if (promoCode.discount_type === 'percentage') {
      discountPercentage = promoCode.discount_value;
      // Bei 100% Rabatt: gewünschten Betrag gutschreiben
      if (discountPercentage === 100 && amount) {
        discountAmount = amount;
      } else {
        discountAmount = 50; // Default bonus für Teil-Rabatte
      }
    }

    const newBalance = Number(contractor.wallet_balance) + discountAmount;

    // Update contractor wallet balance
    const { error: updateError } = await supabaseClient
      .from('contractors')
      .update({ wallet_balance: newBalance })
      .eq('id', user.id);

    if (updateError) {
      console.error('❌ Failed to update wallet:', updateError);
      throw updateError;
    }

    // Create transaction record
    const { error: transactionError } = await supabaseClient
      .from('transactions')
      .insert({
        handwerker_id: user.id,
        type: 'WALLET_RECHARGE',
        amount: discountAmount,
        balance_after: newBalance,
        description: `Gutschein eingelöst: ${code}`,
        metadata: { promo_code_id: promoCode.id, code: code }
      });

    if (transactionError) {
      console.error('❌ Failed to create transaction:', transactionError);
      // Don't fail the whole operation, wallet was already updated
    }

    // Increment promo code usage
    const { error: incrementError } = await supabaseClient
      .from('promo_codes')
      .update({ used_count: promoCode.used_count + 1 })
      .eq('id', promoCode.id);

    if (incrementError) {
      console.error('❌ Failed to increment usage:', incrementError);
      // Don't fail the whole operation
    }

    console.log(`✅ Voucher redeemed successfully. New balance: €${newBalance}`);

    return new Response(
      JSON.stringify({
        success: true,
        amount: discountAmount,
        discountPercentage: discountPercentage,
        newBalance: newBalance,
        message: `Gutschein erfolgreich eingelöst! €${discountAmount} wurden deinem Guthaben hinzugefügt.`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error redeeming voucher:', error);
    const errorMessage = error instanceof Error ? error.message : 'Interner Fehler';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
