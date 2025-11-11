import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { MapPin, Calendar, Euro } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  title: string;
  description: string;
  gewerk_id: string;
  postal_code: string;
  city: string;
  budget_min: number | null;
  budget_max: number | null;
  urgency: string;
  created_at: string;
}

export default function ContractorProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTrade, setFilterTrade] = useState<string>("all");
  const [filterPostal, setFilterPostal] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, [filterTrade, filterPostal]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("projects")
        .select("*")
        .eq("status", "open")
        .eq("visibility", "public")
        .order("created_at", { ascending: false });

      if (filterTrade !== "all") {
        query = query.eq("gewerk_id", filterTrade);
      }

      if (filterPostal) {
        query = query.eq("postal_code", filterPostal);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProjects(data || []);
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

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "default";
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case "high": return "Dringend";
      case "medium": return "Normal";
      case "low": return "Niedrig";
      default: return urgency;
    }
  };

  const getDaysAgo = (dateString: string) => {
    const days = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return "Heute";
    if (days === 1) return "Gestern";
    return `vor ${days} Tagen`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Projekt-Marktplatz</h1>
          <p className="text-muted-foreground">
            Finden Sie passende Aufträge in Ihrer Region
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Gewerk</label>
                <Select value={filterTrade} onValueChange={setFilterTrade}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Gewerke</SelectItem>
                    <SelectItem value="Elektriker">Elektriker</SelectItem>
                    <SelectItem value="Sanitär">Sanitär</SelectItem>
                    <SelectItem value="Maler">Maler</SelectItem>
                    <SelectItem value="Bau">Bau</SelectItem>
                    <SelectItem value="Sonstige">Sonstige</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Postleitzahl</label>
                <Input
                  placeholder="z.B. 1010"
                  value={filterPostal}
                  onChange={(e) => setFilterPostal(e.target.value)}
                  maxLength={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Projekte werden geladen...</p>
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Keine Projekte gefunden. Versuchen Sie andere Filter.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge>{project.gewerk_id}</Badge>
                    <Badge variant={getUrgencyColor(project.urgency)}>
                      {getUrgencyLabel(project.urgency)}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {project.postal_code} {project.city}
                    </div>
                    {(project.budget_min || project.budget_max) && (
                      <div className="flex items-center text-muted-foreground">
                        <Euro className="h-4 w-4 mr-2" />
                        {project.budget_min && project.budget_max
                          ? `€${project.budget_min} - €${project.budget_max}`
                          : project.budget_min
                          ? `ab €${project.budget_min}`
                          : `bis €${project.budget_max}`}
                      </div>
                    )}
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {getDaysAgo(project.created_at)}
                    </div>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => navigate(`/handwerker/projekt/${project.id}`)}
                  >
                    Details ansehen
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
