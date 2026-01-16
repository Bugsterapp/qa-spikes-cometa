import { cn } from '@cometa/utils';

import { Button } from '@cometa/recreo';
import { Button as ButtonV2 } from '@cometa/recreo/v2';
import type { FC } from 'react';
import { BANNER_HEIGHT } from '../constants/ui';

interface BannerProps {
  message: React.ReactNode;
  isVisible?: boolean;
  variant?: keyof typeof bannerVariants;
  icon?: React.ReactNode;
  onClose?: () => void;
}

const bannerVariants = {
  danger: 'bg-red-500 text-white text-center',
  normal: 'bg-blue-500 text-white text-center',
  primary: 'bg-green-500 text-white text-center',
  outline: 'bg-white text-[#1c1c1d] border border-[#1c1c1d]',
};

const Banner: FC<BannerProps> = ({ message, isVisible = false, variant = 'primary', icon, onClose }) => (
  <div
    className={cn('fixed top-0 left-0 right-0 z-30 w-full', {
      hidden: !isVisible,
      block: isVisible,
    })}
    style={{ height: BANNER_HEIGHT }}
  >
    <Button className="w-full p-0 h-full" onClick={onClose}>
      <div className={cn('text-center flex items-center justify-between w-full h-full px-4', bannerVariants[variant])}>
        <div className="flex items-center ml-5">
          {icon && <div className="mr-4 text-sm">{icon}</div>}
          <span className="text-sm">{message}</span>
        </div>
      </div>
    </Button>
  </div>
);

interface NotificationBannerProps {
  message: React.ReactNode;
  isVisible?: boolean;
  variant: 'default' | 'warning' | 'danger';
  icon?: React.ReactNode;
  showActionButton?: boolean;
  actionButtonText?: string;
  onActionClick?: () => void;
}

const notificationBannerVariants = {
  default: 'bg-[#7b35e8] text-white text-sm leading-5',
  warning: 'bg-[#fff9e6] text-[#8c6a04] text-sm leading-5',
  danger: 'bg-[#ffefef] text-[#8b3636] text-sm leading-5',
};

export const NotificationBanner: FC<NotificationBannerProps> = ({
  message,
  isVisible = false,
  variant,
  icon,
  showActionButton = false,
  actionButtonText,
  onActionClick,
}) => (
  <div
    className={cn('fixed top-0 left-0 right-0 z-30 w-full', {
      hidden: !isVisible,
      block: isVisible,
    })}
    style={{ height: BANNER_HEIGHT }}
  >
    <div
      className={cn('flex items-center justify-between w-full h-full', notificationBannerVariants[variant], {
        'px-[30px] py-[5px]': variant === 'default',
        'px-[24px] py-[8px]': variant === 'warning' || variant === 'danger',
      })}
    >
      <div
        className={cn('flex items-center', {
          'gap-2': variant === 'default',
          'gap-[8px]': variant === 'warning' || variant === 'danger',
        })}
      >
        {icon && <div className="shrink-0">{icon}</div>}
        <div
          className={cn('font-lota', {
            'text-white font-semibold text-sm leading-5': variant === 'default',
            'text-[#8c6a04] text-[14px] leading-[20px] font-semibold': variant === 'warning',
            'text-[#8b3636] text-[14px] leading-[20px] font-semibold': variant === 'danger',
          })}
        >
          {message}
        </div>
      </div>
      {showActionButton && (
        <ButtonV2
          variant={variant === 'warning' || variant === 'danger' ? 'outline' : 'ghost'}
          size="sm"
          className={cn({
            'text-white px-4 py-2 h-9 font-semibold text-sm hover:bg-transparent': variant === 'default',
            'border-[#8c6a04] text-[#8c6a04] bg-[#fff9e6] h-[24px] px-[12px] py-[8px] rounded-full text-[12px] leading-[16px] font-[550] hover:bg-[#ffecb2] hover:text-[#8c6a04]':
              variant === 'warning',
            'border-[#8b3636] text-[#8b3636] bg-[#ffefef] h-[24px] px-[12px] py-[8px] rounded-full text-[12px] leading-[16px] font-[550] hover:bg-[#ffd9d9] hover:text-[#8b3636]':
              variant === 'danger',
          })}
          onClick={onActionClick}
        >
          {actionButtonText || (variant === 'default' ? 'Ir a configuración inicial' : 'Actualizar ahora')}
          {variant === 'default' && (
            <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </ButtonV2>
      )}
    </div>
  </div>
);

export default Banner;
