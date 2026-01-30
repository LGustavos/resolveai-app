import { Skeleton } from "@/components/ui/skeleton";

export default function ProviderLoading() {
  return (
    <div className="space-y-5">
      {/* Banner + avatar */}
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="flex items-end gap-4 -mt-10 px-4">
        <Skeleton className="h-20 w-20 rounded-xl border-4 border-white" />
        <div className="flex-1 space-y-2 pb-1">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>

      {/* Info */}
      <div className="space-y-3 px-1">
        <Skeleton className="h-5 w-24 rounded-md" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>

      {/* Portfolio skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-24" />
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>

      {/* Reviews skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-24" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-white p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
