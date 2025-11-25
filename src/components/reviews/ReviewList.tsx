import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ReviewCard } from './ReviewCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { StarRating } from './StarRating';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_type: string;
}

interface ReviewListProps {
  contractorId: string;
}

export const ReviewList = ({ contractorId }: ReviewListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    loadReviews();
  }, [contractorId]);

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('handwerker_id', contractorId)
        .eq('reviewer_type', 'CUSTOMER')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReviews(data || []);
      
      // Calculate average
      if (data && data.length > 0) {
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
        setAverageRating(Math.round(avg * 10) / 10);
      }
    } catch (error) {
      console.error('❌ Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Noch keine Bewertungen vorhanden
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 pb-4 border-b">
        <div>
          <p className="text-3xl font-bold">{averageRating}</p>
          <StarRating rating={Math.round(averageRating)} size="sm" />
        </div>
        <div className="text-sm text-muted-foreground">
          {reviews.length} {reviews.length === 1 ? 'Bewertung' : 'Bewertungen'}
        </div>
      </div>

      <div className="space-y-3">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            rating={review.rating}
            comment={review.comment}
            createdAt={review.created_at}
            reviewerType={review.reviewer_type as 'CUSTOMER' | 'HANDWERKER'}
          />
        ))}
      </div>
    </div>
  );
};
