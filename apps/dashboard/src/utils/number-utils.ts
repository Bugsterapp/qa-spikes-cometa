export const formatPercentage = (value: number | string): string => {
  const num = Number(value);
  const rounded = Math.round(num * 100) / 100;

  if (rounded % 1 === 0) {
    return `${rounded}%`;
  }

  return `${rounded.toFixed(2)}%`;
};
