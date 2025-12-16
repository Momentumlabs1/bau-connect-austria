import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Mail, ArrowRight } from "lucide-react";

export default function EmailConfirmation() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const role = searchParams.get("role") || "customer";
  const navigate = useNavigate();

  // Redirect users to registration since we now use OTP
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(`/register?role=${role}`);
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate, role]);

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
              <CardTitle>Neue Registrierung</CardTitle>
              <CardDescription>
                Wir haben unseren Registrierungsprozess verbessert!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Jetzt mit schneller 6-stelliger Code-Bestätigung. 
                  Kein E-Mail-Link mehr nötig!
                </p>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Sie werden in 5 Sekunden automatisch weitergeleitet...
              </p>

              <Button
                onClick={() => navigate(`/register?role=${role}`)}
                className="w-full"
              >
                Jetzt registrieren
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              {email && (
                <p className="text-xs text-muted-foreground text-center">
                  Falls Sie bereits registriert sind, nutzen Sie bitte die{" "}
                  <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/login")}>
                    Anmeldung
                  </Button>
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
