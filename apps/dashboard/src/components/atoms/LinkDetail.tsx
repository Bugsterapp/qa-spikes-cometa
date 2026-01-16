import Link_To from '/public/assets/icons/ic_link_to.svg';
import { Tooltip } from 'src/components/atoms/Tooltip';
import { Skeleton as SkeletonText } from 'src/components/ui/Skeleton';
import { cn } from '/src/utils/cn';

const LinkDetail = ({
  text,
  href,
  message,
  loading,
  loaderWidth,
  className,
  target = '_blank',
}: {
  text: string;
  href: string;
  message?: string;
  loading?: boolean;
  loaderWidth?: number;
  className?: string;
  target?: '_self' | '_blank' | '_parent' | '_top';
}) => (
  <Tooltip message={message} disableClick={false}>
    <div>
      {loading ? (
        <SkeletonText loaderWidth={loaderWidth} />
      ) : (
        <a
          href={href}
          className={cn(
            'text-sm flex flex-row p-2 border rounded cursor-pointer border-blue-secondary hover:bg-info/8 gap-2 items-center',
            className
          )}
          target={target}
          rel="noopener noreferrer"
        >
          {text}
          <Link_To />
        </a>
      )}
    </div>
  </Tooltip>
);

export default LinkDetail;
