import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export const StarRating = ({ 
  rating, 
  maxRating = 5, 
  size = 'md',
  interactive = false,
  onRatingChange 
}: StarRatingProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleClick = (index: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  return (
    <div className="flex gap-1">
      {Array.from({ length: maxRating }).map((_, index) => {
        const filled = index < rating;
        return (
          <Star
            key={index}
            className={cn(
              sizeClasses[size],
              filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300',
              interactive && 'cursor-pointer hover:scale-110 transition-transform'
            )}
            onClick={() => handleClick(index)}
          />
        );
      })}
    </div>
  );
};
