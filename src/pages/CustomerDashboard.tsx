import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Plus, Loader2, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  title: string;
  gewerk_id: string;
  budget_min: number | null;
  budget_max: number | null;
  status: string;
  created_at: string;
}

export default function CustomerDashboard() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchProjects();
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
      .maybeSingle();

    if (profile?.role !== "customer") {
      toast({
        title: "Zugriff verweigert",
        description: "Sie haben keine Berechtigung für diese Seite",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

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

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      open: { label: "Offen", variant: "default" },
      assigned: { label: "In Bearbeitung", variant: "secondary" },
      completed: { label: "Abgeschlossen", variant: "outline" },
      cancelled: { label: "Abgebrochen", variant: "destructive" },
    };

    const config = statusConfig[status] || statusConfig.open;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filterProjects = (status: string) => {
    if (status === "all") return projects;
    if (status === "open") return projects.filter(p => p.status === "open");
    if (status === "active") return projects.filter(p => p.status === "assigned");
    if (status === "completed") return projects.filter(p => p.status === "completed");
    return projects;
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Meine Aufträge</h1>
            <p className="text-muted-foreground">Verwalten Sie Ihre Projekte</p>
          </div>
          <Button onClick={() => navigate("/kunde/projekt-erstellen")}>
            <Plus className="mr-2 h-4 w-4" />
            Neues Projekt erstellen
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">Alle</TabsTrigger>
            <TabsTrigger value="open">Offen</TabsTrigger>
            <TabsTrigger value="active">In Bearbeitung</TabsTrigger>
            <TabsTrigger value="completed">Abgeschlossen</TabsTrigger>
          </TabsList>

          {["all", "open", "active", "completed"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              {filterProjects(tab).length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Briefcase className="mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-lg font-semibold">Noch keine Projekte</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Erstellen Sie Ihr erstes Projekt und erhalten Sie Angebote
                    </p>
                    <Button onClick={() => navigate("/kunde/projekt-erstellen")}>
                      <Plus className="mr-2 h-4 w-4" />
                      Projekt erstellen
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filterProjects(tab).map((project) => (
                    <Card key={project.id} className="cursor-pointer transition-shadow hover:shadow-md">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{project.title}</CardTitle>
                            <CardDescription>{project.gewerk_id}</CardDescription>
                          </div>
                          {getStatusBadge(project.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {project.budget_min && project.budget_max && (
                          <p className="text-sm text-muted-foreground">
                            Budget: €{project.budget_min} - €{project.budget_max}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-muted-foreground">
                          Erstellt: {new Date(project.created_at).toLocaleDateString("de-AT")}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
