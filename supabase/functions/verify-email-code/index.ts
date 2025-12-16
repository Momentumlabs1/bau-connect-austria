import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code } = await req.json();
    
    console.log("Verifying code for:", email);

    if (!email || !code) {
      throw new Error("Email and code are required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the verification code
    const { data: verificationRecord, error: fetchError } = await supabase
      .from("email_verification_codes")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("code", code)
      .is("verified_at", null)
      .single();

    if (fetchError || !verificationRecord) {
      console.error("Code not found or invalid:", fetchError);
      return new Response(
        JSON.stringify({ error: "Ungültiger Code. Bitte überprüfen Sie den Code und versuchen Sie es erneut." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if expired
    if (new Date(verificationRecord.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Der Code ist abgelaufen. Bitte fordern Sie einen neuen Code an." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const projectData = verificationRecord.project_data;
    const password = projectData?.password;
    const firstName = projectData?.firstName;

    if (!password) {
      throw new Error("Password not found in verification record");
    }

    // Mark code as verified
    await supabase
      .from("email_verification_codes")
      .update({ verified_at: new Date().toISOString() })
      .eq("id", verificationRecord.id);

    // Create user account with confirmed email
    console.log("Creating user account...");
    const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password: password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        role: projectData?.role || 'customer'
      }
    });

    if (signUpError) {
      // Check if user already exists
      if (signUpError.message?.includes("already been registered")) {
        console.log("User already exists, attempting to sign in...");
        
        // Try to get existing user
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
        
        if (existingUser) {
          // User exists, create project for them
          const userId = existingUser.id;
          
          // Create the project
          const { data: project, error: projectError } = await supabase
            .from("projects")
            .insert({
              customer_id: userId,
              title: projectData?.title || "Neues Projekt",
              description: projectData?.description || "",
              city: projectData?.city || "",
              postal_code: projectData?.postal_code || "",
              gewerk_id: projectData?.gewerk_id || "",
              subcategory_id: projectData?.subcategory_id,
              funnel_answers: projectData?.funnel_answers,
              urgency: projectData?.urgency || "normal",
              images: projectData?.images || [],
              status: "open",
              confirmed_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (projectError) {
            console.error("Project creation error:", projectError);
            throw new Error("Projekt konnte nicht erstellt werden");
          }

          console.log("✅ Project created for existing user:", project.id);

          // Trigger contractor matching
          try {
            const matchResponse = await fetch(`${supabaseUrl}/functions/v1/match-contractors`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({ projectId: project.id }),
            });
            console.log("Matching triggered:", await matchResponse.json());
          } catch (matchErr) {
            console.error("Matching error:", matchErr);
          }

          return new Response(
            JSON.stringify({
              success: true,
              userId: userId,
              projectId: project.id,
              userExists: true,
              message: "Email bestätigt! Projekt wurde veröffentlicht.",
            }),
            { headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
      }
      
      console.error("SignUp error:", signUpError);
      throw new Error(signUpError.message || "Account konnte nicht erstellt werden");
    }

    const userId = authData.user.id;
    console.log("✅ User created:", userId);

    // Add customer role
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({
        user_id: userId,
        role: projectData?.role || "customer",
      });

    if (roleError) {
      console.error("Role insert error:", roleError);
    }

    // Create profile
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        email: email.toLowerCase(),
        first_name: firstName || null,
        last_name: projectData?.lastName || null,
        phone: projectData?.phone || null,
      });

    if (profileError) {
      console.error("Profile insert error:", profileError);
    }

    // Create the project
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        customer_id: userId,
        title: projectData?.title || "Neues Projekt",
        description: projectData?.description || "",
        city: projectData?.city || "",
        postal_code: projectData?.postal_code || "",
        gewerk_id: projectData?.gewerk_id || "",
        subcategory_id: projectData?.subcategory_id,
        funnel_answers: projectData?.funnel_answers,
        urgency: projectData?.urgency || "normal",
        images: projectData?.images || [],
        status: "open",
        confirmed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (projectError) {
      console.error("Project creation error:", projectError);
      throw new Error("Projekt konnte nicht erstellt werden");
    }

    console.log("✅ Project created:", project.id);

    // Trigger contractor matching
    try {
      const matchResponse = await fetch(`${supabaseUrl}/functions/v1/match-contractors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ projectId: project.id }),
      });
      const matchResult = await matchResponse.json();
      console.log("✅ Matching triggered:", matchResult);
    } catch (matchErr) {
      console.error("Matching error:", matchErr);
    }

    // Clean up old verification codes for this email
    await supabase
      .from("email_verification_codes")
      .delete()
      .eq("email", email.toLowerCase())
      .neq("id", verificationRecord.id);

    return new Response(
      JSON.stringify({
        success: true,
        userId: userId,
        projectId: project.id,
        message: "Email bestätigt! Projekt wurde veröffentlicht.",
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
