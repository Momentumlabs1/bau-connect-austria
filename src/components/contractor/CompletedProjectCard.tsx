import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, CheckCircle2, XCircle, Star, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface CompletedProjectCardProps {
  match: {
    id: string;
    project_id: string;
    status: string;
    updated_at: string;
    project: {
      id: string;
      title: string;
      city: string;
      postal_code: string;
    };
  };
  index: number;
}

export const CompletedProjectCard = ({ match, index }: CompletedProjectCardProps) => {
  const navigate = useNavigate();
  const isWon = match.status === 'won' || match.status === 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="p-6 hover:shadow-lg transition-all">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold mb-1">{match.project.title}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {match.project.postal_code} {match.project.city}
                </p>
              </div>
              {isWon ? (
                <Badge variant="default" className="bg-green-500/10 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Gewonnen
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-muted">
                  <XCircle className="h-3 w-3 mr-1" />
                  Verloren
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(match.updated_at), 'dd.MM.yyyy', { locale: de })}
              </div>
            </div>

            {isWon && (
              <div className="mt-4 bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  🎉 Herzlichen Glückwunsch! Projekt erfolgreich abgeschlossen.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <Star className="h-3 w-3 mr-2" />
                  Bewertung anfordern
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 md:w-48">
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => navigate(`/handwerker/projekt/${match.project.id}`)}
            >
              Details ansehen
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
