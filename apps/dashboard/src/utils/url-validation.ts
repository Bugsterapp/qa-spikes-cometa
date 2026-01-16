/**
 * URL validation utility that supports multiple URL formats:
 * - http://example.com
 * - https://example.com
 * - www.example.com
 * - example.com
 */

/**
 * Comprehensive URL regex that matches:
 * 1. URLs with http:// or https:// protocol
 * 2. URLs with www. prefix (no protocol)
 * 3. Domain names without www. or protocol
 *
 * Pattern breakdown:
 * - ^(https?:\/\/)? - Optional http:// or https://
 * - (www\.)? - Optional www.
 * - ([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,} - Domain with at least one dot and valid TLD
 * - (:[0-9]{1,5})? - Optional port number
 * - (\/[^\s]*)? - Optional path
 * - $ - End of string
 */
const URL_REGEX = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:[0-9]{1,5})?(\/[^\s]*)?$/;

/**
 * Validates if a string is a valid URL in any of the supported formats
 * @param url - The URL string to validate
 * @returns boolean - True if valid, false otherwise
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Trim whitespace
  const trimmedUrl = url.trim();

  // Check if it matches our regex pattern
  if (!URL_REGEX.test(trimmedUrl)) {
    return false;
  }

  // Additional validation: try to create a URL object for more complete validation
  // If no protocol is provided, we'll add https:// for validation purposes
  try {
    let urlForValidation = trimmedUrl;

    // Add protocol if missing for URL constructor validation
    if (!trimmedUrl.match(/^https?:\/\//)) {
      urlForValidation = `https://${trimmedUrl}`;
    }

    const urlObject = new URL(urlForValidation);

    // Ensure the hostname is valid (has at least one dot for domain)
    return urlObject.hostname.includes('.');
  } catch {
    return false;
  }
}

/**
 * Normalizes a URL by adding https:// protocol if missing
 * @param url - The URL to normalize
 * @returns string - The normalized URL with protocol
 */
export function normalizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return url;
  }

  const trimmedUrl = url.trim();

  // If it already has a protocol, return as is
  if (trimmedUrl.match(/^https?:\/\//)) {
    return trimmedUrl;
  }

  // Add https:// prefix
  return `https://${trimmedUrl}`;
}
