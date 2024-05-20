export function buildObjectWithNonEmptyProps<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([_key, value]) => Boolean(value))) as Partial<T>;
}

function extractPageFromURL(url: string) {
  if (!url) return undefined;
  const urlObj = new URL(url); // Dummy base URL because the URL API expects absolute URLs
  const params = new URLSearchParams(urlObj.search);
  const page = params.get('page');
  return page;
}
export { extractPageFromURL };
