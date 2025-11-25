import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OfferCard } from './OfferCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { toast } from '@/hooks/use-toast';

interface Offer {
  id: string;
  amount: number;
  message: string | null;
  status: string;
  created_at: string;
  valid_until: string;
  contractor_id: string;
  contractors?: {
    company_name: string;
  };
}

interface OfferListProps {
  projectId: string;
  showActions?: boolean;
  onOfferUpdate?: () => void;
}

export const OfferList = ({ projectId, showActions = false, onOfferUpdate }: OfferListProps) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOffers();
  }, [projectId]);

  const loadOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select(`
          *,
          contractors (
            company_name
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOffers(data || []);
    } catch (error) {
      console.error('❌ Error loading offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (offerId: string) => {
    try {
      const { error } = await supabase.functions.invoke('respond-to-offer', {
        body: { offerId, action: 'accept' }
      });

      if (error) throw error;

      toast({
        title: 'Angebot akzeptiert',
        description: 'Das Projekt wurde dem Handwerker zugewiesen'
      });

      loadOffers();
      onOfferUpdate?.();
    } catch (error: any) {
      console.error('❌ Error accepting offer:', error);
      toast({
        title: 'Fehler',
        description: error.message || 'Angebot konnte nicht akzeptiert werden',
        variant: 'destructive'
      });
    }
  };

  const handleReject = async (offerId: string) => {
    try {
      const { error } = await supabase.functions.invoke('respond-to-offer', {
        body: { offerId, action: 'reject' }
      });

      if (error) throw error;

      toast({
        title: 'Angebot abgelehnt',
        description: 'Das Angebot wurde abgelehnt'
      });

      loadOffers();
      onOfferUpdate?.();
    } catch (error: any) {
      console.error('❌ Error rejecting offer:', error);
      toast({
        title: 'Fehler',
        description: error.message || 'Angebot konnte nicht abgelehnt werden',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Noch keine Angebote vorhanden
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {offers.map((offer) => (
        <OfferCard
          key={offer.id}
          id={offer.id}
          amount={offer.amount}
          message={offer.message}
          status={offer.status}
          createdAt={offer.created_at}
          validUntil={offer.valid_until}
          contractorName={offer.contractors?.company_name}
          showActions={showActions}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      ))}
    </div>
  );
};
