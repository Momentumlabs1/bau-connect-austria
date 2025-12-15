import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  firstName: string;
  role: 'customer' | 'contractor';
}

const getCustomerTemplate = (firstName: string) => `
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
              <p style="margin: 8px 0 0; color: #bfdbfe; font-size: 14px;">Ihr Handwerker-Marktplatz</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #18181b; font-size: 24px; font-weight: 600;">
                Willkommen bei BauConnect24, ${firstName}! 🎉
              </h2>
              <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.6;">
                Vielen Dank für Ihre Registrierung! Sie können jetzt ganz einfach qualifizierte Handwerker für Ihre Projekte finden.
              </p>
              <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                <h3 style="margin: 0 0 12px; color: #1e40af; font-size: 16px; font-weight: 600;">So geht's weiter:</h3>
                <ol style="margin: 0; padding-left: 20px; color: #1e40af;">
                  <li style="margin-bottom: 8px;">Erstellen Sie Ihre erste Projektanfrage</li>
                  <li style="margin-bottom: 8px;">Erhalten Sie Angebote von qualifizierten Handwerkern</li>
                  <li style="margin-bottom: 0;">Wählen Sie den besten Handwerker für Ihr Projekt</li>
                </ol>
              </div>
              <table role="presentation" style="width: 100%; margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://bauconnect24.at/projekt-erstellen" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                      Projekt erstellen →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0; color: #71717a; font-size: 14px; line-height: 1.6;">
                Bei Fragen stehen wir Ihnen jederzeit zur Verfügung.
              </p>
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

const getContractorTemplate = (firstName: string) => `
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
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">BauConnect24</h1>
              <p style="margin: 8px 0 0; color: #fed7aa; font-size: 14px;">Ihr Handwerker-Marktplatz</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #18181b; font-size: 24px; font-weight: 600;">
                Willkommen bei BauConnect24, ${firstName}! 🛠️
              </h2>
              <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.6;">
                Herzlichen Glückwunsch zur Registrierung! Sie haben jetzt Zugang zu qualifizierten Kundenanfragen in Ihrer Region.
              </p>
              <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                <h3 style="margin: 0 0 12px; color: #c2410c; font-size: 16px; font-weight: 600;">Ihre nächsten Schritte:</h3>
                <ol style="margin: 0; padding-left: 20px; color: #c2410c;">
                  <li style="margin-bottom: 8px;">Vervollständigen Sie Ihr Firmenprofil</li>
                  <li style="margin-bottom: 8px;">Laden Sie Ihr Guthaben auf</li>
                  <li style="margin-bottom: 8px;">Entdecken Sie passende Kundenanfragen</li>
                  <li style="margin-bottom: 0;">Kaufen Sie Leads und gewinnen Sie neue Aufträge</li>
                </ol>
              </div>
              <table role="presentation" style="width: 100%; margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://bauconnect24.at/handwerker/dashboard" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                      Zum Dashboard →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0; color: #71717a; font-size: 14px; line-height: 1.6;">
                Wir freuen uns, Sie als Partner begrüßen zu dürfen!
              </p>
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
    const { email, firstName, role }: WelcomeEmailRequest = await req.json();

    console.log(`Sending welcome email to ${email} (${role})`);

    const html = role === 'contractor' 
      ? getContractorTemplate(firstName || 'Handwerker')
      : getCustomerTemplate(firstName || 'Kunde');

    const subject = role === 'contractor'
      ? 'Willkommen bei BauConnect24 - Starten Sie durch!'
      : 'Willkommen bei BauConnect24 - Finden Sie Ihren Handwerker!';

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "BauConnect24 <noreply@bauconnect24.at>",
        to: [email],
        subject,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", data);
      throw new Error(data.message || "Failed to send email");
    }

    console.log("Welcome email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
