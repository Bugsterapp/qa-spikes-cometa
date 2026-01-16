import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { sendTrackEvent } from '/src/utils/events';
import { TrackEvents } from '/src/constants/events';

/**
 * Hook to measure and track page load time via Segment
 * Measures navigation time between route changes
 */
export const usePageLoadTime = () => {
  const router = useRouter();
  const startTime = useRef<number>(0);

  useEffect(() => {
    const handleRouteChangeStart = () => {
      startTime.current = performance.now();
    };

    const handleRouteChangeComplete = (url: string) => {
      if (startTime.current > 0) {
        const loadTime = Math.round(performance.now() - startTime.current);

        sendTrackEvent(TrackEvents.performance.pageLoadTime, {
          page_path: url,
          page_name: document.title,
          load_time_ms: loadTime,
        });
        startTime.current = 0;
      }
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router]);
};
