'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const backdropMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

const modalMotion = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 20 },
  transition: { duration: 0.3, ease: 'easeInOut' },
};

export default function DeleteModal({ isOpen, onClose, onDelete }: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} {...backdropMotion} />

          {/* Modal */}
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" {...backdropMotion}>
            <motion.div
              className="bg-[#ffffff] box-border content-stretch flex flex-col items-start justify-start overflow-clip pb-3 pt-6 px-0 relative rounded-[10px] shadow-[0px_8px_16px_0px_rgba(145,158,171,0.16)] w-[440px]"
              onClick={(e) => e.stopPropagation()}
              {...modalMotion}
            >
              {/* Header with trash icon */}
              <div className="bg-[#ffffff] box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-8 py-3 relative shrink-0 w-full">
                <div className="overflow-clip relative shrink-0 size-12">
                  <div className="absolute bottom-[12.5%] left-[18.75%] right-[15.625%] top-[12.5%]">
                    <Trash2 className="w-9 h-9 text-gray-600" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full">
                <div className="bg-[#ffffff] relative shrink-0 w-full">
                  <div className="flex flex-row items-center justify-center relative size-full">
                    <div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-8 py-1 relative w-full">
                      <div className="basis-0 box-border content-stretch flex flex-col grow items-center justify-center min-h-px min-w-px pb-1 pt-0 px-0 relative shrink-0">
                        <div className="leading-[0] mb-[-4px] min-w-full not-italic relative shrink-0 text-[#454d64] text-[20px] text-center">
                          <p className="block leading-[24px]">Eliminar comunicado</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-[#ffffff] box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-8 py-2 relative shrink-0 w-full">
                <div className="basis-0 box-border content-stretch flex flex-col grow items-start justify-center min-h-px min-w-px pb-1 pt-0 px-0 relative shrink-0">
                  <div className="leading-[20px] mb-[-4px] min-w-full not-italic relative shrink-0 text-[#637381] text-[14px] text-center">
                    <p className="block mb-0">Se eliminará el comunicado de manera permanente.</p>
                    <p className="block">
                      Al eliminar el comunicado ya no podrías revisar la información ni recibir respuestas.
                    </p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="bg-[#ffffff] box-border content-stretch flex flex-row gap-4 items-center justify-center px-8 py-4 relative shrink-0 w-full">
                {/* Back button */}
                <button
                  onClick={onClose}
                  className="basis-0 grow min-h-px min-w-px relative rounded-[100px] shrink-0 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-row items-center justify-center relative size-full">
                    <div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-5 py-2.5 relative w-full">
                      <div className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1d] text-[14px] text-left text-nowrap">
                        <p className="block leading-[20px] whitespace-pre">Atrás</p>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Delete button */}
                <button
                  onClick={onDelete}
                  className="basis-0 bg-[#fd6262] grow min-h-px min-w-px relative rounded-[100px] shrink-0 hover:bg-[#fc4545] transition-colors"
                >
                  <div className="flex flex-row items-center justify-center relative size-full">
                    <div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-5 py-2.5 relative w-full">
                      <div className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[14px] text-left text-nowrap">
                        <p className="block leading-[20px] whitespace-pre">Eliminar</p>
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute box-border content-stretch flex flex-row items-center justify-center p-[9px] right-3 rounded-[100px] top-3 hover:bg-gray-100 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-gray-600" />
              </button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
