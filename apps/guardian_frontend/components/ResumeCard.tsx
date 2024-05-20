import { DependantErrorRFC } from '~/contexts/VerifyRFCContext';
import { Color } from '~/utils/colors';
import { Footer } from './OrderCard';
import { cn } from '~/lib/cn';
import { Button } from './atoms/Button';
import { HelperTextWithIcon } from './CustomFormField';

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
