import * as RDialog from '@radix-ui/react-dialog';

type Props = {
  open: boolean;
  handleClose: () => void;
  onAgree: () => void;
};

const DialogUpdateBilling = ({ open, handleClose, onAgree }: Props) => (
  <RDialog.Root
    open={open}
    onOpenChange={(open) => !open && handleClose()}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <RDialog.Portal>
      <RDialog.Overlay className="fixed inset-0 z-[1000] bg-black bg-opacity-25" />
      <RDialog.Content className="fixed z-[1001] py-6 text-gray-300 -translate-x-1/2 -translate-y-1/2 bg-white px-[53px] rounded-xl left-1/2 top-1/2 outline-none">
        <h4 id="alert-dialog-description" className="mb-6 text-sm font-bold text-center">
          ¿Desea aplicar los cambios?
        </h4>
        <div className="flex items-center justify-between space-x-2 font-bold">
          <RDialog.Close asChild>
            <button className="text-xs text-blue-100 uppercase transition-colors bg-transparent border-none rounded-lg outline-none cursor-pointer hover:text-opacity-75">
              Cancelar
            </button>
          </RDialog.Close>
          <RDialog.Close asChild>
            <button
              id="dialog-update-billing-agree"
              className="px-6 py-2 text-xs text-white uppercase transition-colors bg-blue-100 border-none rounded-full outline-none cursor-pointer hover:bg-blue-800"
              onClick={() => {
                onAgree();
                handleClose();
              }}
            >
              Confirmar
            </button>
          </RDialog.Close>
        </div>
      </RDialog.Content>
    </RDialog.Portal>
  </RDialog.Root>
);
export default DialogUpdateBilling;
