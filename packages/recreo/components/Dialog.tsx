import React, { forwardRef, ReactNode } from 'react';
import * as RDialog from '@radix-ui/react-dialog';
import { cn } from '@cometa/utils';

type DialogProps = RDialog.DialogProps & {
  position?: 'left' | 'center' | 'right' | 'bottom-right';
  className?: string;
  overlay?: boolean;
  centerWhenSidepanelIsOpen?: boolean;
  hideShadow?: boolean;
  disableCloseOutside?: boolean;
};

const Root = forwardRef<HTMLDivElement, DialogProps>(
  (
    { children, open, overlay = true, position = 'center', hideShadow, centerWhenSidepanelIsOpen = false, ...props },
    ref
  ) => {
    const boxClassNames = cn(
      'fixed max-w-md px-6 py-7 z-30 max-h-fit -translate-y-1/2 bg-white shadow-xl top-1/2 rounded-lg animate-fade-in duration-200 ease-linear',
      {
        'shadow-none': hideShadow,
        'left-0 right-0 mx-auto': position === 'center',
        'right-11': position === 'right',
        'left-11': position === 'left',
        '-bottom-16 mb-0 mt-auto right-11': position === 'bottom-right',
        'translate-x-[-29px]': centerWhenSidepanelIsOpen,
      }
    );

    return (
      <RDialog.Root
        open={open}
        {...props}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <RDialog.Portal>
          <RDialog.Overlay
            className={cn('fixed inset-0 z-30 bg-black bg-opacity-25 animate-fade-in', {
              'bg-opacity-0 bg-transparent opacity-0 hidden': !overlay,
            })}
          />
          <RDialog.Content
            ref={ref}
            className={cn(boxClassNames, props.className)}
            onPointerDownOutside={(e) => (props.disableCloseOutside ? e.preventDefault() : undefined)}
          >
            {children}
          </RDialog.Content>
        </RDialog.Portal>
      </RDialog.Root>
    );
  }
);

function Title({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mb-4 text-lg font-semibold leading-6 text-center', className)}>{children}</div>;
}

function Description({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('font-normal text-sm text-[#637381] mb-6 text-center', className)}>{children}</div>;
}

const Close = RDialog.Close;

const Dialog = { Root, Title, Description, Close };

export { Dialog };
