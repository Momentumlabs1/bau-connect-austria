import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, User, Phone, Mail, MessageSquare, Calendar, Euro } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface PurchasedLeadCardProps {
  match: {
    id: string;
    project_id: string;
    purchased_at: string;
    status?: string;
    project: {
      id: string;
      title: string;
      city: string;
      postal_code: string;
      final_price: number;
      customer_id: string;
      status?: string;
      profiles?: {
        first_name?: string;
        last_name?: string;
        email: string;
        phone?: string;
      };
    };
    offers?: Array<{
      status: string;
    }>;
  };
  index: number;
}

export const PurchasedLeadCard = ({ match, index }: PurchasedLeadCardProps) => {
  const navigate = useNavigate();
  const customer = match.project.profiles;
  
  // Determine status badge
  const offerStatus = match.offers?.[0]?.status;
  const projectStatus = match.project.status;
  const matchStatus = match.status;
  
  const getStatusBadge = () => {
    if (matchStatus === 'won') {
      return <Badge className="bg-green-500">Gewonnen</Badge>;
    }
    if (matchStatus === 'accepted' && projectStatus === 'in_progress') {
      return <Badge className="bg-blue-500">Aktiv</Badge>;
    }
    if (matchStatus === 'lost') {
      return <Badge variant="destructive">Lead vergeben</Badge>;
    }
    if (offerStatus === 'rejected') {
      return <Badge variant="destructive">Angebot abgelehnt</Badge>;
    }
    if (offerStatus === 'pending') {
      return <Badge className="bg-yellow-500">Angebot ausstehend</Badge>;
    }
    return <Badge variant="default" className="bg-primary/10 text-primary">Gekauft</Badge>;
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
              {getStatusBadge()}
            </div>

            <div className="bg-muted/50 p-4 rounded-lg mb-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Kundenkontakt
              </h4>
              {customer ? (
                <div className="space-y-1 text-sm">
                  {(customer.first_name || customer.last_name) && (
                    <p className="font-medium">
                      {customer.first_name} {customer.last_name}
                    </p>
                  )}
                  <a 
                    href={`mailto:${customer.email}`}
                    className="flex items-center gap-2 text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Mail className="h-3 w-3" />
                    {customer.email}
                  </a>
                  {customer.phone && (
                    <a 
                      href={`tel:${customer.phone}`}
                      className="flex items-center gap-2 text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone className="h-3 w-3" />
                      {customer.phone}
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Kundendaten laden...</p>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Gekauft: {format(new Date(match.purchased_at), 'dd.MM.yyyy', { locale: de })}
              </div>
              <div className="flex items-center gap-1">
                <Euro className="h-3 w-3" />
                €{match.project.final_price.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 md:w-48">
            <Button 
              variant="default"
              className="w-full"
              onClick={() => navigate(`/handwerker/projekt/${match.project.id}`)}
            >
              Details ansehen
            </Button>
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => navigate('/nachrichten')}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat öffnen
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
