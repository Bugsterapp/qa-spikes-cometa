import IcStatusCompleted from '../../../public/assets/icons/ic_status_completed.svg';
import IcStatusError from '../../../public/assets/icons/ic_status_error.svg';
import IcStatusInReview from '../../../public/assets/icons/ic_status_in_review.svg';
import IcStatusPending from '../../../public/assets/icons/ic_status_pending.svg';
import { ONBOARDING_TASK_STATUS } from '../../constants/onboardingSegments';
import { cn } from '../../utils/cn';

export type StatusBadgeVariant = 'completed' | 'in-review' | 'pending' | 'error';

type StatusBadgeProps = {
  variant: StatusBadgeVariant;
  className?: string;
};

export function StatusBadge({ variant, className }: Readonly<StatusBadgeProps>) {
  const badgeConfig = {
    completed: {
      bgColor: 'bg-[#28C441]',
      icon: <IcStatusCompleted className="w-3 h-3" />,
    },
    'in-review': {
      bgColor: 'bg-[#E8B006]',
      icon: <IcStatusInReview className="w-3 h-3" />,
    },
    pending: {
      bgColor: 'bg-transparent',
      icon: <IcStatusPending className="w-full h-full" style={{ aspectRatio: '1/1' }} />,
    },
    error: {
      bgColor: 'bg-[#FD6262]',
      icon: <IcStatusError className="w-3 h-3" />,
    },
  };

  const config = badgeConfig[variant];

  if (variant === ONBOARDING_TASK_STATUS.PENDING) {
    return (
      <div className={cn('w-5 h-5', className)} style={{ aspectRatio: '1/1' }}>
        {config.icon}
      </div>
    );
  }

  return (
    <div className={cn('rounded-[10px] w-5 h-5 flex items-center justify-center', config.bgColor, className)}>
      {config.icon}
    </div>
  );
}
