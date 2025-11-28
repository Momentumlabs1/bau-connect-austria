import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface TopContractor {
  id: string;
  company_name: string;
  trades: string[];
  city: string;
  description: string;
  rating: number;
  total_reviews: number;
  profile_image_url: string | null;
}

const GEWERKE_LABELS: Record<string, { label: string; icon: string }> = {
  "elektriker": { label: "Elektriker", icon: "⚡" },
  "sanitar-heizung": { label: "Sanitär & Heizung", icon: "🔧" },
  "dachdecker": { label: "Dachdecker", icon: "🏠" },
  "fassade": { label: "Fassade", icon: "🧱" },
  "maler": { label: "Maler", icon: "🎨" },
  "bau": { label: "Bau / Rohbau", icon: "🏗️" },
};

export function TopContractors() {
  const [contractors, setContractors] = useState<TopContractor[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTopContractors();
  }, []);

  const loadTopContractors = async () => {
    try {
      const { data, error } = await supabase
        .from('contractors')
        .select('id, company_name, trades, city, description, rating, total_reviews, profile_image_url')
        .eq('verified', true)
        .gt('rating', 4.5)
        .order('rating', { ascending: false })
        .order('total_reviews', { ascending: false })
        .limit(4);

      if (error) throw error;
      setContractors(data || []);
    } catch (error) {
      console.error('Error loading top contractors:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || contractors.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3">
              <span className="text-gray-900">Top </span>
              <span className="text-blue-600">Handwerker</span>
            </h2>
            <p className="text-lg text-gray-600">
              Höchstbewertete Fachleute auf BauConnect24
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contractors.map((contractor) => (
              <Card
                key={contractor.id}
                className="p-6 hover:shadow-xl transition-all cursor-pointer group border-2 hover:border-blue-600"
                onClick={() => navigate(`/handwerker/${contractor.id}`)}
              >
                <div className="flex gap-4">
                  {/* Profile Image */}
                  <div className="flex-shrink-0">
                    {contractor.profile_image_url ? (
                      <img
                        src={contractor.profile_image_url}
                        alt={contractor.company_name}
                        className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-gray-200">
                        {contractor.company_name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {contractor.company_name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold text-gray-900">
                          {contractor.rating.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        ({contractor.total_reviews} Bewertungen)
                      </span>
                    </div>

                    {/* Trades */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {contractor.trades.slice(0, 3).map((trade) => {
                        const gewerkInfo = GEWERKE_LABELS[trade] || { label: trade, icon: "🔨" };
                        return (
                          <Badge
                            key={trade}
                            variant="secondary"
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                          >
                            <span className="mr-1">{gewerkInfo.icon}</span>
                            {gewerkInfo.label}
                          </Badge>
                        );
                      })}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {contractor.description}
                    </p>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {contractor.city}
                    </div>
                  </div>
                </div>

                {/* View Profile Button */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors"
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    Profil ansehen
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/handwerker-verzeichnis")}
              className="hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
            >
              Alle Handwerker durchsuchen
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
