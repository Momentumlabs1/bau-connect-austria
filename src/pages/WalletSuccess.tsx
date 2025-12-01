import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function WalletSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const amount = searchParams.get("amount");

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
          <Button onClick={() => navigate("/handwerker/dashboard")} className="w-full">
            Zurück zum Dashboard
          </Button>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
