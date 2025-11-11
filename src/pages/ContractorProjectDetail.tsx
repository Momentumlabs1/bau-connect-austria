import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { MapPin, Calendar, Euro, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Project {
  id: string;
  title: string;
  description: string;
  gewerk_id: string;
  postal_code: string;
  city: string;
  address: string | null;
  budget_min: number | null;
  budget_max: number | null;
  urgency: string;
  preferred_start_date: string | null;
  images: string[];
  created_at: string;
}

export default function ContractorProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState("");
  const [hasMatch, setHasMatch] = useState(false);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    loadProject();
    checkAuth();
  }, [id]);

  const checkAuth = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      setUserId(data.user.id);
    }
  };

  const loadProject = async () => {
    setLoading(true);
    try {
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // Check if already applied
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data: matchData } = await supabase
          .from("matches")
          .select("*")
          .eq("project_id", id)
          .eq("contractor_id", userData.user.id)
          .maybeSingle();

        setHasMatch(!!matchData);
      }
    } catch (error: any) {
      toast({
        title: "Fehler beim Laden",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!message.trim()) {
      toast({
        title: "Nachricht erforderlich",
        description: "Bitte geben Sie eine Nachricht ein",
        variant: "destructive",
      });
      return;
    }

    setApplying(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Nicht angemeldet");

      // Check free leads
      const { data: contractor } = await supabase
        .from("contractors")
        .select("free_leads_remaining")
        .eq("id", userData.user.id)
        .single();

      if (!contractor || contractor.free_leads_remaining <= 0) {
        toast({
          title: "Keine kostenlosen Leads mehr",
          description: "Sie haben keine kostenlosen Leads mehr verfügbar",
          variant: "destructive",
        });
        return;
      }

      // Create match
      const { error: matchError } = await supabase
        .from("matches")
        .insert({
          project_id: id,
          contractor_id: userData.user.id,
          match_type: "applied",
          status: "pending",
          message: message,
          lead_purchased: true,
          purchased_at: new Date().toISOString(),
          score: 80
        });

      if (matchError) throw matchError;

      // Decrease free leads
      const { error: updateError } = await supabase
        .from("contractors")
        .update({ free_leads_remaining: contractor.free_leads_remaining - 1 })
        .eq("id", userData.user.id);

      if (updateError) throw updateError;

      toast({
        title: "Bewerbung gesendet!",
        description: "Der Kunde wird Ihre Bewerbung prüfen",
      });

      navigate("/handwerker/dashboard");
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Projekt wird geladen...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Projekt nicht gefunden</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate("/handwerker/projekte")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zu Projekten
        </Button>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge>{project.gewerk_id}</Badge>
                  <Badge variant={project.urgency === "high" ? "destructive" : "default"}>
                    {project.urgency === "high" ? "Dringend" : project.urgency === "medium" ? "Normal" : "Niedrig"}
                  </Badge>
                </div>
                <CardTitle className="text-2xl">{project.title}</CardTitle>
                <CardDescription>
                  Erstellt am {format(new Date(project.created_at), "PPP", { locale: de })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Beschreibung</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{project.description}</p>
                </div>

                {project.images && project.images.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Bilder</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {project.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Projekt ${idx + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {!hasMatch && (
              <Card>
                <CardHeader>
                  <CardTitle>Jetzt bewerben</CardTitle>
                  <CardDescription>
                    Senden Sie eine Nachricht an den Kunden
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="message">Ihre Nachricht</Label>
                    <Textarea
                      id="message"
                      rows={5}
                      placeholder="Stellen Sie sich vor und beschreiben Sie, warum Sie der richtige Handwerker für dieses Projekt sind..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleApply} disabled={applying} className="w-full">
                    {applying ? "Wird gesendet..." : "Bewerbung senden (1 kostenloser Lead)"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {hasMatch && (
              <Card>
                <CardContent className="py-6 text-center">
                  <p className="text-muted-foreground">
                    Sie haben sich bereits für dieses Projekt beworben
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Projektdetails</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Standort</p>
                    <p className="text-sm text-muted-foreground">
                      {project.postal_code} {project.city}
                      {project.address && <><br />{project.address}</>}
                    </p>
                  </div>
                </div>

                {(project.budget_min || project.budget_max) && (
                  <div className="flex items-start">
                    <Euro className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Budget</p>
                      <p className="text-sm text-muted-foreground">
                        {project.budget_min && project.budget_max
                          ? `€${project.budget_min} - €${project.budget_max}`
                          : project.budget_min
                          ? `ab €${project.budget_min}`
                          : `bis €${project.budget_max}`}
                      </p>
                    </div>
                  </div>
                )}

                {project.preferred_start_date && (
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Starttermin</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(project.preferred_start_date), "PPP", { locale: de })}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
