import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, MessageSquare, Users, Calendar, Loader2, Send } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Project {
  id: string;
  title: string;
  gewerk_id: string;
  city: string;
  created_at: string;
  status: string;
  urgency: string;
  interested_contractors: number;
  active_chats: number;
  contractors: Array<{
    id: string;
    company_name: string;
    rating: number;
    lead_purchased: boolean;
  }>;
}

export default function CustomerMyProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkMessageDialog, setBulkMessageDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [bulkMessage, setBulkMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: projectsData, error } = await supabase
        .from("projects")
        .select(`
          id,
          title,
          gewerk_id,
          city,
          created_at,
          status,
          urgency,
          matches!inner(
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
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data to include counts
      const transformedProjects = projectsData?.map((project: any) => ({
        id: project.id,
        title: project.title,
        gewerk_id: project.gewerk_id,
        city: project.city,
        created_at: project.created_at,
        status: project.status,
        urgency: project.urgency,
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
    } catch (error) {
      console.error("Error loading projects:", error);
      toast({
        title: "Fehler",
        description: "Projekte konnten nicht geladen werden.",
        variant: "destructive"
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

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const contractorIds = selectedProject.contractors.map(c => c.id);

      for (const contractorId of contractorIds) {
        // Get or create conversation
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
          // Send message
          await supabase.from("messages").insert({
            conversation_id: conversationId,
            sender_id: user.id,
            message: bulkMessage
          });

          // Create notification
          await supabase.from("notifications").insert({
            handwerker_id: contractorId,
            type: "NEW_MESSAGE",
            title: "Neue Nachricht vom Kunden",
            body: `${selectedProject.title}: ${bulkMessage.substring(0, 100)}...`,
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
    switch (status) {
      case 'open': return <Badge variant="default">Offen</Badge>;
      case 'in_progress': return <Badge variant="secondary">In Bearbeitung</Badge>;
      case 'completed': return <Badge>Abgeschlossen</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
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
          <h1 className="text-3xl font-bold mb-2">Meine eingestellten Aufträge</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Projekte und kommunizieren Sie mit interessierten Handwerkern
          </p>
        </div>

        {projects.length === 0 ? (
          <Card className="p-12 text-center">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Noch keine Projekte</h3>
            <p className="text-muted-foreground mb-6">
              Erstellen Sie Ihr erstes Projekt und erhalten Sie Angebote von qualifizierten Handwerkern.
            </p>
            <Button onClick={() => navigate("/kunde/projekt-erstellen")}>
              Erstes Projekt erstellen
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
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
                          {project.interested_contractors > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Warten auf Ihre Entscheidung
                            </p>
                          )}
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
                          {project.active_chats > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Unterhaltung läuft
                            </p>
                          )}
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
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

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
