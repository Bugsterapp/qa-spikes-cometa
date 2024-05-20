import * as RTooltip from '@radix-ui/react-tooltip';
import { PropsWithChildren, useRef } from 'react';
import { cn } from '/src/utils/cn';

type Props = PropsWithChildren<{
  message?: string;
  disableHover?: boolean;
  theme?: string | null;
  disableClick?: boolean;
}>;

export const Tooltip = ({ children, message, disableHover = false, theme = null, disableClick = true }: Props) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <RTooltip.Provider>
      <RTooltip.Root delayDuration={300}>
        <RTooltip.Trigger
          ref={triggerRef}
          onClick={(e) => disableClick && e.preventDefault()}
          className={cn('w-fit', { 'bg-white': theme === 'white' })}
          asChild
        >
          <div className={`${theme === 'white' ? 'bg-white' : ''}`}>{children}</div>
        </RTooltip.Trigger>
        {!disableHover && message && (
          <RTooltip.Portal>
            <RTooltip.Content
              onPointerDownOutside={(event) => {
                assertIsElement(event.target);
                // We transform the `HTMLCollection` to an array to efficently check if the target is a Trigger's child
                if ([...(triggerRef.current?.children || [])].includes(event.target)) event.preventDefault();
              }}
              className="max-w-[164px] rounded-md text-white text-xs text-center bg-[#212B36] px-2 py-1.5 z-[9999]"
              sideOffset={4}
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
