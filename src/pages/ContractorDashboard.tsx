import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/stores/authStore";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wallet, TrendingUp, Star, AlertCircle, Plus, User } from "lucide-react";
import { motion } from "framer-motion";
import { AvailableLeadCard } from "@/components/contractor/AvailableLeadCard";
import { PurchasedLeadCard } from "@/components/contractor/PurchasedLeadCard";
import { ActiveProjectCard } from "@/components/contractor/ActiveProjectCard";
import { CompletedProjectCard } from "@/components/contractor/CompletedProjectCard";
import { Footer } from "@/components/Footer";

export default function ContractorDashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  
  // Stats
  const [walletBalance, setWalletBalance] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const [rating, setRating] = useState(0);
  const [openOffers, setOpenOffers] = useState(0);
  
  // Leads data
  const [availableLeads, setAvailableLeads] = useState<any[]>([]);
  const [purchasedLeads, setPurchasedLeads] = useState<any[]>([]);
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [completedProjects, setCompletedProjects] = useState<any[]>([]);
  
  // Wallet dialog
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState<number | string>(100);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userId) {
      loadDashboardData();
    }
  }, [userId]);

  const checkAuth = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    // Role-Guard: Redirect customers to their dashboard
    if (!authLoading && role && role !== 'contractor') {
      navigate('/kunde/dashboard');
      return;
    }
    
    setUserId(user.id);
  };

  const loadDashboardData = async () => {
    try {
      // Load contractor profile
      const { data: contractorData } = await supabase
        .from("contractors")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (!contractorData) {
        navigate("/handwerker/onboarding");
        return;
      }

      if (contractorData.handwerker_status === 'INCOMPLETE' || contractorData.handwerker_status === 'REGISTERED') {
        navigate("/handwerker/onboarding");
        return;
      }

      // Set stats
      setWalletBalance(Number(contractorData.wallet_balance) || 0);
      setConversionRate(Number(contractorData.conversion_rate) || 0);
      setRating(Number(contractorData.rating) || 0);

      // Load available leads (not purchased)
      const { data: availableData } = await supabase
        .from("matches")
        .select(`
          *,
          project:projects(*)
        `)
        .eq("contractor_id", userId)
        .eq("lead_purchased", false)
        .order("created_at", { ascending: false });

      setAvailableLeads(availableData || []);

      // Load purchased leads (contacted/pending)
      const { data: purchasedData } = await supabase
        .from("matches")
        .select(`
          *,
          project:projects(
            *,
            profiles(first_name, last_name, email, phone)
          ),
          offers!offers_project_id_fkey(status)
        `)
        .eq("contractor_id", userId)
        .eq("lead_purchased", true)
        .in("status", ["contacted", "pending", "lost"])
        .order("purchased_at", { ascending: false });

      setPurchasedLeads(purchasedData || []);

      // Load active projects
      const { data: activeData } = await supabase
        .from("matches")
        .select(`
          *,
          project:projects(*)
        `)
        .eq("contractor_id", userId)
        .eq("status", "accepted")
        .order("updated_at", { ascending: false });

      setActiveProjects(activeData || []);

      // Load completed projects
      const { data: completedData } = await supabase
        .from("matches")
        .select(`
          *,
          project:projects(*)
        `)
        .eq("contractor_id", userId)
        .in("status", ["won", "lost", "completed"])
        .order("updated_at", { ascending: false });

      setCompletedProjects(completedData || []);

      // Load open offers count
      const { count } = await supabase
        .from("offers")
        .select("*", { count: "exact", head: true })
        .eq("contractor_id", userId)
        .eq("status", "pending");

      setOpenOffers(count || 0);
      
    } catch (error: any) {
      console.error("Error loading dashboard:", error);
      toast({
        title: "Fehler",
        description: "Dashboard konnte nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async () => {
    const amount = typeof rechargeAmount === 'string' ? parseFloat(rechargeAmount) : rechargeAmount;
    
    if (!amount || amount < 10) {
      toast({
        title: "Ungültiger Betrag",
        description: "Mindestbetrag: €10",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Test-Modus",
      description: `€${amount} wurden Ihrem Guthaben hinzugefügt (Demo)`,
    });

    const newBalance = walletBalance + amount;
    setWalletBalance(newBalance);
    
    await supabase
      .from("contractors")
      .update({ wallet_balance: newBalance })
      .eq("id", userId);

    setShowWalletDialog(false);
    setRechargeAmount(100);
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

  const showLowBalanceWarning = walletBalance < 50;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header with Stats */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <Button onClick={() => navigate("/handwerker/profil-bearbeiten")}>
              <User className="h-4 w-4 mr-2" />
              Profil bearbeiten
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Wallet className="h-5 w-5 text-primary" />
                <Button size="sm" variant="outline" onClick={() => setShowWalletDialog(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Aufladen
                </Button>
              </div>
              <p className="text-2xl font-bold">€{walletBalance.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Wallet-Guthaben</p>
            </Card>

            <Card className="p-6">
              <TrendingUp className="h-5 w-5 text-primary mb-2" />
              <p className="text-2xl font-bold">{conversionRate.toFixed(0)}%</p>
              <p className="text-sm text-muted-foreground">Conversion-Rate</p>
            </Card>

            <Card className="p-6">
              <Star className="h-5 w-5 text-primary mb-2" />
              <p className="text-2xl font-bold">{rating.toFixed(1)} ⭐</p>
              <p className="text-sm text-muted-foreground">Bewertung</p>
            </Card>

            <Card className="p-6">
              <AlertCircle className="h-5 w-5 text-primary mb-2" />
              <p className="text-2xl font-bold">{openOffers}</p>
              <p className="text-sm text-muted-foreground">Offene Angebote</p>
            </Card>
          </div>

          {showLowBalanceWarning && (
            <Card className="p-4 bg-destructive/10 border-destructive/20 mb-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="font-semibold text-destructive">Niedriges Guthaben</p>
                  <p className="text-sm text-muted-foreground">
                    Ihr Guthaben ist unter €50. Laden Sie auf, um weiterhin Leads kaufen zu können.
                  </p>
                </div>
                <Button size="sm" onClick={() => setShowWalletDialog(true)}>
                  Jetzt aufladen
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="available" className="w-full">
          <TabsList className="w-full flex overflow-x-auto">
            <TabsTrigger value="available" className="flex-1 min-w-[120px] whitespace-nowrap">
              <span className="hidden md:inline">Verfügbare Leads</span>
              <span className="md:hidden">Verfügbar</span>
              <span className="ml-1">({availableLeads.length})</span>
            </TabsTrigger>
            <TabsTrigger value="purchased" className="flex-1 min-w-[120px] whitespace-nowrap">
              <span className="hidden md:inline">Gekaufte Leads</span>
              <span className="md:hidden">Gekauft</span>
              <span className="ml-1">({purchasedLeads.length})</span>
            </TabsTrigger>
            <TabsTrigger value="active" className="flex-1 min-w-[120px] whitespace-nowrap">
              <span className="hidden md:inline">Aktive Projekte</span>
              <span className="md:hidden">Aktiv</span>
              <span className="ml-1">({activeProjects.length})</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 min-w-[120px] whitespace-nowrap">
              <span className="md:hidden">Fertig</span>
              <span className="hidden md:inline">Abgeschlossen</span>
              <span className="ml-1">({completedProjects.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4 mt-6">
            {availableLeads.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">Keine verfügbaren Leads im Moment</p>
              </Card>
            ) : (
              availableLeads.map((match, index) => (
                <AvailableLeadCard key={match.id} match={match} index={index} />
              ))
            )}
          </TabsContent>

          <TabsContent value="purchased" className="space-y-4 mt-6">
            {purchasedLeads.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">Noch keine Leads gekauft</p>
              </Card>
            ) : (
              purchasedLeads.map((match, index) => (
                <PurchasedLeadCard key={match.id} match={match} index={index} />
              ))
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4 mt-6">
            {activeProjects.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">Keine aktiven Projekte</p>
              </Card>
            ) : (
              activeProjects.map((match, index) => (
                <ActiveProjectCard key={match.id} match={match} index={index} />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 mt-6">
            {completedProjects.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">Noch keine abgeschlossenen Projekte</p>
              </Card>
            ) : (
              completedProjects.map((match, index) => (
                <CompletedProjectCard key={match.id} match={match} index={index} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />

      {/* Wallet Recharge Dialog */}
      <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Guthaben aufladen</DialogTitle>
            <DialogDescription>
              Laden Sie Ihr Wallet auf, um Leads kaufen zu können
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={() => setRechargeAmount(100)}>
                €100
              </Button>
              <Button variant="outline" onClick={() => setRechargeAmount(250)}>
                €250
              </Button>
              <Button variant="outline" onClick={() => setRechargeAmount(500)}>
                €500
              </Button>
            </div>
            
            <div>
              <Label htmlFor="custom-amount">Oder eigener Betrag</Label>
              <Input
                id="custom-amount"
                type="number"
                min="10"
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(e.target.value)}
                placeholder="Betrag eingeben"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWalletDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleRecharge}>
              Aufladen (Test-Modus)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
