const ConceptInfoSkeleton = () => (
  <div className="bg-gray-50 rounded-lg px-6 py-5 flex flex-col gap-y-4 animate-pulse">
    <div className="flex flex-col gap-4">
      <div className="h-2.5 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-0.5 bg-gray-200 rounded-full w-full" />
      <div className="flex flex-col gap-4 pl-1">
        <div className="h-2.5 bg-gray-200 rounded w-full" />
      </div>
    </div>
    <div className="flex flex-col gap-4 mt-4">
      <div className="h-2.5 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-0.5 bg-gray-200 rounded-full w-full" />
      <div className="flex flex-col gap-4 pl-1">
        <div className="h-2.5 bg-gray-200 rounded w-full" />
      </div>
    </div>
    <div className="mt-6">
      <div className="h-14 bg-gray-200 rounded-lg mb-2" />
      <div className="flex flex-col gap-2">
        <div className="h-10 bg-gray-200 rounded-lg mb-2" />
        <div className="h-10 bg-gray-200 rounded-lg mb-2" />
        <div className="h-10 bg-gray-200 rounded-lg mb-2" />
        <div className="h-10 bg-gray-200 rounded-lg" />
      </div>
    </div>
  </div>
);

export default ConceptInfoSkeleton;
