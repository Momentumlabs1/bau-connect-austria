import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { seedDemoContractors } from "@/utils/seedDemoContractors";
import { useToast } from "@/hooks/use-toast";

export default function SeedDemo() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const { toast } = useToast();

  const handleSeed = async () => {
    setLoading(true);
    try {
      const seedResults = await seedDemoContractors();
      setResults(seedResults);
      
      const successCount = seedResults.filter(r => r.success).length;
      toast({
        title: "Seed abgeschlossen",
        description: `${successCount} von ${seedResults.length} Demo-Handwerker erstellt`,
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Demo-Daten seeden</CardTitle>
            <CardDescription>
              Erstellt 10 Demo-Handwerker (2 pro Gewerk) mit vollständigen Profilen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleSeed} 
              disabled={loading}
              size="lg"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Demo-Handwerker werden erstellt...
                </>
              ) : (
                "10 Demo-Handwerker erstellen"
              )}
            </Button>

            {results.length > 0 && (
              <div className="space-y-2 mt-6">
                <h3 className="font-semibold mb-3">Ergebnisse:</h3>
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <span className="text-sm font-mono">{result.email}</span>
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{result.error}</span>
                        <XCircle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 p-4 bg-muted rounded-lg text-sm space-y-2">
              <p className="font-semibold">Demo-Handwerker Details:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>2x Elektriker (Schmidt, Müller)</li>
                <li>2x Sanitär-Heizung (Wagner, Huber)</li>
                <li>2x Dachdecker (König, Bauer)</li>
                <li>2x Fassade (Gruber, Steiner)</li>
                <li>2x Maler (Fuchs, Berger)</li>
              </ul>
              <p className="text-xs mt-3">
                Alle Passwörter: <code className="bg-background px-2 py-1 rounded">Demo123!</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
