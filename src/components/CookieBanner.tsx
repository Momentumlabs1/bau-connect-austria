import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cookie } from "lucide-react";
import { Link } from "react-router-dom";

export const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = (type: 'all' | 'necessary') => {
    localStorage.setItem('cookie-consent', type);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-5">
      <Card className="max-w-4xl mx-auto p-6 shadow-lg bg-background border-2">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-shrink-0">
            <Cookie className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">Cookie-Einstellungen</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Wir verwenden ausschließlich technisch notwendige Cookies, um die Funktionalität unserer Plattform zu gewährleisten (Authentifizierung, Session-Management). Diese Cookies sind für den Betrieb der Website unerlässlich.
            </p>
            <p className="text-xs text-muted-foreground">
              Weitere Informationen finden Sie in unserer{" "}
              <Link to="/datenschutz" className="text-primary hover:underline">
                Datenschutzerklärung
              </Link>
              .
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() => handleAccept('necessary')}
              className="w-full sm:w-auto"
            >
              Nur notwendige
            </Button>
            <Button
              onClick={() => handleAccept('all')}
              className="w-full sm:w-auto"
            >
              Alle akzeptieren
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
