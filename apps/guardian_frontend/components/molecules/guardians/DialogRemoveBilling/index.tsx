import Dialog, { Close, Content } from '~/components/molecules/common/Dialog';

const DialogRemoveBilling = ({
  open,
  onAgree,
  handleClose,
}: {
  open: boolean;
  onAgree: () => void;
  handleClose: () => void;
}) => (
  <Dialog open={open} handleClose={handleClose}>
    <Content>
      <>
        <h4 id="alert-dialog-description" className="mt-0 mb-6 text-sm font-bold text-center">
          ¿Estás seguro que deseas eliminar tus datos de facturación?
        </h4>
        <div className="flex items-center justify-between space-x-2 font-bold">
          <Close asChild>
            <button className="text-xs text-blue-100 uppercase transition-colors bg-transparent border-none rounded-lg outline-none cursor-pointer hover:text-opacity-75">
              Cancelar
            </button>
          </Close>
          <Close asChild>
            <button
              id="dialog-update-billing-agree"
              className="px-6 py-2 text-xs text-[#F46F6F] uppercase transition-colors bg-[#FFE3E3] border-none rounded-lg outline-none cursor-pointer"
              onClick={() => {
                onAgree();
              }}
            >
              Si, eliminar
            </button>
          </Close>
        </div>
      </>
    </Content>
  </Dialog>
);
export default DialogRemoveBilling;
