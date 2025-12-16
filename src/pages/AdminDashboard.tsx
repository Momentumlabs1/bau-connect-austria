import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VerificationBadge } from "@/components/contractor/VerificationBadge";
import { ExternalLink, CheckCircle2, XCircle, Shield, Users, FileText, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Contractor {
  id: string;
  company_name: string;
  city: string | null;
  trades: string[];
  verified: boolean | null;
  handwerker_status: string | null;
  gewerbeschein_url: string | null;
  created_at: string;
  profiles: {
    email: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
  } | null;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { role, roleLoaded, isAuthenticated } = useAuth();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (roleLoaded && role !== "admin") {
      navigate("/");
      return;
    }
    if (roleLoaded && role === "admin") {
      fetchContractors();
    }
  }, [role, roleLoaded, navigate]);

  const fetchContractors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contractors")
        .select(`
          id,
          company_name,
          city,
          trades,
          verified,
          handwerker_status,
          gewerbeschein_url,
          created_at,
          profiles!contractors_id_fkey (
            email,
            first_name,
            last_name,
            phone
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContractors(data || []);
    } catch (error) {
      console.error("Error fetching contractors:", error);
      toast.error("Fehler beim Laden der Handwerker");
    } finally {
      setLoading(false);
    }
  };

  const toggleVerification = async (contractorId: string, currentStatus: boolean | null) => {
    setUpdating(contractorId);
    try {
      const newStatus = !currentStatus;
      const { error } = await supabase
        .from("contractors")
        .update({ 
          verified: newStatus,
          handwerker_status: newStatus ? "APPROVED" : "REGISTERED"
        })
        .eq("id", contractorId);

      if (error) throw error;

      setContractors(prev =>
        prev.map(c =>
          c.id === contractorId 
            ? { ...c, verified: newStatus, handwerker_status: newStatus ? "APPROVED" : "REGISTERED" } 
            : c
        )
      );

      toast.success(newStatus ? "Handwerker verifiziert!" : "Verifizierung entfernt");
    } catch (error) {
      console.error("Error updating verification:", error);
      toast.error("Fehler beim Aktualisieren");
    } finally {
      setUpdating(null);
    }
  };

  const getTradeLabel = (trade: string) => {
    const labels: Record<string, string> = {
      "elektriker": "Elektriker",
      "sanitar-heizung": "Sanitär & Heizung",
      "dachdecker": "Dachdecker",
      "fassade": "Fassade",
      "maler": "Maler",
      "bau": "Bau/Rohbau"
    };
    return labels[trade] || trade;
  };

  if (!roleLoaded || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (role !== "admin") {
    return null;
  }

  const verifiedCount = contractors.filter(c => c.verified).length;
  const pendingCount = contractors.filter(c => !c.verified).length;
  const withDocsCount = contractors.filter(c => c.gewerbeschein_url).length;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Handwerker-Verwaltung</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => supabase.auth.signOut().then(() => navigate("/"))}>
            Abmelden
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{contractors.length}</p>
                  <p className="text-sm text-muted-foreground">Handwerker gesamt</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{verifiedCount}</p>
                  <p className="text-sm text-muted-foreground">Verifiziert</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <FileText className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{withDocsCount}</p>
                  <p className="text-sm text-muted-foreground">Mit Gewerbeschein</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contractors Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Alle Handwerker</CardTitle>
            <Button variant="outline" size="sm" onClick={fetchContractors} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Aktualisieren
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : contractors.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Noch keine Handwerker registriert
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Firma</TableHead>
                      <TableHead>Kontakt</TableHead>
                      <TableHead>Gewerke</TableHead>
                      <TableHead>Gewerbeschein</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Registriert</TableHead>
                      <TableHead className="text-right">Aktion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contractors.map((contractor) => (
                      <TableRow key={contractor.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{contractor.company_name}</p>
                            {contractor.city && (
                              <p className="text-sm text-muted-foreground">{contractor.city}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{contractor.profiles?.email || "-"}</p>
                            {contractor.profiles?.phone && (
                              <p className="text-muted-foreground">{contractor.profiles.phone}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {contractor.trades.slice(0, 2).map((trade) => (
                              <Badge key={trade} variant="secondary" className="text-xs">
                                {getTradeLabel(trade)}
                              </Badge>
                            ))}
                            {contractor.trades.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{contractor.trades.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {contractor.gewerbeschein_url ? (
                            <a
                              href={contractor.gewerbeschein_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                            >
                              <FileText className="h-4 w-4" />
                              Ansehen
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-sm">Nicht hochgeladen</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <VerificationBadge verified={contractor.verified || false} size="sm" />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(contractor.created_at), "dd.MM.yyyy", { locale: de })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant={contractor.verified ? "outline" : "default"}
                            onClick={() => toggleVerification(contractor.id, contractor.verified)}
                            disabled={updating === contractor.id}
                          >
                            {updating === contractor.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : contractor.verified ? (
                              <>
                                <XCircle className="h-4 w-4 mr-1" />
                                Entfernen
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Verifizieren
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}