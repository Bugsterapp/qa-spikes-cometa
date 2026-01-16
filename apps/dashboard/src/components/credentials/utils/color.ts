export function lightenColor(color: string, amount = 0.25): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const newR = Math.round(r * (1 - amount) + 255 * amount);
  const newG = Math.round(g * (1 - amount) + 255 * amount);
  const newB = Math.round(b * (1 - amount) + 255 * amount);

  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}
