import React, { useEffect, useState } from 'react';

function useDebounce<TValue>(value: TValue, offset = 600) {
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
