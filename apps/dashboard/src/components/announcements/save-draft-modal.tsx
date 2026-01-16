'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@cometa/recreo/v2';
import { X, PanelTop } from 'lucide-react';
import { useSendEvent } from '/src/hooks/useSendEvent';
import { useEffect } from 'react';
import { TrackEvents } from '/src/constants/events';

interface SaveDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDraft: () => void;
  onDiscardChanges: () => void;
  isEditing: boolean;
  loading: boolean;
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

export default function SaveDraftModal({
  isOpen,
  onClose,
  onSaveDraft,
  onDiscardChanges,
  isEditing = false,
  loading = false,
}: SaveDraftModalProps) {
  const sendEvent = useSendEvent();

  useEffect(() => {
    if (isOpen) {
      sendEvent(TrackEvents.announcements.saveDraftModalShown);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => {
              sendEvent(TrackEvents.announcements.saveDraftModalClosed);
              onClose();
            }}
            {...backdropMotion}
          />

          {/* Modal */}
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" {...backdropMotion}>
            <motion.div
              className="bg-white box-border content-stretch flex flex-col items-start justify-start overflow-clip pb-3 pt-6 px-0 relative rounded-[10px] shadow-[0px_8px_16px_0px_rgba(145,158,171,0.16)] w-[440px]"
              onClick={(e) => e.stopPropagation()}
              {...modalMotion}
            >
              {/* Header with icon */}
              <div className="bg-white box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-8 py-3 relative shrink-0 w-full">
                <div className="overflow-clip relative shrink-0 size-12">
                  <div className="absolute bottom-[4.166%] left-0 right-0 top-[4.167%]">
                    <PanelTop className="w-12 h-12 text-gray-500" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full">
                <div className="bg-white relative shrink-0 w-full">
                  <div className="flex flex-row items-center justify-center relative size-full">
                    <div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-8 py-1 relative w-full">
                      <div className="basis-0 box-border content-stretch flex flex-col grow items-center justify-center min-h-px min-w-px pb-1 pt-0 px-0 relative shrink-0">
                        <div className=" leading-[0] mb-[-4px] min-w-full not-italic relative shrink-0 text-[#454d64] text-[20px] text-center">
                          <p className="block leading-[24px]">
                            {isEditing ? '¿Actualizar borrador?' : '¿Guardar en borrador?'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-8 py-2 relative shrink-0 w-full">
                <div className="basis-0 box-border content-stretch flex flex-col grow items-start justify-center min-h-px min-w-px pb-1 pt-0 px-0 relative shrink-0">
                  <div className=" leading-[0] mb-[-4px] min-w-full not-italic relative shrink-0 text-[#637381] text-[14px] text-center">
                    <p className="block leading-[20px]">
                      ¿Quieres guardar el progreso de este comunicado para poder continuar luego?
                    </p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="bg-white box-border content-stretch flex flex-row gap-4 items-center justify-center px-8 py-4 relative shrink-0 w-full">
                {/* No button */}
                <Button
                  onClick={() => {
                    sendEvent(TrackEvents.announcements.saveDraftModalNoClicked);
                    onDiscardChanges();
                  }}
                  disabled={loading}
                  variant="ghost"
                >
                  No
                </Button>

                {/* Yes, save button */}
                <Button
                  onClick={() => {
                    sendEvent(TrackEvents.announcements.saveDraftModalYesClicked);
                    onSaveDraft();
                  }}
                  disabled={loading}
                >
                  Sí guardar
                </Button>
              </div>

              {/* Close button */}
              <button
                onClick={() => {
                  sendEvent(TrackEvents.announcements.saveDraftModalClosed);
                  onClose();
                }}
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
