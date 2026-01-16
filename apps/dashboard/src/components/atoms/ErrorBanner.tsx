import IcOctagonAlert from 'public/assets/icons/ic_octagon_alert.svg';
import { cn } from '../../utils/cn';

type ErrorBannerProps = {
  message: string;
  className?: string;
};

export function ErrorBanner({ message, className }: ErrorBannerProps) {
  return (
    <div
      className={cn(
        'bg-[#ffefef] border border-[#fe9696] box-border flex gap-3 items-center px-4 py-3 rounded-lg',
        className
      )}
    >
      <div className="shrink-0 pt-[2px]">
        <IcOctagonAlert className="w-4 h-4" />
      </div>
      <div className="flex flex-col gap-1 grow items-start justify-center">
        <p className="font-lota text-sm text-[#8b3636] w-full">{message}</p>
      </div>
    </div>
  );
}
