export function buildObjectWithNonEmptyProps<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([_key, value]) => Boolean(value))) as Partial<T>;
}
