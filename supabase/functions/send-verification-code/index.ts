import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, projectData, password } = await req.json();
    
    console.log("Sending verification code to:", email);

    if (!email) {
      throw new Error("Email is required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Delete any existing codes for this email
    await supabase
      .from("email_verification_codes")
      .delete()
      .eq("email", email.toLowerCase());

    // Store the code with project data and password (hashed by Supabase on signup)
    const { error: insertError } = await supabase
      .from("email_verification_codes")
      .insert({
        email: email.toLowerCase(),
        code,
        project_data: { ...projectData, password, firstName },
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to store verification code");
    }

    // Send email with code
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      
      await resend.emails.send({
        from: "BauConnect24 <noreply@bauconnect24.at>",
        to: [email],
        subject: "Ihr Bestätigungscode: " + code,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 480px; margin: 0 auto; padding: 40px 20px; }
              .code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb; text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px; margin: 24px 0; }
              .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Willkommen bei BauConnect24${firstName ? `, ${firstName}` : ''}!</h2>
              <p>Ihr Bestätigungscode lautet:</p>
              <div class="code">${code}</div>
              <p>Geben Sie diesen Code im Formular ein, um Ihre E-Mail-Adresse zu bestätigen und Ihr Projekt zu veröffentlichen.</p>
              <p><strong>Der Code ist 15 Minuten gültig.</strong></p>
              <div class="footer">
                <p>Falls Sie diese E-Mail nicht angefordert haben, können Sie sie ignorieren.</p>
                <p>© 2024 BauConnect24 - Ihre Handwerker-Plattform</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      
      console.log("✅ Verification code sent via Resend");
    } else {
      console.log("⚠️ No RESEND_API_KEY - Code stored but email not sent:", code);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Verification code sent",
        // Only include code in dev for testing (remove in production)
        ...(Deno.env.get("ENVIRONMENT") !== "production" && { devCode: code })
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
