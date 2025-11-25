import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface OfferFormProps {
  projectId: string;
  onSuccess?: () => void;
}

export const OfferForm = ({ projectId, onSuccess }: OfferFormProps) => {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: 'Ungültiger Betrag',
        description: 'Bitte gib einen gültigen Betrag ein',
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
          message: message.trim() || null,
          validDays: 7
        }
      });

      if (error) throw error;

      toast({
        title: 'Angebot erstellt',
        description: 'Dein Angebot wurde erfolgreich an den Kunden gesendet'
      });

      setAmount('');
      setMessage('');
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="amount">Angebotspreis (€) *</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="z.B. 1500.00"
          required
        />
      </div>

      <div>
        <Label htmlFor="message">Nachricht (optional)</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Füge Details zu deinem Angebot hinzu..."
          rows={4}
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {message.length}/500 Zeichen
        </p>
      </div>

      <div className="bg-muted p-3 rounded-md text-sm">
        <p className="font-medium mb-1">Hinweis:</p>
        <p className="text-muted-foreground">
          Dein Angebot ist 7 Tage gültig und kann vom Kunden angenommen oder abgelehnt werden.
        </p>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Wird gesendet...' : 'Angebot senden'}
      </Button>
    </form>
  );
};
