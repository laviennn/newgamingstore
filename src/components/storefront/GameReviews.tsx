"use client";

import React, { useMemo } from 'react';
import { Star } from 'lucide-react';
import { format } from 'date-fns';

function maskName(name: string) {
  if (!name) return "";
  if (name.length <= 2) return name[0] + "***";
  // Format like A****sh
  return name.charAt(0) + "****" + name.slice(-2);
}

export function GameReviews({ reviews }: { reviews: any[] }) {
  if (!reviews || reviews.length === 0) return null;

  const totalReviews = reviews.length;
  const averageRating = useMemo(() => {
    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / totalReviews).toFixed(1);
  }, [reviews, totalReviews]);

  const ratingCounts = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      if (counts[r.rating] !== undefined) {
        counts[r.rating]++;
      }
    });
    return counts;
  }, [reviews]);

  // Calculate percentage of 5 and 4 star reviews
  const satisfiedCount = ratingCounts[5] + ratingCounts[4];
  const satisfiedPercentage = totalReviews > 0 ? Math.round((satisfiedCount / totalReviews) * 100) : 100;

  return (
    <div className="bg-[#0f0f11] border border-border/20 rounded-xl p-5 md:p-6 shadow-xl backdrop-blur-md">
      {/* Header Summary */}
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="flex items-center justify-center gap-3">
          <Star className="w-8 h-8 md:w-10 md:h-10 text-[#FFC107] fill-[#FFC107]" />
          <div className="flex items-baseline text-white">
            <span className="text-4xl md:text-5xl font-bold">{averageRating}</span>
            <span className="text-lg md:text-xl text-white/60 ml-1">/ 5.0</span>
          </div>
        </div>
        <p className="font-bold text-white/90 text-[13px] md:text-sm mt-3 text-center">
          {satisfiedPercentage}% pembeli merasa puas dengan produk ini.
        </p>
        <p className="text-xs md:text-sm text-white/60 mt-1">
          Dari {totalReviews} Ulasan.
        </p>
      </div>

      {/* Progress Bars */}
      <div className="space-y-2 mb-8 max-w-sm mx-auto">
        {[5, 4, 3, 2, 1].map(star => {
          const count = ratingCounts[star];
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-3">
              <span className="text-white font-medium w-3">{star}</span>
              <Star className="w-4 h-4 text-[#FFC107] fill-[#FFC107]" />
              <div className="flex-1 h-3 bg-[#e0e0e0] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#FFC107] rounded-full" 
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-white font-medium w-6 text-right text-sm">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Review Prompt */}
      <div className="text-center mb-8 px-4">
        <p className="text-sm md:text-base text-white/60 leading-relaxed">
          Apakah kamu menyukai produk ini? Beri tahu kami dan calon pembeli lainnya tentang pengalamanmu.
        </p>
      </div>

      {/* Review List */}
      <div className="space-y-0">
        {reviews.map((review, idx) => (
          <div key={review.id} className="py-5 border-t border-white/10">
            <div className="flex justify-between items-start mb-1">
              <span className="font-bold text-white text-sm">
                {maskName(review.reviewer_name)}
              </span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star 
                    key={star} 
                    className={`w-3.5 h-3.5 md:w-4 md:h-4 ${star <= review.rating ? 'text-[#FFC107] fill-[#FFC107]' : 'text-white/20'}`} 
                  />
                ))}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-1">
              <p className="text-[11px] md:text-xs text-white/50 italic font-medium truncate pr-2">
                {review.products?.name || "Game Product"}
              </p>
              <p className="text-[11px] md:text-xs text-white/50 whitespace-nowrap shrink-0">
                {format(new Date(review.created_at), 'dd MMM yyyy')}
              </p>
            </div>
            
            <div className="flex">
              <div className="w-[3px] bg-[#FFC107] mr-3 rounded-full shrink-0"></div>
              <p className="text-sm text-white/80 font-medium italic">
                {review.comment || "Sangat puas"}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {reviews.length > 5 && (
        <div className="mt-4 pt-4 text-center border-t border-white/10">
          <button className="text-xs md:text-sm font-bold text-white/70 hover:text-white uppercase tracking-wider flex items-center justify-center w-full gap-2 transition-colors">
            Lihat Semua Ulasan <span className="text-lg">→</span>
          </button>
        </div>
      )}
    </div>
  );
}
