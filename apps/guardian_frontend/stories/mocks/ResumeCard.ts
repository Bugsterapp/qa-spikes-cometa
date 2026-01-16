import { TOrderPortal } from '@cometa/hooks';
import { TaxingSystemEnum, TaxingTypeEnum } from '@cometa/trpc';
import { DependantErrorRFC } from '~/contexts/VerifyRFCContext';
import { Color } from '~/utils/colors';

type DependantColor = DependantErrorRFC & Color;

const BaseMock = {
  id: 'b59dd0e4-2133-452f-8ef9-057a53c7e237',
  identifier: 'XXXX170929MNLRLP00',
  enrollment_code: '123466',
  first_name: 'YADIRA',
  last_name: 'JARA ESQUIVEL',
  section: '7 A',
  billing_guardian: {
    id: '3d9253c7-e31f-42cd-b77e-7979b0507ade',
    first_name: 'HOMERO ALEJANDRO',
    last_name: 'JARA SOSA',
    email: '5test@getcometa.com',
    billing_name: 'ESCUELA KEMPER URGATE',
  },
  guardians: [
    {
      id: '3d9253c7-e31f-42cd-b77e-7979b0507ade',
      first_name: 'HOMERO ALEJANDRO',
      last_name: 'JARA SOSA',
      email: '5test@getcometa.com',
      phone: '+584128222487',
      tax_id: 'EKU9003173C9',
      billing_name: 'ESCUELA KEMPER URGATE',
      billing_info: {
        tax_id: 'EKU9003173C9',
        billing_name: 'ESCUELA KEMPER URGATE',
        billable_dependents: [
          {
            id: 'b59dd0e4-2133-452f-8ef9-057a53c7e237',
            first_name: 'YADIRA',
            last_name: 'JARA ESQUIVEL',
            enrollment_code: '123466',
            level: 'Secundaria',
            section: '7 A',
          },
        ],
        taxing_system: TaxingSystemEnum.Value601,
        postal_code: '26015',
        address_name: '',
        address_number: '',
        address_complement: null,
        district: '',
        city: '',
        state: '',
        cfdi_config: undefined,
        taxing_type: TaxingTypeEnum.M,
      },
      validRFC: true,
    },
  ],
  is_ready: false,
  errorRFC: false,
  color: {
    text: 'rgba(202, 50, 205, 1)',
    background: 'rgba(230, 114, 233, 0.29)',
  },
};

const SubscriptionItemsResume = [
  {
    id: 'b59dd0e4-2133-452f-8ef9-057a53c7e237',
    concept_name: 'Colegiatura Secundaria',
  },
  {
    id: 'b59dd0e4-2133-452f-8ef9-057a53c7e237',
    concept_name: 'Colegiatura Preparatoria',
  },
  {
    id: 'b59dd0e4-2133-452f-8ef9-057a53c7e237',
    concept_name: 'Material',
  },
];

const OrderItemsResume: TOrderPortal[] = [
  {
    id: 'cd0cae74-f912-4cb3-b0d5-ead8a109d6bd',
    order_id: '2b0fd019-d269-4923-a344-fb51e391451f',
    payins: [],
    concept: {
      type: 'MONTHLY_FEE',
      is_billable: true,
      payment_only_in_dashboard: false,
      optional: false,
    },
    subscription: {
      id: 'd6b2d51f-73b2-42ad-bc9f-c9ed92dde667',
      next_payment_date: '2024-05-10',
      payment_has_failed: false,
    },
    student: {
      id: '2f2049d0-1371-4497-8ad7-edd53919c182',
      first_name: 'YADIRA',
    },
    special_over_charges: [],
    currency: 'MXN',
    amount: '5125.00',
    price: '5125.00',
    final_amount: '4193.75',
    pending_amount: '4193.75',
    interest: '0.00',
    total_overcharged: '0.00',
    discount_breakdown: {
      total: 931.25,
      details: {
        special: null,
        early_bird: null,
        scholarships: {
          total: 931.25,
          details: [
            {
              id: '2c0d677c-9de6-488a-9aea-dbd3fcf8e3e7',
              name: 'Beca $ 931.25',
              active: true,
              discount: 931.25,
            },
          ],
        },
      },
    },
    has_partial_payins: false,
    status: 'NOT_PAID',
    is_due: true,
    name: 'Colegiatura Primaria Opción A - Abril, 2024',
    due: '2024-04-10',
    order_type: 'due',
    paid_fulfillments_required_proxy: [],
    fulfillments_dependent_proxy: ['fab53fc5-f2f2-44af-acd3-6e7b09f27477'],
  },
  {
    id: 'fab53fc5-f2f2-44af-acd3-6e7b09f27477',
    order_id: 'd6b2d51f-73b2-42ad-bc9f-c9ed92dde667',
    payins: [],
    concept: {
      type: 'MONTHLY_FEE',
      is_billable: true,
      payment_only_in_dashboard: false,
      optional: false,
    },
    subscription: {
      id: 'd6b2d51f-73b2-42ad-bc9f-c9ed92dde667',
      next_payment_date: '2024-05-10',
      payment_has_failed: false,
    },
    student: {
      id: '2f2049d0-1371-4497-8ad7-edd53919c182',
      first_name: 'YADIRA',
    },
    special_over_charges: [],
    currency: 'MXN',
    amount: '5125.00',
    price: '5125.00',
    final_amount: '4193.75',
    pending_amount: '4193.75',
    interest: '0.00',
    total_overcharged: '0.00',
    discount_breakdown: {
      total: 931.25,
      details: {
        special: null,
        early_bird: null,
        scholarships: {
          total: 931.25,
          details: [
            {
              id: '2c0d677c-9de6-488a-9aea-dbd3fcf8e3e7',
              name: 'Beca $ 931.25',
              active: true,
              discount: 931.25,
            },
          ],
        },
      },
    },
    has_partial_payins: false,
    status: 'NOT_PAID',
    is_due: true,
    name: 'Colegiatura Primaria Opción A - Mayo, 2024',
    due: '2024-05-10',
    order_type: 'due',
    paid_fulfillments_required_proxy: ['cd0cae74-f912-4cb3-b0d5-ead8a109d6bd'],
    fulfillments_dependent_proxy: ['921cae1d-6d30-4b98-a07d-abbd280494f1'],
  },
  {
    id: '921cae1d-6d30-4b98-a07d-abbd280494f1',
    order_id: 'a30f5f00-b562-452e-ba3b-b1e09110971a',
    payins: [],
    concept: {
      type: 'MONTHLY_FEE',
      is_billable: true,
      payment_only_in_dashboard: false,
      optional: false,
    },
    subscription: {
      id: 'd6b2d51f-73b2-42ad-bc9f-c9ed92dde667',
      next_payment_date: '2024-05-10',
      payment_has_failed: false,
    },
    student: {
      id: '2f2049d0-1371-4497-8ad7-edd53919c182',
      first_name: 'YADIRA',
    },
    special_over_charges: [],
    currency: 'MXN',
    amount: '5125.00',
    price: '5125.00',
    final_amount: '4193.75',
    pending_amount: '4193.75',
    interest: '0.00',
    total_overcharged: '0.00',
    discount_breakdown: {
      total: 931.25,
      details: {
        special: null,
        early_bird: null,
        scholarships: {
          total: 931.25,
          details: [
            {
              id: '2c0d677c-9de6-488a-9aea-dbd3fcf8e3e7',
              name: 'Beca $ 931.25',
              active: true,
              discount: 931.25,
            },
          ],
        },
      },
    },
    has_partial_payins: false,
    status: 'NOT_PAID',
    is_due: true,
    name: 'Colegiatura Primaria Opción A - Junio, 2024',
    due: '2024-06-10',
    order_type: 'due',
    paid_fulfillments_required_proxy: ['fab53fc5-f2f2-44af-acd3-6e7b09f27477'],
    fulfillments_dependent_proxy: [],
  },
];

export const OrderItemsResumeMock = (props: typeof OrderItemsResume) => [...OrderItemsResume, ...props];

export const CartItemsMock = [
  {
    id: '921cae1d-6d30-4b98-a07d-abbd280494f1',
    order: 'a30f5f00-b562-452e-ba3b-b1e09110971a',
    student: '2f2049d0-1371-4497-8ad7-edd53919c182',
  },
  {
    id: 'fab53fc5-f2f2-44af-acd3-6e7b09f27477',
    order: 'd6b2d51f-73b2-42ad-bc9f-c9ed92dde667',
    student: '2f2049d0-1371-4497-8ad7-edd53919c182',
  },
  {
    id: 'cd0cae74-f912-4cb3-b0d5-ead8a109d6bd',
    order: '2b0fd019-d269-4923-a344-fb51e391451f',
    student: '2f2049d0-1371-4497-8ad7-edd53919c182',
  },
];

export const SubscriptionItemsResumeMock = (props: typeof SubscriptionItemsResume) => [
  ...SubscriptionItemsResume,
  ...props,
];

export const DependentMock = (props: Partial<typeof BaseMock>) =>
  ({ ...BaseMock, ...props } as unknown as DependantColor);

export const DependentWithColorMock = (props: Partial<typeof BaseMock>) =>
  ({ ...BaseMock, ...props } as unknown as DependantErrorRFC & Color);
