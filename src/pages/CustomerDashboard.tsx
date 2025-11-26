import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Plus, Loader2, Briefcase, Users, MessageSquare, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Footer } from "@/components/Footer";

interface Project {
  id: string;
  title: string;
  gewerk_id: string;
  city: string;
  budget_min: number | null;
  budget_max: number | null;
  status: string;
  created_at: string;
  interested_contractors: number;
  active_chats: number;
  contractors: Array<{
    id: string;
    company_name: string;
    rating: number;
    lead_purchased: boolean;
  }>;
}

export default function CustomerDashboard() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [bulkMessageDialog, setBulkMessageDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [bulkMessage, setBulkMessage] = useState("");
  const [sending, setSending] = useState(false);
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

    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id);

    const roles = userRoles?.map(r => r.role) || [];
    
    if (!roles.includes("customer")) {
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: projectsData, error } = await supabase
        .from("projects")
        .select(`
          id,
          title,
          gewerk_id,
          city,
          budget_min,
          budget_max,
          status,
          created_at,
          matches(
            id,
            contractor_id,
            lead_purchased,
            contractors(
              id,
              company_name,
              rating
            )
          ),
          conversations(
            id
          )
        `)
        .eq('customer_id', session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data to include counts
      const transformedProjects = projectsData?.map((project: any) => ({
        id: project.id,
        title: project.title,
        gewerk_id: project.gewerk_id,
        city: project.city,
        budget_min: project.budget_min,
        budget_max: project.budget_max,
        status: project.status,
        created_at: project.created_at,
        interested_contractors: project.matches?.length || 0,
        active_chats: project.conversations?.length || 0,
        contractors: project.matches?.map((match: any) => ({
          id: match.contractors?.id,
          company_name: match.contractors?.company_name,
          rating: match.contractors?.rating,
          lead_purchased: match.lead_purchased
        })) || []
      })) || [];

      setProjects(transformedProjects);
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

  const openBulkMessageDialog = (project: Project) => {
    setSelectedProject(project);
    setBulkMessage(`Guten Tag,\n\nvielen Dank für Ihr Interesse an meinem Projekt "${project.title}".\n\nIch würde mich freuen, von Ihnen ein Angebot zu erhalten.\n\nMit freundlichen Grüßen`);
    setBulkMessageDialog(true);
  };

  const sendBulkMessages = async () => {
    if (!selectedProject || !bulkMessage.trim()) return;

    const trimmedMessage = bulkMessage.trim();
    
    if (trimmedMessage.length === 0) {
      toast({
        title: "Fehler",
        description: "Nachricht darf nicht leer sein.",
        variant: "destructive"
      });
      return;
    }
    
    if (trimmedMessage.length > 5000) {
      toast({
        title: "Nachricht zu lang",
        description: "Nachricht darf maximal 5000 Zeichen lang sein.",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const contractorIds = selectedProject.contractors.map(c => c.id);

      for (const contractorId of contractorIds) {
        const { data: existingConv } = await supabase
          .from("conversations")
          .select("id")
          .eq("customer_id", user.id)
          .eq("contractor_id", contractorId)
          .eq("project_id", selectedProject.id)
          .maybeSingle();

        let conversationId = existingConv?.id;

        if (!conversationId) {
          const { data: newConv } = await supabase
            .from("conversations")
            .insert({
              customer_id: user.id,
              contractor_id: contractorId,
              project_id: selectedProject.id
            })
            .select("id")
            .single();

          conversationId = newConv?.id;
        }

        if (conversationId) {
          await supabase.from("messages").insert({
            conversation_id: conversationId,
            sender_id: user.id,
            message: trimmedMessage
          });

          await supabase.from("notifications").insert({
            handwerker_id: contractorId,
            type: "NEW_MESSAGE",
            title: "Neue Nachricht vom Kunden",
            body: `${selectedProject.title}: ${trimmedMessage.substring(0, 100)}...`,
            data: {
              project_id: selectedProject.id,
              conversation_id: conversationId
            }
          });
        }
      }

      toast({
        title: "Nachrichten gesendet",
        description: `Anfrage an ${contractorIds.length} Handwerker gesendet.`
      });

      setBulkMessageDialog(false);
      setBulkMessage("");
    } catch (error) {
      console.error("Error sending bulk messages:", error);
      toast({
        title: "Fehler",
        description: "Nachrichten konnten nicht gesendet werden.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
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
            <p className="text-muted-foreground">Verwalten Sie Ihre Projekte und kommunizieren Sie mit interessierten Handwerkern</p>
          </div>
          <Button onClick={() => navigate("/kunde/projekt-erstellen")}>
            <Plus className="mr-2 h-4 w-4" />
            Neues Projekt erstellen
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">Alle ({projects.length})</TabsTrigger>
            <TabsTrigger value="open">Offen ({filterProjects("open").length})</TabsTrigger>
            <TabsTrigger value="active">In Bearbeitung ({filterProjects("active").length})</TabsTrigger>
            <TabsTrigger value="completed">Abgeschlossen ({filterProjects("completed").length})</TabsTrigger>
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
                <div className="space-y-4">
                  {filterProjects(tab).map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow">
                        <div className="p-6">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start gap-3 mb-3">
                                <Briefcase className="h-5 w-5 text-primary mt-1" />
                                <div>
                                  <h3 className="text-xl font-semibold">{project.title}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    Eingestellt am {format(new Date(project.created_at), 'dd. MMM yyyy', { locale: de })} • {project.city}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="bg-muted/50 p-4 rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-semibold text-2xl">
                                      {project.interested_contractors}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {project.interested_contractors === 1 ? 'Interessent' : 'Interessenten'}
                                  </p>
                                </div>

                                <div className="bg-muted/50 p-4 rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-semibold text-2xl">
                                      {project.active_chats}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {project.active_chats === 1 ? 'Chat' : 'Chats'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2 md:w-48">
                              {getStatusBadge(project.status)}
                              <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={() => navigate(`/kunde/projekt/${project.id}`)}
                              >
                                Details ansehen
                              </Button>
                              {project.interested_contractors > 0 && (
                                <Button 
                                  variant="default"
                                  className="w-full"
                                  onClick={() => openBulkMessageDialog(project)}
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  Anfrage an alle
                                </Button>
                              )}
                            </div>
                          </div>

                          {project.contractors.length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                              <p className="text-sm font-medium mb-2">Interessierte Handwerker:</p>
                              <div className="flex flex-wrap gap-2">
                                {project.contractors.map((contractor) => (
                                  <Badge
                                    key={contractor.id}
                                    variant={contractor.lead_purchased ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => navigate(`/handwerker/${contractor.id}`)}
                                  >
                                    {contractor.company_name}
                                    {contractor.lead_purchased && " ✓"}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Footer />

      {/* Bulk Message Dialog */}
      <Dialog open={bulkMessageDialog} onOpenChange={setBulkMessageDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Anfrage an {selectedProject?.interested_contractors} Handwerker senden
            </DialogTitle>
            <DialogDescription>
              Senden Sie eine Nachricht an alle interessierten Handwerker für "{selectedProject?.title}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Textarea
              value={bulkMessage}
              onChange={(e) => setBulkMessage(e.target.value)}
              rows={8}
              placeholder="Ihre Nachricht an die Handwerker..."
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkMessageDialog(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={sendBulkMessages}
              disabled={!bulkMessage.trim() || sending}
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Wird gesendet...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  An {selectedProject?.interested_contractors} Handwerker senden
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
