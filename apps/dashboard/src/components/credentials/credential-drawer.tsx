'use client';

import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { CredentialModal } from './credential-modal';

type CredentialDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  hasUnsavedChanges?: boolean;
  isEditing?: boolean;
};

const backdropMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

const drawerMotion = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.25, ease: 'easeInOut' },
};

export function CredentialDrawer({
  isOpen,
  onClose,
  title = 'Nueva plantilla',
  children,
  hasUnsavedChanges = false,
  isEditing = false,
}: CredentialDrawerProps) {
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  const finalTitle = isEditing ? 'Editar plantilla' : title;

  // Block body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;

      // Block body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        // Restore body styles
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';

        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  function handleClose() {
    if (hasUnsavedChanges) {
      setShowUnsavedModal(true);
    } else {
      onClose();
    }
  }

  function handleConfirmClose() {
    setShowUnsavedModal(false);
    onClose();
  }

  return (
    <>
      <AnimatePresence>
        {isOpen ? (
          <>
            <motion.div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} {...backdropMotion} />

            <motion.div className="fixed inset-0 z-50" {...drawerMotion}>
              <div className="w-full h-full bg-white flex flex-col">
                <div className="flex-shrink-0 bg-white border-b border-neutral-100 px-7 py-4 flex items-center justify-between h-[56px]">
                  <h1 className="text-sm font-semibold text-neutral-900">Credenciales / {finalTitle}</h1>
                  <button
                    onClick={handleClose}
                    className="text-neutral-900 hover:text-neutral-700 transition-colors"
                    type="button"
                    aria-label="Cerrar"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">{children}</div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <CredentialModal
        open={showUnsavedModal}
        onClose={() => setShowUnsavedModal(false)}
        onConfirm={handleConfirmClose}
        variant="unsaved"
      />
    </>
  );
}
