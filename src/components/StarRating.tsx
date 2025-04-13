
import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type StarRatingProps = {
  rating: number;
  onChange?: (rating: 1 | 2 | 3 | 4 | 5) => void;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
};

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  onChange, 
  size = 'md',
  readOnly = false 
}) => {
  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const containerSizes = {
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: 'gap-2'
  };

  return (
    <div className={cn('flex items-center', containerSizes[size])}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            starSizes[size],
            'transition-colors',
            rating >= star 
              ? 'fill-designer-badge text-designer-badge' 
              : 'fill-transparent text-designer-text-secondary',
            !readOnly && 'cursor-pointer hover:text-designer-badge'
          )}
          onClick={() => {
            if (!readOnly && onChange) {
              onChange(star as 1 | 2 | 3 | 4 | 5);
            }
          }}
        />
      ))}
    </div>
  );
};

export default StarRating;
