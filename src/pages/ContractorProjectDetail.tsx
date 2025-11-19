import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { LeadPreviewCard } from "@/components/LeadPreviewCard";
import { FullProjectDetails } from "@/components/FullProjectDetails";

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
  customer_id: string;
  final_price: number;
}

export default function ContractorProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [customerData, setCustomerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [hasPurchasedLead, setHasPurchasedLead] = useState(false);
  const [purchasedAt, setPurchasedAt] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [insufficientBalance, setInsufficientBalance] = useState(false);
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
          *,
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

      setProject(projectData);
      setCustomerData(projectData.profiles);

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

      if (matchData) {
        setHasPurchasedLead(matchData.lead_purchased || false);
        setPurchasedAt(matchData.purchased_at || "");
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

    // Pre-check balance before attempting purchase
    if (insufficientBalance || walletBalance < project.final_price) {
      toast({
        title: "Guthaben zu niedrig",
        description: `Sie benötigen €${project.final_price}. Ihr aktuelles Guthaben: €${walletBalance.toFixed(2)}`,
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
        // Handle specific error cases
        if (error.message.includes("Insufficient balance") || error.message.includes("Guthaben")) {
          setInsufficientBalance(true);
          toast({
            title: "Guthaben zu niedrig",
            description: `Lead-Preis: €${project.final_price}. Ihr Guthaben: €${walletBalance.toFixed(2)}`,
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

      // Success
      toast({
        title: "Lead erfolgreich gekauft! 🎉",
        description: `Neues Guthaben: €${data.newBalance.toFixed(2)}. Sie können jetzt den Kunden kontaktieren.`,
      });

      setHasPurchasedLead(true);
      setPurchasedAt(new Date().toISOString());
      setWalletBalance(data.newBalance);
      loadProject();
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
      const { data: existingConv } = await supabase
        .from("conversations")
        .select("id")
        .eq("contractor_id", userId)
        .eq("customer_id", project.customer_id)
        .eq("project_id", project.id)
        .maybeSingle();

      let conversationId = existingConv?.id;

      if (!conversationId) {
        const { data: newConv, error } = await supabase
          .from("conversations")
          .insert({
            contractor_id: userId,
            customer_id: project.customer_id,
            project_id: project.id
          })
          .select("id")
          .single();

        if (error) throw error;
        conversationId = newConv.id;
      }

      navigate("/nachrichten");
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
            leadPrice={project.final_price}
            onPurchase={handlePurchaseLead}
            purchasing={purchasing}
            insufficientBalance={insufficientBalance}
            currentBalance={walletBalance}
          />
        ) : (
          <FullProjectDetails
            project={project}
            customer={customerData}
            purchasedAt={purchasedAt}
            onStartChat={handleStartChat}
          />
        )}
      </div>
    </div>
  );
}
