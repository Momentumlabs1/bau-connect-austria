import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewList } from "@/components/reviews/ReviewList";
import { PortfolioGallery } from "@/components/portfolio/PortfolioGallery";
import { VerificationBadge } from "@/components/contractor/VerificationBadge";
import { Star, MapPin, Loader2, MessageSquare } from "lucide-react";

interface Contractor {
  id: string;
  company_name: string;
  rating: number;
  total_reviews: number;
  city: string;
  trades: string[];
  profile_image_url: string | null;
  description: string | null;
  service_radius: number;
  postal_codes: string[];
  verified: boolean;
  team_size: number | null;
  rechtsform: string | null;
  portfolio_images: string[] | null;
}

export default function PublicContractorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContractorProfile();
  }, [id]);

  const loadContractorProfile = async () => {
    try {
      const { data } = await supabase
        .from('contractors')
        .select('*')
        .eq('id', id)
        .single();
      
      setContractor(data);
    } catch (error) {
      console.error('Error loading contractor:', error);
    } finally {
      setLoading(false);
    }
  };

  const startConversation = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }
    navigate('/nachrichten');
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

  if (!contractor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Handwerker nicht gefunden</h2>
            <Button onClick={() => navigate('/kunde/handwerker-suchen')}>
              Zurück zur Suche
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
        {/* Header */}
        <Card className="p-4 md:p-8 mb-6">
          <div className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left gap-4 md:gap-6">
            <Avatar className="h-20 w-20 md:h-24 md:w-24">
              <AvatarImage src={contractor.profile_image_url || ''} />
              <AvatarFallback>{contractor.company_name[0]}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 w-full">
              <h1 className="text-xl md:text-3xl font-bold mb-2">{contractor.company_name}</h1>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-4 text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {contractor.city}
                </div>
                <VerificationBadge verified={contractor.verified} size="sm" />
              </div>
              
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{(contractor.rating ?? 0).toFixed(1)}</span>
                <span className="text-muted-foreground">
                  ({contractor.total_reviews} Bewertungen)
                </span>
              </div>
              
              <Button size="lg" onClick={startConversation} className="w-full md:w-auto mb-4">
                <MessageSquare className="h-4 w-4 mr-2" />
                Nachricht senden
              </Button>
              
              {contractor.description && (
                <p className="text-muted-foreground text-sm md:text-base">{contractor.description}</p>
              )}
            </div>
          </div>
          
          {/* Trades */}
          <div className="mt-4 md:mt-6">
            <h3 className="font-semibold mb-3 text-center md:text-left">Gewerke</h3>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {contractor.trades.map(trade => (
                <Badge key={trade} variant="secondary" className="text-sm">
                  {trade}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Service Area & Details */}
          <div className="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <h3 className="font-semibold mb-2">Service-Gebiet</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Bis {contractor.service_radius} km von {contractor.city}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {contractor.postal_codes.slice(0, 10).map(plz => (
                  <Badge key={plz} variant="outline">{plz}</Badge>
                ))}
                {contractor.postal_codes.length > 10 && (
                  <Badge variant="outline">
                    +{contractor.postal_codes.length - 10} weitere
                  </Badge>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Details</h3>
              <div className="space-y-2 text-sm">
                {contractor.team_size && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Teamgröße:</span>
                    <span>{contractor.team_size} Personen</span>
                  </div>
                )}
                {contractor.rechtsform && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rechtsform:</span>
                    <span>{contractor.rechtsform}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
        
        {/* Tabs: Portfolio & Bewertungen */}
        <Card className="p-6">
          <Tabs defaultValue="portfolio" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="reviews">Bewertungen</TabsTrigger>
            </TabsList>
            
            <TabsContent value="portfolio" className="mt-6">
              {contractor.portfolio_images && contractor.portfolio_images.length > 0 ? (
                <PortfolioGallery images={contractor.portfolio_images} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Noch keine Portfolio-Bilder vorhanden
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <ReviewList contractorId={contractor.id} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}