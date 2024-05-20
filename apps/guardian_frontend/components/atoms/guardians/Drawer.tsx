import { cn } from '~/lib/cn';
import * as DialogPrimitive from '@radix-ui/react-dialog';

/**
 * @see https://www.radix-ui.com/docs/primitives/components/dialog
 * Shows a drawer
 */
export const Root = DialogPrimitive.Root;

/**
 * Shows a drawer overlay
 * @param children - The content of the drawer overlay
 * @param className - The class name of the drawer overlay
 * @param otherProps - The props of the drawer overlay
 * @returns The drawer overlay
 */
export const Overlay = ({ className, children, ...otherProps }: DialogPrimitive.DialogOverlayProps) => (
  <DialogPrimitive.Overlay
    className={cn(
      'fixed inset-0 overflow-y-auto bg-black/30 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
      className
    )}
    {...otherProps}
  >
    {children}
  </DialogPrimitive.Overlay>
);

/**
 * @see https://www.radix-ui.com/docs/primitives/components/dialog#content
 * Shows a drawer content
 * @param children - The content of the drawer alert
 * @param className - The class name of the drawer alert content
 */
export function Content({ children, className, ...otherProps }: DialogPrimitive.DialogContentProps) {
  return (
    <DialogPrimitive.Content
      className={cn(
        'fixed bottom-0 z-10 max-w-[600px] w-full bg-white rounded-t-2xl data-[state=open]:animate-accordion-slide-up data-[state=closed]:animate-accordion-slide-down',
        className
      )}
      {...otherProps}
    >
      {children}
    </DialogPrimitive.Content>
  );
}
export const Close = DialogPrimitive.Close;
export const Title = DialogPrimitive.Title;
export const Description = DialogPrimitive.Description;
