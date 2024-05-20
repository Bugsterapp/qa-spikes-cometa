import * as RTooltip from '@radix-ui/react-tooltip';
import { PropsWithChildren, useRef } from 'react';

type Props = PropsWithChildren<{
  message?: React.ReactNode;
  disableHover?: boolean;
  disableClick?: boolean;
  sideOffset?: number;
  align?: RTooltip.TooltipContentProps['align'];
}> &
  RTooltip.TooltipProps;

export const Tooltip = ({
  children,
  message,
  disableHover = false,
  disableClick = true,
  align,
  sideOffset,
  ...rootProps
}: Props) => {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  return (
    <RTooltip.Provider>
      <RTooltip.Root {...rootProps} delayDuration={300}>
        <RTooltip.Trigger ref={triggerRef} onClick={(e) => disableClick && e.preventDefault()} asChild>
          {children}
        </RTooltip.Trigger>
        {!disableHover && message && (
          <RTooltip.Portal>
            <RTooltip.Content
              onPointerDownOutside={(event) => {
                // We transform the `HTMLCollection` to an array to efficiently check if the target is a Trigger's child
                assertIsElement(event.target);
                if (triggerRef?.current?.children.length && [...triggerRef?.current?.children].includes(event.target))
                  event.preventDefault();
              }}
              className="max-w-[216px] rounded-1.5xl text-white text-xs bg-gray-300/90 font-medium px-[18px] py-4"
              sideOffset={sideOffset || 12}
              align={align || 'end'}
            >
              {/* if message is a string, we wrap it in a span to avoid a warning */}
              {typeof message === 'string' ? <span>{message}</span> : message}
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
