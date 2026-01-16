import React from 'react';
import Dialog from '/src/components/atoms/Dialog';

interface ScholarshipDeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export const ScholarshipDeleteConfirmation: React.FC<ScholarshipDeleteConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}) => (
  <Dialog.Root open={isOpen} position="right" centerWhenSidepanelIsOpen onOpenChange={onClose}>
    <Dialog.Title>¿Estás seguro que deseas eliminar esta beca o descuento?</Dialog.Title>
    <Dialog.Description>
      Al eliminarlo, el estudiante perderá el beneficio únicamente para esta orden. Podrás reactivarlo luego si lo
      necesitas.
    </Dialog.Description>
    <div className="flex justify-center gap-x-10">
      <Dialog.Close className="px-8 py-2 text-sm font-bold text-gray-600 bg-transparent hover:opacity-90 whitespace-nowrap">
        Cancelar
      </Dialog.Close>
      <button
        disabled={isLoading}
        className="text-white font-bold py-2 px-8 rounded-lg text-sm hover:opacity-90 whitespace-nowrap bg-error shadow-[0_8px_16px_#FF48423D] w-[120px] disabled:opacity-50 disabled:cursor-wait"
        onClick={onConfirm}
      >
        {isLoading ? <img src="/assets/oval.svg" alt="loading" className="mx-auto h-4" /> : 'Eliminar'}
      </button>
    </div>
  </Dialog.Root>
);
