import type { Configuration } from '@happykit/flags/config';

export type AppFlags = {
  test: boolean;
  concepts: boolean;
  optionals_payment: boolean;
  is_reims: boolean;
  mass_assign_concept: boolean;
  show_accounting_download: boolean;
  mass_assign_concept_filters: boolean;
};

export const config: Configuration<AppFlags> = {
  envKey: process.env.NEXT_PUBLIC_FLAGS_ENV_KEY as string,

  // You can provide defaults flag values here
  defaultFlags: {
    test: false,
    concepts: false,
    optionals_payment: false,
    is_reims: false,
    mass_assign_concept: false,
    show_accounting_download: false,
    mass_assign_concept_filters: false,
  },
};
