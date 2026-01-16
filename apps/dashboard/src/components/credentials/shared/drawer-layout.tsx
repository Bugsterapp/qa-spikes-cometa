'use client';

import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';

type DrawerLayoutProps = {
  children: React.ReactNode;
  title: string;
  onClose: () => void;
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

export function DrawerLayout({ children, title, onClose }: DrawerLayoutProps) {
  useEffect(() => {
    const scrollY = window.scrollY;

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} {...backdropMotion} />

      <motion.div className="fixed inset-0 z-50" {...drawerMotion}>
        <div className="w-full h-full bg-white flex flex-col">
          <div className="flex-shrink-0 bg-white border-b border-neutral-100 px-7 py-4 flex items-center justify-between h-[56px]">
            <h1 className="text-sm font-semibold text-neutral-900">{title}</h1>
            <button
              onClick={onClose}
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
    </AnimatePresence>
  );
}
