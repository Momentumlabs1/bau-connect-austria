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

    const { offerId, action } = await req.json();

    if (!offerId || !action || !['accept', 'reject'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Angebots-ID und Aktion (accept/reject) erforderlich' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📋 Processing offer ${offerId}: ${action} by user ${user.id}`);

    // Get offer details
    const { data: offer, error: offerError } = await supabaseClient
      .from('offers')
      .select('*, projects!inner(customer_id, status)')
      .eq('id', offerId)
      .single();

    if (offerError || !offer) {
      console.error('❌ Offer not found:', offerError);
      return new Response(
        JSON.stringify({ error: 'Angebot nicht gefunden' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is the project owner
    if (offer.projects.customer_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Nur der Projektbesitzer kann auf Angebote reagieren' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if offer is still pending
    if (offer.status !== 'pending') {
      return new Response(
        JSON.stringify({ error: 'Angebot ist nicht mehr verfügbar' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const newStatus = action === 'accept' ? 'accepted' : 'rejected';

    // Update offer status
    const { error: updateOfferError } = await supabaseClient
      .from('offers')
      .update({ status: newStatus })
      .eq('id', offerId);

    if (updateOfferError) {
      console.error('❌ Failed to update offer:', updateOfferError);
      throw updateOfferError;
    }

    // If accepted, update project status and reject other offers
    if (action === 'accept') {
      // Update project status to in_progress
      const { error: projectUpdateError } = await supabaseClient
        .from('projects')
        .update({ 
          status: 'in_progress',
          assigned_handwerker: [offer.contractor_id]
        })
        .eq('id', offer.project_id);

      if (projectUpdateError) {
        console.error('❌ Failed to update project:', projectUpdateError);
        throw projectUpdateError;
      }

      // Update matches.status to 'accepted' for winning contractor
      const { error: matchAcceptError } = await supabaseClient
        .from('matches')
        .update({ status: 'accepted' })
        .eq('project_id', offer.project_id)
        .eq('contractor_id', offer.contractor_id);

      if (matchAcceptError) {
        console.error('❌ Failed to update match status:', matchAcceptError);
      }

      // Update matches.status to 'lost' for all other contractors who purchased the lead
      const { error: matchLostError } = await supabaseClient
        .from('matches')
        .update({ status: 'lost' })
        .eq('project_id', offer.project_id)
        .eq('lead_purchased', true)
        .neq('contractor_id', offer.contractor_id);

      if (matchLostError) {
        console.error('❌ Failed to update other matches:', matchLostError);
      }

      // Reject all other pending offers for this project
      const { error: rejectOthersError } = await supabaseClient
        .from('offers')
        .update({ status: 'rejected' })
        .eq('project_id', offer.project_id)
        .eq('status', 'pending')
        .neq('id', offerId);

      if (rejectOthersError) {
        console.error('❌ Failed to reject other offers:', rejectOthersError);
      }

      // Notify all other contractors who purchased the lead
      const { data: otherMatches } = await supabaseClient
        .from('matches')
        .select('contractor_id')
        .eq('project_id', offer.project_id)
        .eq('lead_purchased', true)
        .neq('contractor_id', offer.contractor_id);

      if (otherMatches && otherMatches.length > 0) {
        const notifications = otherMatches.map(match => ({
          handwerker_id: match.contractor_id,
          type: 'lead_lost',
          title: 'Lead vergeben',
          body: 'Dieser Lead wurde an einen anderen Handwerker vergeben. Das Projekt ist nicht mehr verfügbar.',
          data: {
            project_id: offer.project_id,
            offer_id: offerId
          }
        }));

        const { error: notificationError } = await supabaseClient
          .from('notifications')
          .insert(notifications);

        if (notificationError) {
          console.error('❌ Failed to send notifications to other contractors:', notificationError);
        } else {
          console.log(`✅ Sent notifications to ${otherMatches.length} other contractors`);
        }
      }
    }

    // Create notification for contractor
    const notificationTitle = action === 'accept' 
      ? 'Angebot akzeptiert!' 
      : 'Angebot abgelehnt';
    const notificationBody = action === 'accept'
      ? `Dein Angebot über €${offer.amount} wurde akzeptiert. Das Projekt wurde dir zugewiesen.`
      : `Dein Angebot über €${offer.amount} wurde leider abgelehnt.`;

    const { error: notificationError } = await supabaseClient
      .from('notifications')
      .insert({
        handwerker_id: offer.contractor_id,
        type: action === 'accept' ? 'offer_accepted' : 'offer_rejected',
        title: notificationTitle,
        body: notificationBody,
        data: {
          project_id: offer.project_id,
          offer_id: offerId,
          amount: offer.amount
        }
      });

    if (notificationError) {
      console.error('❌ Failed to create notification:', notificationError);
      // Don't fail the whole operation
    }

    console.log(`✅ Offer ${action}ed successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        message: action === 'accept' 
          ? 'Angebot erfolgreich akzeptiert' 
          : 'Angebot abgelehnt'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error responding to offer:', error);
    const errorMessage = error instanceof Error ? error.message : 'Interner Fehler';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
