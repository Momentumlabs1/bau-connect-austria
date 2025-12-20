import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  logStep('🚀 Webhook function invoked', { method: req.method });
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    logStep('🔑 Environment check', {
      hasStripeKey: !!stripeKey,
      hasWebhookSecret: !!webhookSecret,
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey
    });

    if (!stripeKey || !webhookSecret) {
      throw new Error('Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    const signature = req.headers.get('stripe-signature');
    const body = await req.text();
    
    logStep('📝 Request details', {
      hasSignature: !!signature,
      bodyLength: body.length
    });

    if (!signature) {
      throw new Error('No stripe-signature header provided');
    }

    // Verify webhook signature
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep('✅ Signature verified successfully', { eventType: event.type, eventId: event.id });
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : 'Unknown error';
      logStep('❌ Signature verification failed', { error: errMessage });
      return new Response(
        JSON.stringify({ error: 'Webhook signature verification failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl ?? '', supabaseServiceKey ?? '');

    // Handle payment_intent.succeeded event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      logStep('💳 Payment Intent succeeded', { 
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      });

      // Update purchase status
      const { data: updateData, error: updateError } = await supabaseAdmin
        .from('lead_purchases')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('stripe_payment_intent_id', paymentIntent.id)
        .select();

      if (updateError) {
        logStep('❌ Error updating lead_purchases', { error: updateError });
        throw updateError;
      }

      logStep('✅ Lead purchase marked as completed', { updatedRows: updateData?.length || 0 });
    }

    // Handle payment_intent.payment_failed event
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      logStep('❌ Payment Intent failed', { paymentIntentId: paymentIntent.id });

      const { error: updateError } = await supabaseAdmin
        .from('lead_purchases')
        .update({
          status: 'failed',
        })
        .eq('stripe_payment_intent_id', paymentIntent.id);

      if (updateError) {
        logStep('❌ Error updating failed purchase', { error: updateError });
      } else {
        logStep('✅ Lead purchase marked as failed');
      }
    }

    // Handle checkout.session.completed (Wallet Recharge)
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      logStep('🛒 Checkout session completed', {
        sessionId: session.id,
        paymentStatus: session.payment_status,
        metadata: session.metadata
      });
      
      // Nur WALLET_RECHARGE verarbeiten
      if (session.metadata?.type === 'WALLET_RECHARGE') {
        const userId = session.metadata.userId;
        const amount = parseFloat(session.metadata.amount); // Voller Betrag aus Metadata!
        const voucherCode = session.metadata.voucherCode || '';
        const discountApplied = parseFloat(session.metadata.discountApplied || '0');
        
        logStep('💰 Processing wallet recharge', {
          userId,
          amount,
          voucherCode: voucherCode || 'none',
          discountApplied
        });
        
        // Aktuelle Balance holen
        const { data: contractor, error: fetchError } = await supabaseAdmin
          .from('contractors')
          .select('wallet_balance, company_name')
          .eq('id', userId)
          .single();
        
        if (fetchError) {
          logStep('❌ Error fetching contractor', { error: fetchError });
          throw fetchError;
        }
        
        if (contractor) {
          const currentBalance = Number(contractor.wallet_balance) || 0;
          const newBalance = currentBalance + amount;
          
          logStep('💵 Updating wallet balance', {
            companyName: contractor.company_name,
            currentBalance,
            addingAmount: amount,
            newBalance
          });
          
          // Wallet-Balance aktualisieren
          const { error: updateError } = await supabaseAdmin
            .from('contractors')
            .update({ wallet_balance: newBalance })
            .eq('id', userId);
          
          if (updateError) {
            logStep('❌ Error updating wallet balance', { error: updateError });
            throw updateError;
          }
          
          // Transaktion loggen
          const description = voucherCode 
            ? `Wallet-Aufladung via Stripe (Code: ${voucherCode}, Rabatt: €${discountApplied.toFixed(2)})`
            : `Wallet-Aufladung via Stripe Checkout`;
            
          const { error: txError } = await supabaseAdmin
            .from('transactions')
            .insert({
              handwerker_id: userId,
              type: 'WALLET_RECHARGE',
              amount: amount,
              balance_after: newBalance,
              description: description,
              metadata: { 
                stripe_session_id: session.id,
                payment_status: session.payment_status,
                voucher_code: voucherCode,
                discount_applied: discountApplied
              }
            });
          
          if (txError) {
            logStep('⚠️ Error logging transaction (non-critical)', { error: txError });
          } else {
            logStep('✅ Transaction logged successfully');
          }
          
          // Gutschein-Verwendung erhöhen (falls verwendet)
          if (voucherCode) {
            const { data: promo } = await supabaseAdmin
              .from('promo_codes')
              .select('used_count')
              .eq('code', voucherCode)
              .single();
            
            if (promo) {
              await supabaseAdmin
                .from('promo_codes')
                .update({ used_count: promo.used_count + 1 })
                .eq('code', voucherCode);
              logStep('✅ Voucher usage count updated');
            }
          }
          
          logStep('🎉 Wallet recharge complete!', {
            newBalance,
            paidAmount: (amount - discountApplied).toFixed(2)
          });
        } else {
          logStep('⚠️ No contractor found for userId', { userId });
        }
      } else {
        logStep('ℹ️ Checkout session type not WALLET_RECHARGE, skipping', {
          type: session.metadata?.type || 'none'
        });
      }
    }

    logStep('✅ Webhook processed successfully');

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    logStep('❌ Webhook error', { error: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
