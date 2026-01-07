import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MessageNotificationRequest {
  conversationId: string;
  senderId: string;
  recipientId: string;
  messagePreview: string;
}

const getEmailTemplate = (recipientName: string, senderName: string, projectTitle: string, messagePreview: string) => `
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
              <p style="margin: 8px 0 0; color: #bfdbfe; font-size: 14px;">Neue Nachricht</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #18181b; font-size: 24px; font-weight: 600;">
                Hallo ${recipientName}! 💬
              </h2>
              <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.6;">
                Sie haben eine neue Nachricht erhalten!
              </p>
              <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; padding: 24px; margin: 24px 0; border-radius: 12px;">
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td style="padding: 8px 0; color: #52525b; font-size: 14px;">
                      <strong>👤 Von:</strong> ${senderName}
                    </td>
                  </tr>
                  ${projectTitle ? `
                  <tr>
                    <td style="padding: 8px 0; color: #52525b; font-size: 14px;">
                      <strong>📋 Projekt:</strong> ${projectTitle}
                    </td>
                  </tr>
                  ` : ''}
                </table>
                <div style="margin-top: 16px; padding: 16px; background-color: #ffffff; border-radius: 8px; border-left: 4px solid #3b82f6;">
                  <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.5; font-style: italic;">
                    "${messagePreview.length > 200 ? messagePreview.substring(0, 200) + '...' : messagePreview}"
                  </p>
                </div>
              </div>
              <table role="presentation" style="width: 100%; margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://bauconnect24.at/nachrichten" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                      Nachricht lesen →
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

    const { conversationId, senderId, recipientId, messagePreview }: MessageNotificationRequest = await req.json();

    console.log(`Sending message notification for conversation ${conversationId}`);

    // Fetch conversation with project info
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select(`
        project_id,
        projects (title)
      `)
      .eq('id', conversationId)
      .single();

    if (convError) {
      console.error('Conversation fetch error:', convError);
    }

    // Fetch sender info
    const { data: senderProfile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', senderId)
      .single();

    // Check if sender is contractor
    const { data: senderContractor } = await supabase
      .from('contractors')
      .select('company_name')
      .eq('id', senderId)
      .single();

    // Fetch recipient info
    const { data: recipientProfile } = await supabase
      .from('profiles')
      .select('email, first_name')
      .eq('id', recipientId)
      .single();

    if (!recipientProfile?.email) {
      throw new Error('Recipient email not found');
    }

    const senderName = senderContractor?.company_name || 
      `${senderProfile?.first_name || ''} ${senderProfile?.last_name || ''}`.trim() || 
      'Benutzer';

    const projectTitle = (conversation?.projects as any)?.title || '';

    const html = getEmailTemplate(
      recipientProfile.first_name || 'Benutzer',
      senderName,
      projectTitle,
      messagePreview
    );

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "BauConnect24 <noreply@bauconnect24.at>",
        to: [recipientProfile.email],
        subject: `💬 Neue Nachricht von ${senderName}`,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", data);
      throw new Error(data.message || "Failed to send email");
    }

    console.log("Message notification sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending message notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
