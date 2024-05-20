import { cn } from '/src/utils/cn';

interface SkeletonProps {
  className?: string;
}

const Skeleton = ({ className }: SkeletonProps) => (
  <div
    className={cn(
      'bg-gradient-to-r from-[#DFDFDF3D] to-[#AFAFAF52] h-[14px] w-full transition-colors rounded-lg animate-pulse',
      className
    )}
  />
);

export default Skeleton;
