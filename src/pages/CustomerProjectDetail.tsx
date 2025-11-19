import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Calendar, Euro, Star, MessageSquare, Loader2 } from "lucide-react";

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
  images: string[];
  created_at: string;
  status: string;
}

interface Contractor {
  id: string;
  company_name: string;
  rating: number;
  total_reviews: number;
  city: string;
  trades: string[];
  profile_image_url: string | null;
  description: string | null;
  distance?: number;
}

export default function CustomerProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [matchedContractors, setMatchedContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjectDetails();
  }, [id]);

  const loadProjectDetails = async () => {
    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // Find matching contractors
      const { data: contractors } = await supabase
        .from('contractors')
        .select('*')
        .contains('trades', [projectData.gewerk_id])
        .in('handwerker_status', ['REGISTERED', 'APPROVED', 'UNDER_REVIEW'])
        .order('rating', { ascending: false })
        .limit(10);

      setMatchedContractors(contractors || []);
    } catch (error: any) {
      toast({
        title: "Fehler beim Laden",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startConversation = async (contractorId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      // Check if conversation exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('project_id', id)
        .eq('contractor_id', contractorId)
        .maybeSingle();

      if (existing) {
        navigate(`/nachrichten?conversation=${existing.id}`);
      } else {
        // Create new conversation
        const { data: newConv } = await supabase
          .from('conversations')
          .insert({
            project_id: id,
            customer_id: session.user.id,
            contractor_id: contractorId
          })
          .select()
          .single();

        navigate(`/nachrichten?conversation=${newConv.id}`);
      }
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Projekt nicht gefunden</h2>
            <Button onClick={() => navigate('/kunde/dashboard')}>
              Zurück zum Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/kunde/dashboard')} className="mb-6">
          ← Zurück zum Dashboard
        </Button>

        {/* Project Details */}
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <Badge>{project.status === 'open' ? 'Offen' : 'Geschlossen'}</Badge>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Beschreibung</h3>
              <p className="text-muted-foreground">{project.description}</p>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold mb-2">Details</h3>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{project.city}, {project.postal_code}</span>
              </div>
              {project.budget_min && project.budget_max && (
                <div className="flex items-center gap-2 text-sm">
                  <Euro className="h-4 w-4 text-muted-foreground" />
                  <span>€{project.budget_min} - €{project.budget_max}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Erstellt am {new Date(project.created_at).toLocaleDateString('de-DE')}</span>
              </div>
            </div>
          </div>

          {project.images && project.images.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Bilder</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {project.images.map((img, i) => (
                  <img 
                    key={i}
                    src={img}
                    alt={`Projekt Bild ${i + 1}`}
                    className="rounded-lg w-full h-32 object-cover"
                  />
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Matched Contractors */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Passende Handwerker ({matchedContractors.length})
          </h2>
          
          {matchedContractors.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                Aktuell keine passenden Handwerker verfügbar
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {matchedContractors.map(contractor => (
                <Card key={contractor.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={contractor.profile_image_url || ''} />
                        <AvatarFallback>{contractor.company_name[0]}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1">{contractor.company_name}</h3>
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{contractor.rating.toFixed(1)} ⭐</span>
                          <span className="text-muted-foreground">
                            ({contractor.total_reviews} Bewertungen)
                          </span>
                        </div>
                        <div className="flex gap-2 mb-2">
                          {contractor.trades.slice(0, 3).map(trade => (
                            <Badge key={trade} variant="secondary">{trade}</Badge>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          📍 {contractor.city}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => navigate(`/handwerker/${contractor.id}`)}
                      >
                        Profil
                      </Button>
                      <Button onClick={() => startConversation(contractor.id)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Nachricht
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}