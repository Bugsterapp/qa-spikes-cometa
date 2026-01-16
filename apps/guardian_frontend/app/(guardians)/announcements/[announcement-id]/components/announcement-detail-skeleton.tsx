export default function AnnouncementDetailSkeleton() {
  return (
    <div className="bg-white flex flex-col items-start justify-start pb-4 pt-0 px-0 relative min-h-screen">
      {/* Header Skeleton */}
      <div className="bg-[#F4F6F8] relative w-full">
        <div className="flex flex-col items-start justify-start p-4 relative w-full">
          <div className="flex items-center gap-3 w-full mb-4">
            <div className="w-6 h-6 bg-[#D0D8E9] rounded animate-pulse" />
            <div className="w-32 h-6 bg-[#D0D8E9] rounded animate-pulse" />
          </div>
          <div className="w-full h-32 bg-[#D0D8E9] rounded-lg animate-pulse mb-4" />
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 bg-[#D0D8E9] rounded-full animate-pulse" />
            <div className="flex flex-col gap-2">
              <div className="w-24 h-4 bg-[#D0D8E9] rounded animate-pulse" />
              <div className="w-32 h-3 bg-[#D0D8E9] rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="relative w-full">
        <div className="flex flex-col overflow-clip relative w-full p-4">
          <div className="flex flex-col gap-4 items-start justify-start p-0 relative w-full mb-8">
            {/* Alert Skeleton */}
            <div className="w-full h-12 bg-[#D0D8E9] rounded-lg animate-pulse" />

            {/* Article Content Skeleton */}
            <div className="flex flex-col items-start justify-start p-0 relative w-full gap-3">
              <div className="w-full h-4 bg-[#D0D8E9] rounded animate-pulse" />
              <div className="w-5/6 h-4 bg-[#D0D8E9] rounded animate-pulse" />
              <div className="w-4/5 h-4 bg-[#D0D8E9] rounded animate-pulse" />
              <div className="w-full h-4 bg-[#D0D8E9] rounded animate-pulse" />
              <div className="w-3/4 h-4 bg-[#D0D8E9] rounded animate-pulse" />
              <div className="w-5/6 h-4 bg-[#D0D8E9] rounded animate-pulse" />
              <div className="w-2/3 h-4 bg-[#D0D8E9] rounded animate-pulse" />
            </div>

            {/* Form Skeleton */}
            <div className="w-full mt-6">
              <div className="flex flex-col gap-4 w-full">
                <div className="w-48 h-5 bg-[#D0D8E9] rounded animate-pulse" />
                <div className="w-full h-12 bg-[#D0D8E9] rounded-lg animate-pulse" />
                <div className="w-32 h-5 bg-[#D0D8E9] rounded animate-pulse" />
                <div className="w-full h-32 bg-[#D0D8E9] rounded-lg animate-pulse" />
                <div className="w-24 h-10 bg-[#D0D8E9] rounded-lg animate-pulse" />
              </div>
            </div>
          </div>

          {/* Images Grid Skeleton */}
          <div className="w-full grid grid-cols-3 gap-[2px] mb-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="h-28 bg-[#D0D8E9] animate-pulse" />
            ))}
          </div>

          {/* Files List Skeleton */}
          <div className="flex flex-col w-full gap-2 mt-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center gap-3 w-full bg-[#F7F9FC] px-3 py-5 rounded-lg">
                <div className="w-8 h-8 bg-[#D0D8E9] rounded animate-pulse" />
                <div className="flex flex-col gap-2">
                  <div className="w-32 h-4 bg-[#D0D8E9] rounded animate-pulse" />
                  <div className="w-16 h-3 bg-[#D0D8E9] rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
