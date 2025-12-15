import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(true);
  const [message, setMessage] = useState("E-Mail wird bestätigt...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // First check for code in URL params (email confirmation uses this)
        const code = searchParams.get('code');
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        
        console.log("Auth callback - URL params:", { code, token_hash, type });
        console.log("Auth callback - Full URL:", window.location.href);
        console.log("Auth callback - Hash:", window.location.hash);
        
        // Try to exchange authorization code if present
        if (code) {
          console.log("Exchanging code for session...");
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error("Code exchange error:", exchangeError);
            throw exchangeError;
          }
          
          console.log("Code exchange successful:", data);
        }

        // Get session (should be set now if code exchange worked)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        console.log("Current session:", session);

        if (!session) {
          // Try to get tokens from URL hash (older flow)
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          console.log("Hash tokens:", { accessToken: !!accessToken, refreshToken: !!refreshToken });
          
          if (accessToken && refreshToken) {
            const { error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (setSessionError) throw setSessionError;
          } else {
            throw new Error("Keine gültige Session gefunden. Bitte fordern Sie einen neuen Bestätigungslink an.");
          }
        }

        // Get user after session is set
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error("Benutzer nicht gefunden");
        }

        setMessage("E-Mail bestätigt! Weiterleitung...");

        // Check for any draft projects that need to be published
        const { data: draftProjects, error: draftError } = await supabase
          .from('projects')
          .select('id')
          .eq('customer_id', user.id)
          .eq('status', 'draft');

        if (!draftError && draftProjects && draftProjects.length > 0) {
          // Publish all draft projects
          for (const project of draftProjects) {
            await supabase
              .from('projects')
              .update({ 
                status: 'open',
                confirmed_at: new Date().toISOString()
              })
              .eq('id', project.id);

            // Trigger contractor matching
            try {
              await supabase.functions.invoke('match-contractors', {
                body: { projectId: project.id }
              });
            } catch (matchErr) {
              console.error('Matching error:', matchErr);
            }
          }

          toast({
            title: "🎉 E-Mail bestätigt!",
            description: `${draftProjects.length} Projekt(e) wurden veröffentlicht`,
          });
        } else {
          toast({
            title: "E-Mail bestätigt!",
            description: "Willkommen bei BauConnect24",
          });
        }

        // Get user role and redirect appropriately
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        const roles = userRoles?.map(r => r.role) || [];
        const role = searchParams.get('role');

        // Check if user has a newly published project to show
        const { data: recentProjects } = await supabase
          .from('projects')
          .select('id')
          .eq('customer_id', user.id)
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(1);

        setTimeout(() => {
          if (roles.includes('contractor') || role === 'contractor') {
            navigate('/handwerker/onboarding');
          } else if (roles.includes('customer') || role === 'customer') {
            // If there's a recently created project, go to that project detail
            if (recentProjects && recentProjects.length > 0) {
              navigate(`/kunde/projekte/${recentProjects[0].id}`);
            } else {
              navigate('/kunde/dashboard');
            }
          } else {
            navigate('/');
          }
        }, 1000);

      } catch (error: any) {
        console.error("Auth callback error:", error);
        toast({
          title: "Fehler bei der Bestätigung",
          description: error.message || "Bitte versuchen Sie es erneut",
          variant: "destructive",
        });
        setMessage("Fehler bei der Bestätigung");
        setTimeout(() => navigate('/login'), 2000);
      } finally {
        setProcessing(false);
      }
    };

    handleCallback();
  }, [navigate, searchParams, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        {processing && <LoadingSpinner />}
        <p className="text-lg font-medium">{message}</p>
        <p className="text-sm text-muted-foreground">
          Bitte warten Sie einen Moment...
        </p>
      </div>
    </div>
  );
}
