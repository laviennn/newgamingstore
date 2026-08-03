import React from "react";

export default function MemberLoading() {
  return (
    <div className="w-full space-y-6">
      {/* Header/Title Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="w-48 h-8 bg-white/5 animate-pulse rounded-lg" />
          <div className="w-32 h-4 bg-white/5 animate-pulse rounded" />
        </div>
        <div className="w-32 h-10 bg-white/10 animate-pulse rounded-full" />
      </div>

      {/* Stats/Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-[#121212] border border-white/5 p-6 rounded-2xl h-36 flex flex-col justify-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 animate-pulse" />
              <div className="space-y-2">
                <div className="w-24 h-4 bg-white/5 animate-pulse rounded" />
                <div className="w-32 h-6 bg-white/10 animate-pulse rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table/List Skeleton */}
      <div className="bg-[#121212] border border-white/5 p-6 rounded-2xl space-y-6">
        <div className="w-48 h-6 bg-white/5 animate-pulse rounded" />
        
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="space-y-2">
                <div className="w-32 h-4 bg-white/10 animate-pulse rounded" />
                <div className="w-24 h-3 bg-white/5 animate-pulse rounded" />
              </div>
              <div className="w-20 h-6 bg-white/10 animate-pulse rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
