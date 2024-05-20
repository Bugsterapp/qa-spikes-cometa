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

export const SubscriptionItemsResumeMock = (props: typeof SubscriptionItemsResume) => [
  ...SubscriptionItemsResume,
  ...props,
];

export const DependentMock = (props: Partial<typeof BaseMock>) =>
  ({ ...BaseMock, ...props } as unknown as DependantColor);

export const DependentWithColorMock = (props: Partial<typeof BaseMock>) =>
  ({ ...BaseMock, ...props } as unknown as DependantErrorRFC & Color);
