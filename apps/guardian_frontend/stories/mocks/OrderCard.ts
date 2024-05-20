import { GuardianDependentFulfillment } from '@cometa/trpc';

const BaseMock = {
  id: '9b1c7dce-be0f-4bfa-8f5c-28fee2220d6d',
  name: 'Colegiatura Primaria 23-24 - Febrero, 2024',
  amount: '2300.00',
  final_amount: '2530.00',
  paid_amount: '0',
  currency: 'MXN',
  due: '2024-02-10',
  status: 'WAITING_PAID',
  interest: '230.00',
  total_charge: '230.00',
  discount: '0.00',
  pending: true,
  student: {
    id: 'c830e847-9dc6-4824-8450-a01ac6dd6d8f',
    first_name: 'Juana',
    last_name: 'Posada Miranda',
    enrollment_code: 'VME27',
    level: 'Primaria',
    section: '1 A',
  },
  has_partial_payins: false,
  pending_amount: '2530.00',
  order_id: 'b637efbb-238d-4fc9-9d75-e19e37197910',
  is_due: true,
  paid_fulfillments_required_proxy: [],
  fulfillments_dependent_proxy: ['d709ae7c-a717-417e-89fa-7c010611c5c3'],
  fulfillments_dependent: [
    'd709ae7c-a717-417e-89fa-7c010611c5c3',
    '0a904024-633f-4bdc-9ba9-320d9a71a5e0',
    'dbd9f97c-c753-47f0-aadf-aae08c2e97ec',
    '3b7a01ec-2cee-45fd-a361-a66f548cf6b5',
    'a5b4c1f9-6cce-4968-b12c-d7ed2eb21c6d',
  ],
  is_billable: true,
  special_over_charges: [],
  payins: [
    {
      id: '1888da51-5842-4acd-b4fa-7be31707f103',
      status: 'pending',
      type: 'ticket',
      method: 'KUSHKI',
      guardian: {
        id: '0a50a836-4df4-4e75-b9c7-dccd2421e7c3',
        first_name: 'Esperanza',
        last_name: 'Abreu',
        email: 'silvano66@example.com',
        dependents_count: 1,
        phone: '+527258504744',
      },
      guardian_fullname: 'Esperanza Abreu',
      total: '7130.00',
      transaction: {
        id: 'ed3b5564-b428-47df-b13f-c4a8d38e8835',
        service: 'KUSHKI',
        identifier: '65b29cc2-1916-46ef-93c8-b43cd5d20f48',
        status: 200,
        details: {
          pdf: ['https://api-uat.kushkipagos.com/cash/v1/charges/2308462115351492/receipt'],
          pin: '1428260600020',
          pins: [
            {
              pin: '1428260600020',
              processorName: 'RedEfectiva',
            },
          ],
          payin: '1888da51-5842-4acd-b4fa-7be31707f103',
          pdfUrl: 'https://api-uat.kushkipagos.com/cash/v1/charges/2308462115351492/receipt',
          barCodeUrl: 'https://api-uat.kushkipagos.com/cash/v1/charges/2308462115351492/barcode',
          ticketNumber: '2308462115351492',
          getPinBarCode: '(14)282606(00)020',
          preference_type: 'ticket',
          agreementDetails: [
            {
              walmart: [
                {
                  processorName: 'RedEfectiva',
                  agreementNumber: 'servicio_198',
                },
              ],
            },
            {
              samsclub: [
                {
                  processorName: 'RedEfectiva',
                  agreementNumber: 'servicio_198',
                },
              ],
            },
            {
              bodegaaurrera: [
                {
                  processorName: 'RedEfectiva',
                  agreementNumber: 'servicio_198',
                },
              ],
            },
            {
              soriana: [
                {
                  processorName: 'RedEfectiva',
                  agreementNumber: 'servicio_paycash',
                },
              ],
            },
            {
              eleven: [
                {
                  processorName: 'RedEfectiva',
                  agreementNumber: 'servicio_paycash',
                },
              ],
            },
            {
              bbva: [
                {
                  processorName: 'RedEfectiva',
                  agreementNumber: 'cie_1420712',
                },
              ],
            },
            {
              banorte: [
                {
                  processorName: 'RedEfectiva',
                  agreementNumber: 'convenio_3724',
                },
              ],
            },
            {
              roma: [
                {
                  processorName: 'RedEfectiva',
                  agreementNumber: 'servicio_paycash',
                },
              ],
            },
          ],
          transactionReference: '65b29cc2-1916-46ef-93c8-b43cd5d20f48',
        },
      },
      total_currency: 'MXN',
      is_partial: false,
      correlative_id: 'VMEG00001473',
      created: '2024-02-20T14:48:43-0600',
      modified: '2024-02-20T14:48:43-0600',
      paid_date: null,
      total_paid: '7130.00',
      created_by_fullname: null,
      collected_at: 'collected_at_portal',
      invoices: [],
    },
  ],
  price: '2300.00',
  discount_breakdown: {
    total: 0,
    details: {
      special: null,
      early_bird: null,
      scholarships: null,
    },
  },
  concept: {
    id: '88932734-812c-438a-9171-5014422fe857',
    name: 'Colegiatura Primaria 23-24',
    type: 'MONTHLY_FEE',
    payment_only_in_dashboard: false,
    optional: 'False',
    subscription: 'True',
    is_billable: true,
  },
  invoices: [],
  order_type: 'due',
  guardian_commission: '0.00',
};

export const OrderCardMock = (props: Partial<typeof BaseMock>) =>
  // Cast due to inconsistency with backend types
  ({ ...BaseMock, ...props } as unknown as GuardianDependentFulfillment);
