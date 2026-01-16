import { Chip } from '@cometa/recreo';
import { StatusBadge, type StatusBadgeVariant } from './StatusBadge';
import { cn } from '../../utils/cn';
import ChevronRightIcon from '../../../public/assets/icons/ic_chevron_right.svg';

type OnboardingTaskItemProps = {
  title: string;
  description: string;
  statusBadge: StatusBadgeVariant;
  chipVariant?: 'warning' | 'success' | 'blue' | 'error';
  chipText?: string;
  onClick?: () => void;
  showChevron?: boolean;
  className?: string;
  isLast?: boolean;
};

export function OnboardingTaskItem({
  title,
  description,
  statusBadge,
  chipVariant,
  chipText,
  onClick,
  showChevron = true,
  className,
  isLast = false,
}: Readonly<OnboardingTaskItemProps>) {
  const isClickable = !!onClick;

  const content = (
    <>
      <div className="flex gap-6 items-start flex-1">
        <div className="flex flex-col gap-2.5 flex-1">
          <div className="flex gap-5 items-center">
            <StatusBadge variant={statusBadge} />
            <div className="flex items-center gap-2.5">
              <span className="font-semibold text-[16px] leading-6 text-[#22283a]">{title}</span>
              {chipVariant && chipText && <Chip variant={chipVariant}>{chipText}</Chip>}
            </div>
          </div>
          <div className="pl-10">
            <span className="text-[14px] leading-[20px] text-[#697086]">{description}</span>
          </div>
        </div>
      </div>
      {showChevron && (
        <div className="w-9 h-9 bg-transparent rounded-full flex items-center justify-center flex-shrink-0">
          <ChevronRightIcon className="w-4 h-4 text-[#697086]" />
        </div>
      )}
    </>
  );

  const baseClasses = cn(
    'flex items-center justify-between px-6 py-4 bg-white',
    !isLast && 'border-b border-[#d0d8e9]',
    className
  );

  if (isClickable) {
    return (
      <button
        type="button"
        className={cn(baseClasses, 'transition-colors duration-200 hover:bg-[#f8f9fb] cursor-pointer w-full text-left')}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return <div className={baseClasses}>{content}</div>;
}
