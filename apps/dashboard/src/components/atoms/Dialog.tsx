import * as RDialog from '@radix-ui/react-dialog';
import { forwardRef, ReactNode } from 'react';
import { cn } from '/src/utils/cn';

interface DialogProps extends RDialog.DialogProps {
  position?: 'left' | 'center' | 'right' | 'bottom-right';
  classNames?: string;
  overlay?: boolean;
  centerWhenSidepanelIsOpen?: boolean;
}

const Close = RDialog.Close;

const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  ({ children, open, overlay = true, position = 'center', centerWhenSidepanelIsOpen = false, ...props }, ref) => {
    const BoxClassNames = cn(
      'fixed max-w-[480px] px-6 py-7 text-center z-[9999] max-h-fit -translate-y-1/2 bg-white shadow-xl top-1/2 rounded-2xl animate-show',
      {
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
          {overlay && <RDialog.Overlay className="fixed inset-0 z-[9998] bg-black bg-opacity-25 animate-show" />}
          <RDialog.Content ref={ref} className={cn(BoxClassNames, props.classNames)}>
            {children}
          </RDialog.Content>
        </RDialog.Portal>
      </RDialog.Root>
    );
  }
);

const Title = ({ children }: { children: ReactNode }) => (
  <div className="mb-4 text-base font-semibold leading-6">{children}</div>
);
const Description = ({ children }: { children: ReactNode }) => (
  <div className="font-normal text-sm text-[#637381] mb-6">{children}</div>
);

export default {
  Root: Dialog,
  Title,
  Description,
  Close,
};
