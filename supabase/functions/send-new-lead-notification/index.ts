import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LeadNotificationRequest {
  projectId: string;
  contractorIds: string[];
}

const getEmailTemplate = (contractorName: string, projectTitle: string, projectCity: string, gewerkLabel: string, leadPrice: number) => `
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
              <p style="margin: 8px 0 0; color: #a7f3d0; font-size: 14px;">Neue Kundenanfrage!</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #18181b; font-size: 24px; font-weight: 600;">
                Hallo ${contractorName}! 🔔
              </h2>
              <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.6;">
                Eine neue Kundenanfrage passt zu Ihrem Profil und wartet auf Sie!
              </p>
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
                      <strong>🔧 Gewerk:</strong> ${gewerkLabel}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #52525b; font-size: 14px;">
                      <strong>💰 Lead-Preis:</strong> €${leadPrice.toFixed(2)}
                    </td>
                  </tr>
                </table>
              </div>
              <p style="margin: 0 0 24px; color: #71717a; font-size: 14px; line-height: 1.6;">
                Seien Sie schnell! Gute Leads werden schnell vergeben.
              </p>
              <table role="presentation" style="width: 100%; margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://bauconnect24.at/handwerker/dashboard" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                      Lead ansehen →
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

    const { projectId, contractorIds }: LeadNotificationRequest = await req.json();

    console.log(`Sending lead notifications for project ${projectId} to ${contractorIds.length} contractors`);

    // Fetch project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        title,
        city,
        gewerk_id,
        final_price,
        gewerke_config (label)
      `)
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      throw new Error(`Project not found: ${projectError?.message}`);
    }

    // Fetch contractors with their emails
    const { data: contractors, error: contractorsError } = await supabase
      .from('contractors')
      .select(`
        id,
        company_name,
        profiles (email, first_name)
      `)
      .in('id', contractorIds);

    if (contractorsError) {
      throw new Error(`Failed to fetch contractors: ${contractorsError.message}`);
    }

    const results = [];
    
    for (const contractor of contractors || []) {
      const profile = contractor.profiles as any;
      if (!profile?.email) continue;

      const html = getEmailTemplate(
        contractor.company_name || profile.first_name || 'Handwerker',
        project.title,
        project.city,
        (project.gewerke_config as any)?.label || project.gewerk_id,
        project.final_price || 5
      );

      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "BauConnect24 <onboarding@resend.dev>",
            to: [profile.email],
            subject: `🔔 Neue Kundenanfrage: ${project.title}`,
            html,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error(`Failed to send to ${profile.email}:`, data);
          results.push({ contractorId: contractor.id, success: false, error: data.message });
        } else {
          console.log(`Lead notification sent to ${profile.email}:`, data);
          results.push({ contractorId: contractor.id, success: true });
        }
      } catch (emailError: any) {
        console.error(`Failed to send to ${profile.email}:`, emailError);
        results.push({ contractorId: contractor.id, success: false, error: emailError.message });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending lead notifications:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
