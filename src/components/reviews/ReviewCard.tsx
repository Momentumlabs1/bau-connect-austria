import { StarRating } from './StarRating';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { User } from 'lucide-react';

interface ReviewCardProps {
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewerType: 'CUSTOMER' | 'HANDWERKER';
}

export const ReviewCard = ({ rating, comment, createdAt, reviewerType }: ReviewCardProps) => {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-sm">
              {reviewerType === 'CUSTOMER' ? 'Kunde' : 'Handwerker'}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(createdAt), { 
                addSuffix: true,
                locale: de 
              })}
            </p>
          </div>
        </div>
        <StarRating rating={rating} size="sm" />
      </div>
      
      {comment && (
        <p className="text-sm text-foreground">{comment}</p>
      )}
    </div>
  );
};
