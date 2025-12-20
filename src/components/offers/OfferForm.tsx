import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { MessageSquare, Send, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface OfferFormProps {
  projectId: string;
  projectTitle?: string;
  projectCity?: string;
  onSuccess?: () => void;
}

const MESSAGE_TEMPLATES = [
  {
    id: 'professional',
    title: '👔 Professionelle Anfrage',
    template: (title: string, city: string) => 
      `Guten Tag!\n\nIch habe Ihr Projekt "${title}" in ${city} gesehen und bin sehr an der Umsetzung interessiert. Als erfahrener Handwerker kann ich Ihnen eine qualitativ hochwertige Ausführung garantieren.\n\nGerne würde ich weitere Details mit Ihnen besprechen und einen Vor-Ort-Termin vereinbaren.\n\nMit freundlichen Grüßen`,
    preview: 'Professionelle Vorstellung mit Terminvorschlag'
  },
  {
    id: 'quick',
    title: '⚡ Schnelle Kontaktaufnahme',
    template: (title: string, city: string) => 
      `Hallo!\n\nIhr Projekt "${title}" interessiert mich sehr. Ich bin in der Region ${city} tätig und könnte zeitnah mit der Arbeit beginnen.\n\nKönnen wir telefonisch die Details besprechen?\n\nViele Grüße`,
    preview: 'Kurz und direkt, fokussiert auf schnellen Start'
  },
  {
    id: 'detailed',
    title: '📋 Detaillierte Vorstellung',
    template: (title: string, city: string) => 
      `Sehr geehrte/r Interessent/in,\n\nzu Ihrem Projekt "${title}" in ${city} möchte ich mich gerne als qualifizierter Handwerker vorstellen.\n\nIch verfüge über langjährige Erfahrung in diesem Bereich und lege großen Wert auf:\n• Termingerechte Ausführung\n• Saubere Arbeitsweise\n• Faire Preisgestaltung\n• Nachhaltige Lösungen\n\nGerne erstelle ich Ihnen ein unverbindliches Angebot nach einer Besichtigung vor Ort.\n\nFreundliche Grüße`,
    preview: 'Ausführliche Vorstellung mit Leistungspunkten'
  }
];

export const OfferForm = ({ projectId, projectTitle = 'dieses Projekt', projectCity = 'Ihrer Region', onSuccess }: OfferFormProps) => {
  const [amount, setAmount] = useState('');
  const [messageType, setMessageType] = useState<'template' | 'custom'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [customMessage, setCustomMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingOffer, setExistingOffer] = useState<any>(null);
  const [checkingExisting, setCheckingExisting] = useState(true);

  // Check for existing offer on mount
  useEffect(() => {
    checkExistingOffer();
  }, [projectId]);

  const checkExistingOffer = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('project_id', projectId)
        .eq('contractor_id', user.id)
        .maybeSingle();

      if (!error && data) {
        setExistingOffer(data);
      }
    } catch (error) {
      console.error('Error checking existing offer:', error);
    } finally {
      setCheckingExisting(false);
    }
  };

  // Show message if offer already exists
  if (checkingExisting) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="text-muted-foreground mt-4">Prüfe bestehende Angebote...</p>
      </div>
    );
  }

  if (existingOffer) {
    return (
      <Card className="p-6 bg-yellow-50 border-yellow-200">
        <div className="text-center space-y-4">
          <div className="text-4xl">✓</div>
          <h3 className="text-lg font-semibold">Angebot bereits gesendet</h3>
          <p className="text-sm text-muted-foreground">
            Sie haben bereits am {format(new Date(existingOffer.created_at), 'dd.MM.yyyy', { locale: de })} ein Angebot über <strong>€{existingOffer.amount.toFixed(2)}</strong> abgegeben.
          </p>
          <p className="text-sm text-muted-foreground">
            Der Kunde wird sich bei Interesse bei Ihnen melden.
          </p>
        </div>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: 'Ungültiger Betrag',
        description: 'Bitte gib einen gültigen Angebotspreis ein',
        variant: 'destructive'
      });
      return;
    }

    let finalMessage = '';
    if (messageType === 'template') {
      const template = MESSAGE_TEMPLATES.find(t => t.id === selectedTemplate);
      if (template) {
        finalMessage = template.template(projectTitle, projectCity);
      }
    } else {
      finalMessage = customMessage.trim();
    }

    if (!finalMessage || finalMessage.length < 20) {
      toast({
        title: 'Nachricht erforderlich',
        description: 'Bitte füge eine Nachricht mit mindestens 20 Zeichen hinzu',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-offer', {
        body: {
          projectId,
          amount: amountNum,
          message: finalMessage,
          validDays: 7
        }
      });

      if (error) throw error;

      toast({
        title: 'Angebot erstellt',
        description: 'Dein Angebot wurde erfolgreich an den Kunden gesendet'
      });

      setAmount('');
      setCustomMessage('');
      setMessageType('template');
      setSelectedTemplate('professional');
      onSuccess?.();
    } catch (error: any) {
      console.error('❌ Error creating offer:', error);
      toast({
        title: 'Fehler',
        description: error.message || 'Angebot konnte nicht erstellt werden',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Price Input */}
      <div>
        <Label htmlFor="amount" className="text-base font-semibold flex items-center gap-2">
          💰 Ihr Angebotspreis
        </Label>
        <div className="relative mt-2">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="z.B. 1500.00"
            className="pl-8 text-lg h-12"
            required
          />
        </div>
      </div>

      {/* Message Selection */}
      <div>
        <Label className="text-base font-semibold flex items-center gap-2 mb-4">
          📝 Ihre Nachricht
        </Label>

        <RadioGroup value={messageType} onValueChange={(value: any) => setMessageType(value)} className="space-y-3">
          {/* Template Options */}
          {MESSAGE_TEMPLATES.map((template) => (
            <Card
              key={template.id}
              className={`p-4 cursor-pointer transition-all hover:border-primary ${
                messageType === 'template' && selectedTemplate === template.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border'
              }`}
              onClick={() => {
                setMessageType('template');
                setSelectedTemplate(template.id);
              }}
            >
              <div className="flex items-start gap-3">
                <RadioGroupItem value={template.id} id={template.id} className="mt-1" />
                <div className="flex-1">
                  <label htmlFor={template.id} className="font-medium cursor-pointer block">
                    {template.title}
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">{template.preview}</p>
                  {messageType === 'template' && selectedTemplate === template.id && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-md text-sm whitespace-pre-wrap">
                      {template.template(projectTitle, projectCity)}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {/* Custom Message Option */}
          <Card
            className={`p-4 cursor-pointer transition-all hover:border-primary ${
              messageType === 'custom' ? 'border-primary bg-primary/5' : 'border-border'
            }`}
            onClick={() => setMessageType('custom')}
          >
            <div className="flex items-start gap-3">
              <RadioGroupItem value="custom" id="custom" className="mt-1" />
              <div className="flex-1">
                <label htmlFor="custom" className="font-medium cursor-pointer flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Eigene Nachricht schreiben
                </label>
                {messageType === 'custom' && (
                  <Textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Beschreiben Sie Ihr Angebot und warum Sie der richtige Handwerker für dieses Projekt sind..."
                    rows={8}
                    minLength={20}
                    maxLength={500}
                    className="mt-3"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
                {messageType === 'custom' && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {customMessage.length}/500 Zeichen (mindestens 20 Zeichen erforderlich)
                  </p>
                )}
              </div>
            </div>
          </Card>
        </RadioGroup>
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={loading} className="w-full h-12 text-base" size="lg">
        {loading ? (
          'Wird gesendet...'
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Angebot senden
          </>
        )}
      </Button>
    </form>
  );
};
