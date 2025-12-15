import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Use SERVICE_ROLE_KEY to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, projectData } = await req.json();

    console.log('Creating project after signup for user:', userId);

    if (!userId || !projectData) {
      return new Response(
        JSON.stringify({ error: 'Missing userId or projectData' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate user exists (even if email not confirmed yet)
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError || !userData) {
      console.error('User validation error:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid user' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User validated:', userData.user.email);

    // Create project with SERVICE_ROLE_KEY (bypasses RLS)
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        customer_id: userId,
        title: projectData.title,
        description: projectData.description,
        gewerk_id: projectData.gewerk_id,
        subcategory_id: projectData.subcategory_id,
        postal_code: projectData.postal_code,
        city: projectData.city,
        address: projectData.address,
        urgency: projectData.urgency,
        preferred_start_date: projectData.preferred_start_date,
        images: projectData.images || [],
        funnel_answers: projectData.funnel_answers || {},
        status: 'open',
        visibility: 'public',
        terms_accepted: projectData.terms_accepted || false,
        confirmed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (projectError) {
      console.error('Project creation error:', projectError);
      return new Response(
        JSON.stringify({ error: 'Failed to create project', details: projectError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Project created:', project.id);

    // Send welcome email to new customer (non-blocking)
    try {
      const firstName = userData.user.user_metadata?.first_name || 'Kunde';
      const emailUrl = Deno.env.get('SUPABASE_URL') + '/functions/v1/send-welcome-email';
      const emailResponse = await fetch(emailUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.user.email,
          firstName,
          role: 'customer'
        })
      });
      if (!emailResponse.ok) {
        console.error('Welcome email failed:', await emailResponse.text());
      } else {
        console.log('📧 Welcome email sent to customer');
      }
    } catch (emailError) {
      console.error('Welcome email error:', emailError);
      // Don't fail project creation
    }

    // Matching wird aktuell nicht im Backend ausgelöst,
    // sondern clientseitig nach der Registrierung im Funnel.

    return new Response(
      JSON.stringify({ 
        success: true, 
        projectId: project.id,
        project: project
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
