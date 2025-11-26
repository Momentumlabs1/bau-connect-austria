import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Euro, Phone, Mail, User, Calendar, CheckCircle2, MessageSquare, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CategoryQuestion {
  id: string;
  question_text: string;
  question_type: string;
  options: any;
  required: boolean;
  help_text: string | null;
  sort_order: number;
}

interface FullProjectDetailsProps {
  project: {
    id: string;
    title: string;
    gewerk_id: string;
    subcategory_id?: string;
    postal_code: string;
    city: string;
    address?: string;
    description: string;
    urgency: string;
    budget_min?: number;
    budget_max?: number;
    preferred_start_date?: string;
    images?: string[];
    funnel_answers?: Record<string, any>;
    final_price: number;
    customer_id: string;
    created_at: string;
  };
  customer: {
    first_name?: string;
    last_name?: string;
    email: string;
    phone?: string;
  };
  purchasedAt: string;
  onStartChat: () => void;
  categoryQuestions?: CategoryQuestion[];
}

export const FullProjectDetails = ({ project, customer, purchasedAt, onStartChat, categoryQuestions = [] }: FullProjectDetailsProps) => {
  const [questions, setQuestions] = useState<CategoryQuestion[]>(categoryQuestions);
  const [categoryName, setCategoryName] = useState<string>("");

  useEffect(() => {
    const loadQuestions = async () => {
      if (categoryQuestions.length > 0) {
        setQuestions(categoryQuestions);
        return;
      }
      
      if (project.subcategory_id) {
        const { data } = await supabase
          .from('category_questions')
          .select('*')
          .eq('category_id', project.subcategory_id)
          .order('sort_order');
        
        if (data) setQuestions(data);
      }
    };

    const loadCategoryName = async () => {
      if (project.subcategory_id) {
        const { data } = await supabase
          .from('service_categories')
          .select('name')
          .eq('id', project.subcategory_id)
          .single();
        
        if (data) setCategoryName(data.name);
      }
    };

    loadQuestions();
    loadCategoryName();
  }, [project.subcategory_id, categoryQuestions]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'Dringend';
      case 'medium': return 'Normal';
      case 'low': return 'Flexibel';
      default: return urgency;
    }
  };

  const formatAnswer = (questionId: string, answer: any) => {
    if (Array.isArray(answer)) {
      return answer.join(', ');
    }
    return String(answer || '–');
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

      {/* Project Details */}
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Projektdetails
        </h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
            <Badge variant={getUrgencyColor(project.urgency)} className="mb-2">
              {getUrgencyLabel(project.urgency)}
            </Badge>
            {categoryName && (
              <p className="text-sm text-muted-foreground mt-1">
                Kategorie: {categoryName}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-muted-foreground mb-1">Standort</h4>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {project.postal_code} {project.city}
                {project.address && `, ${project.address}`}
              </p>
            </div>

            {project.preferred_start_date && (
              <div>
                <h4 className="font-medium text-muted-foreground mb-1">Gewünschter Start</h4>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(project.preferred_start_date), 'dd. MMMM yyyy', { locale: de })}
                </p>
              </div>
            )}

            {(project.budget_min || project.budget_max) && (
              <div className="md:col-span-2">
                <h4 className="font-medium text-muted-foreground mb-1">Budget</h4>
                <p className="font-semibold text-xl text-primary">
                  {project.budget_min && project.budget_max
                    ? `€${project.budget_min} - €${project.budget_max}`
                    : project.budget_min
                    ? `ab €${project.budget_min}`
                    : `bis €${project.budget_max}`}
                </p>
              </div>
            )}
          </div>

          {/* Funnel Answers Section */}
          {project.funnel_answers && Object.keys(project.funnel_answers).length > 0 && questions.length > 0 && (
            <div className="border-t pt-6">
              <h4 className="font-semibold text-lg mb-4">📋 Projektanforderungen</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questions.map((question) => {
                  const answer = project.funnel_answers?.[question.id];
                  if (!answer) return null;
                  
                  return (
                    <div key={question.id} className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {question.question_text}
                      </p>
                      <p className="text-foreground font-medium">
                        {formatAnswer(question.id, answer)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h4 className="font-medium text-muted-foreground mb-2">Zusätzliche Beschreibung</h4>
            <p className="text-foreground whitespace-pre-wrap">{project.description}</p>
          </div>

          {project.images && project.images.length > 0 && (
            <div>
              <h4 className="font-medium text-muted-foreground mb-3">Projektfotos</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {project.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Projektfoto ${index + 1}`}
                    className="rounded-lg w-full h-48 object-cover border hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => window.open(image, '_blank')}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
