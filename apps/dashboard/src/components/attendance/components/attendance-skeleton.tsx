export function AttendanceRowSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-200 rounded w-32" />
        </div>

        <div className="flex items-center gap-3">
          <div className="h-6 bg-gray-200 rounded-lg w-16" />

          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-12" />

          <div className="w-[120px] h-2 bg-gray-200 rounded-full" />

          <div className="flex items-center gap-1 min-w-[60px]">
            <div className="h-4 w-4 bg-gray-200 rounded-full" />
            <div className="h-4 bg-gray-200 rounded w-10" />
          </div>

          <div className="h-5 w-5 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export function AttendanceGroupSkeleton({ rowCount = 2 }: { rowCount?: number }) {
  return (
    <div className="flex flex-col pb-6 bg-[#F8F9FB] border rounded-xl p-8 gap-4">
      <div className="flex items-center gap-1 animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-20" />
        <div className="h-5 w-5 bg-gray-300 rounded-full border border-[#D0D8E9]" />
      </div>

      <div className="flex flex-col gap-4">
        {Array.from({ length: rowCount }).map((_, index) => (
          <AttendanceRowSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export function AttendanceListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <AttendanceGroupSkeleton rowCount={2} />
      <AttendanceGroupSkeleton rowCount={3} />
    </div>
  );
}
