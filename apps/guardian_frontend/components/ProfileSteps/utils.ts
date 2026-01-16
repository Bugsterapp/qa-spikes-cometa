export function formatBooleanField(
  value: boolean | null | undefined,
  labels = { true: 'Sí', false: 'No', undefined: '-' }
): string {
  if (value === undefined) {
    return labels.undefined;
  }
  return value ? labels.true : labels.false;
}
