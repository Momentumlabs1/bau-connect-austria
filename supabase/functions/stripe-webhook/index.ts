import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    if (!signature) {
      throw new Error('No signature provided');
    }

    // Verify webhook signature
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret || '');
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Webhook signature verification failed:', errMessage);
      return new Response(
        JSON.stringify({ error: 'Webhook signature verification failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Webhook event received:', event.type);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle payment_intent.succeeded event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Payment succeeded:', paymentIntent.id);

      // Update purchase status
      const { error: updateError } = await supabaseAdmin
        .from('lead_purchases')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('stripe_payment_intent_id', paymentIntent.id);

      if (updateError) {
        console.error('Error updating purchase:', updateError);
        throw updateError;
      }

      console.log('Purchase marked as completed');
    }

    // Handle payment_intent.payment_failed event
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Payment failed:', paymentIntent.id);

      const { error: updateError } = await supabaseAdmin
        .from('lead_purchases')
        .update({
          status: 'failed',
        })
        .eq('stripe_payment_intent_id', paymentIntent.id);

      if (updateError) {
        console.error('Error updating failed purchase:', updateError);
      }
    }

    // Handle checkout.session.completed (Wallet Recharge)
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Nur WALLET_RECHARGE verarbeiten
      if (session.metadata?.type === 'WALLET_RECHARGE') {
        const userId = session.metadata.userId;
        const amount = parseFloat(session.metadata.amount);
        
        console.log(`💰 Processing wallet recharge for user ${userId}, amount: €${amount}`);
        
        // Aktuelle Balance holen
        const { data: contractor } = await supabaseAdmin
          .from('contractors')
          .select('wallet_balance')
          .eq('id', userId)
          .single();
        
        if (contractor) {
          const newBalance = Number(contractor.wallet_balance) + amount;
          
          // Wallet-Balance aktualisieren
          await supabaseAdmin
            .from('contractors')
            .update({ wallet_balance: newBalance })
            .eq('id', userId);
          
          // Transaktion loggen
          await supabaseAdmin
            .from('transactions')
            .insert({
              handwerker_id: userId,
              type: 'WALLET_RECHARGE',
              amount: amount,
              balance_after: newBalance,
              description: `Wallet-Aufladung via Stripe Checkout`,
              metadata: { 
                stripe_session_id: session.id,
                payment_status: session.payment_status 
              }
            });
          
          console.log(`✅ Wallet recharged. New balance: €${newBalance}`);
        }
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
