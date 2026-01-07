import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, MessageSquare } from "lucide-react";

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
}

export default function CustomerContractorSearch() {
  const navigate = useNavigate();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [filters, setFilters] = useState({
    gewerk: 'all',
    postalCode: '',
    radius: 50,
    minRating: 0
  });

  useEffect(() => {
    searchContractors();
  }, [filters]);

  const searchContractors = async () => {
    // ============================================================
    // SECURITY: Exclude financial/private fields from public query
    // ============================================================
    let query = supabase
      .from('contractors')
      .select(`
        id,
        company_name,
        rating,
        total_reviews,
        city,
        trades,
        profile_image_url,
        description,
        service_radius,
        postal_codes
      `)
      .in('handwerker_status', ['APPROVED', 'UNDER_REVIEW']); // Nur verifizierte/in Prüfung

    if (filters.gewerk && filters.gewerk !== 'all') {
      query = query.contains('trades', [filters.gewerk]);
    }

    if (filters.minRating > 0) {
      query = query.gte('rating', filters.minRating);
    }

    const { data } = await query.order('rating', { ascending: false });
    setContractors(data || []);
  };

  const startConversation = async (contractorId: string) => {
    try {
      console.log('💬 Starting conversation with contractor:', contractorId);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('❌ No session found');
        navigate('/login');
        return;
      }

      // Get customer's most recent project
      const { data: latestProject } = await supabase
        .from('projects')
        .select('id')
        .eq('customer_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!latestProject) {
        console.warn('⚠️ No projects found, redirecting to messages');
        navigate('/nachrichten');
        return;
      }

      console.log('🔍 Checking for existing conversation...');
      
      // Check if conversation exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('project_id', latestProject.id)
        .eq('contractor_id', contractorId)
        .eq('customer_id', session.user.id)
        .maybeSingle();

      if (existing) {
        console.log('✅ Found existing conversation:', existing.id);
        navigate(`/nachrichten?conversation=${existing.id}`);
        return;
      }

      console.log('➕ Creating new conversation...');
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({
          project_id: latestProject.id,
          customer_id: session.user.id,
          contractor_id: contractorId,
          last_message_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating conversation:', createError);
        throw createError;
      }

      console.log('✅ Conversation created:', newConv.id);
      navigate(`/nachrichten?conversation=${newConv.id}`);
    } catch (error: any) {
      console.error('💥 Start conversation failed:', error);
      navigate('/nachrichten');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Handwerker finden</h1>
        
        {/* Filter Section */}
        <Card className="p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Label>Gewerk</Label>
              <Select 
                value={filters.gewerk} 
                onValueChange={v => setFilters({...filters, gewerk: v})}
              >
                <SelectTrigger><SelectValue placeholder="Alle" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="elektriker">Elektriker</SelectItem>
                  <SelectItem value="sanitar-heizung">Sanitär & Heizung</SelectItem>
                  <SelectItem value="maler">Maler</SelectItem>
                  <SelectItem value="dachdecker">Dachdecker</SelectItem>
                  <SelectItem value="fassade">Fassade</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Postleitzahl</Label>
              <Input 
                value={filters.postalCode}
                onChange={e => setFilters({...filters, postalCode: e.target.value})}
                placeholder="4320"
              />
            </div>
            
            <div>
              <Label>Radius: {filters.radius} km</Label>
              <Slider 
                value={[filters.radius]}
                onValueChange={([v]) => setFilters({...filters, radius: v})}
                min={10}
                max={150}
                step={10}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>Min. Bewertung</Label>
              <Select 
                value={filters.minRating.toString()} 
                onValueChange={v => setFilters({...filters, minRating: Number(v)})}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Alle</SelectItem>
                  <SelectItem value="4">4+ ⭐</SelectItem>
                  <SelectItem value="4.5">4.5+ ⭐</SelectItem>
                  <SelectItem value="5">5 ⭐</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
        
        {/* Results */}
        <div className="space-y-4">
          <p className="text-muted-foreground">
            {contractors.length} Handwerker gefunden
          </p>
          
          {contractors.map(contractor => (
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
                    <div className="flex gap-2 mb-2 flex-wrap">
                      {contractor.trades.map(trade => (
                        <Badge key={trade} variant="secondary">{trade}</Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      <MapPin className="inline h-3 w-3 mr-1" />
                      {contractor.city} • Service-Radius: {contractor.service_radius} km
                    </p>
                    {contractor.description && (
                      <p className="text-sm mt-2 line-clamp-2">
                        {contractor.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => navigate(`/handwerker/${contractor.id}`)}
                  >
                    Profil ansehen
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
      </div>
    </div>
  );
}