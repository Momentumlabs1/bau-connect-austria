import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const leadId = searchParams.get('lead');
  const paymentIntent = searchParams.get('payment_intent');

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      if (!paymentIntent) {
        setLoading(false);
        return;
      }

      // Check if payment was completed in database
      const { data, error } = await supabase
        .from('lead_purchases')
        .select('status')
        .eq('stripe_payment_intent_id', paymentIntent)
        .single();

      if (error) throw error;

      if (data?.status === 'completed') {
        setVerified(true);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewLead = () => {
    if (leadId) {
      navigate(`/contractor/projects/${leadId}`);
    } else {
      navigate('/contractor/projects');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className="p-8 text-center">
          {loading ? (
            <>
              <Loader2 className="h-16 w-16 animate-spin mx-auto mb-6 text-primary" />
              <h1 className="text-2xl font-bold mb-2">Zahlung wird überprüft...</h1>
              <p className="text-muted-foreground">
                Bitte warten Sie einen Moment
              </p>
            </>
          ) : verified ? (
            <>
              <CheckCircle2 className="h-16 w-16 mx-auto mb-6 text-green-500" />
              <h1 className="text-3xl font-bold mb-4">Zahlung erfolgreich!</h1>
              <p className="text-lg text-muted-foreground mb-8">
                Sie haben den Lead erfolgreich gekauft. Die Kontaktdaten sind jetzt für Sie freigeschaltet.
              </p>
              <div className="space-y-3">
                <Button onClick={handleViewLead} size="lg" className="w-full">
                  Lead anzeigen
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/contractor/projects')}
                  className="w-full"
                >
                  Zurück zur Übersicht
                </Button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-4">Zahlung wird verarbeitet</h1>
              <p className="text-muted-foreground mb-6">
                Ihre Zahlung wird gerade verarbeitet. Dies kann einen Moment dauern.
              </p>
              <Button onClick={() => navigate('/contractor/projects')} variant="outline">
                Zurück zur Übersicht
              </Button>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
