import React, { useEffect, useState } from 'react';

export interface UseDebounceProps {
  value: string;
  offset?: number;
}

function useDebounce<T>(value: T, offset = 600): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timeOutRef = setTimeout(() => {
      setDebouncedValue(value);
    }, offset);
    return () => {
      clearTimeout(timeOutRef);
    };
  }, [value, offset]);
  return debouncedValue;
}

export default useDebounce;
