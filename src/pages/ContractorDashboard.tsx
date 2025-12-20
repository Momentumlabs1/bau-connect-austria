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
import { LeadPreviewCard } from "@/components/LeadPreviewCard";

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
  const [rechargeAmount, setRechargeAmount] = useState<number | string>(50);
  const [voucherCode, setVoucherCode] = useState("");
  
  // Lead preview dialog
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [showLeadDialog, setShowLeadDialog] = useState(false);
  const [applyingVoucher, setApplyingVoucher] = useState(false);

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

      // FALLBACK: If no matches, query projects directly
      if (!availableData || availableData.length === 0) {
        console.log('🔄 No matches found, falling back to direct project query...');
        const { data: directProjects } = await supabase
          .from("projects")
          .select("*")
          .eq("status", "open")
          .eq("visibility", "public")
          .in("gewerk_id", contractorData.trades || []);
        
        // Format as pseudo-matches
        const pseudoMatches = (directProjects || []).map(project => ({
          id: `pseudo-${project.id}`,
          project_id: project.id,
          contractor_id: userId,
          match_type: 'DIRECT',
          score: 0,
          lead_purchased: false,
          status: 'pending',
          created_at: project.created_at,
          project: project
        }));
        
        setAvailableLeads(pseudoMatches);
      } else {
        setAvailableLeads(availableData);
      }

      // Load purchased leads (contacted/pending)
      const { data: purchasedData, error: purchasedError } = await supabase
        .from("matches")
        .select(`
          *,
          project:projects(
            *,
            profiles(first_name, last_name, email, phone)
          )
        `)
        .eq("contractor_id", userId)
        .eq("lead_purchased", true)
        .in("status", ["contacted", "pending", "lost"])
        .order("purchased_at", { ascending: false });

      if (purchasedError) {
        console.error('Error loading purchased leads:', purchasedError);
      }

      // Fetch offers separately for each purchased lead
      const purchasedWithOffers = await Promise.all(
        (purchasedData || []).map(async (match) => {
          const { data: offerData } = await supabase
            .from("offers")
            .select("status")
            .eq("project_id", match.project_id)
            .eq("contractor_id", userId)
            .maybeSingle();
          return { ...match, offer: offerData };
        })
      );

      setPurchasedLeads(purchasedWithOffers);

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
    
    if (!amount || amount < 50) {
      toast({
        title: "Ungültiger Betrag",
        description: "Mindestbetrag: €50",
        variant: "destructive"
      });
      return;
    }

    // Wenn Gutschein-Code eingegeben wurde
    if (voucherCode.trim()) {
      setApplyingVoucher(true);
      try {
        const { data, error } = await supabase.functions.invoke('redeem-voucher', {
          body: { code: voucherCode, amount }
        });
        
        if (error) throw error;
        
        if (data.success && data.discountPercentage === 100) {
          // 100% Rabatt - kostenlos!
          toast({
            title: "Gutschein eingelöst! 🎉",
            description: `€${amount} wurden Ihrem Guthaben hinzugefügt (kostenlos)`,
          });
          setWalletBalance(data.newBalance);
          setShowWalletDialog(false);
          setVoucherCode("");
          setRechargeAmount(50);
          await loadDashboardData();
          return;
        } else if (data.success && data.discountPercentage < 100) {
          // Teil-Rabatt: Weiter zu Stripe mit Gutschein-Code
          setApplyingVoucher(false);
          // Fahre fort zu Stripe Checkout mit voucherCode
        } else {
          throw new Error("Ungültiger Gutschein");
        }
      } catch (err: any) {
        toast({
          title: "Gutschein ungültig",
          description: err.message || "Gutschein konnte nicht eingelöst werden",
          variant: "destructive"
        });
        setApplyingVoucher(false);
        return;
      }
    }

    // Stripe Checkout (mit oder ohne Gutschein für Teil-Rabatt)
    try {
      const { data, error } = await supabase.functions.invoke('create-wallet-checkout', {
        body: { 
          amount,
          voucherCode: voucherCode.trim() || undefined
        }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast({
        title: "Fehler",
        description: err.message || "Zahlung konnte nicht gestartet werden",
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
                <AvailableLeadCard 
                  key={match.id} 
                  match={match} 
                  index={index}
                  onSelect={(m) => {
                    setSelectedLead(m);
                    setShowLeadDialog(true);
                  }}
                />
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
              Mindesteinzahlung: €50
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant={rechargeAmount === 50 ? "default" : "outline"} 
                onClick={() => setRechargeAmount(50)}
              >
                €50
              </Button>
              <Button 
                variant={rechargeAmount === 100 ? "default" : "outline"} 
                onClick={() => setRechargeAmount(100)}
              >
                €100
              </Button>
              <Button 
                variant={rechargeAmount === 250 ? "default" : "outline"} 
                onClick={() => setRechargeAmount(250)}
              >
                €250
              </Button>
            </div>
            
            <div>
              <Label htmlFor="custom-amount">Oder eigener Betrag (min. €50)</Label>
              <Input
                id="custom-amount"
                type="number"
                min="50"
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(e.target.value)}
                placeholder="Betrag eingeben"
              />
            </div>

            <div>
              <Label htmlFor="voucher-code">Gutschein-Code (optional)</Label>
              <Input
                id="voucher-code"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                placeholder="z.B. BAUCONNECT2025"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Mit gültigem 100%-Code ist die Aufladung kostenlos!
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWalletDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleRecharge} disabled={applyingVoucher}>
              {applyingVoucher ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Prüfe...
                </>
              ) : voucherCode ? (
                "Gutschein einlösen"
              ) : (
                "Jetzt bezahlen"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lead Preview Dialog */}
      <Dialog open={showLeadDialog} onOpenChange={setShowLeadDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedLead?.project?.title || 'Lead Details'}</DialogTitle>
            <DialogDescription>
              Alle Projektdetails auf einen Blick
            </DialogDescription>
          </DialogHeader>
          
          {selectedLead?.project && (
            <LeadPreviewCard 
              project={selectedLead.project}
              leadPrice={selectedLead.project.final_price || 5}
              useStripePayment={false}
              onPurchaseSuccess={() => {
                setShowLeadDialog(false);
                setSelectedLead(null);
                loadDashboardData();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
