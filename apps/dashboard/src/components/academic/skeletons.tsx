export function ConfigurationSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6 pb-12 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
        <div className="h-10 w-20 bg-gray-200 rounded" />
      </div>

      <div className="space-y-2">
        <div className="h-6 w-48 bg-gray-200 rounded" />
        <div className="h-12 w-96 bg-gray-200 rounded" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-slate-100 rounded-lg overflow-hidden bg-white">
            <div className="p-4 bg-slate-100">
              <div className="h-5 w-32 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>

      <div className="h-px bg-gray-200" />

      <div className="space-y-4">
        <div className="h-6 w-32 bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="space-y-4">
          <div className="h-16 w-full bg-gray-100 rounded" />
          <div className="h-16 w-full bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}
