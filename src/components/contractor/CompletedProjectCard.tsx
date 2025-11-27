import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { MapPin, CheckCircle2, XCircle, Star, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface CompletedProjectCardProps {
  match: {
    id: string;
    project_id: string;
    contractor_id: string;
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
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const isWon = match.status === 'won' || match.status === 'completed';

  const handleReviewSuccess = () => {
    setShowReviewDialog(false);
  };

  return (
    <>
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
                <div className="mt-4 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setShowReviewDialog(true)}
                  >
                    <Star className="h-4 w-4 mr-1" />
                    Kunde bewerten
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/handwerker/projekt/${match.project.id}`)}
                  >
                    Details ansehen
                  </Button>
                </div>
              )}

              {!isWon && (
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(`/handwerker/projekt/${match.project.id}`)}
                  >
                    Details ansehen
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kunde bewerten</DialogTitle>
            <DialogDescription>
              Wie war Ihre Erfahrung mit diesem Kunden?
            </DialogDescription>
          </DialogHeader>
          <ReviewForm
            projectId={match.project_id}
            contractorId={match.contractor_id}
            reviewerType="HANDWERKER"
            onSuccess={handleReviewSuccess}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
