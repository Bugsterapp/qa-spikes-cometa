interface CurrencyLocale {
  [key: string]: string;
}

export interface CometaCurrency {
  string_value: string;
  int_value: number;
  coefficient: number;
}

/**
 * currencyLocale: Object with the currency code as key and the locale as value to be used in the Intl.NumberFormat
 * @type {Object}
 * @property {string} MXN - Mexican Peso
 */
export const currencyLocale: CurrencyLocale = {
  MXN: 'es-MX',
};

/**
 * getDivisor: Returns the divisor to be used in the toFloat function
 * @param {number} coefficient - The coefficient to be used in the divisor.
 * @returns {number} Divisor
 * @example
 * getDivisor(2) // returns 100
 * getDivisor(3) // returns 1000
 * */
const getDivisor = (coefficient: number): number => Math.pow(10, coefficient);

/**
 * toFloat: Converts an integer with two decimals to a float
 * @param {CometaCurrency | string} val - The value to be formatted. If it is a string it will be returned as is.
 * @returns {number} Float
 */
export const toFloat = (val: CometaCurrency | string): number | string => {
  if (!val) return 0;
  if (typeof val === 'string') return val;
  return val.int_value / getDivisor(val.coefficient);
};

/**
 * toInt: Converts a string to an integer with two decimals
 * @param {string | number} val
 * @returns {number} Integer with two decimals
 */
export const toInt = (val: string | number) => Number(val) * 100;

/**
 * It takes a number and a currency code and returns a string with the number formatted as a currency
 * @param {number} val - The number to be formatted.
 * @param {string} currency - The currency code to be used in the format.
 */
export const parseCurrency = (val: number | string, currency?: string) => {
  if (!val) return 0;
  if (typeof val === 'string') val = Number(val);
  if (!currency) return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2 }).format(val);
  return new Intl.NumberFormat(currencyLocale[currency], {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(val);
};
