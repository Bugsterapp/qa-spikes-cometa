import { useEffect } from 'react';

interface DialogUpdateBillingProps {
  open: boolean;
  handleClose: () => void;
  onAgree: () => void;
}

const DialogUpdateBilling = ({ open, handleClose, onAgree }: DialogUpdateBillingProps) => {
  // Handle body scroll lock when dialog is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, handleClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Dialog Content */}
          <div className="p-6">
            <p id="alert-dialog-description" className="text-gray-700 text-base">
              ¿Desea aplicar los cambios?
            </p>
            <p className="text-gray-700 text-sm font-medium pt-2">
              Estos cambios se verán reflejados <br /> en tus siguientes facturas.
            </p>
          </div>

          {/* Dialog Actions */}
          <div className="flex justify-around px-6 pb-6">
            <button
              id="dialog-update-billing-cancel"
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              Cancelar
            </button>
            <button
              id="dialog-update-billing-agree"
              type="button"
              onClick={() => {
                onAgree();
                handleClose();
              }}
              autoFocus
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-md"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DialogUpdateBilling;
