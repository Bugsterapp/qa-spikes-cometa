import { DependantErrorRFC } from '~/contexts/VerifyRFCContext';
import { Color } from '~/utils/colors';
import { cn } from '~/lib/cn';
import { Button } from './ui/Button';
import { HelperTextWithIcon } from './CustomFormField';
import { ChevronDown } from 'lucide-react';
import * as RCollapsible from '@radix-ui/react-collapsible';

export const Content = ({
  children,
  className,
  ...props
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => (
  <div
    className={cn(
      'w-full rounded-[14px] shadow-[0px_2px_24px_0px_#ADBBCC4D] overflow-hidden transition-colors bg-white outline-2 outline outline-transparent',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const Info = ({
  children,
  className,
  ...props
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => (
  <div
    className={cn('px-[26px] py-5', 'border-b border-[#E3E0FF] border-solid last:border-none', className)}
    {...props}
  >
    {children}
  </div>
);

export const Details = ({
  children,
  className,
  onOpenChange,
}: {
  children: React.ReactElement | React.ReactNode;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}) => (
  <RCollapsible.Root
    onOpenChange={onOpenChange}
    className={cn(
      'px-[26px] py-5 data-[state="open"]:pb-5 flex flex-col gap-y-2.5',
      'group',
      'border-b border-[#E3E0FF] border-solid last:border-none',
      className
    )}
  >
    {children}
  </RCollapsible.Root>
);

export const DetailsTrigger = ({ children, className, ...props }: RCollapsible.CollapsibleTriggerProps) => (
  <RCollapsible.Trigger asChild {...props}>
    <div
      className={cn(
        'flex items-center justify-between gap-x-2 text-[#3E3E3E] font-medium text-sm w-full select-none cursor-pointer focus-visible:outline-none ',
        className
      )}
    >
      {children}
      <ChevronDown className='group-data-[state="open"]:rotate-180 transition-transform' />
    </div>
  </RCollapsible.Trigger>
);

export const DetailsContent = (props: RCollapsible.CollapsibleContentProps) => (
  <RCollapsible.Content
    {...props}
    className={cn(
      'transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden',
      props.className
    )}
  />
);

export const Footer = ({
  children,
  className,
  ...props
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>) => (
  <footer className={cn('flex items-center justify-between p-4', className)} {...props}>
    {children}
  </footer>
);

interface VerifyRFCFooterProps {
  isLoadingVerify?: boolean;
  isLoading?: boolean;
  onAssignRFC?: (dependent: DependantErrorRFC & Color) => void;
  dependent: DependantErrorRFC & Color;
  Tour?: React.ReactElement;
}

export const VerifyRFCFooter = ({ dependent, isLoading, isLoadingVerify, onAssignRFC, Tour }: VerifyRFCFooterProps) => {
  const billingName = dependent.billing_guardian?.billing_name;
  return (
    <Footer
      className={cn('px-[26px] py-5', {
        'border-t-[#F46F6F] bg-[#FFE8E8]': dependent.errorRFC,
      })}
    >
      {isLoadingVerify || isLoading ? (
        <div className="flex items-center justify-center w-full text-gray-300 gap-x-1">
          {isLoadingVerify && <span className="mr-1">Verificando RFC</span>}
          <div
            data-testid="loader"
            className="inline-block h-5 w-5 animate-spin rounded-full border-4 border-solid border-slate-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
          />
        </div>
      ) : (
        <div className="w-full">
          {Tour}
          {dependent.billing_guardian ? (
            <div className="text-sm text-gray-300">
              <div className="flex items-center justify-between gap-x-2">
                <div className="flex flex-col gap-y-1.5">
                  <span className="font-semibold">Facturación:</span>
                  <span>{billingName ?? 'Datos Incompletos'}</span>
                </div>
                {onAssignRFC && (
                  <Button variant="outline" size="xs" className="change-rfc" onClick={() => onAssignRFC(dependent)}>
                    {dependent.errorRFC ? 'CORREGIR' : 'CAMBIAR'}
                  </Button>
                )}
              </div>
              {dependent.errorRFC && billingName && (
                <HelperTextWithIcon isError className="items-center gap-0 ml-0">
                  Los datos no coinciden con los del SAT
                </HelperTextWithIcon>
              )}
            </div>
          ) : (
            <div
              className={cn('flex items-center justify-center gap-x-2', {
                'justify-between': !!onAssignRFC,
              })}
              id={`card-${dependent.id}-change-rfc`}
            >
              <span className="text-sm font-semibold text-gray-300">No hay facturación</span>
              {onAssignRFC && (
                <Button variant="outline" size="xs" className="change-rfc" onClick={() => onAssignRFC(dependent)}>
                  CAMBIAR
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </Footer>
  );
};
