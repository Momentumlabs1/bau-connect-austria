import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OfferResponseNotificationRequest {
  offerId: string;
  action: 'accept' | 'reject';
  contractorId: string;
  projectId: string;
  amount: number;
}

const getAcceptedEmailTemplate = (contractorName: string, projectTitle: string, offerAmount: number, customerName: string) => `
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
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">BauConnect24</h1>
              <p style="margin: 8px 0 0; color: #dcfce7; font-size: 14px;">Angebot akzeptiert!</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #18181b; font-size: 24px; font-weight: 600;">
                Herzlichen Glückwunsch, ${contractorName}! 🎉
              </h2>
              <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.6;">
                Großartige Neuigkeiten! Ihr Angebot wurde akzeptiert und das Projekt wurde Ihnen zugewiesen.
              </p>
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 24px; margin: 24px 0; border-radius: 12px;">
                <h3 style="margin: 0 0 16px; color: #166534; font-size: 18px; font-weight: 600;">
                  📋 ${projectTitle}
                </h3>
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td style="padding: 8px 0; color: #52525b; font-size: 14px;">
                      <strong>👤 Kunde:</strong> ${customerName}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #52525b; font-size: 14px;">
                      <strong>💰 Akzeptiertes Angebot:</strong> <span style="color: #16a34a; font-weight: 600; font-size: 18px;">€${offerAmount.toFixed(2)}</span>
                    </td>
                  </tr>
                </table>
              </div>
              <p style="margin: 0 0 24px; color: #71717a; font-size: 14px; line-height: 1.6;">
                Kontaktieren Sie jetzt den Kunden, um die Projektdetails zu besprechen und mit der Arbeit zu beginnen.
              </p>
              <table role="presentation" style="width: 100%; margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://bauconnect24.at/handwerker/projekte" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                      Zum Projekt →
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

const getRejectedEmailTemplate = (contractorName: string, projectTitle: string, offerAmount: number) => `
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
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #71717a 0%, #52525b 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">BauConnect24</h1>
              <p style="margin: 8px 0 0; color: #d4d4d8; font-size: 14px;">Angebotsbenachrichtigung</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #18181b; font-size: 24px; font-weight: 600;">
                Hallo ${contractorName},
              </h2>
              <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.6;">
                Leider wurde Ihr Angebot vom Kunden nicht angenommen. Aber lassen Sie sich nicht entmutigen – es warten viele weitere Aufträge auf Sie!
              </p>
              <div style="background-color: #f4f4f5; border: 1px solid #e4e4e7; padding: 24px; margin: 24px 0; border-radius: 12px;">
                <h3 style="margin: 0 0 16px; color: #52525b; font-size: 18px; font-weight: 600;">
                  📋 ${projectTitle}
                </h3>
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td style="padding: 8px 0; color: #71717a; font-size: 14px;">
                      <strong>💰 Ihr Angebot:</strong> €${offerAmount.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #71717a; font-size: 14px;">
                      <strong>Status:</strong> Abgelehnt
                    </td>
                  </tr>
                </table>
              </div>
              <p style="margin: 0 0 24px; color: #52525b; font-size: 14px; line-height: 1.6;">
                💡 <strong>Tipp:</strong> Schauen Sie sich neue Leads an und senden Sie weitere Angebote. Je aktiver Sie sind, desto höher sind Ihre Chancen auf neue Aufträge!
              </p>
              <table role="presentation" style="width: 100%; margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://bauconnect24.at/handwerker/dashboard" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                      Neue Leads ansehen →
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

    const { offerId, action, contractorId, projectId, amount }: OfferResponseNotificationRequest = await req.json();

    console.log(`📧 Sending offer response notification: ${action} for offer ${offerId}`);

    // Fetch contractor email from profiles
    const { data: contractorProfile, error: contractorError } = await supabase
      .from('profiles')
      .select('email, first_name, last_name')
      .eq('id', contractorId)
      .single();

    if (contractorError || !contractorProfile?.email) {
      console.error('❌ Contractor profile not found:', contractorError);
      throw new Error('Contractor email not found');
    }

    // Fetch contractor company name
    const { data: contractor, error: companyError } = await supabase
      .from('contractors')
      .select('company_name')
      .eq('id', contractorId)
      .single();

    if (companyError) {
      console.error('❌ Contractor not found:', companyError);
    }

    // Fetch project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('title, customer_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      console.error('❌ Project not found:', projectError);
      throw new Error('Project not found');
    }

    // Fetch customer name for accepted emails
    let customerName = 'Kunde';
    if (action === 'accept') {
      const { data: customerProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', project.customer_id)
        .single();
      
      if (customerProfile) {
        customerName = [customerProfile.first_name, customerProfile.last_name].filter(Boolean).join(' ') || 'Kunde';
      }
    }

    const contractorName = contractor?.company_name || 
      [contractorProfile.first_name, contractorProfile.last_name].filter(Boolean).join(' ') || 
      'Handwerker';

    const html = action === 'accept'
      ? getAcceptedEmailTemplate(contractorName, project.title, amount, customerName)
      : getRejectedEmailTemplate(contractorName, project.title, amount);

    const subject = action === 'accept'
      ? `🎉 Angebot akzeptiert: ${project.title}`
      : `Angebotsbenachrichtigung: ${project.title}`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "BauConnect24 <noreply@bauconnect24.at>",
        to: [contractorProfile.email],
        subject,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Resend API error:", data);
      throw new Error(data.message || "Failed to send email");
    }

    console.log(`✅ Offer response notification sent successfully to ${contractorProfile.email}`);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("❌ Error sending offer response notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
