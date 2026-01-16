import { cn } from '/src/utils/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'default' | 'title' | 'text' | 'button' | 'circular' | 'card';
}

export const Skeleton = ({ className, variant = 'default', ...props }: SkeletonProps) => {
  const baseStyles =
    'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:400%_100%] animate-[pulse_2s_ease-in-out_infinite]';

  const variants = {
    default: 'rounded',
    title: 'rounded-lg h-8',
    text: 'rounded h-4',
    button: 'rounded-full h-10',
    circular: 'rounded-full',
    card: 'rounded-2xl',
  };

  return <div className={cn(baseStyles, variants[variant], className)} {...props} />;
};
