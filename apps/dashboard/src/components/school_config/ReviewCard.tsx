import { ReactNode, useState } from 'react';
import { OnboardingStatus } from '@cometa/trpc/src/bot/types';
import { Tooltip } from '../atoms/Tooltip';
import IcChevronRight from 'public/assets/icons/ic_chevron_right.svg';
import IcInfoWarning from 'public/assets/icons/ic_info_warning.svg';
import { Chip } from '@cometa/recreo';

const statusConfig = {
  [OnboardingStatus.Declined]: {
    variant: 'warning' as const,
    text: 'Requiere correcciones',
    showIcon: true,
  },
  [OnboardingStatus.Approved]: {
    variant: 'success' as const,
    text: 'Aprobada',
    showIcon: false,
  },
  [OnboardingStatus.Pending]: {
    variant: 'blue' as const,
    text: 'En revisión',
    showIcon: false,
  },
  archived: {
    variant: 'default' as const,
    text: 'Desactivada',
    showIcon: false,
  },
};

type ReviewCardProps<T = unknown> = {
  entity: T;
  title: string;
  subtitle: string;
  status: OnboardingStatus | 'archived';
  icon?: ReactNode;
  onView?: (entity: T) => void;
  onEdit?: (entity: T) => void;
  getStatusTooltip?: (status: OnboardingStatus | 'archived') => string;
  hideStatusChip?: boolean;
  children?: ReactNode;
};

export function ReviewCard<T>({
  entity,
  title,
  subtitle,
  status,
  icon,
  onView,
  onEdit,
  getStatusTooltip = defaultGetStatusTooltip,
  hideStatusChip = false,
  children,
}: Readonly<ReviewCardProps<T>>) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (status === OnboardingStatus.Declined) {
      onEdit?.(entity);
    } else {
      onView?.(entity);
    }
  };

  const renderStatusChip = () => {
    const config = statusConfig[status];

    return (
      <Tooltip message={getStatusTooltip(status)}>
        <Chip
          variant={config.variant}
          className={config.showIcon ? 'flex justify-center items-center gap-1 py-0.5 px-2' : ''}
        >
          {config.text}
          {config.showIcon && <IcInfoWarning className="flex-shrink-0 w-3 h-3 aspect-square" />}
        </Chip>
      </Tooltip>
    );
  };

  return (
    <button
      type="button"
      className={`bg-[#f8f9fb] relative rounded-[12px] shrink-0 w-full cursor-pointer transition-colors duration-200 border-0 p-0 m-0 text-left ${
        isHovered ? 'bg-accent' : ''
      }`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      <div className="box-border content-stretch flex flex-col items-start justify-center overflow-clip p-[16px] relative w-full gap-2">
        <div className="content-stretch flex gap-3 items-center justify-start relative shrink-0 w-full min-w-0">
          {icon && <div className="flex-shrink-0">{icon}</div>}

          <div className="flex flex-col gap-1 grow min-h-0 min-w-0">
            <div className="self-stretch flex items-center gap-2 leading-none">
              <div className="min-h-0 font-semibold font-lota tracking-[-0.4px] overflow-ellipsis overflow-hidden whitespace-nowrap text-base text-[#22283a]">
                {title}
              </div>
              {!hideStatusChip && <div className="shrink-0">{renderStatusChip()}</div>}
            </div>
            <div className="font-lota font-normal text-sm leading-5 text-[#697086] overflow-ellipsis overflow-hidden whitespace-nowrap w-full">
              {subtitle}
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0)] box-border content-stretch flex gap-2 items-center justify-center px-4 py-2 relative rounded-[9999px] shrink-0 size-9">
            <div className="overflow-clip relative shrink-0 size-4">
              <IcChevronRight
                width="16"
                height="16"
                className={`text-[#22283a] transition-transform duration-200 ${isHovered ? 'translate-x-1' : ''}`}
              />
            </div>
          </div>
        </div>
        {children}
      </div>

      <div
        aria-hidden="true"
        className="absolute border border-[#d0d8e9] border-solid inset-0 pointer-events-none rounded-[12px]"
      />
    </button>
  );
}

const defaultGetStatusTooltip = (status: OnboardingStatus | 'archived'): string => {
  switch (status) {
    case OnboardingStatus.Pending:
      return 'Nuestro equipo está revisando este elemento para asegurarse de que todo esté en orden.';
    case OnboardingStatus.Approved:
      return 'Este elemento ha sido validado y está listo para usar.';
    case OnboardingStatus.Declined:
      return 'Este elemento ha sido rechazado. Contacta a soporte para más información.';
    case 'archived':
      return 'Este elemento ha sido desactivado temporalmente.';
    default:
      return 'Nuestro equipo está revisando este elemento para asegurarse de que todo esté en orden.';
  }
};
