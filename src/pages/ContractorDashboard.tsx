import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Loader2, Clock, DollarSign, Star, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContractorProfile {
  verified: boolean;
  rating: number;
  total_reviews: number;
}

export default function ContractorDashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ContractorProfile | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchProfile();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profile?.role !== "contractor") {
      toast({
        title: "Zugriff verweigert",
        description: "Sie haben keine Berechtigung für diese Seite",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("contractors")
        .select("verified, rating, total_reviews")
        .eq("id", session.user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      setProfile(data);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Handwerker Dashboard</h1>
          <p className="text-muted-foreground">Willkommen zurück</p>
        </div>

        {!profile && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Profil vervollständigen</AlertTitle>
            <AlertDescription>
              Bitte vervollständigen Sie Ihr Profil um Aufträge zu erhalten.
              <Button 
                className="mt-2 w-full"
                onClick={() => navigate("/handwerker/profil-erstellen")}
              >
                Profil jetzt erstellen
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {profile && !profile.verified && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Profil wird geprüft</AlertTitle>
            <AlertDescription>
              Ihr Profil wird aktuell von unserem Team geprüft. 
              Sie können Aufträge sehen, sobald Ihr Profil verifiziert wurde.
            </AlertDescription>
          </Alert>
        )}

        {profile && profile.verified && (
          <Button 
            size="lg"
            onClick={() => navigate("/handwerker/projekte")}
            className="mb-6"
          >
            Projekt-Marktplatz durchsuchen
          </Button>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Neue Aufträge</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Verfügbare Projekte in Ihrer Region
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gekaufte Leads</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Leads in diesem Monat
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bewertung</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profile?.rating?.toFixed(1) || "0.0"}
              </div>
              <p className="text-xs text-muted-foreground">
                {profile?.total_reviews || 0} Bewertungen
              </p>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
