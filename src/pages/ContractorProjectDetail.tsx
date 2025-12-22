import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { OfferForm } from "@/components/offers/OfferForm";
import { Loader2, DollarSign } from "lucide-react";
import { LeadPreviewCard } from "@/components/LeadPreviewCard";
import { FullProjectDetails } from "@/components/FullProjectDetails";

interface Project {
  id: string;
  title: string;
  description: string;
  gewerk_id: string;
  subcategory_id?: string;
  postal_code: string;
  city: string;
  address: string | null;
  budget_min: number | null;
  budget_max: number | null;
  urgency: string;
  preferred_start_date: string | null;
  images: string[];
  funnel_answers?: Record<string, any>;
  created_at: string;
  customer_id: string;
  final_price: number;
}

export default function ContractorProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [customerData, setCustomerData] = useState<any>(null);
  const [categoryQuestions, setCategoryQuestions] = useState<any[]>([]);
  const [subcategoryName, setSubcategoryName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [hasPurchasedLead, setHasPurchasedLead] = useState(false);
  const [purchasedAt, setPurchasedAt] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userId && id) {
      loadProject();
    }
  }, [userId, id]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setUserId(user.id);
  };

  const loadProject = async () => {
    try {
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select(`
          id,
          title,
          description,
          gewerk_id,
          subcategory_id,
          postal_code,
          city,
          address,
          budget_min,
          budget_max,
          urgency,
          preferred_start_date,
          images,
          funnel_answers,
          created_at,
          customer_id,
          final_price,
          profiles!projects_customer_id_fkey(
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq("id", id)
        .maybeSingle();

      if (projectError) throw projectError;
      if (!projectData) {
        setLoading(false);
        return;
      }

      const typedProject = projectData as any;
      setProject({
        ...typedProject,
        funnel_answers: typedProject.funnel_answers as Record<string, any> || {}
      });
      
      // Kundeninfos NUR laden wenn noch nicht vorhanden (verhindert Überschreiben nach Purchase)
      if (!customerData && typedProject.profiles) {
        setCustomerData(typedProject.profiles);
      }

      // Load category questions and name if subcategory_id exists
      if (typedProject.subcategory_id) {
        const { data: questionsData } = await supabase
          .from('category_questions')
          .select('*')
          .eq('category_id', typedProject.subcategory_id)
          .order('sort_order');
        
        if (questionsData) {
          setCategoryQuestions(questionsData);
        }

        const { data: categoryData } = await supabase
          .from('service_categories')
          .select('name')
          .eq('id', typedProject.subcategory_id)
          .maybeSingle();
        
        if (categoryData) {
          setSubcategoryName(categoryData.name);
        }
      }

      // Load contractor wallet balance
      const { data: contractorData } = await supabase
        .from("contractors")
        .select("wallet_balance")
        .eq("id", userId)
        .maybeSingle();
      
      if (contractorData) {
        const balance = Number(contractorData.wallet_balance) || 0;
        setWalletBalance(balance);
        setInsufficientBalance(balance < projectData.final_price);
      }

      const { data: matchData } = await supabase
        .from("matches")
        .select("lead_purchased, purchased_at")
        .eq("project_id", id)
        .eq("contractor_id", userId)
        .maybeSingle();

      // Check for Stripe purchases
      const { data: stripePurchase } = await supabase
        .from("lead_purchases")
        .select("*")
        .eq("lead_id", id)
        .eq("user_id", userId)
        .eq("status", "completed")
        .maybeSingle();

      if (matchData) {
        setHasPurchasedLead(matchData.lead_purchased || false);
        setPurchasedAt(matchData.purchased_at || "");
      }

      // Override with Stripe purchase if exists
      if (stripePurchase) {
        setHasPurchasedLead(true);
        setPurchasedAt(stripePurchase.completed_at || stripePurchase.created_at);
      }
    } catch (error) {
      console.error("Error loading project:", error);
      toast({
        title: "Fehler",
        description: "Projekt konnte nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseLead = async () => {
    if (!project || !userId) return;

    if (insufficientBalance || walletBalance < project.final_price) {
      toast({
        title: "Guthaben zu niedrig",
        description: `Sie benötigen €${(project.final_price ?? 0).toFixed(2)}. Ihr aktuelles Guthaben: €${(walletBalance ?? 0).toFixed(2)}`,
        variant: "destructive",
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/handwerker/dashboard')}
          >
            Jetzt aufladen
          </Button>
        )
      });
      return;
    }

    setPurchasing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase.functions.invoke("purchase-lead", {
        body: { leadId: project.id },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        if (error.message.includes("Insufficient balance") || error.message.includes("Guthaben")) {
          setInsufficientBalance(true);
          toast({
            title: "Guthaben zu niedrig",
            description: `Lead-Preis: €${(project.final_price ?? 0).toFixed(2)}. Ihr Guthaben: €${(walletBalance ?? 0).toFixed(2)}`,
            variant: "destructive",
            action: (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/handwerker/dashboard')}
              >
                Jetzt aufladen
              </Button>
            )
          });
          return;
        }
        
        if (error.message.includes("Already purchased") || error.message.includes("bereits gekauft")) {
          toast({
            title: "Lead bereits gekauft",
            description: "Sie haben diesen Lead bereits erworben.",
            variant: "destructive"
          });
          setHasPurchasedLead(true);
          loadProject();
          return;
        }
        
        if (error.message.includes("sold out") || error.message.includes("verkauft")) {
          toast({
            title: "Lead nicht mehr verfügbar",
            description: "Dieser Lead wurde bereits an 3 Handwerker verkauft.",
            variant: "destructive"
          });
          return;
        }
        
        throw error;
      }

      // ✨ SOFORTIGE UI-UPDATES (nicht auf DB warten!)
      setHasPurchasedLead(true);
      setPurchasedAt(new Date().toISOString());
      setWalletBalance(data.newBalance);
      setInsufficientBalance(false); // Reset warning
      
      // Kundendetails aus Response laden
      if (data.customerDetails) {
        setCustomerData(data.customerDetails);
      }

      toast({
        title: "Lead erfolgreich gekauft! 🎉",
        description: `Sie können jetzt den Kunden kontaktieren. Neues Guthaben: €${(data.newBalance ?? 0).toFixed(2)}`,
      });
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast({
        title: "Fehler beim Kauf",
        description: error.message || "Lead konnte nicht gekauft werden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setPurchasing(false);
    }
  };

  const handleStartChat = async () => {
    if (!project || !userId) return;

    try {
      // Check if conversation exists
      const { data: existingConv } = await supabase
        .from("conversations")
        .select("id")
        .eq("contractor_id", userId)
        .eq("customer_id", project.customer_id)
        .eq("project_id", project.id)
        .maybeSingle();

      let conversationId = existingConv?.id;

      // If conversation doesn't exist, create it (but NO automatic message)
      if (!conversationId) {
        const { data: newConv, error } = await supabase
          .from("conversations")
          .insert({
            contractor_id: userId,
            customer_id: project.customer_id,
            project_id: project.id,
            last_message_at: new Date().toISOString()
          })
          .select("id")
          .single();

        if (error) throw error;
        conversationId = newConv.id;
        // NO automatic message - user navigates to chat and writes their own
      }

      navigate(`/nachrichten?conversation=${conversationId}`);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Chat konnte nicht gestartet werden.",
        variant: "destructive"
      });
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

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Projekt nicht gefunden</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {!hasPurchasedLead ? (
          <LeadPreviewCard
            project={project}
            leadPrice={project.final_price ?? 5}
            onPurchase={handlePurchaseLead}
            purchasing={purchasing}
            insufficientBalance={insufficientBalance}
            currentBalance={walletBalance}
            useStripePayment={false}
            subcategoryName={subcategoryName}
            onPurchaseSuccess={() => {
              setHasPurchasedLead(true);
              loadProject();
            }}
          />
        ) : (
          <>
            {customerData ? (
              <>
                <FullProjectDetails
                  project={project}
                  customer={customerData}
                  purchasedAt={purchasedAt}
                  categoryQuestions={categoryQuestions}
                />
                
                {/* Offer Dialog */}
                <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      <DollarSign className="mr-2 h-5 w-5" />
                      Jetzt Angebot senden
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Angebot für {project.title}</DialogTitle>
                    </DialogHeader>
                    <OfferForm 
                      projectId={id!}
                      projectTitle={project.title}
                      projectCity={project.city}
                      onSuccess={async () => {
                        setShowOfferDialog(false);
                        toast({
                          title: "Angebot gesendet",
                          description: "Dein Angebot wurde erfolgreich an den Kunden gesendet"
                        });
                        // Direkt zum Chat navigieren mit korrekter Conversation-ID
                        await handleStartChat();
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <Card className="p-8 text-center">
                <h2 className="text-xl font-bold mb-2">Kundendaten werden geladen...</h2>
                <p className="text-muted-foreground mb-4">
                  Die Kontaktdaten sollten gleich verfügbar sein.
                </p>
                <Button onClick={() => loadProject()} variant="outline">
                  Erneut laden
                </Button>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
