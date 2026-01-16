import { cn } from '~/lib/cn';
import { DrawerAlert, DrawerAlertActions, DrawerAlertContent } from './organisms/guardians/DrawerAlert';
import IcInfo from '~/public/icons/information-white.svg';

export const StockErrorAlert = ({
  stockError,
  resetSelection,
  setIsLoadingButton,
  setStockError,
}: {
  stockError: boolean;
  resetSelection?: () => void;
  setIsLoadingButton?: (value: boolean) => void;
  setStockError?: (value: boolean) => void;
}) => (
  <DrawerAlert open={stockError}>
    <DrawerAlertContent>
      <div className="mb-10 mx-[49.5px] mt-6 flex flex-col items-center text-white space-y-6">
        <IcInfo className="w-12 h-12" />
        <p className="text-lg font-semibold text-center">
          Alguno de los conceptos a pagar ya no tienen stock disponible.
        </p>
      </div>
      <DrawerAlertActions className="px-[49.5px] space-y-5">
        <div className="flex flex-col justify-center text-center">
          <span className="font-medium text-secondary">¿Qué puedo hacer?</span>
          <span className="font-medium text-gray-600 list-decimal list-inside text-xs/5 mt-2.5">
            Si crees que este error ha salido por equivocación puedes contactar a nuestro equipo de soporte y te
            ayudaremos lo antes posible.
          </span>
        </div>
        <button
          className={cn(
            'text-center block py-4 px-6 appearance-none bg-blue-100 rounded-full text-white text-base font-normal outline-none shadow-[6px_6px_20px_rgba(85,112,255,0.3)] cursor-pointer hover:bg-[#364AFD] transition-colors hover:shadow-[6px_6px_35px_rgba(85, 112, 255, 0.42)] active:bg-blue-100',
            'disabled:shadow-none disabled:bg-[#EBEBEB] disabled:text-[#A6A6A6] w-full py-3 font-medium'
          )}
          type="button"
          rel="noopener noreferrer"
          onClick={() => {
            resetSelection?.();
            setIsLoadingButton?.(false);
            setStockError?.(false);
          }}
        >
          Volver al inicio
        </button>
      </DrawerAlertActions>
    </DrawerAlertContent>
  </DrawerAlert>
);
