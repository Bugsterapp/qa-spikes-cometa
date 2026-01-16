import { Dialog } from '@cometa/recreo';
import { Button } from '@cometa/recreo/v2';

type RefundPaymentNotShowDetailDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function RefundPaymentNotShowDetailDialog({ open, onClose }: RefundPaymentNotShowDetailDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(newOpen) => !newOpen && onClose()}>
      <Dialog.Title className="text-left">No se puede mostrar el detalle de este pago</Dialog.Title>

      <Dialog.Description className="text-left">
        Este pago ha sido devuelto por completo y el concepto desasignado. Por lo tanto, ya no es posible visualizar el
        detalle.
      </Dialog.Description>

      <div className="flex justify-end mt-6">
        <Button variant="default" size="lg" onClick={onClose}>
          Entendido
        </Button>
      </div>
    </Dialog.Root>
  );
}
