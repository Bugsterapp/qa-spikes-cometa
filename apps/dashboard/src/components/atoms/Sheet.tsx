import * as Dialog from '@radix-ui/react-dialog';
import React from 'react';
import { cn } from '/src/utils/cn';
import Info from '/public/assets/icons/ic_info.svg';
import Close from '/public/assets/icons/ic_close.svg';
import * as Portal from '@radix-ui/react-portal';

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

type TooltipAlert = { id: string; message: string };

type SheetContextType = {
  contentComponents: string[];
  addContent: (id: string) => void;
  removeContent: (id: string) => void;
  setTooltip: (args: TooltipAlert | null) => void;
  tooltip: TooltipAlert | null;
};

const SheetContext = React.createContext<SheetContextType | undefined>(undefined);

export const SheetProvider = ({ children }: React.PropsWithChildren<object>) => {
  const [contentComponents, setContentComponents] = React.useState<string[]>([]);
  const [tooltipAlert, setTooltipAlert] = React.useState<TooltipAlert | null>(null);

  const addContent = React.useCallback(
    (id: string) => {
      setContentComponents((prevContents) => [...prevContents, id]);
    },
    [setContentComponents]
  );

  const removeContent = React.useCallback(
    (id: string) => {
      setContentComponents((prevContents) => prevContents.filter((contentId) => contentId !== id));
    },
    [setContentComponents]
  );

  const setTooltip = React.useCallback(
    (args: TooltipAlert | null) => {
      setTooltipAlert(args);
    },
    [setTooltipAlert]
  );

  return (
    <SheetContext.Provider value={{ contentComponents, addContent, removeContent, setTooltip, tooltip: tooltipAlert }}>
      {children}
    </SheetContext.Provider>
  );
};

type DialogContentPrimitiveProps = React.ComponentProps<typeof Dialog.Content> & {
  className?: string;
  disableAutoFocus?: boolean;
  sheetWithoutBackground?: boolean;
};

const useSheetState = () => {
  const context = React.useContext(SheetContext);

  if (!context) {
    throw new Error('SheetContent must be used within a Sheet component');
  }

  return context;
};

export const useValidateId = () => {
  const { contentComponents, setTooltip } = useSheetState();

  const checkId = React.useCallback(
    (id: string, message: string, callback: () => void) => {
      if (contentComponents.includes(id)) {
        setTooltip({
          id,
          message,
        });
      } else {
        callback();
      }
    },
    [contentComponents, setTooltip]
  );

  return checkId;
};

interface SheetProps extends Dialog.DialogProps {
  children: React.ReactElement | React.ReactElement[];
  id?: string;
}

const Sheet = ({ children, id: _id, ...props }: SheetProps) => {
  const id = React.useRef(_id ? _id : genId());
  const { removeContent, addContent, setTooltip, tooltip } = useSheetState();

  React.useEffect(() => {
    const cleanupId = id.current;
    return () => removeContent(cleanupId);
  }, [id]);

  const childrenWithId = React.Children.map(children, (child) =>
    React.isValidElement<{ id: string }>(child) ? React.cloneElement(child, { id: id.current }) : child
  );

  React.useEffect(() => {
    if (!props.open) {
      removeContent(id.current);
      if (tooltip?.id === id.current) setTooltip(null);
    } else {
      addContent(id.current);
    }
  }, [props.open]);

  return <Dialog.Root {...props}> {childrenWithId} </Dialog.Root>;
};

const SheetContent = ({
  children,
  className,
  disableAutoFocus = false,
  sheetWithoutBackground,
  onStartedScroll,
  ...props
}: DialogContentPrimitiveProps & { onStartedScroll?: (isScrolling: boolean) => void }) => {
  const { contentComponents, tooltip, setTooltip } = useSheetState();

  const contentRef = React.useRef<HTMLDivElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const index = [...contentComponents].reverse().indexOf(String(props.id));
  const offset = index === 0 ? 0 : index * 30;
  const zIndex = 30 + (contentComponents.length - 1 - index) * 2;
  const [tooltipOffset, setTooltipOffset] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const isScrolling = contentRef.current.scrollTop > 20;
      if (onStartedScroll) onStartedScroll(isScrolling);
    };

    const contentElement = contentRef.current;
    contentElement?.addEventListener('scroll', handleScroll);

    return () => contentElement?.removeEventListener('scroll', handleScroll);
  }, [onStartedScroll]);

  const showTooltip = tooltip && tooltip.id === props.id;

  const clientRect = contentRef.current?.getBoundingClientRect();

  React.useEffect(() => {
    const setOffset = () => {
      if (tooltipRef.current && clientRect?.left) {
        setTooltipOffset(clientRect?.left - tooltipRef.current?.offsetWidth);
      }
    };

    setOffset();

    window.addEventListener('resize', setOffset);

    return () => window.removeEventListener('resize', setOffset);
  }, [tooltipRef.current, clientRect?.left, showTooltip]);

  return (
    <>
      <Dialog.Portal>
        <div
          className="fixed z-[var(--z)] inset-0"
          style={
            {
              '--z': `${zIndex}`,
            } as React.CSSProperties
          }
        >
          <Dialog.Overlay
            className={cn('data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out w-full h-full', {
              'bg-black/10': !sheetWithoutBackground,
            })}
          />
        </div>
        <Dialog.Content
          onOpenAutoFocus={(e) => {
            if (disableAutoFocus) {
              e.preventDefault();
            }
          }}
          {...props}
          ref={contentRef}
          key={props.id}
          onInteractOutside={(e) => {
            // We want to prevent outside clicking for sheets in the background.\
            if (index !== 0 || tooltip !== null) e.preventDefault();
          }}
          className={cn(
            'data-[state=open]:animate-slide-in-right scrollbar mr-1 transition-all data-[state=closed]:animate-slide-out-right fixed top-0 bottom-0 right-0 z-[var(--z)] max-w-[572px] w-screen h-full bg-white overflow-auto -translate-x-[var(--offset)] scrollbar-stable',
            className
          )}
          style={
            {
              '--offset': `${offset}px`,
              '--z': zIndex,
            } as React.CSSProperties
          }
        >
          {children}
        </Dialog.Content>
      </Dialog.Portal>
      {showTooltip ? (
        <Portal.Root asChild>
          <div
            ref={tooltipRef}
            className={cn(
              'w-full max-w-[214px] fixed left-[var(--offsetX)] animate-bounce-x top-[var(--offsetY)] z-[900000]'
            )}
            style={
              {
                '--offsetX': `${tooltipOffset - 20}px`,
                '--offsetY': `calc(${contentRef.current?.clientHeight ?? 0 / 2}px / 2)`,
                // Override Radix
                pointerEvents: 'auto',
              } as React.CSSProperties
            }
          >
            <div className='relative min-h-[92px] w-full h-full bg-[#D0F2FF] rounded-lg text-blue-700 p-4 flex flex-nowrap gap-3.5 items-start before:block before:rounded before:content-[""] before:absolute before:-right-1.5 before:rotate-45 before:w-4 before:h-4 before:bg-[#D0F2FF] before:inset-y-0 before:m-auto'>
              <Info className="w-5 h-5" />
              <span className="flex-1 text-sm">{tooltip.message}</span>
              <button onClick={() => setTooltip(null)}>
                <Close className="w-5 h-5 text-blue-700 transition-colors cursor-pointer hover:text-blue-700/40" />
              </button>
            </div>
          </div>
        </Portal.Root>
      ) : null}
    </>
  );
};

Sheet.Content = SheetContent;
Sheet.Trigger = Dialog.Trigger;
Sheet.Close = Dialog.Close;
Sheet.Title = Dialog.Title;
Sheet.Description = Dialog.Description;

export default Sheet;
