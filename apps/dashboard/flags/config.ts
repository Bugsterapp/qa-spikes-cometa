import type { Configuration } from '@happykit/flags/config';

export type AppFlags = {
  test: boolean;
  concepts: boolean;
  optionals_payment: boolean;
  is_reims: boolean;
  mass_assign_concept: boolean;
  show_accounting_download: boolean;
  mass_assign_concept_filters: boolean;
  show_inscription: boolean;
  due_orders_new_endpoint: boolean;
  show_deassign_students: boolean;
  show_charge_efficiency: boolean;
  show_students_name_backwards: boolean;
  show_variants: boolean;
  show_personalized_reports: boolean;
  show_new_reports_payments: boolean;
  show_edit_prices: boolean;
  inscriptions: boolean;
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
    show_inscription: false,
    due_orders_new_endpoint: false,
    show_deassign_students: false,
    show_charge_efficiency: false,
    show_students_name_backwards: false,
    show_variants: false,
    show_personalized_reports: false,
    show_new_reports_payments: false,
    show_edit_prices: false,
    inscriptions: false,
  },
};
