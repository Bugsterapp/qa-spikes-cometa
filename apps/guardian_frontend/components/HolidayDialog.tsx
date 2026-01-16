import * as Dialog from '@radix-ui/react-dialog';
import HolidayHeader from '~/public/images/holiday-header.svg';
import HolidayFooter from '~/public/images/holiday-footer.svg';

const defaultMessage = 'No se podrán realizar pagos a través del portal para ayudar al colegio a cerrar el año fiscal.';

export const HolidayDialog = ({ open }: { open: boolean; schoolId: string }) => (
  <Dialog.Root open={open}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-20 bg-black bg-opacity-50" />
      <Dialog.Content className="fixed inset-0 rounded-xl overflow-hidden m-auto z-20 flex flex-col max-w-xs lg:max-w-md justify-center bg-white max-h-[300px]">
        <div className="relative flex flex-col items-center justify-center flex-1">
          <HolidayHeader />
          <div className="text-center px-9">
            <h2 className="mb-8 font-semibold">¡Gracias por usar Cometa!</h2>
            <p className="mb-6"> {defaultMessage}</p>
            <p className="text-sm font-semibold px-9">¡Felices Fiestas y Prospero Año 2025!</p>
          </div>
          <HolidayFooter />
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
