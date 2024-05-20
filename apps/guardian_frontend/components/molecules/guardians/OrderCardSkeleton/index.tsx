import Box from '~/components/atoms/common/Box';

export const OrderCardSkeleton = () => (
  <Box className="flex flex-col p-12 my-6 space-y-4 animate-pulse">
    <div className="w-2/3 h-4 rounded-full bg-slate-200" />
    <div className="w-2/4 h-3 rounded-full bg-slate-200" />
    <div className="w-1/3 h-4 rounded-full bg-slate-200" />
  </Box>
);

export const OrderListTitleSkeleton = () => <Box className="flex flex-col w-2/3 h-6 p-4 animate-pulse bg-slate-200" />;
export const OrderListInfoSkeleton = () => <Box className="flex flex-col w-full h-3 p-1 animate-pulse bg-slate-200" />;
