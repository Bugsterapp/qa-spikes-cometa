import IcClose from '/public/assets/icons/ic_close.svg';
import CIconButton from '/src/components/atoms/CIconButton';
import { cn } from '/src/utils/cn';

type SidebarHeaderProps = {
  onClose?: () => void;
  title: string;
  disabled?: boolean;
  subtitle?: string;
  subClassName?: string;
  boxClassName?: string;
};

export default function SidebarHeader({
  onClose,
  disabled = false,
  title,
  subtitle,
  subClassName,
  boxClassName,
}: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        'py-[22px] flex flex-row justify-between items-center sticky top-0 bg-white z-[9999] px-[36px]',
        boxClassName
      )}
    >
      <div className="flex items-center">
        <h2 className="font-semibold text-[22px] mr-2 text-[#212B36]">{title}</h2>
        {subtitle && (
          <label
            className={cn('text-[#919EAB] text-base font-medium pl-2 border-l border-l-[#919EAB3D]', subClassName)}
          >
            {subtitle}
          </label>
        )}
      </div>
      <CIconButton aria-label="close" onClick={onClose} disabled={disabled}>
        <IcClose fill="#637381" />
      </CIconButton>
    </div>
  );
}
