import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Euro, Clock, AlertCircle, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

interface LeadPreviewCardProps {
  project: {
    id: string;
    title: string;
    gewerk_id: string;
    city: string;
    postal_code: string;
    description: string;
    urgency: string;
    budget_min?: number;
    budget_max?: number;
    estimated_value?: number;
    final_price: number;
    images?: string[];
    created_at: string;
  };
  leadPrice: number;
  onPurchase: () => void;
  purchasing?: boolean;
}

export function LeadPreviewCard({ project, leadPrice, onPurchase, purchasing = false }: LeadPreviewCardProps) {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case 'high': return 'Sofort';
      case 'medium': return 'Normal';
      case 'low': return 'Flexibel';
      default: return urgency;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 border-2 border-warning/50 bg-gradient-to-br from-warning/5 to-background">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            <h3 className="font-semibold text-lg">Lead-Vorschau</h3>
          </div>
          <Badge variant={getUrgencyColor(project.urgency)}>
            {getUrgencyLabel(project.urgency)}
          </Badge>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-xl mb-2">{project.title}</h4>
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <MapPin className="h-4 w-4" />
              <span>{project.city} (PLZ: {project.postal_code.substring(0, 2)}**)</span>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Beschreibung:</p>
            <p className="text-sm line-clamp-3">{project.description}</p>
          </div>

          {project.budget_min && project.budget_max && (
            <div className="flex items-center gap-2">
              <Euro className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Budget: €{project.budget_min} - €{project.budget_max}
              </span>
            </div>
          )}

          {project.images && project.images.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ImageIcon className="h-4 w-4" />
                <span>{project.images.length} Foto{project.images.length > 1 ? 's' : ''} verfügbar</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {project.images.slice(0, 3).map((_, index) => (
                  <div 
                    key={index}
                    className="aspect-square bg-muted rounded-lg backdrop-blur-xl relative overflow-hidden"
                  >
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
                      <AlertCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-4 space-y-3">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Lead-Preis:</p>
              <p className="text-3xl font-bold text-primary">€{leadPrice.toFixed(2)}</p>
            </div>

            <div className="bg-muted/30 p-3 rounded-lg space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Erhalten Sie nach dem Kauf:
              </p>
              <ul className="text-sm space-y-1 ml-6">
                <li>✓ Vollständige Kontaktdaten des Kunden</li>
                <li>✓ Exakte Adresse für Besichtigung</li>
                <li>✓ Alle Projektdetails und Fotos</li>
                <li>✓ Direkte Chat-Funktion zum Kunden</li>
              </ul>
            </div>

            <Button 
              className="w-full text-lg py-6" 
              size="lg"
              onClick={onPurchase}
              disabled={purchasing}
            >
              {purchasing ? (
                <>Wird gekauft...</>
              ) : (
                <>Lead jetzt kaufen für €{leadPrice.toFixed(2)}</>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
