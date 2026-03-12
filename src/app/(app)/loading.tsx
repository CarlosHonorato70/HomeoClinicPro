export default function Loading() {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-[#1a1a24]" />
        <div className="h-4 w-72 animate-pulse rounded-lg bg-[#1a1a24]" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-800 bg-[#111118] p-6 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 animate-pulse rounded bg-[#1a1a24]" />
              <div className="h-8 w-8 animate-pulse rounded-lg bg-[#1a1a24]" />
            </div>
            <div className="h-8 w-20 animate-pulse rounded bg-[#1a1a24]" />
            <div className="h-3 w-32 animate-pulse rounded bg-[#1a1a24]" />
          </div>
        ))}
      </div>

      {/* Activity card skeleton */}
      <div className="rounded-xl border border-gray-800 bg-[#111118] p-6 space-y-4">
        <div className="h-5 w-36 animate-pulse rounded bg-[#1a1a24]" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-[#1a1a24]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-[#1a1a24]" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-[#1a1a24]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
