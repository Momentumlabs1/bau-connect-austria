import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const demoContractors = [
  {
    email: "elektriker.wien@demo.at",
    password: "Demo1234!",
    company_name: "Elektro Mustermann GmbH",
    trades: ["elektriker"],
    city: "Wien",
    postal_code: "1010",
    postal_codes: ["1010", "1020", "1030"],
    address: "Hauptstraße 1",
    service_radius: 50,
    description: "Professionelle Elektroinstallationen seit 2010. Spezialisiert auf Smart Home und PV-Anlagen.",
    wallet_balance: 500,
    rating: 4.5,
    total_reviews: 15,
    verified: true,
    handwerker_status: 'APPROVED' as const
  },
  {
    email: "elektriker.linz@demo.at",
    password: "Demo1234!",
    company_name: "Elektro Huber OG",
    trades: ["elektriker"],
    city: "Linz",
    postal_code: "4020",
    postal_codes: ["4020", "4030", "4040"],
    address: "Linzer Straße 10",
    service_radius: 40,
    description: "Ihr Partner für alle elektrischen Arbeiten in Oberösterreich. 20 Jahre Erfahrung.",
    wallet_balance: 750,
    rating: 4.8,
    total_reviews: 28,
    verified: true,
    handwerker_status: 'APPROVED' as const
  },
  {
    email: "maler.salzburg@demo.at",
    password: "Demo1234!",
    company_name: "Malerei Gruber",
    trades: ["maler"],
    city: "Salzburg",
    postal_code: "5020",
    postal_codes: ["5020", "5023", "5026"],
    address: "Salzburger Straße 5",
    service_radius: 35,
    description: "Hochwertige Malerarbeiten für Innen und Außen. Schnell, sauber, professionell.",
    wallet_balance: 400,
    rating: 4.6,
    total_reviews: 22,
    verified: true,
    handwerker_status: 'APPROVED' as const
  },
  {
    email: "maler.graz@demo.at",
    password: "Demo1234!",
    company_name: "Fassadenprofi Steiermark",
    trades: ["maler"],
    city: "Graz",
    postal_code: "8010",
    postal_codes: ["8010", "8020", "8041"],
    address: "Grazer Platz 3",
    service_radius: 45,
    description: "Spezialist für Innen- und Außenmalerei, Fassadengestaltung und Tapezierarbeiten.",
    wallet_balance: 600,
    rating: 4.7,
    total_reviews: 19,
    verified: true,
    handwerker_status: 'APPROVED' as const
  },
  {
    email: "sanitaer.innsbruck@demo.at",
    password: "Demo1234!",
    company_name: "Sanitär & Heizung Tirol GmbH",
    trades: ["sanitar-heizung"],
    city: "Innsbruck",
    postal_code: "6020",
    postal_codes: ["6020", "6060", "6080"],
    address: "Innsbrucker Straße 15",
    service_radius: 50,
    description: "Sanitärinstallationen, Heizungsbau, Wartung. Notdienst 24/7 verfügbar.",
    wallet_balance: 800,
    rating: 4.9,
    total_reviews: 35,
    verified: true,
    handwerker_status: 'APPROVED' as const
  },
  {
    email: "sanitaer.klagenfurt@demo.at",
    password: "Demo1234!",
    company_name: "Heizung Kärnten Service",
    trades: ["sanitar-heizung"],
    city: "Klagenfurt",
    postal_code: "9020",
    postal_codes: ["9020", "9100", "9500"],
    address: "Kärntner Ring 8",
    service_radius: 60,
    description: "Ihr Partner für Heizung, Sanitär und Klimatechnik in Kärnten.",
    wallet_balance: 550,
    rating: 4.4,
    total_reviews: 17,
    verified: true,
    handwerker_status: 'APPROVED' as const
  },
  {
    email: "dachdecker.wels@demo.at",
    password: "Demo1234!",
    company_name: "Dachprofi Oberösterreich",
    trades: ["dachdecker"],
    city: "Wels",
    postal_code: "4600",
    postal_codes: ["4600", "4650", "4680"],
    address: "Dachstraße 20",
    service_radius: 55,
    description: "Dachdeckerarbeiten aller Art. Von Reparaturen bis Neueindeckungen.",
    wallet_balance: 700,
    rating: 4.7,
    total_reviews: 24,
    verified: true,
    handwerker_status: 'APPROVED' as const
  },
  {
    email: "dachdecker.villach@demo.at",
    password: "Demo1234!",
    company_name: "Alpen Dachdecker GmbH",
    trades: ["dachdecker"],
    city: "Villach",
    postal_code: "9500",
    postal_codes: ["9500", "9520", "9560"],
    address: "Villacher Straße 12",
    service_radius: 50,
    description: "Spezialisiert auf Steildach, Flachdach und Dachsanierungen.",
    wallet_balance: 450,
    rating: 4.5,
    total_reviews: 20,
    verified: true,
    handwerker_status: 'APPROVED' as const
  },
  {
    email: "fassade.dornbirn@demo.at",
    password: "Demo1234!",
    company_name: "Fassadenbau Vorarlberg",
    trades: ["fassade"],
    city: "Dornbirn",
    postal_code: "6850",
    postal_codes: ["6850", "6900", "6923"],
    address: "Vorarlberger Straße 7",
    service_radius: 40,
    description: "Fassadensanierung, Wärmedämmung, Verputzarbeiten. Qualität aus Vorarlberg.",
    wallet_balance: 650,
    rating: 4.8,
    total_reviews: 30,
    verified: true,
    handwerker_status: 'APPROVED' as const
  },
  {
    email: "fassade.steyr@demo.at",
    password: "Demo1234!",
    company_name: "Fassadenservice Steyr OG",
    trades: ["fassade"],
    city: "Steyr",
    postal_code: "4400",
    postal_codes: ["4400", "4407", "4421"],
    address: "Steyrer Platz 9",
    service_radius: 45,
    description: "Fassadengestaltung, Vollwärmeschutz und Außenputz vom Fachmann.",
    wallet_balance: 500,
    rating: 4.6,
    total_reviews: 18,
    verified: true,
    handwerker_status: 'APPROVED' as const
  }
];

export default function SeedContractors() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Array<{ email: string; success: boolean; error?: string }>>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const seedContractors = async () => {
    setLoading(true);
    const seedResults: Array<{ email: string; success: boolean; error?: string }> = [];

    for (const contractor of demoContractors) {
      try {
        console.log(`🌱 Seeding contractor: ${contractor.email}`);

        // Sign up the contractor
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: contractor.email,
          password: contractor.password,
          options: {
            data: {
              role: 'contractor'
            }
          }
        });

        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            seedResults.push({ email: contractor.email, success: false, error: 'Already exists' });
            continue;
          }
          throw signUpError;
        }

        if (!authData.user) {
          throw new Error('No user returned from signup');
        }

        // Wait a bit for profile to be created by trigger
        await new Promise(resolve => setTimeout(resolve, 500));

        // Insert contractor profile
        const { error: contractorError } = await supabase
          .from('contractors')
          .insert({
            id: authData.user.id,
            company_name: contractor.company_name,
            trades: contractor.trades,
            city: contractor.city,
            postal_code: contractor.postal_code,
            postal_codes: contractor.postal_codes,
            address: contractor.address,
            service_radius: contractor.service_radius,
            description: contractor.description,
            wallet_balance: contractor.wallet_balance,
            rating: contractor.rating,
            total_reviews: contractor.total_reviews,
            verified: contractor.verified,
            handwerker_status: contractor.handwerker_status,
            min_project_value: 500,
            accepts_urgent: true,
            quality_score: 85
          });

        if (contractorError) {
          console.error('Contractor insert error:', contractorError);
          throw contractorError;
        }

        console.log(`✅ Successfully seeded: ${contractor.email}`);
        seedResults.push({ email: contractor.email, success: true });

      } catch (error: any) {
        console.error(`❌ Failed to seed ${contractor.email}:`, error);
        seedResults.push({ 
          email: contractor.email, 
          success: false, 
          error: error.message 
        });
      }
    }

    setResults(seedResults);
    setLoading(false);

    const successCount = seedResults.filter(r => r.success).length;
    toast({
      title: "Seeding abgeschlossen",
      description: `${successCount} von ${demoContractors.length} Demo-Contractors erstellt`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Demo-Contractors erstellen</h1>
            <p className="text-muted-foreground">
              Erstellt 10 Demo-Handwerker (2 pro Gewerk) mit vollständigen Profilen für Testing
            </p>
          </div>

          <div className="space-y-4">
            {results.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Klicken Sie auf den Button, um Demo-Contractors zu erstellen
                </p>
                <Button 
                  onClick={seedContractors} 
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Erstelle Contractors...
                    </>
                  ) : (
                    '🌱 Demo-Contractors erstellen'
                  )}
                </Button>
              </div>
            ) : (
              <>
                <h3 className="font-semibold text-lg mb-4">Ergebnisse:</h3>
                <div className="space-y-2">
                  {results.map((result, i) => (
                    <div 
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                        )}
                        <span className="font-mono text-sm">{result.email}</span>
                      </div>
                      <span className={result.success ? "text-green-600" : "text-yellow-600"}>
                        {result.success ? '✅ Erstellt' : `⚠️ ${result.error}`}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 justify-center mt-6">
                  <Button onClick={() => navigate('/handwerker/dashboard')}>
                    Zum Handwerker Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/kunde/dashboard')}>
                    Zum Kunden Dashboard
                  </Button>
                </div>
              </>
            )}
          </div>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">📋 Demo Login Credentials:</h4>
            <p className="text-sm text-muted-foreground mb-2">Alle Accounts verwenden das Passwort: <code>Demo1234!</code></p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>⚡ elektriker.wien@demo.at (Wien)</li>
              <li>⚡ elektriker.linz@demo.at (Linz)</li>
              <li>🎨 maler.salzburg@demo.at (Salzburg)</li>
              <li>🎨 maler.graz@demo.at (Graz)</li>
              <li>💧 sanitaer.innsbruck@demo.at (Innsbruck)</li>
              <li>💧 sanitaer.klagenfurt@demo.at (Klagenfurt)</li>
              <li>🏠 dachdecker.wels@demo.at (Wels)</li>
              <li>🏠 dachdecker.villach@demo.at (Villach)</li>
              <li>🧱 fassade.dornbirn@demo.at (Dornbirn)</li>
              <li>🧱 fassade.steyr@demo.at (Steyr)</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
