import { lightenColor } from './utils/color';
import { format, addYears } from 'date-fns';
import { CredentialTemplateType } from '@cometa/trpc/src/students/types';

const DEFAULT_VALIDITY_DATE = format(addYears(new Date(), 1), 'dd/MM/yyyy');

export const CREDENTIAL_DIMENSIONS = {
  portrait: {
    width: 356,
    height: 512,
  },
  landscape: {
    width: 512,
    height: 356,
  },
} as const;

export type CredentialOrientation = 'portrait' | 'landscape';

export type CredentialSide = 'front' | 'back';

export const CREDENTIAL_SIDE = {
  FRONT: 'front',
  BACK: 'back',
} as const;

export type BaseFieldConfig = {
  show: boolean;
  color: string;
  editable: boolean;
  value?: string;
};

export type FrontFieldConfig = BaseFieldConfig;

export type BackFieldConfig = BaseFieldConfig & {
  file_id?: string;
};

export type CredentialConfig = {
  templateName: string;
  type: CredentialTemplateType;
  orientation: CredentialOrientation;
  color_scheme: {
    background: {
      primary: string;
      secondary: string;
    };
    text_color: string;
  };
  front_fields: {
    name: FrontFieldConfig;
    last_name: FrontFieldConfig;
    level: FrontFieldConfig;
    cct_identifier: FrontFieldConfig;
    grade: FrontFieldConfig;
    enrollment_code: FrontFieldConfig;
    identifier: FrontFieldConfig;
    school_cycle: FrontFieldConfig;
    expires_at: FrontFieldConfig;
  };
  back_fields: {
    free_text: BackFieldConfig;
    signature: BackFieldConfig;
    digital_seal: BackFieldConfig;
  };
};

const PRIMARY_COLOR = '#004c4c';

export const DEFAULT_CREDENTIAL_CONFIG: CredentialConfig = {
  templateName: '',
  type: CredentialTemplateType.Student,
  orientation: 'portrait',
  color_scheme: {
    background: {
      primary: PRIMARY_COLOR,
      secondary: lightenColor(PRIMARY_COLOR, 0.25),
    },
    text_color: '#FFFFFF',
  },
  front_fields: {
    name: { show: true, color: '#FFFFFF', editable: false },
    last_name: { show: true, color: '#FFFFFF', editable: false },
    level: { show: true, color: '#FFFFFF', editable: true },
    cct_identifier: { show: false, color: '#FFFFFF', editable: false },
    grade: { show: true, color: '#FFFFFF', editable: true },
    enrollment_code: { show: true, color: '#FFFFFF', editable: true },
    identifier: { show: true, color: '#FFFFFF', editable: true },
    school_cycle: { show: true, color: '#FFFFFF', editable: true },
    expires_at: { show: true, color: '#FFFFFF', editable: true, value: DEFAULT_VALIDITY_DATE },
  },
  back_fields: {
    free_text: { show: true, color: '#000000', editable: true, value: '' },
    signature: { show: true, color: '#000000', editable: true, file_id: '' },
    digital_seal: { show: true, color: '#000000', editable: true, file_id: '' },
  },
};

export const CREDENTIAL_FIELD_LABELS = {
  name: 'Nombre del estudiante',
  last_name: 'Apellido del estudiante',
  level: 'Nivel',
  cct_identifier: 'CCT',
  grade: 'Grado',
  enrollment_code: 'Matrícula',
  identifier: 'CURP',
  school_cycle: 'Ciclo',
  expires_at: 'Vigencia',
  free_text: 'Campo libre de texto',
  signature: 'Firma digital',
  digital_seal: 'Sello digital',
};

export type StudentData = {
  name: string;
  lastName: string;
  photo: string;
  level: string;
  cct: string;
  grade: string;
  enrollment: string;
  curp: string;
  cycle: string;
  expires_at?: string;
};

export type SchoolData = {
  name: string;
  logo: string;
};

export const SAMPLE_STUDENT_DATA: StudentData = {
  name: 'Diego Sebastian',
  lastName: 'Medina de la Fuente',
  photo: '/assets/avatar.jpg',
  level: 'Primaria',
  cct: 'AS213123123',
  grade: '1A',
  enrollment: '5431234',
  curp: '5431234',
  cycle: '2026',
  expires_at: DEFAULT_VALIDITY_DATE,
};

export const SAMPLE_SCHOOL_DATA: SchoolData = {
  name: 'Colegio Nuestra Maria señora del Pilar de México',
  logo: '/assets/cometa-logo.svg',
};
