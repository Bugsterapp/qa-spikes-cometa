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
              className="max-w-[216px] rounded-1.5xl text-white text-xs bg-[#57537A]/80 font-normal px-[18px] py-4 backdrop-blur-[2px]"
              sideOffset={sideOffset ?? 12}
              align={align ?? 'end'}
              alignOffset={-26}
            >
              {/* if message is a string, we wrap it in a span to avoid a warning */}
              {typeof message === 'string' ? <span>{message}</span> : message}
              <RTooltip.Arrow asChild>
                <svg className="w-6 h-[19px]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 13">
                  <path
                    fill="#57537A"
                    fillOpacity=".8"
                    d="M18.764 8.29c-3.14 4.971-10.388 4.971-13.528 0L0 0h24l-5.236 8.29Z"
                  />
                </svg>
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
