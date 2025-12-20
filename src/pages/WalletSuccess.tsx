import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function WalletSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const amount = searchParams.get("amount");
  const sessionId = searchParams.get("session_id");

  const [verifying, setVerifying] = useState(!!sessionId);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountLabel = useMemo(() => {
    if (!amount) return "...";
    const n = Number(amount);
    return Number.isFinite(n) ? n.toFixed(2) : amount;
  }, [amount]);

  const verify = async () => {
    if (!sessionId) return;

    setVerifying(true);
    setError(null);

    const { data, error } = await supabase.functions.invoke("verify-wallet-recharge", {
      body: { sessionId },
    });

    if (error) {
      setError(error.message || "Verifizierung fehlgeschlagen");
      setVerifying(false);
      return;
    }

    if (data?.ok) {
      setVerified(true);
      setVerifying(false);
      toast({
        title: "Wallet aktualisiert",
        description: `Neues Guthaben: €${Number(data.newBalance || 0).toFixed(2)}`,
      });
      return;
    }

    setError("Zahlung ist noch nicht als bezahlt bestätigt. Bitte versuchen Sie es in 10 Sekunden erneut.");
    setVerifying(false);
  };

  useEffect(() => {
    if (sessionId) {
      verify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-16 flex-1 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          {verifying ? (
            <>
              <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-bold mb-2">Guthaben wird aktualisiert…</h1>
              <p className="text-muted-foreground">Bitte warten Sie einen Moment.</p>
            </>
          ) : error ? (
            <>
              <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Fast geschafft</h1>
              <p className="text-muted-foreground mb-6">{error}</p>
              <div className="space-y-3">
                {sessionId && (
                  <Button onClick={verify} className="w-full">
                    Erneut versuchen
                  </Button>
                )}
                <Button variant="outline" onClick={() => navigate("/handwerker/dashboard")} className="w-full">
                  Zum Dashboard
                </Button>
              </div>
            </>
          ) : (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Zahlung erfolgreich!</h1>
              <p className="text-muted-foreground mb-6">€{amountLabel} wurden Ihrem Wallet gutgeschrieben.</p>
              <Button onClick={() => navigate("/handwerker/dashboard")} className="w-full">
                Zum Dashboard
              </Button>
            </>
          )}
        </Card>
      </div>
      <Footer />
    </div>
  );
}
