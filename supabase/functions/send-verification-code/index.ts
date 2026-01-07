import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const getEmailTemplate = (code: string, firstName?: string) => `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">BauConnect24</h1>
              <p style="margin: 8px 0 0; color: #bfdbfe; font-size: 14px;">E-Mail-Bestätigung</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #18181b; font-size: 24px; font-weight: 600;">
                ${firstName ? `Willkommen, ${firstName}! 🔐` : 'Willkommen bei BauConnect24! 🔐'}
              </h2>
              <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.6;">
                Vielen Dank für Ihre Registrierung! Um Ihre E-Mail-Adresse zu bestätigen und Ihr Projekt zu veröffentlichen, geben Sie bitte den folgenden Code ein:
              </p>
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #3b82f6; padding: 24px; margin: 24px 0; border-radius: 12px; text-align: center;">
                <p style="margin: 0 0 8px; color: #1e40af; font-size: 14px; font-weight: 500;">Ihr Bestätigungscode:</p>
                <p style="margin: 0; color: #1d4ed8; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', Courier, monospace;">
                  ${code}
                </p>
              </div>
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  ⚠️ Dieser Code ist nur <strong>15 Minuten</strong> gültig.
                </p>
              </div>
              <p style="margin: 0; color: #71717a; font-size: 14px; line-height: 1.6;">
                Geben Sie diesen Code im Formular ein, um Ihre E-Mail-Adresse zu bestätigen und Ihr Projekt zu veröffentlichen.
              </p>
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #71717a; font-size: 14px; line-height: 1.6;">
                  Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; background-color: #f4f4f5; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="margin: 0 0 8px; color: #71717a; font-size: 12px;">
                © 2024 BauConnect24 - Ihr Handwerker-Marktplatz
              </p>
              <p style="margin: 0; color: #a1a1aa; font-size: 11px;">
                <a href="https://bauconnect24.at/impressum" style="color: #a1a1aa; text-decoration: none;">Impressum</a> · 
                <a href="https://bauconnect24.at/datenschutz" style="color: #a1a1aa; text-decoration: none;">Datenschutz</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, projectData } = await req.json();
    
    // Password kann entweder direkt oder in projectData sein
    const passwordToStore = projectData?.password;
    
    console.log("Sending verification code to:", email);
    console.log("Password provided:", !!passwordToStore);

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
        project_data: { ...projectData, password: passwordToStore, firstName },
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to store verification code");
    }

    // Send email with code
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      const html = getEmailTemplate(code, firstName);
      
      await resend.emails.send({
        from: "BauConnect24 <noreply@bauconnect24.at>",
        to: [email],
        subject: "🔐 Ihr Bestätigungscode: " + code,
        html,
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
