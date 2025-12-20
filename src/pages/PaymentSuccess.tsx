import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const leadId = searchParams.get('lead');
  const paymentIntent = searchParams.get('payment_intent');

  const MAX_ATTEMPTS = 10;
  const POLL_INTERVAL = 2000; // 2 seconds

  const verifyPayment = useCallback(async () => {
    try {
      if (!paymentIntent) {
        setLoading(false);
        setTimedOut(true);
        return;
      }

      // Check if payment was completed in database
      const { data, error } = await supabase
        .from('lead_purchases')
        .select('status')
        .eq('stripe_payment_intent_id', paymentIntent)
        .maybeSingle();

      if (error) {
        console.error('Error verifying payment:', error);
      }

      if (data?.status === 'completed') {
        setVerified(true);
        setLoading(false);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  }, [paymentIntent]);

  useEffect(() => {
    let pollTimer: NodeJS.Timeout;
    let timeoutTimer: NodeJS.Timeout;

    const startPolling = async () => {
      const success = await verifyPayment();
      
      if (success) return;

      // Poll for payment completion
      pollTimer = setInterval(async () => {
        setAttempts(prev => {
          if (prev >= MAX_ATTEMPTS) {
            clearInterval(pollTimer);
            setLoading(false);
            setTimedOut(true);
            return prev;
          }
          return prev + 1;
        });
        
        const verified = await verifyPayment();
        if (verified) {
          clearInterval(pollTimer);
        }
      }, POLL_INTERVAL);

      // Overall timeout after 20 seconds
      timeoutTimer = setTimeout(() => {
        clearInterval(pollTimer);
        if (!verified) {
          setLoading(false);
          setTimedOut(true);
        }
      }, 20000);
    };

    startPolling();

    return () => {
      clearInterval(pollTimer);
      clearTimeout(timeoutTimer);
    };
  }, [verifyPayment, verified]);

  const handleViewLead = () => {
    if (leadId) {
      navigate(`/handwerker/projekt/${leadId}`);
    } else {
      navigate('/handwerker/dashboard');
    }
  };

  const handleReturnToDashboard = () => {
    navigate('/handwerker/dashboard');
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
              <p className="text-muted-foreground mb-4">
                Bitte warten Sie einen Moment (Versuch {attempts + 1}/{MAX_ATTEMPTS})
              </p>
              <p className="text-sm text-muted-foreground">
                Die Bestätigung kann bis zu 20 Sekunden dauern.
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
                  onClick={handleReturnToDashboard}
                  className="w-full"
                >
                  Zurück zum Dashboard
                </Button>
              </div>
            </>
          ) : timedOut ? (
            <>
              <AlertTriangle className="h-16 w-16 mx-auto mb-6 text-amber-500" />
              <h1 className="text-2xl font-bold mb-4">Zahlung wird verarbeitet</h1>
              <p className="text-muted-foreground mb-4">
                Ihre Zahlung wurde bei Stripe erfolgreich durchgeführt, aber die Bestätigung dauert noch.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Bitte schauen Sie in Ihrem Dashboard nach – der Lead sollte in Kürze verfügbar sein.
                Falls nicht, kontaktieren Sie bitte unseren Support.
              </p>
              <div className="space-y-3">
                <Button onClick={handleReturnToDashboard} className="w-full">
                  Zurück zum Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setLoading(true);
                    setAttempts(0);
                    setTimedOut(false);
                    verifyPayment();
                  }}
                  className="w-full"
                >
                  Erneut prüfen
                </Button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-4">Zahlung wird verarbeitet</h1>
              <p className="text-muted-foreground mb-6">
                Ihre Zahlung wird gerade verarbeitet. Dies kann einen Moment dauern.
              </p>
              <Button onClick={handleReturnToDashboard} variant="outline">
                Zurück zum Dashboard
              </Button>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
