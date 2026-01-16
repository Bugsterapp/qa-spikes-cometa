'use client';

import React from 'react';
import { FileMetadata } from '@cometa/trpc/src/announcements/types';
import * as Carousel from '~/app/components/carousel';
import { motion, AnimatePresence } from 'framer-motion';

interface SlideshowProps {
  images: FileMetadata[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export default function Slideshow({ images, isOpen, onClose, initialIndex = 0 }: SlideshowProps) {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.3,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleOverlayClick}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -10 }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
              mass: 0.8,
              restDelta: 0.001,
            }}
            className="relative flex flex-col items-center justify-center w-full h-full px-5 max-w-md"
            onClick={handleOverlayClick}
          >
            <Carousel.Carousel
              className="w-full flex items-center justify-center"
              opts={{ align: 'center', startIndex: initialIndex }}
            >
              <Carousel.CarouselContent className="h-full items-center -ml-4">
                {images.map((image, index) => (
                  <Carousel.CarouselItem
                    key={image.name}
                    className="h-full flex items-center justify-center pl-4 basis-[90%]"
                  >
                    <motion.img
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: index * 0.1,
                        duration: 0.4,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      src={image.url}
                      alt={image.name}
                      className="max-w-full max-h-[300px] object-contain rounded-[20px]"
                    />
                  </Carousel.CarouselItem>
                ))}
              </Carousel.CarouselContent>
            </Carousel.Carousel>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
