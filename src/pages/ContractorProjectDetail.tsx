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

    // Check balance before attempting purchase
    if (insufficientBalance) {
      toast({
        title: "Guthaben zu niedrig",
        description: "Bitte laden Sie Ihr Wallet auf, um diesen Lead zu kaufen.",
        variant: "destructive",
        action: (
          <Button
            size="sm"
            onClick={() => navigate("/handwerker/dashboard")}
          >
            Jetzt aufladen
          </Button>
        ),
      });
      return;
    }

    setPurchasing(true);
    try {
      const { data, error } = await supabase.functions.invoke('purchase-lead', {
        body: {
          leadId: project.id,
          contractorId: userId
        }
      });

      if (error) throw error;

      if (data.error === 'Insufficient balance') {
        toast({
          title: "Guthaben zu niedrig",
          description: data.message || "Ihr Wallet-Guthaben reicht nicht aus.",
          variant: "destructive",
          action: (
            <Button
              size="sm"
              onClick={() => navigate("/handwerker/dashboard")}
            >
              Jetzt aufladen
            </Button>
          ),
        });
        setInsufficientBalance(true);
        return;
      }

      if (data.success) {
        toast({
          title: "Lead erfolgreich gekauft!",
          description: `Sie haben €${project.final_price.toFixed(2)} bezahlt.`
        });

        setHasPurchasedLead(true);
        setPurchasedAt(new Date().toISOString());
        loadProject();
      } else {
        throw new Error(data.error || "Lead-Kauf fehlgeschlagen");
      }
    } catch (error: any) {
      toast({
        title: "Fehler beim Lead-Kauf",
        description: error.message || "Lead konnte nicht gekauft werden.",
        variant: "destructive"
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
