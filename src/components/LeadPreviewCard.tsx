import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Euro, Clock, AlertCircle, Image as ImageIcon, Ticket } from "lucide-react";
import { motion } from "framer-motion";
import { LeadPurchaseButton } from "@/components/LeadPurchaseButton";
import { useState } from "react";

interface LeadPreviewCardProps {
  project: {
    id: string;
    title: string;
    gewerk_id: string;
    subcategory_id?: string;
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
    preferred_start_date?: string;
    funnel_answers?: Record<string, any>;
  };
  leadPrice: number;
  onPurchase?: (voucherCode?: string) => void;
  purchasing?: boolean;
  insufficientBalance?: boolean;
  currentBalance?: number;
  useStripePayment?: boolean;
  onPurchaseSuccess?: () => void;
  subcategoryName?: string;
}

export function LeadPreviewCard({ 
  project, 
  leadPrice, 
  onPurchase, 
  purchasing = false, 
  insufficientBalance = false, 
  currentBalance = 0,
  useStripePayment = false,
  onPurchaseSuccess,
  subcategoryName
}: LeadPreviewCardProps) {
  const [voucherCode, setVoucherCode] = useState("");
  
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

  const getGewerkLabel = (gewerkId: string) => {
    const labels: Record<string, string> = {
      'elektriker': 'Elektriker',
      'sanitar-heizung': 'Sanitär / Heizung',
      'dachdecker': 'Dachdecker',
      'fassade': 'Fassade',
      'maler': 'Maler'
    };
    return labels[gewerkId] || gewerkId;
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
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-xl">{project.title}</h4>
              <Badge variant="outline">{getGewerkLabel(project.gewerk_id)}</Badge>
            </div>
            {subcategoryName && (
              <p className="text-sm text-muted-foreground mb-2">📂 {subcategoryName}</p>
            )}
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <MapPin className="h-4 w-4" />
              <span>{project.city} (PLZ: {project.postal_code.substring(0, 2)}**)</span>
            </div>
            {project.preferred_start_date && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Start: {new Date(project.preferred_start_date).toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            )}
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Beschreibung:</p>
            <p className="text-sm line-clamp-3">{project.description}</p>
          </div>

          {/* ALL Funnel Answers - no slicing */}
          {project.funnel_answers && Object.keys(project.funnel_answers).length > 0 && (
            <div className="bg-muted/30 p-4 rounded-lg border">
              <p className="text-sm font-medium mb-3 flex items-center gap-2">
                <span>📋</span>
                Projekt-Details
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(project.funnel_answers).map(([key, value]) => (
                  <div key={key} className="text-sm bg-background/50 p-2 rounded">
                    <span className="text-muted-foreground">• </span>
                    {Array.isArray(value) ? value.join(', ') : String(value)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Real images - not blurred */}
          {project.images && project.images.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ImageIcon className="h-4 w-4" />
                <span>{project.images.length} Foto{project.images.length > 1 ? 's' : ''}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {project.images.slice(0, 6).map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Projektfoto ${index + 1}`}
                    className="aspect-square object-cover rounded-lg border"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-4 space-y-3">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Lead-Preis:</p>
              <p className="text-3xl font-bold text-primary">€{leadPrice.toFixed(2)}</p>
            </div>

            {insufficientBalance && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm font-medium text-destructive mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Guthaben zu niedrig
                </p>
                <p className="text-sm text-muted-foreground">
                  Ihr aktuelles Guthaben: €{currentBalance.toFixed(2)}
                  <br />
                  Benötigt: €{leadPrice.toFixed(2)}
                  <br />
                  Fehlbetrag: €{(leadPrice - currentBalance).toFixed(2)}
                </p>
              </div>
            )}

            <div className="bg-muted/30 p-3 rounded-lg space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Erhalten Sie nach dem Kauf:
              </p>
              <ul className="text-sm space-y-1 ml-6">
                <li>✓ Vollständige Kontaktdaten des Kunden</li>
                <li>✓ Direkte Chat-Funktion zum Kunden</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Ticket className="h-4 w-4 text-primary" />
                <span>Gutschein-Code (optional)</span>
              </div>
              <Input
                placeholder="z.B. CONNECT2025"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                className="uppercase"
              />
              {voucherCode && (
                <p className="text-xs text-muted-foreground">
                  ✓ Gutschein wird beim Kauf angewendet
                </p>
              )}
            </div>

            {useStripePayment ? (
              <LeadPurchaseButton 
                leadId={project.id}
                leadTitle={project.title}
                leadPrice={leadPrice}
                onPurchaseSuccess={onPurchaseSuccess}
                voucherCode={voucherCode}
              />
            ) : (
              <Button 
                className="w-full text-lg py-6" 
                size="lg"
                onClick={() => onPurchase?.(voucherCode)}
                disabled={purchasing || (insufficientBalance && !voucherCode)}
              >
                {purchasing ? (
                  <>Wird gekauft...</>
                ) : insufficientBalance && !voucherCode ? (
                  <>Guthaben aufladen erforderlich</>
                ) : voucherCode ? (
                  <>Lead mit Gutschein kaufen</>
                ) : (
                  <>Lead jetzt kaufen für €{leadPrice.toFixed(2)}</>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
