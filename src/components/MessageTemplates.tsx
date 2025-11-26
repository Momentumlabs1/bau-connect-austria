import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Clock, Sparkles } from "lucide-react";

interface MessageTemplate {
  id: string;
  title: string;
  message: string;
  icon: React.ReactNode;
}

interface MessageTemplatesProps {
  projectTitle: string;
  projectCity: string;
  onSelectTemplate: (message: string) => void;
  onCustomMessage: () => void;
}

export function MessageTemplates({ projectTitle, projectCity, onSelectTemplate, onCustomMessage }: MessageTemplatesProps) {
  const templates: MessageTemplate[] = [
    {
      id: 'formal',
      title: 'Professionelle Anfrage',
      message: `Guten Tag! Ich habe großes Interesse an Ihrem Projekt "${projectTitle}" in ${projectCity}. Ich würde mich freuen, Ihnen ein detailliertes Angebot zu erstellen. Könnten wir einen Termin für eine Besichtigung vor Ort vereinbaren?`,
      icon: <MessageSquare className="h-4 w-4" />
    },
    {
      id: 'quick',
      title: 'Schnelle Kontaktaufnahme',
      message: `Hallo! Ihr Projekt "${projectTitle}" interessiert mich sehr. Ich habe langjährige Erfahrung in diesem Bereich und könnte kurzfristig bei Ihnen vorbeikommen. Wann wäre ein guter Zeitpunkt für Sie?`,
      icon: <Clock className="h-4 w-4" />
    },
    {
      id: 'detailed',
      title: 'Detaillierte Vorstellung',
      message: `Sehr geehrte/r Interessent/in,\n\nich habe Ihre Projektanfrage "${projectTitle}" in ${projectCity} gesehen und möchte mich gerne vorstellen. Ich verfüge über mehrjährige Erfahrung in diesem Fachbereich und zahlreiche erfolgreiche Referenzprojekte.\n\nGerne würde ich Details mit Ihnen besprechen und Ihnen ein maßgeschneidertes Angebot erstellen. Wie wäre es mit einem unverbindlichen Beratungsgespräch?\n\nMit freundlichen Grüßen`,
      icon: <Sparkles className="h-4 w-4" />
    }
  ];

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-lg mb-4">Nachricht an Kunden senden</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Wählen Sie eine Vorlage oder schreiben Sie eine eigene Nachricht:
      </p>
      
      <div className="space-y-3">
        {templates.map((template) => (
          <Card key={template.id} className="p-4 hover:border-primary transition-colors cursor-pointer" onClick={() => onSelectTemplate(template.message)}>
            <div className="flex items-start gap-3">
              <div className="mt-1">{template.icon}</div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">{template.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">{template.message}</p>
              </div>
              <Button size="sm" variant="outline" onClick={(e) => {
                e.stopPropagation();
                onSelectTemplate(template.message);
              }}>
                Senden
              </Button>
            </div>
          </Card>
        ))}

        <Button className="w-full" variant="outline" onClick={onCustomMessage}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Eigene Nachricht schreiben
        </Button>
      </div>
    </Card>
  );
}
