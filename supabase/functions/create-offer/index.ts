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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
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

    const { projectId, amount, message, validDays = 7 } = await req.json();

    if (!projectId || !amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Projekt-ID und Betrag erforderlich' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`💼 Creating offer for project ${projectId} by contractor ${user.id}`);

    // Verify contractor has purchased the lead
    const { data: match, error: matchError } = await supabaseClient
      .from('matches')
      .select('lead_purchased')
      .eq('project_id', projectId)
      .eq('contractor_id', user.id)
      .single();

    if (matchError || !match) {
      return new Response(
        JSON.stringify({ error: 'Du hast diesen Lead nicht gekauft' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!match.lead_purchased) {
      return new Response(
        JSON.stringify({ error: 'Du musst den Lead kaufen, bevor du ein Angebot erstellen kannst' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if project is still open
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('status, customer_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return new Response(
        JSON.stringify({ error: 'Projekt nicht gefunden' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (project.status !== 'open') {
      return new Response(
        JSON.stringify({ error: 'Projekt ist nicht mehr offen für Angebote' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate valid_until date
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validDays);

    // Create or update offer
    const { data: offer, error: offerError } = await supabaseClient
      .from('offers')
      .upsert({
        project_id: projectId,
        contractor_id: user.id,
        amount: amount,
        message: message || '',
        status: 'pending',
        valid_until: validUntil.toISOString()
      }, {
        onConflict: 'project_id,contractor_id'
      })
      .select()
      .single();

    if (offerError) {
      console.error('❌ Failed to create offer:', offerError);
      throw offerError;
    }

    // Create notification for customer
    const { error: notificationError } = await supabaseClient
      .from('notifications')
      .insert({
        handwerker_id: project.customer_id,
        type: 'new_offer',
        title: 'Neues Angebot erhalten',
        body: `Ein Handwerker hat ein Angebot über €${amount} für dein Projekt abgegeben.`,
        data: {
          project_id: projectId,
          offer_id: offer.id,
          amount: amount
        }
      });

    if (notificationError) {
      console.error('❌ Failed to create notification:', notificationError);
      // Don't fail the whole operation
    }

    console.log(`✅ Offer created successfully: ${offer.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        offer: offer,
        message: 'Angebot erfolgreich erstellt'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error creating offer:', error);
    const errorMessage = error instanceof Error ? error.message : 'Interner Fehler';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
