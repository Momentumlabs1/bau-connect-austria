import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from './StarRating';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ReviewFormProps {
  projectId: string;
  contractorId: string;
  reviewerType: 'CUSTOMER' | 'HANDWERKER';
  onSuccess?: () => void;
}

export const ReviewForm = ({ 
  projectId, 
  contractorId, 
  reviewerType,
  onSuccess 
}: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({
        title: 'Bewertung erforderlich',
        description: 'Bitte wähle eine Sternbewertung aus',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          lead_id: projectId,
          handwerker_id: contractorId,
          rating,
          comment: comment.trim() || null,
          reviewer_type: reviewerType
        });

      if (error) throw error;

      toast({
        title: 'Bewertung abgegeben',
        description: 'Deine Bewertung wurde erfolgreich gespeichert'
      });

      setRating(0);
      setComment('');
      onSuccess?.();
    } catch (error: any) {
      console.error('❌ Error submitting review:', error);
      toast({
        title: 'Fehler',
        description: error.message || 'Bewertung konnte nicht gespeichert werden',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Deine Bewertung *
        </label>
        <StarRating 
          rating={rating}
          interactive
          onRatingChange={setRating}
          size="lg"
        />
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-2">
          Kommentar (optional)
        </label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Teile deine Erfahrung..."
          rows={4}
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {comment.length}/1000 Zeichen
        </p>
      </div>

      <Button type="submit" disabled={loading || rating === 0}>
        {loading ? 'Wird gespeichert...' : 'Bewertung abgeben'}
      </Button>
    </form>
  );
};
