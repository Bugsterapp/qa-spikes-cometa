export function buildObjectWithNonEmptyProps<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([_key, value]) => Boolean(value))) as Partial<T>;
}

function extractPageFromURL(url: string) {
  if (!url) return undefined;
  // Using localhost as base URL to parse relative URLs. Domain doesn't matter since we only need query params.
  const urlObj = new URL(url, 'http://localhost');
  const params = new URLSearchParams(urlObj.search);
  const page = params.get('page');
  return page;
}
export { extractPageFromURL };
