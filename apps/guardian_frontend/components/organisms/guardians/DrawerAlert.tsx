import { AlertType } from '~/contexts/AlertContext';
import { cn } from '~/lib/cn';
import * as DialogPrimitive from '@radix-ui/react-dialog';

/**
 * @see https://www.radix-ui.com/docs/primitives/components/dialog
 * Shows a drawer alert
 */
export const DrawerAlert = DialogPrimitive.Root;

/**
 * @see https://www.radix-ui.com/docs/primitives/components/dialog#content
 * Shows a drawer alert content
 * @param children - The content of the drawer alert
 * @param className - The class name of the drawer alert content
 * @param type - The type of the drawer alert content (error, success, warn, info) default is error
 */

interface DrawerAlertContentProps {
  children: React.ReactNode;
  className?: string;
  type?: AlertType;
}

export function DrawerAlertContent({ children, className, type }: Readonly<DrawerAlertContentProps>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Content
        className={cn(
          'fixed bottom-0 z-10 max-w-[376px] w-full -translate-x-1/2 bg-error left-1/2 rounded-t-2xl data-[state=open]:animate-accordion-slide-up data-[state=closed]:animate-accordion-slide-down',
          className,
          {
            'bg-error': type === 'error',
            'bg-success': type === 'success',
            'bg-warning': type === 'warn' || type === 'warning',
            'bg-info': type === 'info',
          }
        )}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

/**
 * Second content in the drawer alert content, this is down below the title or description
 * @param children - The content of the drawer alert content actions
 * @param className - The class name of the drawer alert content actions
 **/

interface DrawerAlertActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function DrawerAlertActions({ children, className }: Readonly<DrawerAlertActionsProps>) {
  return <div className={cn('w-full h-full p-6 bg-white rounded-t-[48px]', className)}>{children}</div>;
}
