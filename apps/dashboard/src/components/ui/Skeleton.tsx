import { cn } from '/src/utils/cn';

export const Skeleton = ({ loaderWidth, className }: { loaderWidth?: number; className?: string }) => (
  <div role="status" className="max-w-sm animate-pulse">
    <div
      className={cn(
        `h-2.5 bg-gray-200 rounded-full dark:bg-gray-400 w-48`,
        { 'w-[var(--loader-width)]': loaderWidth },
        className
      )}
      style={{ '--loader-width': `${loaderWidth}px` } as React.CSSProperties}
    />
  </div>
);
