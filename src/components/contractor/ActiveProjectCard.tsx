import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, MessageSquare, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useChatNavigation } from "@/hooks/useChatNavigation";

interface ActiveProjectCardProps {
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
      status: string;
      customer_id: string;
    };
  };
  index: number;
}

export const ActiveProjectCard = ({ match, index }: ActiveProjectCardProps) => {
  const navigate = useNavigate();
  const { navigateToChat, isNavigating } = useChatNavigation();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted': return <Badge variant="default">Angenommen</Badge>;
      case 'in_progress': return <Badge variant="secondary">In Bearbeitung</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleOpenChat = () => {
    navigateToChat({
      projectId: match.project.id,
      customerId: match.project.customer_id,
      contractorId: match.contractor_id,
    });
  };

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
              {getStatusBadge(match.status)}
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Nächste Schritte
              </h4>
              <p className="text-sm">
                {match.status === 'accepted' 
                  ? 'Vereinbaren Sie einen Termin mit dem Kunden'
                  : 'Halten Sie den Kunden über Fortschritte auf dem Laufenden'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 md:w-48">
            <Button 
              variant="default"
              className="w-full"
              onClick={() => navigate(`/handwerker/projekt/${match.project.id}`)}
            >
              Projekt öffnen
            </Button>
            <Button 
              variant="outline"
              className="w-full"
              onClick={handleOpenChat}
              disabled={isNavigating}
            >
              {isNavigating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <MessageSquare className="h-4 w-4 mr-2" />
              )}
              Chat
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};