import { Button } from '~/components/ui/Button';
import Dialog from '../molecules/common/Dialog';
import OrderCardGroup from '~/public/images/order-card-group.svg';
import GiftCard from '~/public/images/gift-card.svg';

interface DialogTourToPayProps {
  open: boolean;
  hasDue?: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const DialogTourToPay = ({ open = false, onCancel, onSuccess, hasDue = false }: DialogTourToPayProps) => {
  const handleClose = () => {
    onCancel();
  };
  return (
    <Dialog open={open} handleClose={handleClose}>
      <Dialog.Content className="w-screen px-[25px] pt-4 pb-2.5">
        <div className="flex flex-col items-center gap-y-5">
          <div>{hasDue ? <OrderCardGroup /> : <GiftCard />}</div>
          <div className="space-y-[18px]">
            {hasDue && <h3 className="text-[#2B2D30] font-bold text-lg/6 text-center">¡Tienes pagos vencidos!</h3>}
            <div className="border-t border-t-[#E2E2E2] mx-1" />
            <h4 className="text-[#57537A] font-semibold text-base/normal text-center">
              ¿Quieres ver como realizar tu primer pago?
            </h4>
            <div className="flex flex-col gap-y-2.5">
              <Button
                className="bg-[#2B2D30] shadow-none hover:bg-[#2B2D30]/80 active:bg-[#2B2D30] rounded-[19px] py-2 px-[18px] font-bold text-xs/4"
                onClick={onSuccess}
              >
                SI
              </Button>
              <Dialog.Close
                className="py-2 px-[18px] text-[#2B2D30] font-semibold text-xs/4 bg-transparent"
                onClick={handleClose}
              >
                Por ahora no
              </Dialog.Close>
            </div>
          </div>
        </div>
      </Dialog.Content>
    </Dialog>
  );
};
export default DialogTourToPay;
