import type { Configuration } from '@happykit/flags/config';

export type AppFlags = {
  cash_in: 'mercadopago' | 'kushki';
  credit_card: 'mercadopago' | 'kushki';
  bank_transfer: 'mercadopago' | 'kushki';
};

export const config: Configuration<AppFlags> = {
  envKey: process.env.NEXT_PUBLIC_FLAGS_ENV_KEY! as string,

  // You can provide defaults flag values here
  defaultFlags: {
    cash_in: 'kushki',
    credit_card: 'kushki',
    bank_transfer: 'kushki',
  },
};
