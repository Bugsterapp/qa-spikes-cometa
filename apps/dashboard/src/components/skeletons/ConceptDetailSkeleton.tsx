import { Skeleton } from '../atoms/Skeleton';

const GeneralDataSkeleton = () => (
  <div className="bg-white rounded-2xl p-8">
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" className="w-48 h-7" />
          <Skeleton variant="button" className="w-28 h-7" />
        </div>
        <div className="h-[1px] bg-[#91A0AB] bg-opacity-25" />
      </div>
      <div className="grid gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <div key={item} className="flex items-start">
            <Skeleton variant="text" className="w-[25%] mr-3 h-5" />
            <div className="flex-1">
              {item === 4 ? (
                <div className="flex flex-wrap gap-2">
                  <Skeleton variant="button" className="w-32 h-7 rounded-full" />
                  <Skeleton variant="button" className="w-32 h-7 rounded-full" />
                  <Skeleton variant="button" className="w-32 h-7 rounded-full" />
                </div>
              ) : (
                <Skeleton variant="text" className="w-[80%] h-5" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AutoAssignmentSkeleton = () => (
  <div className="px-8 py-6 space-y-4 bg-white rounded-2xl">
    <div className="inline-flex items-center justify-start w-full pb-2 border-b-2 gap-x-4">
      <Skeleton variant="text" className="w-40 h-4" />
      <Skeleton variant="button" className="w-24 h-7" />
    </div>
    <div className="border-2 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" className="w-6 h-6" />
        <Skeleton variant="text" className="w-[90%] h-5" />
      </div>
    </div>
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div key={item} className="p-4 border-2 rounded-lg">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton variant="text" className="w-48 h-6" />
              <Skeleton variant="circular" className="w-6 h-6" />
            </div>
            <div className="flex flex-wrap gap-2">
              {Array(4)
                .fill(0)
                .map((_, chip) => (
                  <Skeleton key={chip} variant="button" className="w-28 h-7 rounded-full" />
                ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const BillingInformationSkeleton = () => (
  <div className="space-y-2.5 rounded-2xl p-6 bg-white">
    <div className="border-b-2 pb-2 mb-6">
      <Skeleton variant="text" className="w-48 h-4" />
    </div>
    <div className="space-y-8">
      {[1, 2].map((section) => (
        <div key={section} className="space-y-4">
          <div className="p-4 border-2 rounded-lg">
            <div className="space-y-3">
              <Skeleton variant="text" className="w-full h-5" />
              <div className="flex flex-col gap-2">
                <Skeleton variant="text" className="w-48 h-5 font-semibold" />
                <Skeleton variant="text" className="w-36 h-4" />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Skeleton
                  key={i}
                  variant="button"
                  className="h-[30px] px-[12px] rounded-[50px]"
                  style={{ width: [120, 100, 140][i % 3] }}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const OrdersSkeleton = () => (
  <div className="space-y-2.5 rounded-2xl p-6 bg-white h-full">
    <div className="border-b-2 pb-2 mb-6">
      <Skeleton variant="text" className="w-32 h-4" />
    </div>
    <div className="space-y-4">
      {[1, 2, 3, 4, 5, 6, 7].map((order) => (
        <div key={order} className="p-4 border-2 rounded-lg space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton variant="text" className="w-48 h-5" />
              <Skeleton variant="text" className="w-36 h-4 text-[#637381]" />
            </div>
            <Skeleton variant="title" className="w-32 h-6 text-[#00AB55]" />
          </div>
          <div className="flex flex-wrap gap-2">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Skeleton
                  key={i}
                  variant="button"
                  className="h-[30px] px-[12px] rounded-[50px]"
                  style={{ width: [100, 120, 90][i % 3] }}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const ConceptDetailSkeleton = () => (
  <div className="min-h-screen font-lota">
    <div className="h-[60px] bg-white flex items-center px-10">
      <span className="flex gap-2 items-center">
        <Skeleton variant="circular" className="w-5 h-5" />
        <Skeleton variant="text" className="w-24 h-5" />
      </span>
    </div>

    <div className="sticky top-0 z-20 flex flex-col bg-white">
      <div className="flex justify-between items-center max-h-[72px] px-10">
        <Skeleton variant="title" className="py-5 pl-10 text-2xl w-[550px] h-8" />
        <div className="flex gap-3 py-4">
          <Skeleton variant="button" className="h-10 w-44 rounded-full" />
          <Skeleton variant="circular" className="w-10 h-10" />
        </div>
      </div>

      <div className="border-b-2 border-[#919EAB3D]/24">
        <div className="flex gap-10 py-2.5 px-10">
          {['Información general', 'Órdenes', 'Estudiantes asignados'].map((tab) => (
            <Skeleton key={tab} variant="button" className="w-40 h-6" />
          ))}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-5 gap-6 px-10 py-8">
      <div className="col-span-3 space-y-8">
        <GeneralDataSkeleton />
        <AutoAssignmentSkeleton />
        <BillingInformationSkeleton />
      </div>
      <div className="col-span-2">
        <OrdersSkeleton />
      </div>
    </div>
  </div>
);
