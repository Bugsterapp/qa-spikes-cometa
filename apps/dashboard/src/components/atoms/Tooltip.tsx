import * as RTooltip from '@radix-ui/react-tooltip';
import { PropsWithChildren, useRef } from 'react';
import { cn } from '/src/utils/cn';

type Props = PropsWithChildren<{
  message?: string;
  disableHover?: boolean;
  theme?: string | null;
  disableClick?: boolean;
  delayDuration?: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
  fullWidth?: boolean;
  className?: string;
}>;

export const Tooltip = ({
  children,
  message,
  disableHover = false,
  theme = null,
  disableClick = true,
  delayDuration,
  side,
  fullWidth,
  className,
}: Props) => {
  const triggerRef = useRef<HTMLDivElement>(null);

  return (
    <RTooltip.Provider>
      <RTooltip.Root delayDuration={delayDuration || 300}>
        <RTooltip.Trigger
          asChild
          onClick={(event) => {
            if (disableClick) event.preventDefault();
          }}
        >
          <div
            ref={triggerRef}
            className={cn(
              'w-fit',
              { 'bg-white': theme === 'white' },
              {
                'w-full': fullWidth,
              },
              className
            )}
          >
            {children}
          </div>
        </RTooltip.Trigger>
        {!disableHover && message && (
          <RTooltip.Portal>
            <RTooltip.Content
              onPointerDownOutside={(event) => {
                assertIsElement(event.target);
                if ([...(triggerRef.current?.children || [])].includes(event.target)) event.preventDefault();
              }}
              className="max-w-[164px] rounded-md text-white text-xs text-center bg-[#212B36] px-2 py-1.5 z-[9999]"
              sideOffset={4}
              side={side}
            >
              <p>{message}</p>
              <RTooltip.Arrow asChild>
                <span className="h-2 w-2 bg-[#212B36] rotate-45 -translate-y-1 rounded-[2px]" />
              </RTooltip.Arrow>
            </RTooltip.Content>
          </RTooltip.Portal>
        )}
      </RTooltip.Root>
    </RTooltip.Provider>
  );
};

function assertIsElement(e: EventTarget | null): asserts e is Element {
  if (!e || !('nodeType' in e)) {
    throw new Error(`Node expected`);
  }
}
