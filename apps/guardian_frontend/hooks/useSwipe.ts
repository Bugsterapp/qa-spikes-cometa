import { useEffect, useRef } from 'react';

interface SwipeCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

interface SwipeOptions {
  minSwipeDistance?: number;
  maxSwipeTime?: number;
}

/**
 * Hook to detect swipe gestures on a DOM element
 * @param callbacks - Functions to call on swipe left/right
 * @param options - Configuration for swipe detection
 * @returns ref - Ref to attach to the element you want to detect swipes on
 */
export function useSwipe<T extends HTMLElement = HTMLElement>(callbacks: SwipeCallbacks, options: SwipeOptions = {}) {
  const { onSwipeLeft, onSwipeRight } = callbacks;
  const { minSwipeDistance = 50, maxSwipeTime = 500 } = options;

  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      touchStartTime.current = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndTime = Date.now();

      const deltaX = touchEndX - touchStartX.current;
      const deltaY = touchEndY - touchStartY.current;
      const deltaTime = touchEndTime - touchStartTime.current;

      // Check if swipe was fast enough
      if (deltaTime > maxSwipeTime) return;

      // Check if horizontal swipe was longer than vertical (to avoid interfering with scrolling)
      if (Math.abs(deltaX) < Math.abs(deltaY)) return;

      // Check if swipe distance was sufficient
      if (Math.abs(deltaX) < minSwipeDistance) return;

      // Determine swipe direction
      if (deltaX > 0) {
        // Swipe right
        onSwipeRight?.();
      } else {
        // Swipe left
        onSwipeLeft?.();
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, minSwipeDistance, maxSwipeTime]);

  return elementRef;
}
