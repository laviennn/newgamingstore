import React from "react";

export default function StorefrontLoading() {
  return (
    <div className="w-full min-h-screen bg-[#070707] pb-24">
      {/* Skeleton Hero Slider */}
      <div className="w-full max-w-6xl mx-auto px-4 mt-6">
        <div className="w-full aspect-[16/9] sm:aspect-[21/9] lg:aspect-[3/1] bg-white/5 animate-pulse rounded-2xl" />
      </div>

      {/* Skeleton Category Banner */}
      <div className="w-full max-w-6xl mx-auto px-4 mt-8">
        <div className="w-full h-16 bg-white/5 animate-pulse rounded-2xl" />
      </div>

      {/* Skeleton Grid (Games/Flash Sale) */}
      <div className="w-full max-w-6xl mx-auto px-4 mt-12">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
          <div className="w-48 h-8 rounded-lg bg-white/10 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="w-full aspect-[3/4] rounded-2xl bg-white/5 animate-pulse" />
              <div className="w-3/4 h-4 bg-white/10 animate-pulse rounded" />
              <div className="w-1/2 h-3 bg-white/5 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
