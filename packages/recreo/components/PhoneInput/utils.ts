import type { CountryCode } from 'libphonenumber-js';

export function trimString(str: string, maxLength: number) {
  return str.length > maxLength ? str.substring(0, maxLength) : str;
}

export function getCountryFlag(code: CountryCode) {
  return `/countries/${code}.svg`;
}
