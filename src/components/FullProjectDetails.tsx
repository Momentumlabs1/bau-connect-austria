import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Euro, Phone, Mail, User, Calendar, CheckCircle2, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface FullProjectDetailsProps {
  project: {
    id: string;
    title: string;
    gewerk_id: string;
    city: string;
    postal_code: string;
    address?: string;
    description: string;
    urgency: string;
    budget_min?: number;
    budget_max?: number;
    estimated_value?: number;
    final_price: number;
    images?: string[];
    created_at: string;
    preferred_start_date?: string;
    customer_id: string;
  };
  customer: {
    first_name?: string;
    last_name?: string;
    email: string;
    phone?: string;
  };
  purchasedAt: string;
  onStartChat: () => void;
}

export function FullProjectDetails({ project, customer, purchasedAt, onStartChat }: FullProjectDetailsProps) {
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
      className="space-y-6"
    >
      {/* Success Banner */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold">Lead erfolgreich gekauft</p>
            <p className="text-sm text-muted-foreground">
              Gekauft am {format(new Date(purchasedAt), 'dd. MMM yyyy, HH:mm', { locale: de })} Uhr für €{project.final_price.toFixed(2)}
            </p>
          </div>
        </div>
      </Card>

      {/* Customer Contact Information */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <User className="h-5 w-5" />
          Kundenkontakt
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {customer.first_name && customer.last_name 
                ? `${customer.first_name} ${customer.last_name}`
                : 'Kunde'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <a href={`mailto:${customer.email}`} className="text-primary hover:underline">
              {customer.email}
            </a>
          </div>
          {customer.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${customer.phone}`} className="text-primary hover:underline">
                {customer.phone}
              </a>
            </div>
          )}
          <div className="mt-4">
            <Button 
              className="w-full" 
              onClick={onStartChat}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Angebot erstellen
            </Button>
          </div>
        </div>
      </Card>
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-semibold text-xl">{project.title}</h3>
          <Badge variant={getUrgencyColor(project.urgency)}>
            {getUrgencyLabel(project.urgency)}
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {project.address ? `${project.address}, ` : ''}
              {project.postal_code} {project.city}
            </span>
          </div>

          {project.preferred_start_date && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Gewünschter Start: {format(new Date(project.preferred_start_date), 'dd. MMMM yyyy', { locale: de })}
              </span>
            </div>
          )}

          {project.budget_min && project.budget_max && (
            <div className="flex items-center gap-2">
              <Euro className="h-4 w-4 text-muted-foreground" />
              <span>Budget: €{project.budget_min} - €{project.budget_max}</span>
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">Projektbeschreibung</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {project.description}
            </p>
          </div>

          {project.images && project.images.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Projektfotos ({project.images.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {project.images.map((imageUrl, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={imageUrl}
                      alt={`Projekt Foto ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => window.open(imageUrl, '_blank')}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
