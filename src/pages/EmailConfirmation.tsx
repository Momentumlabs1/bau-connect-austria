import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, RefreshCw, CheckCircle2, ArrowRight } from "lucide-react";

export default function EmailConfirmation() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const role = searchParams.get("role") || "customer";
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleResend = async () => {
    if (!email) {
      toast({
        title: "Fehler",
        description: "Keine E-Mail-Adresse angegeben",
        variant: "destructive",
      });
      return;
    }

    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?role=${role}`
        }
      });

      if (error) throw error;

      setResent(true);
      toast({
        title: "E-Mail gesendet!",
        description: "Bitte überprüfen Sie Ihren Posteingang",
      });
    } catch (error: any) {
      toast({
        title: "Fehler beim Senden",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>E-Mail bestätigen</CardTitle>
              <CardDescription>
                Wir haben Ihnen eine Bestätigungs-E-Mail gesendet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Gesendet an:</p>
                <p className="font-medium">{email || "Ihre E-Mail-Adresse"}</p>
              </div>

              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <p>Öffnen Sie die E-Mail in Ihrem Posteingang</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <p>Klicken Sie auf den Bestätigungslink</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <p>Sie werden automatisch eingeloggt</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Keine E-Mail erhalten? Überprüfen Sie auch Ihren Spam-Ordner.
                </p>
                <Button
                  variant="outline"
                  onClick={handleResend}
                  disabled={resending || resent}
                  className="w-full"
                >
                  {resending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Wird gesendet...
                    </>
                  ) : resent ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      E-Mail erneut gesendet
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Bestätigungsmail erneut senden
                    </>
                  )}
                </Button>
              </div>

              <div className="border-t pt-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/login")}
                  className="w-full"
                >
                  Zur Anmeldung
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
