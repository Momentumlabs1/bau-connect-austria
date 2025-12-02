import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Euro, Clock, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface AvailableLeadCardProps {
  match: {
    id: string;
    project_id: string;
    score: number | null;
    created_at: string;
    project: {
      id: string;
      title: string;
      city: string;
      postal_code: string;
      gewerk_id: string;
      urgency: string;
      final_price: number;
      description?: string;
      images?: string[];
      funnel_answers?: Record<string, any>;
      preferred_start_date?: string;
      subcategory_id?: string;
    };
  };
  index: number;
  onSelect?: (match: any) => void;
}

export const AvailableLeadCard = ({ match, index, onSelect }: AvailableLeadCardProps) => {
  const navigate = useNavigate();

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'high': return <Badge variant="destructive">Dringend</Badge>;
      case 'medium': return <Badge variant="default">Normal</Badge>;
      case 'low': return <Badge variant="secondary">Flexibel</Badge>;
      default: return <Badge variant="outline">{urgency}</Badge>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary" onClick={() => onSelect ? onSelect(match) : navigate(`/handwerker/projekt/${match.project.id}`)}>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{match.project.title}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {match.project.postal_code.substring(0, 2)}XX {match.project.city}
                </p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  Genaue Adresse nach Kauf sichtbar
                </p>
              </div>
              {getUrgencyBadge(match.project.urgency)}
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="bg-primary/10 px-3 py-1.5 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground">Lead-Preis</p>
                <p className="text-lg font-bold text-primary">
                  €{match.project.final_price.toFixed(2)}
                </p>
              </div>
              <div className="bg-muted/50 px-3 py-1.5 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground">Dringlichkeit</p>
                <p className="text-sm font-semibold">
                  {match.project.urgency === 'high' ? '🔴 Dringend' : 
                   match.project.urgency === 'medium' ? '🟡 Normal' : 
                   '🟢 Flexibel'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 md:w-48">
            <Button 
              variant="default"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                onSelect ? onSelect(match) : navigate(`/handwerker/projekt/${match.project.id}`);
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Details & Kaufen
            </Button>
            {match.score && (
              <p className="text-xs text-center text-muted-foreground">
                Match: {match.score}%
              </p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
