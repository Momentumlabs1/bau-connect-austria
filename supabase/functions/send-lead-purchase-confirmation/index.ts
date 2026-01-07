import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LeadPurchaseConfirmationRequest {
  contractorId: string;
  leadId: string;
  pricePaid: number;
}

const getEmailTemplate = (
  contractorName: string,
  projectTitle: string,
  projectCity: string,
  customerName: string,
  customerEmail: string,
  customerPhone: string | null,
  pricePaid: number
) => `
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
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">BauConnect24</h1>
              <p style="margin: 8px 0 0; color: #a7f3d0; font-size: 14px;">Lead erfolgreich gekauft! ✅</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #18181b; font-size: 24px; font-weight: 600;">
                Herzlichen Glückwunsch, ${contractorName}! 🎉
              </h2>
              <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.6;">
                Sie haben den Lead erfolgreich gekauft. Hier sind die Kontaktdaten des Kunden:
              </p>
              
              <!-- Projekt-Info -->
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 24px; margin: 24px 0; border-radius: 12px;">
                <h3 style="margin: 0 0 16px; color: #166534; font-size: 18px; font-weight: 600;">
                  📋 ${projectTitle}
                </h3>
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td style="padding: 8px 0; color: #52525b; font-size: 14px;">
                      <strong>📍 Standort:</strong> ${projectCity}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #52525b; font-size: 14px;">
                      <strong>💰 Gezahlt:</strong> €${pricePaid.toFixed(2)}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Kundenkontakt -->
              <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 24px; margin: 24px 0; border-radius: 12px;">
                <h3 style="margin: 0 0 16px; color: #1e40af; font-size: 18px; font-weight: 600;">
                  👤 Kundenkontakt
                </h3>
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td style="padding: 8px 0; color: #52525b; font-size: 14px;">
                      <strong>Name:</strong> ${customerName}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #52525b; font-size: 14px;">
                      <strong>📧 E-Mail:</strong> <a href="mailto:${customerEmail}" style="color: #2563eb;">${customerEmail}</a>
                    </td>
                  </tr>
                  ${customerPhone ? `
                  <tr>
                    <td style="padding: 8px 0; color: #52525b; font-size: 14px;">
                      <strong>📞 Telefon:</strong> <a href="tel:${customerPhone}" style="color: #2563eb;">${customerPhone}</a>
                    </td>
                  </tr>
                  ` : ''}
                </table>
              </div>

              <p style="margin: 0 0 24px; color: #71717a; font-size: 14px; line-height: 1.6;">
                <strong>Tipp:</strong> Kontaktieren Sie den Kunden so schnell wie möglich! Schnelle Reaktionszeiten erhöhen Ihre Erfolgschancen.
              </p>
              
              <table role="presentation" style="width: 100%; margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://bauconnect24.at/nachrichten" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                      Kunden kontaktieren →
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

    const { contractorId, leadId, pricePaid }: LeadPurchaseConfirmationRequest = await req.json();

    console.log(`📧 Sending lead purchase confirmation to contractor ${contractorId} for lead ${leadId}`);

    // Fetch contractor with profile
    const { data: contractor, error: contractorError } = await supabase
      .from('contractors')
      .select(`
        company_name,
        profiles (email, first_name)
      `)
      .eq('id', contractorId)
      .single();

    if (contractorError || !contractor) {
      throw new Error(`Contractor not found: ${contractorError?.message}`);
    }

    const contractorProfile = contractor.profiles as any;
    if (!contractorProfile?.email) {
      throw new Error('Contractor email not found');
    }

    // Fetch lead with customer info
    const { data: lead, error: leadError } = await supabase
      .from('projects')
      .select(`
        title,
        projekt_typ,
        city,
        customer_id,
        profiles!projects_customer_id_fkey (first_name, last_name, email, phone)
      `)
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      throw new Error(`Lead not found: ${leadError?.message}`);
    }

    const customerProfile = lead.profiles as any;
    console.log('👤 Customer profile for email:', customerProfile);

    const customerName = customerProfile?.first_name 
      ? `${customerProfile.first_name} ${customerProfile.last_name || ''}`.trim()
      : 'Kunde';

    const html = getEmailTemplate(
      contractor.company_name || contractorProfile.first_name || 'Handwerker',
      lead.title || lead.projekt_typ || 'Projekt',
      lead.city,
      customerName,
      customerProfile?.email || 'Nicht verfügbar',
      customerProfile?.phone || null,
      pricePaid
    );

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "BauConnect24 <noreply@bauconnect24.at>",
        to: [contractorProfile.email],
        subject: `✅ Lead gekauft: ${lead.title || lead.projekt_typ} in ${lead.city}`,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", data);
      throw new Error(data.message || "Failed to send email");
    }

    console.log("✅ Lead purchase confirmation sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("❌ Error sending lead purchase confirmation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
