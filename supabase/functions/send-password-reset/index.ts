import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const getEmailTemplate = (resetLink: string, firstName?: string) => `
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
              <p style="margin: 8px 0 0; color: #bfdbfe; font-size: 14px;">Passwort zurücksetzen</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #18181b; font-size: 24px; font-weight: 600;">
                Passwort zurücksetzen 🔑
              </h2>
              <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.6;">
                ${firstName ? `Hallo ${firstName},` : 'Hallo,'}<br><br>
                Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt. Klicken Sie auf den Button unten, um ein neues Passwort zu erstellen.
              </p>
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  ⚠️ Dieser Link ist nur <strong>1 Stunde</strong> gültig.
                </p>
              </div>
              <table role="presentation" style="width: 100%; margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                      Neues Passwort erstellen →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 16px; color: #71717a; font-size: 14px; line-height: 1.6;">
                Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:
              </p>
              <p style="margin: 0; color: #3b82f6; font-size: 12px; word-break: break-all;">
                ${resetLink}
              </p>
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #71717a; font-size: 14px; line-height: 1.6;">
                  Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren. Ihr Passwort bleibt unverändert.
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
    const { email } = await req.json();
    
    if (!email) {
      throw new Error("Email is required");
    }

    console.log("Processing password reset request for:", email);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user exists
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, first_name, email")
      .eq("email", email.toLowerCase())
      .single();

    // Always return success to prevent email enumeration attacks
    if (!profile) {
      console.log("No user found with email:", email);
      return new Response(
        JSON.stringify({ success: true, message: "If an account exists, a reset email has been sent." }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate secure token
    const token = crypto.randomUUID() + "-" + crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete any existing tokens for this email
    await supabase
      .from("password_reset_tokens")
      .delete()
      .eq("email", email.toLowerCase());

    // Store the token
    const { error: insertError } = await supabase
      .from("password_reset_tokens")
      .insert({
        email: email.toLowerCase(),
        token,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("Failed to store reset token:", insertError);
      throw new Error("Failed to process reset request");
    }

    // Build reset link
    const baseUrl = "https://bauconnect24.at";
    const resetLink = `${baseUrl}/passwort-zuruecksetzen?token=${token}`;

    // Send email
    if (resendApiKey) {
      const html = getEmailTemplate(resetLink, profile.first_name);

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "BauConnect24 <noreply@bauconnect24.at>",
          to: [email],
          subject: "🔑 Passwort zurücksetzen - BauConnect24",
          html,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Resend API error:", data);
        throw new Error("Failed to send reset email");
      }

      console.log("✅ Password reset email sent:", data);
    } else {
      console.log("⚠️ No RESEND_API_KEY - Token generated but email not sent");
      console.log("Reset link:", resetLink);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "If an account exists, a reset email has been sent." 
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-password-reset:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
