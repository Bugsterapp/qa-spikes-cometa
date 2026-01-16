export function capitalize(value: string): string {
  return value
    ? value
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : value;
}
