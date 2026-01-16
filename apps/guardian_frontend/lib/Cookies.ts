import _Cookies from 'js-cookie';
import * as Sentry from '@sentry/nextjs';

interface CookiesTypes {
  FULLFILMENT_VALUES: {
    subtotal: number;
    commission: number;
    total: number;
    commissionPercentage: number;
  };
  COMMISSION_VALUES: { order: string; student: string }[];
  PAYMENT_RETRY: Record<string, number>;
}

enum CookiesKeys {
  FULLFILMENT_VALUES = 'FULLFILMENT_VALUES',
  COMMISSION_VALUES = 'COMMISSION_VALUES',
  PAYMENT_RETRY = 'PAYMENT_RETRY',
}

const CaptureCookiesException = <T = unknown>(cookiesFn: T): T | void => {
  try {
    return cookiesFn;
  } catch (err) {
    Sentry.captureException(err);
    return void 0;
  }
};

const Cookies = {
  set: (key: keyof typeof CookiesKeys, value: unknown, options?: _Cookies.CookieAttributes) =>
    CaptureCookiesException(_Cookies.set(CookiesKeys[key], JSON.stringify(value), { sameSite: 'strict', ...options })),
  get: <T extends keyof typeof CookiesKeys>(key: T): CookiesTypes[T] | null =>
    CaptureCookiesException(JSON.parse(_Cookies.get(CookiesKeys[key]) || 'null')),
  delete: <T extends keyof typeof CookiesKeys>(key: T): void => CaptureCookiesException(_Cookies.remove(key)),
  test: <T extends keyof typeof CookiesKeys>(key: T) => _Cookies.get(CookiesKeys[key]),
};

export default Cookies;
