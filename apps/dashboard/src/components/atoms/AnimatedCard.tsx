import { Tooltip } from './Tooltip';
import React, { ReactElement } from 'react';
import { cn } from '/src/utils/cn';
import { useRouter } from 'next/router';

export const AnimatedCard = ({
  children,
  onCancel,
  onClick,
  href,
  tooltip,
  cancelTooltipLabel,
  onHoverCancel,
  canDelete = false,
  disabledMutation = false,
  className,
}: {
  children: ReactElement;
  onCancel?: () => void;
  href?: string;
  onClick?: () => void;
  tooltip?: ReactElement;
  cancelTooltipLabel: string;
  onHoverCancel?: (e: any) => void;
  canDelete?: boolean;
  disabledMutation?: boolean;
  className?: string;
}) => {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (href) {
      e.preventDefault();
      router.push(href);
    } else {
      if (onClick) {
        onClick();
      }
    }
  };

  return (
    <div className="group">
      <div className="border-[#83A9FF] justify-between grid grid-cols-[1fr_auto] border w-full min-h-[58px] rounded-2xl group-hover:border-[#F8F8F8] group-hover:shadow-[0px_16px_32px_-4px_rgba(145,158,171,0.16)] group/card">
        <button
          onClick={handleClick}
          className={cn(
            'cursor-pointer bg-white transition-colors w-full rounded-2xl hover:bg-[#f8f8f8] hover:rounded-l-2xl',
            {
              'group-hover:rounded-r-none': canDelete,
            },
            className
          )}
        >
          <div className={`w-full h-full min-h-[58px] flex justify-between items-center pl-6 pr-[30px] `}>
            <div className="flex justify-between w-full py-1 pr-4">{children}</div>
            <span>
              <svg
                width="8"
                height="14"
                viewBox="0 0 8 14"
                fill="none"
                data-testid="arrow-button"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M0.530694 13.5943C0.156439 13.2201 0.156435 12.6133 0.530684 12.239L5.68638 7.08325L0.530799 1.92764C0.156547 1.55339 0.156548 0.946605 0.530801 0.572353C0.905054 0.198101 1.51184 0.198102 1.88609 0.572356L7.71931 6.4056C8.09356 6.77985 8.09356 7.38663 7.71932 7.76088L1.88598 13.5943C1.51173 13.9686 0.90495 13.9686 0.530694 13.5943Z"
                  fill="#546CE0"
                />
              </svg>
            </span>
          </div>
        </button>
        <Tooltip message={cancelTooltipLabel}>
          {canDelete ? (
            <button
              className="h-full max-w-[73px] w-0 opacity-0 group-hover:opacity-100 transition-all group-hover:w-[73px] group-hover:rounded-r-2xl group-hover:border-l-[#E9E9E9] border-l-transparent group/x hover:cursor-pointer hover:bg-[#F8F8F8] bg-white"
              onClick={(e) => {
                if (!disabledMutation) {
                  e.preventDefault();
                  if (onCancel) onCancel();
                }
              }}
              onMouseEnter={() => onHoverCancel && onHoverCancel(true)}
              onMouseLeave={() => onHoverCancel && onHoverCancel(false)}
            >
              {tooltip}

              <div className="flex items-center justify-center w-full h-full" data-testid="unsuscribeGuardian-button">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="fill-[#919EAB] group-hover/x:fill-[#FF4842] transition-colors"
                >
                  <circle cx="12" cy="12" r="12" />

                  <path d="M8 8L16 16" stroke="white" stroke-width="1.6" stroke-linecap="round" />

                  <path d="M16 8L8 16" stroke="white" stroke-width="1.6" stroke-linecap="round" />
                </svg>
              </div>
            </button>
          ) : null}
        </Tooltip>
      </div>
    </div>
  );
};
