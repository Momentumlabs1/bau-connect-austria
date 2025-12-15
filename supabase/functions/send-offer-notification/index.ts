import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OfferNotificationRequest {
  offerId: string;
}

const getEmailTemplate = (customerName: string, projectTitle: string, contractorName: string, offerAmount: number, offerMessage: string) => `
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
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">BauConnect24</h1>
              <p style="margin: 8px 0 0; color: #ddd6fe; font-size: 14px;">Neues Angebot erhalten!</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #18181b; font-size: 24px; font-weight: 600;">
                Hallo ${customerName}! 💼
              </h2>
              <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.6;">
                Ein Handwerker hat ein Angebot für Ihr Projekt abgegeben!
              </p>
              <div style="background-color: #faf5ff; border: 1px solid #e9d5ff; padding: 24px; margin: 24px 0; border-radius: 12px;">
                <h3 style="margin: 0 0 16px; color: #6b21a8; font-size: 18px; font-weight: 600;">
                  📋 ${projectTitle}
                </h3>
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td style="padding: 8px 0; color: #52525b; font-size: 14px;">
                      <strong>👤 Handwerker:</strong> ${contractorName}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #52525b; font-size: 14px;">
                      <strong>💰 Angebotspreis:</strong> <span style="color: #7c3aed; font-weight: 600; font-size: 18px;">€${offerAmount.toFixed(2)}</span>
                    </td>
                  </tr>
                </table>
                ${offerMessage ? `
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e9d5ff;">
                  <p style="margin: 0 0 8px; color: #6b21a8; font-size: 14px; font-weight: 600;">💬 Nachricht des Handwerkers:</p>
                  <p style="margin: 0; color: #52525b; font-size: 14px; font-style: italic; line-height: 1.5;">
                    "${offerMessage}"
                  </p>
                </div>
                ` : ''}
              </div>
              <p style="margin: 0 0 24px; color: #71717a; font-size: 14px; line-height: 1.6;">
                Sehen Sie sich das Angebot an und entscheiden Sie, ob Sie den Handwerker beauftragen möchten.
              </p>
              <table role="presentation" style="width: 100%; margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://bauconnect24.at/kunde/dashboard" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                      Angebot ansehen →
                    </a>
                  </td>
                </tr>
              </table>
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { offerId }: OfferNotificationRequest = await req.json();

    console.log(`Sending offer notification for offer ${offerId}`);

    // Fetch offer with related data
    const { data: offer, error: offerError } = await supabase
      .from('offers')
      .select(`
        amount,
        message,
        projects (
          title,
          customer_id,
          profiles (email, first_name)
        ),
        contractors (company_name)
      `)
      .eq('id', offerId)
      .single();

    if (offerError || !offer) {
      throw new Error(`Offer not found: ${offerError?.message}`);
    }

    const project = offer.projects as any;
    const customerProfile = project?.profiles;
    const contractor = offer.contractors as any;

    if (!customerProfile?.email) {
      throw new Error('Customer email not found');
    }

    const html = getEmailTemplate(
      customerProfile.first_name || 'Kunde',
      project.title,
      contractor?.company_name || 'Handwerker',
      offer.amount,
      offer.message || ''
    );

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "BauConnect24 <onboarding@resend.dev>",
        to: [customerProfile.email],
        subject: `💼 Neues Angebot für: ${project.title}`,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", data);
      throw new Error(data.message || "Failed to send email");
    }

    console.log("Offer notification sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending offer notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
