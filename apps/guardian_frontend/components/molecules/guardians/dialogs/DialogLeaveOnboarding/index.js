import { useEffect } from 'react';

const DialogLeaveOnboarding = ({ open, handleClose, onAgree }) => {
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
    const handleEscape = (e) => {
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
          {/* Dialog Title */}
          <h2 id="alert-dialog-title" className="text-gray-700 font-semibold px-6 pt-6 pb-2">
            ¿Desea dejar de cargar los datos de contacto?
          </h2>

          {/* Dialog Content */}
          <div className="px-6 pb-4">
            <p id="alert-dialog-description" className="text-gray-700 text-sm">
              No podrá volver a cargar sus datos de contacto sin ayuda de Cometa.
            </p>
          </div>

          {/* Dialog Actions */}
          <div className="flex justify-end gap-2 px-6 pb-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                onAgree();
                handleClose();
              }}
              autoFocus
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DialogLeaveOnboarding;
