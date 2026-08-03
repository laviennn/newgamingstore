import React from "react";

export default function AdminLoading() {
  return (
    <div className="w-full space-y-6">
      {/* Header/Title Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-2">
          <div className="w-64 h-8 bg-muted animate-pulse rounded-lg" />
          <div className="w-48 h-4 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex items-center gap-3">
           <div className="w-24 h-10 bg-muted animate-pulse rounded-md" />
           <div className="w-32 h-10 bg-muted animate-pulse rounded-md" />
        </div>
      </div>

      {/* Stats/Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border bg-card text-card-foreground p-6 rounded-xl shadow-sm h-32 flex flex-col justify-center gap-4">
            <div className="flex items-center justify-between">
              <div className="w-24 h-4 bg-muted animate-pulse rounded" />
              <div className="w-4 h-4 rounded bg-muted animate-pulse" />
            </div>
            <div className="w-32 h-8 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="border bg-card rounded-xl shadow-sm p-6 space-y-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="w-48 h-6 bg-muted animate-pulse rounded" />
          <div className="w-32 h-8 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="space-y-4">
          <div className="h-10 bg-muted/50 animate-pulse rounded-md w-full" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between border-b pb-4">
               <div className="flex gap-4 w-full">
                  <div className="w-1/4 h-5 bg-muted animate-pulse rounded" />
                  <div className="w-1/4 h-5 bg-muted animate-pulse rounded" />
                  <div className="w-1/4 h-5 bg-muted animate-pulse rounded" />
                  <div className="w-1/4 h-5 bg-muted animate-pulse rounded" />
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
