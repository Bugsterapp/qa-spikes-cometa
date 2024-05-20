import { useEffect, useRef, useState } from 'react';

export const useAdjustHeight = (initialHeight: number) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState(initialHeight);

  useEffect(() => {
    let lastHeight = 0;
    let resizeObserver: ResizeObserver | null = null;

    const adjustHeight = () => {
      const wrapperHeight = wrapperRef.current?.offsetHeight || 0;
      const siblingHeight = headerRef.current?.offsetHeight || 0;
      const newHeight = wrapperHeight - siblingHeight;

      if (newHeight !== lastHeight) {
        setMaxHeight(newHeight);
        lastHeight = newHeight;
      }
    };

    const observeChanges = () => {
      adjustHeight();
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === headerRef.current && entry.contentRect.height !== lastHeight) {
            adjustHeight();
          }
        }
      });

      if (headerRef.current) {
        resizeObserver.observe(headerRef.current);
      }
    };

    const intervalId = setInterval(observeChanges, 500);

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      clearInterval(intervalId);
    };
  }, []);

  return { wrapperRef, headerRef, maxHeight };
};
