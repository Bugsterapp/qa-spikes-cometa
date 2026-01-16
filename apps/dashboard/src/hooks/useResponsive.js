import { useState, useEffect } from 'react';

// Tailwind / Material UI breakpoints mapping
// Material UI default breakpoints: xs=0, sm=600, md=900, lg=1200, xl=1536
// Tailwind default breakpoints: sm=640, md=768, lg=1024, xl=1280, 2xl=1536
// Using Material UI breakpoints for compatibility
const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

// Custom hook to replace MUI's useMediaQuery
function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // Set initial value
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    // Create listener
    const listener = () => setMatches(media.matches);

    // Add listener
    media.addEventListener('change', listener);

    // Cleanup
    return () => media.removeEventListener('change', listener);
  }, [query, matches]);

  return matches;
}

// ----------------------------------------------------------------------

export default function useResponsive(query, key, start, end) {
  // Generate media query strings based on breakpoints
  const getMediaQuery = (type, breakpointKey, startKey, endKey) => {
    switch (type) {
      case 'up':
        return `(min-width: ${breakpoints[breakpointKey]}px)`;
      case 'down':
        // Material UI's down means "less than the breakpoint" (exclusive)
        return `(max-width: ${breakpoints[breakpointKey] - 0.05}px)`;
      case 'between':
        return `(min-width: ${breakpoints[startKey]}px) and (max-width: ${breakpoints[endKey] - 0.05}px)`;
      case 'only': {
        // 'only' means between this breakpoint and the next one
        const breakpointKeys = Object.keys(breakpoints);
        const currentIndex = breakpointKeys.indexOf(breakpointKey);
        const nextKey = breakpointKeys[currentIndex + 1];

        if (nextKey) {
          return `(min-width: ${breakpoints[breakpointKey]}px) and (max-width: ${breakpoints[nextKey] - 0.05}px)`;
        }
        // For the last breakpoint, just use min-width
        return `(min-width: ${breakpoints[breakpointKey]}px)`;
      }
      default:
        return '';
    }
  };

  const mediaUp = useMediaQuery(getMediaQuery('up', key));
  const mediaDown = useMediaQuery(getMediaQuery('down', key));
  const mediaBetween = useMediaQuery(getMediaQuery('between', key, start, end));
  const mediaOnly = useMediaQuery(getMediaQuery('only', key));

  if (query === 'up') {
    return mediaUp;
  }

  if (query === 'down') {
    return mediaDown;
  }

  if (query === 'between') {
    return mediaBetween;
  }

  if (query === 'only') {
    return mediaOnly;
  }
}
