import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function WalletSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const amount = searchParams.get("amount");
  const [countdown, setCountdown] = useState(5);
  const [redirecting, setRedirecting] = useState(false);

  // Auto-redirect nach 5 Sekunden
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setRedirecting(true);
          navigate("/handwerker/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-16 flex-1 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Zahlung erfolgreich!</h1>
          <p className="text-muted-foreground mb-6">
            €{amount || "..."} wurden Ihrem Wallet gutgeschrieben.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Sie können jetzt Leads kaufen und mit Kunden in Kontakt treten.
          </p>
          
          {redirecting ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Weiterleitung...</span>
            </div>
          ) : (
            <>
              <Button onClick={() => navigate("/handwerker/dashboard")} className="w-full mb-3">
                Zum Dashboard
              </Button>
              <p className="text-xs text-muted-foreground">
                Automatische Weiterleitung in {countdown} Sekunden...
              </p>
            </>
          )}
        </Card>
      </div>
      <Footer />
    </div>
  );
}
