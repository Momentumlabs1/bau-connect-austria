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
    };
  };
  index: number;
}

export const AvailableLeadCard = ({ match, index }: AvailableLeadCardProps) => {
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
      <Card className="p-6 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate(`/handwerker/projekt/${match.project.id}`)}>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{match.project.title}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {match.project.postal_code} {match.project.city}
                </p>
              </div>
              {getUrgencyBadge(match.project.urgency)}
            </div>

            <div className="bg-muted/50 p-3 rounded-lg w-fit">
              <div className="flex items-center gap-2 mb-1">
                <Euro className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Lead-Preis</span>
              </div>
              <p className="text-lg font-bold text-primary">
                €{match.project.final_price.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 md:w-48">
            <Button 
              variant="default"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/handwerker/projekt/${match.project.id}`);
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Vorschau & Kaufen
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
