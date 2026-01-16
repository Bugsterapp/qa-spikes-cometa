import Dialog from '../atoms/Dialog';
import { Button } from '@cometa/recreo';

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function UnsavedChangesDialog({ isOpen, onClose, onConfirm }: UnsavedChangesDialogProps) {
  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      classNames="w-[433px] p-7 rounded-2xl shadow-[0_8px_16px_rgba(0,0,0,0.24)]"
    >
      <Dialog.Title className="text-base font-semibold text-[#212B36] mb-2 text-center">
        Estás a punto de abandonar el proceso de edición
      </Dialog.Title>
      <Dialog.Description className="text-sm leading-[22px] text-[#637381] font-normal text-center">
        ¿Estás seguro que deseas salir sin guardar los cambios?
        <br />
        Tus modificaciones se perderán si decides continuar.
      </Dialog.Description>

      <div className="flex justify-center gap-3 mt-6">
        <Dialog.Close onClick={onClose} asChild>
          <Button
            className="w-[156px] h-9 bg-transparent rounded-lg text-[#637381] font-bold text-sm hover:no-underline flex items-center justify-center"
            variant="outline"
          >
            Volver
          </Button>
        </Dialog.Close>
        <Button
          className="w-[156px] h-9 bg-[#FF4842] hover:bg-[#FF4842]/90 text-white rounded-lg font-bold text-sm shadow-[0_8px_16px_rgba(255,72,66,0.24)] flex items-center justify-center"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          Descartar cambios
        </Button>
      </div>
    </Dialog.Root>
  );
}
