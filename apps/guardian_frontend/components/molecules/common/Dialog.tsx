import * as RDialog from '@radix-ui/react-dialog';
import { forwardRef, PropsWithChildren } from 'react';
import { cn } from '~/lib/cn';

type Props = PropsWithChildren<{
  handleClose?: () => void;
  className?: string;
}>;

type DialogProps = PropsWithChildren<{
  open: boolean;
  handleClose?: () => void;
}>;

const Dialog = ({ open, handleClose, children }: DialogProps) => (
  <RDialog.Root
    open={open}
    onOpenChange={(open) => (!open && handleClose ? handleClose() : void 0)}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    {children}
  </RDialog.Root>
);

export const Close = RDialog.Close;

export const Content = forwardRef<HTMLDivElement, Props>(({ children, className }, ref) => (
  <RDialog.Portal>
    <RDialog.Overlay className="fixed inset-0 z-[1000] bg-black bg-opacity-25" />
    <RDialog.Content
      ref={ref}
      className={cn(
        'fixed z-[1001] py-6 text-gray-300 -translate-x-1/2 -translate-y-1/2 bg-white px-[53px] rounded-xl left-1/2 top-1/2 outline-none max-w-xs',
        className
      )}
    >
      {children}
    </RDialog.Content>
  </RDialog.Portal>
));

Dialog.Content = Content;
Dialog.Close = Close;

export default Dialog;
