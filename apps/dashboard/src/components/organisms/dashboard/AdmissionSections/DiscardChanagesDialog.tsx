import { Dialog } from '@cometa/recreo';

export function DiscardChangesDialog({
  open,
  onSubmit,
  isLoading,
  onClose,
}: {
  open: boolean;
  onSubmit: () => void;
  isLoading: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog.Root open={open} position="center">
      <Dialog.Title>Descartar cambios</Dialog.Title>

      <div className="my-4">
        <Dialog.Description>
          <p>¿Estás seguro que deseas salir sin guardar los cambios?</p>
          <p>Tus modificaciones se perderán si decides continuar.</p>
        </Dialog.Description>
      </div>

      <div className="flex justify-center gap-x-10">
        <Dialog.Close
          onClick={onClose}
          className="bg-transparent text-[#637381] font-bold	py-2 px-8 text-sm	hover:opacity-90 outline-none"
          disabled={isLoading}
        >
          Volver
        </Dialog.Close>
        <button
          className="bg-[#FF4842] text-white font-bold	py-2 px-8 rounded-lg text-sm hover:opacity-90 hover:cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
          onClick={onSubmit}
          disabled={isLoading}
        >
          Descartar cambios
        </button>
      </div>
    </Dialog.Root>
  );
}
