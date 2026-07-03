import { Star } from 'lucide-react';
import React from 'react';

interface RatingProps {
  rating: number; // 0 to 5
  onChange?: (rating: number) => void;
  readOnly?: boolean;
}

export function Rating({ rating, onChange, readOnly = false }: RatingProps) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    if (readOnly || !onChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    // If click is on the left half of the star, it's a half star
    const isHalf = x < rect.width / 2;
    onChange(index + (isHalf ? 0.5 : 1));
  };

  return (
    <div className="flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((index) => {
        const fillAmount = Math.max(0, Math.min(1, rating - index));
        return (
          <div
            key={index}
            className={`relative ${readOnly ? 'cursor-default' : 'cursor-pointer'} w-5 h-5`}
            onClick={(e) => handleClick(e, index)}
          >
            {/* Background Star */}
            <Star className="absolute top-0 left-0 w-4 h-4 text-zinc-200" strokeWidth={2} />
            {/* Filled Star (masked for half) */}
            <div 
              className="absolute top-0 left-0 overflow-hidden" 
              style={{ width: `${fillAmount * 100}%` }}
            >
              <Star className="w-4 h-4 text-zinc-800 fill-zinc-800" strokeWidth={2} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
