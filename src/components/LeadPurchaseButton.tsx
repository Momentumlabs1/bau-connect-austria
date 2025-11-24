import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, CreditCard } from 'lucide-react';

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51SVIA2Dqron6ccSWsZlFT1zs2v8cSPIY0Qy8jHAGhUtsVNyoHqjcWJIeANd9q2N6OWJJVXdBtNOAJxu3in8DudwH00THNfDTY3');

interface LeadPurchaseButtonProps {
  leadId: string;
  leadTitle: string;
  leadPrice?: number;
  onPurchaseSuccess?: () => void;
}

const CheckoutForm = ({ 
  leadId, 
  leadTitle, 
  onSuccess 
}: { 
  leadId: string; 
  leadTitle: string; 
  onSuccess: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?lead=${leadId}`,
        },
      });

      if (error) {
        toast({
          title: 'Zahlung fehlgeschlagen',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        onSuccess();
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast({
        title: 'Fehler',
        description: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <h3 className="font-semibold">Lead: {leadTitle}</h3>
        <p className="text-sm text-muted-foreground">Preis: 5,00 €</p>
      </div>
      
      <PaymentElement />
      
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verarbeitung...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Jetzt kaufen (5,00 €)
          </>
        )}
      </Button>
    </form>
  );
};

export const LeadPurchaseButton = ({ 
  leadId, 
  leadTitle, 
  leadPrice = 5, 
  onPurchaseSuccess 
}: LeadPurchaseButtonProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const { toast } = useToast();

  const handlePurchaseClick = async () => {
    setIsCreatingIntent(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: 'Nicht angemeldet',
          description: 'Bitte melden Sie sich an, um einen Lead zu kaufen.',
          variant: 'destructive',
        });
        return;
      }

      // Create payment intent
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: { leadId },
      });

      if (error) throw error;

      setClientSecret(data.clientSecret);
      setShowDialog(true);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      toast({
        title: 'Fehler',
        description: error.message || 'Zahlung konnte nicht gestartet werden.',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingIntent(false);
    }
  };

  const handleSuccess = () => {
    setShowDialog(false);
    toast({
      title: 'Zahlung erfolgreich!',
      description: 'Die Kontaktdaten werden nun freigeschaltet.',
    });
    onPurchaseSuccess?.();
  };

  return (
    <>
      <Button
        onClick={handlePurchaseClick}
        disabled={isCreatingIntent}
        size="lg"
        className="w-full"
      >
        {isCreatingIntent ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Lädt...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Kontakt kaufen ({leadPrice}€)
          </>
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Lead kaufen</DialogTitle>
            <DialogDescription>
              Nach erfolgreicher Zahlung erhalten Sie Zugriff auf die Kontaktdaten des Bauherrn.
            </DialogDescription>
          </DialogHeader>
          
          {clientSecret && (
            <Elements 
              stripe={stripePromise} 
              options={{ 
                clientSecret,
                appearance: {
                  theme: 'stripe',
                },
              }}
            >
              <CheckoutForm 
                leadId={leadId} 
                leadTitle={leadTitle} 
                onSuccess={handleSuccess}
              />
            </Elements>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
