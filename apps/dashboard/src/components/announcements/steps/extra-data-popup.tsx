import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface ExtraDataPopupProps {
  extraDataRequest: string;
  userExtraData: string;
  onUserExtraDataChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

const ExtraDataPopup: React.FC<ExtraDataPopupProps> = ({
  extraDataRequest,
  userExtraData,
  onUserExtraDataChange,
  onCancel,
  onSubmit,
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey && event.key === 'Enter') {
        if (userExtraData.trim()) {
          event.preventDefault();
          onSubmit();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onSubmit, userExtraData]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <h3 className="text-lg font-semibold mb-4">Información adicional requerida</h3>
        <p className="text-gray-600 mb-4">{extraDataRequest}</p>
        <input
          type="text"
          value={userExtraData}
          onChange={(e) => onUserExtraDataChange(e.target.value)}
          placeholder="Ingresa la información solicitada..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <motion.button
            onClick={onSubmit}
            disabled={!userExtraData.trim()}
            className="relative overflow-hidden rounded-xl px-4 py-2 text-white font-medium text-sm shadow-lg disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #6366f1 100%)',
              opacity: !userExtraData.trim() ? 0.7 : 1,
            }}
            whileHover={
              !userExtraData.trim()
                ? {
                    scale: 1.02,
                    boxShadow: '0 8px 20px rgba(236, 72, 153, 0.3)',
                  }
                : {}
            }
            whileTap={!userExtraData.trim() ? { scale: 0.98 } : {}}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            Generar
            <motion.span
              className="text-xs rounded px-1.5 py-0.5 hidden md:inline ml-2"
              style={{
                opacity: 0.7,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              }}
              whileHover={{ scale: 1.05 }}
            >
              ⌘ ↲
            </motion.span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default ExtraDataPopup;
