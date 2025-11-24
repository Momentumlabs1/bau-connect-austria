import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    const { leadId } = await req.json();

    if (!leadId) {
      throw new Error('Lead ID is required');
    }

    // Check if lead exists and is not already purchased by this user
    const { data: existingPurchase } = await supabaseClient
      .from('lead_purchases')
      .select('*')
      .eq('lead_id', leadId)
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .single();

    if (existingPurchase) {
      throw new Error('Lead already purchased');
    }

    // Get lead details
    const { data: lead, error: leadError } = await supabaseClient
      .from('projects')
      .select('title, city')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      throw new Error('Lead not found');
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 500, // 5€ in cents
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        leadId,
        userId: user.id,
        leadTitle: lead.title,
        leadCity: lead.city,
      },
    });

    // Store pending purchase in database
    await supabaseClient.from('lead_purchases').insert({
      lead_id: leadId,
      user_id: user.id,
      stripe_payment_intent_id: paymentIntent.id,
      amount: 500,
      status: 'pending',
    });

    console.log('Payment intent created:', paymentIntent.id);

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating payment intent:', error);
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
