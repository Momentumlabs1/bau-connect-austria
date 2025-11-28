import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Star, MapPin, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface Contractor {
  id: string;
  company_name: string;
  city: string;
  rating: number;
  total_reviews: number;
  trades: string[];
  profile_image_url: string | null;
  description: string | null;
}

const GEWERK_LABELS: Record<string, { label: string; icon: string }> = {
  elektriker: { label: "Elektriker", icon: "⚡" },
  "sanitar-heizung": { label: "Sanitär & Heizung", icon: "💧" },
  dachdecker: { label: "Dachdecker", icon: "🏠" },
  fassade: { label: "Fassade", icon: "🏗️" },
  maler: { label: "Maler", icon: "🎨" },
  bau: { label: "Bau / Rohbau", icon: "🧱" },
};

export default function HandwerkerDirectory() {
  const navigate = useNavigate();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [filteredContractors, setFilteredContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGewerk, setSelectedGewerk] = useState<string>("all");
  const [minRating, setMinRating] = useState<string>("0");

  useEffect(() => {
    loadContractors();
  }, []);

  useEffect(() => {
    filterContractors();
  }, [contractors, searchQuery, selectedGewerk, minRating]);

  const loadContractors = async () => {
    try {
      const { data, error } = await supabase
        .from("contractors")
        .select("*")
        .in("handwerker_status", ["REGISTERED", "APPROVED", "UNDER_REVIEW"])
        .order("rating", { ascending: false });

      if (error) throw error;
      setContractors(data || []);
    } catch (error) {
      console.error("Error loading contractors:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterContractors = () => {
    let filtered = [...contractors];

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (c) =>
          c.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.city?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by gewerk
    if (selectedGewerk !== "all") {
      filtered = filtered.filter((c) => c.trades.includes(selectedGewerk));
    }

    // Filter by rating
    const rating = parseFloat(minRating);
    if (rating > 0) {
      filtered = filtered.filter((c) => (c.rating || 0) >= rating);
    }

    setFilteredContractors(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Handwerker-Verzeichnis</h1>
          <p className="text-muted-foreground">
            Finden Sie qualifizierte und verifizierte Handwerker in ganz Österreich
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Input
            placeholder="Stadt oder Firmenname suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <Select value={selectedGewerk} onValueChange={setSelectedGewerk}>
            <SelectTrigger>
              <SelectValue placeholder="Gewerk wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Gewerke</SelectItem>
              {Object.entries(GEWERK_LABELS).map(([key, { label, icon }]) => (
                <SelectItem key={key} value={key}>
                  {icon} {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={minRating} onValueChange={setMinRating}>
            <SelectTrigger>
              <SelectValue placeholder="Mindestbewertung" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Alle Bewertungen</SelectItem>
              <SelectItem value="4">⭐ 4+ Sterne</SelectItem>
              <SelectItem value="4.5">⭐ 4.5+ Sterne</SelectItem>
              <SelectItem value="4.8">⭐ 4.8+ Sterne</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {filteredContractors.length} {filteredContractors.length === 1 ? "Handwerker" : "Handwerker"} gefunden
          </p>
        </div>

        {/* Contractors Grid */}
        {filteredContractors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Keine Handwerker mit den ausgewählten Filtern gefunden.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredContractors.map((contractor, index) => (
              <motion.div
                key={contractor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-lg transition-shadow h-full"
                  onClick={() => navigate(`/handwerker/${contractor.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={contractor.profile_image_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                          {contractor.company_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-1 truncate">
                          {contractor.company_name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>{contractor.city || "Österreich"}</span>
                        </div>
                        {contractor.rating && contractor.rating > 0 ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{contractor.rating.toFixed(1)}</span>
                            <span className="text-sm text-muted-foreground">
                              ({contractor.total_reviews || 0} Bewertungen)
                            </span>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Noch keine Bewertungen</p>
                        )}
                      </div>
                    </div>

                    {contractor.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {contractor.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {contractor.trades.slice(0, 3).map((trade) => {
                        const gewerkInfo = GEWERK_LABELS[trade];
                        return (
                          <Badge key={trade} variant="secondary" className="text-xs">
                            {gewerkInfo?.icon} {gewerkInfo?.label || trade}
                          </Badge>
                        );
                      })}
                      {contractor.trades.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{contractor.trades.length - 3} mehr
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
