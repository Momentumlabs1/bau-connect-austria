import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Wallet, 
  TrendingUp, 
  Star, 
  Clock, 
  Briefcase,
  Bell,
  MapPin,
  Euro,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Plus
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ContractorProfile {
  id: string;
  company_name: string;
  wallet_balance: number;
  leads_bought: number;
  leads_won: number;
  conversion_rate: number;
  quality_score: number;
  rating: number;
  review_count: number;
  total_reviews: number;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data: any;
  read: boolean;
  created_at: string;
  expires_at: string;
}

interface AvailableLead {
  id: string;
  projekt_typ: string;
  city: string;
  postal_code: string;
  urgency: string;
  estimated_value: number;
  final_price: number;
  created_at: string;
  expires_at: string;
  description: string;
  images: string[];
}

export default function HandwerkerDashboard() {
  const [profile, setProfile] = useState<ContractorProfile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [availableLeads, setAvailableLeads] = useState<AvailableLead[]>([]);
  const [selectedLead, setSelectedLead] = useState<AvailableLead | null>(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [rechargeDialogOpen, setRechargeDialogOpen] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(100);
  const [recharging, setRecharging] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const markNotificationAsRead = async (notificationId: string) => {
    await supabase
      .from("notifications")
      .update({ read: true, read_at: new Date().toISOString() })
      .eq("id", notificationId);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (profile && userId) {
      checkProfileCompleteness();
    }
  }, [profile, userId]);

  // Real-time notification subscription for new leads
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('new-lead-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `handwerker_id=eq.${userId}`
        },
        (payload: any) => {
          if (payload.new.type === 'NEW_LEAD') {
            toast({
              title: "🎯 Neuer Lead verfügbar!",
              description: payload.new.title,
              action: (
                <Button
                  size="sm"
                  onClick={() => navigate(`/handwerker/projekt/${payload.new.data?.lead_id}`)}
                >
                  Ansehen
                </Button>
              ),
            });
            
            // Reload available leads
            loadDashboardData();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const checkProfileCompleteness = async () => {
    if (!userId) return;
    
    const { data: contractor } = await supabase
      .from("contractors")
      .select("trades, postal_codes, description, city, address")
      .eq("id", userId)
      .maybeSingle();
      
    if (contractor) {
      const isIncomplete = 
        !contractor.trades || contractor.trades.length === 0 ||
        !contractor.postal_codes || contractor.postal_codes.length === 0 ||
        !contractor.description || 
        !contractor.city ||
        !contractor.address;
      
      if (isIncomplete) {
        navigate('/handwerker/onboarding');
      }
    }
  };

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      setUserId(user.id);

      // Load contractor profile
      const { data: contractor, error: profileError } = await supabase
        .from("contractors")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      
      // Check if contractor profile exists
      if (!contractor) {
        setLoading(false);
        return;
      }
      
      // Map to profile interface with defaults
      const contractorData = contractor as any;
      setProfile({
        id: contractorData.id,
        company_name: contractorData.company_name || contractorData.firmenname || "Firma",
        wallet_balance: Number(contractorData.wallet_balance) || 0,
        leads_bought: contractorData.leads_bought || 0,
        leads_won: contractorData.leads_won || 0,
        conversion_rate: Number(contractorData.conversion_rate) || 0,
        quality_score: contractorData.quality_score || 0,
        rating: Number(contractorData.rating) || 0,
        review_count: contractorData.review_count || contractorData.total_reviews || 0,
        total_reviews: contractorData.total_reviews || 0
      });

      // Load unread notifications
      const { data: notifs, error: notifsError } = await supabase
        .from("notifications")
        .select("*")
        .eq("handwerker_id", user.id)
        .eq("read", false)
        .order("created_at", { ascending: false })
        .limit(10);

      if (notifsError) throw notifsError;
      setNotifications(notifs || []);

      // Load ALL open projects matching contractor's trades
      const contractorTrades = contractorData.trades || [];
      if (contractorTrades.length > 0) {
        const { data: leads, error: leadsError } = await supabase
          .from("projects")
          .select("*")
          .eq("status", "open")
          .eq("visibility", "public")
          .in("gewerk_id", contractorTrades)
          .order("created_at", { ascending: false });

        if (leadsError) throw leadsError;
        setAvailableLeads(leads || []);
      }

    } catch (error: any) {
      console.error("Error loading dashboard:", error);
      toast({
        title: "Fehler beim Laden",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const purchaseLead = async (lead: AvailableLead) => {
    setPurchasing(true);
    try {
      const { data, error } = await supabase.functions.invoke('purchase-lead', {
        body: {
          leadId: lead.id,
          contractorId: userId
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Lead erfolgreich gekauft!",
          description: `Sie haben €${lead.final_price.toFixed(2)} bezahlt.`
        });

        setPurchaseDialogOpen(false);
        navigate(`/handwerker/projekt/${lead.id}`);
      } else {
        throw new Error(data.error || "Lead-Kauf fehlgeschlagen");
      }
    } catch (error: any) {
      console.error("Error purchasing lead:", error);
      toast({
        title: "Fehler beim Lead-Kauf",
        description: error.message || "Lead konnte nicht gekauft werden.",
        variant: "destructive"
      });
    } finally {
      setPurchasing(false);
    }
  };

  const handleRechargeWallet = async () => {
    setRecharging(true);
    try {
      // Insert wallet recharge transaction
      const newBalance = (profile?.wallet_balance || 0) + rechargeAmount;
      
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          handwerker_id: userId,
          type: "WALLET_RECHARGE",
          amount: rechargeAmount,
          balance_after: newBalance,
          description: `Wallet-Aufladung €${rechargeAmount.toFixed(2)}`
        });

      if (transactionError) throw transactionError;

      // Update contractor wallet balance
      const { error: updateError } = await supabase
        .from("contractors")
        .update({ wallet_balance: newBalance })
        .eq("id", userId);

      if (updateError) throw updateError;

      toast({
        title: "Wallet erfolgreich aufgeladen!",
        description: `€${rechargeAmount.toFixed(2)} wurden Ihrem Guthaben hinzugefügt.`
      });

      setRechargeDialogOpen(false);
      loadDashboardData();
    } catch (error: any) {
      console.error("Error recharging wallet:", error);
      toast({
        title: "Fehler beim Aufladen",
        description: "Wallet konnte nicht aufgeladen werden.",
        variant: "destructive"
      });
    } finally {
      setRecharging(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "sofort": return "text-red-500 bg-red-50 dark:bg-red-950";
      case "normal": return "text-blue-500 bg-blue-50 dark:bg-blue-950";
      case "flexibel": return "text-green-500 bg-green-50 dark:bg-green-950";
      default: return "text-gray-500 bg-gray-50 dark:bg-gray-950";
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case "sofort": return "🚨 Sofort";
      case "normal": return "📅 Normal";
      case "flexibel": return "🕐 Flexibel";
      default: return urgency;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Lade Dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-2xl font-bold mb-2">Profil unvollständig</h2>
            <p className="text-muted-foreground mb-6">
              Bitte vervollständigen Sie Ihr Handwerker-Profil, um Aufträge zu erhalten.
            </p>
            <Button onClick={() => navigate("/handwerker/profile")}>
              Profil vervollständigen
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Willkommen zurück, {profile.company_name}!
            </h1>
            <p className="text-muted-foreground">
              Hier ist eine Übersicht Ihrer aktuellen Aktivitäten
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate("/handwerker/profil-bearbeiten")}
          >
            Profil bearbeiten
          </Button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="text-3xl font-bold">
                    {profile.conversion_rate}%
                  </p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {profile.leads_won} von {profile.leads_bought} Leads gewonnen
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Bewertung</p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold">{profile.rating.toFixed(1)}</p>
                    <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                  </div>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-full">
                  <Star className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {profile.review_count} Bewertungen
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Quality Score</p>
                  <p className="text-3xl font-bold">{profile.quality_score}</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <Briefcase className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Von 100 Punkten
              </p>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="leads" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto">
            <TabsTrigger value="leads" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Verfügbare Leads ({availableLeads.length})
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Benachrichtigungen ({notifications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="space-y-4">
            {availableLeads.length === 0 ? (
              <Card className="p-12 text-center">
                <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Keine Leads verfügbar</h3>
                <p className="text-muted-foreground">
                  Momentan gibt es keine passenden Aufträge für Sie. Schauen Sie später wieder vorbei!
                </p>
              </Card>
            ) : (
              availableLeads.map((lead, index) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-bold mb-1">
                              {lead.projekt_typ}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {lead.city} ({lead.postal_code.substring(0, 2)}**)
                              </div>
                              <Badge className={cn("font-medium", getUrgencyColor(lead.urgency))}>
                                {getUrgencyLabel(lead.urgency)}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {lead.description}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Euro className="h-4 w-4 text-muted-foreground" />
                            <span>Geschätzt: €{lead.estimated_value || 'k.A.'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>Erstellt vor {new Date(lead.created_at).toLocaleDateString('de-DE')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Lead-Preis</p>
                          <p className="text-2xl font-bold text-primary">
                            €{lead.final_price.toFixed(2)}
                          </p>
                        </div>
                        <Button 
                          size="lg" 
                          className="w-full lg:w-auto"
                          onClick={() => navigate(`/handwerker/projekt/${lead.id}`)}
                        >
                          Details ansehen
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            {notifications.length === 0 ? (
              <Card className="p-12 text-center">
                <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Keine neuen Benachrichtigungen</h3>
                <p className="text-muted-foreground">
                  Sie haben alle Benachrichtigungen gelesen
                </p>
              </Card>
            ) : (
              notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className={cn(
                      "p-6 cursor-pointer hover:shadow-md transition-all",
                      !notification.read && "border-l-4 border-l-primary"
                    )}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Bell className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.body}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{new Date(notification.created_at).toLocaleString('de-DE')}</span>
                          {notification.data?.distance && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {notification.data.distance} km entfernt
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
