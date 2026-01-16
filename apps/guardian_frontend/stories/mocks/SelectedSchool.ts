import { School } from '@cometa/trpc';

const BaseMock = {
  config_dashboard: {
    emit_invoice_time: null,
    edit_student_portal: true,
    invoice_penalty_iva: false,
    invoice_penalty_option: 'same_item',
    student_edit_onboarding: true,
    enable_manual_pay_invoice: true,
    payment_only_in_dashboard: false,
    default_manual_pay_invoice: false,
    display_inscriptions_status: true,
    partial_payins_payment_portal: true,
    student_identifier_is_required: false,
    use_kushki_sandbox: false,
  },
  config_portal: {
    enable_edit_guardian: false,
  },
  preferences: {
    credit: {
      methods: ['visa', 'mastercard', 'american-express', 'diners-club'],
      is_active: true,
    },
    cash_ticket: {
      is_active: true,
    },
    bank_transfer: {
      is_active: true,
    },
    crediko: {
      is_active: true,
    },
  },
  name: 'Altus Demo School',
  does_invoice: true,
  id: '3f319feb-5ebd-463f-ae8f-d89b138b94c6',
  is_provider: true,
  gateway_credentials: {
    public_merchant_id: 'b1aaf79fe1764fe4b4243d857186b8e1',
  },
};

export const SelectedSchoolMock = (props: Partial<typeof BaseMock>) => ({ ...BaseMock, ...props } as unknown as School);
