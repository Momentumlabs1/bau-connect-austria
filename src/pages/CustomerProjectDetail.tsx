import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { OfferList } from "@/components/offers/OfferList";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { MapPin, Calendar, Euro, Star, MessageSquare, Loader2, CheckCircle } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  gewerk_id: string;
  postal_code: string;
  city: string;
  address: string | null;
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
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [selectedContractorId, setSelectedContractorId] = useState<string | null>(null);

  useEffect(() => {
    loadProjectDetails();
  }, [id]);

  const loadProjectDetails = async () => {
    try {
      console.log('🔍 Loading project details for ID:', id);
      
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);
      console.log('✅ Project loaded:', projectData.title);

      // Load MATCHED contractors from matches table
      console.log('🎯 Loading matched contractors...');
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select(`
          *,
          contractor:contractors(*)
        `)
        .eq('project_id', id)
        .order('score', { ascending: false });

      if (matchesError) {
        console.warn('⚠️ No matches found, loading contractors with matching trade');
        // Fallback: Load all contractors with matching trade
        const { data: contractors } = await supabase
          .from('contractors')
          .select('*')
          .contains('trades', [projectData.gewerk_id])
          .in('handwerker_status', ['REGISTERED', 'APPROVED', 'UNDER_REVIEW'])
          .order('rating', { ascending: false })
          .limit(10);
        
        setMatchedContractors(contractors || []);
        console.log(`📋 Loaded ${contractors?.length || 0} contractors (fallback)`);
      } else {
        // Extract contractors from matches and get their IDs
        const contractors = matchesData
          .map(match => match.contractor)
          .filter(Boolean);
        setMatchedContractors(contractors);
        console.log(`✅ Loaded ${contractors.length} matched contractors`);
        
        // Set first contractor as selected for review
        if (contractors.length > 0) {
          setSelectedContractorId(contractors[0].id);
        }
      }
    } catch (error: any) {
      console.error('❌ Error loading project details:', error);
      toast({
        title: "Fehler beim Laden",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProject = async () => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: 'completed' })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Projekt abgeschlossen',
        description: 'Sie können nun den Handwerker bewerten'
      });

      setShowCompleteDialog(false);
      setShowReviewDialog(true);
      loadProjectDetails();
    } catch (error: any) {
      console.error('❌ Error completing project:', error);
      toast({
        title: 'Fehler',
        description: 'Projekt konnte nicht abgeschlossen werden',
        variant: 'destructive'
      });
    }
  };

  const handleReviewSuccess = () => {
    setShowReviewDialog(false);
    toast({
      title: 'Vielen Dank!',
      description: 'Ihre Bewertung wurde gespeichert'
    });
  };

  const startConversation = async (contractorId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: 'Anmeldung erforderlich',
        description: 'Bitte melden Sie sich an, um Nachrichten zu senden',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    try {
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('project_id', id)
        .eq('customer_id', session.user.id)
        .eq('contractor_id', contractorId)
        .single();

      if (existingConv) {
        navigate(`/nachrichten?conversation=${existingConv.id}`);
        return;
      }

      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          project_id: id,
          customer_id: session.user.id,
          contractor_id: contractorId,
          last_message_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      navigate(`/nachrichten?conversation=${newConv.id}`);
    } catch (error: any) {
      console.error('❌ Error starting conversation:', error);
      toast({
        title: 'Fehler',
        description: 'Konversation konnte nicht gestartet werden',
        variant: 'destructive'
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
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <div className="flex gap-2">
              <Badge className={
                project.urgency === 'high' ? 'bg-red-500' :
                project.urgency === 'medium' ? 'bg-yellow-500' :
                'bg-green-500'
              }>
                {project.urgency === 'high' ? 'Dringend' :
                 project.urgency === 'medium' ? 'Normal' :
                 'Flexibel'}
              </Badge>
              <Badge variant="outline">
                {project.status === 'open' ? 'Offen' : 
                 project.status === 'in_progress' ? 'In Bearbeitung' : 
                 'Abgeschlossen'}
              </Badge>
            </div>
          </div>

          {project.status === 'in_progress' && (
            <div className="mb-4">
              <Button onClick={() => setShowCompleteDialog(true)} className="w-full md:w-auto">
                <CheckCircle className="h-4 w-4 mr-2" />
                Projekt abschließen
              </Button>
            </div>
          )}
          
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

        {/* Tabs: Angebote & Handwerker */}
        <div className="mt-6">
          <Tabs defaultValue="offers" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="offers">Angebote</TabsTrigger>
              <TabsTrigger value="contractors">Handwerker ({matchedContractors.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="offers" className="mt-4">
              <OfferList 
                projectId={id!} 
                showActions={true}
                onOfferUpdate={loadProjectDetails}
              />
            </TabsContent>

            <TabsContent value="contractors" className="mt-4">
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
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Complete Project Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Projekt abschließen?</DialogTitle>
            <DialogDescription>
              Möchten Sie dieses Projekt als abgeschlossen markieren? Sie können danach den Handwerker bewerten.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end mt-4">
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleCompleteProject}>
              Projekt abschließen
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Handwerker bewerten</DialogTitle>
            <DialogDescription>
              Wie zufrieden waren Sie mit der Ausführung des Projekts?
            </DialogDescription>
          </DialogHeader>
          {selectedContractorId && (
            <ReviewForm
              projectId={id!}
              contractorId={selectedContractorId}
              reviewerType="CUSTOMER"
              onSuccess={handleReviewSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
