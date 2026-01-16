import { PATH_PORTAL } from '../routes/paths';
import { OnboardingTaskId } from '@cometa/trpc/src/bot/types';

export type OnboardingTaskConfig = {
  id: OnboardingTaskId;
  title: string;
  description?: string;
  path?: string;
  navItemKey?: string;
  requiredMemberships?: readonly string[];
  requiredPermissions?: readonly string[];
  disabledReason?: string;
};

export type OnboardingSegmentConfig = {
  id: string;
  title: string;
  tasks: OnboardingTaskConfig[];
};

const DISABLED_REASONS = {
  DIRECTORS_ONLY: 'Solo los directores y propietarios pueden completar esta información',
  NO_STUDENT_PERMISSION: 'No tienes permiso para gestionar estudiantes',
  NO_CONCEPT_PERMISSION: 'No tienes permiso para crear conceptos',
  NO_CONCEPT_ASSIGNMENT_PERMISSION: 'No tienes permiso para asignar conceptos',
  NO_SCHOLARSHIP_PERMISSION: 'No tienes permiso para crear becas',
  NO_SCHOLARSHIP_ASSIGNMENT_PERMISSION: 'No tienes permiso para asignar becas',
} as const;

const REQUIRED_MEMBERSHIPS = {
  DIRECTORS: ['OWNER', 'GENERAL_DIRECTOR', 'ADMINISTRATIVE_DIRECTOR'],
} as const;

const REQUIRED_PERMISSIONS = {
  STUDENT_MANAGEMENT: ['can_add_student', 'can_edit_student'],
  CONCEPT_CREATION: ['can_add_concept'],
  CONCEPT_ASSIGNMENT: ['can_add_concept_assignment', 'can_edit_concept_assignment'],
  SCHOLARSHIP_MANAGEMENT: ['can_assign_scholarship'],
} as const;

export const ONBOARDING_TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  IN_REVIEW: 'in-review',
  ERROR: 'error',
} as const;

export const ONBOARDING_SEGMENTS_CONFIG: OnboardingSegmentConfig[] = [
  {
    id: 'documentation',
    title: 'Documentación',
    tasks: [
      {
        id: OnboardingTaskId.BankAccounts,
        title: 'Cuentas bancarias',
        description: 'Establece cuentas específicas para tus ingresos.',
        path: PATH_PORTAL.bankAccounts.root,
        navItemKey: 'bankAccounts',
        requiredMemberships: REQUIRED_MEMBERSHIPS.DIRECTORS,
        disabledReason: DISABLED_REASONS.DIRECTORS_ONLY,
      },
      {
        id: OnboardingTaskId.FiscalEntities,
        title: 'Entidades fiscales',
        description: 'Configura tus entidades fiscales.',
        path: PATH_PORTAL.fiscalEntities.root,
        navItemKey: 'fiscalEntities',
        requiredMemberships: REQUIRED_MEMBERSHIPS.DIRECTORS,
        disabledReason: DISABLED_REASONS.DIRECTORS_ONLY,
      },
      {
        id: OnboardingTaskId.Legal,
        title: 'Legales',
        description: 'Gestiona la documentación legal vinculada a tu colegio.',
        path: PATH_PORTAL.legalDocuments.root,
        navItemKey: 'legalDocuments',
        requiredMemberships: REQUIRED_MEMBERSHIPS.DIRECTORS,
        disabledReason: DISABLED_REASONS.DIRECTORS_ONLY,
      },
      {
        id: OnboardingTaskId.Invoicing,
        title: 'Facturación',
        description: 'Configura y gestiona tus datos de facturación.',
        path: PATH_PORTAL.invoicing.root,
        navItemKey: 'invoicing',
        requiredMemberships: REQUIRED_MEMBERSHIPS.DIRECTORS,
        disabledReason: DISABLED_REASONS.DIRECTORS_ONLY,
      },
      {
        id: OnboardingTaskId.DiscountsSurcharges,
        title: 'Configuración de descuentos y recargos',
        description: 'Configura descuentos y recargos según tus necesidades.',
        path: PATH_PORTAL.scholarshipsConfig.root,
        navItemKey: 'scholarshipsConfig',
        requiredMemberships: REQUIRED_MEMBERSHIPS.DIRECTORS,
        disabledReason: DISABLED_REASONS.DIRECTORS_ONLY,
      },
    ],
  },
  {
    id: 'students-levels',
    title: 'Estudiantes y niveles',
    tasks: [
      {
        id: OnboardingTaskId.Students,
        title: 'Estudiantes',
        description: 'Carga la lista de estudiantes de tu colegio.',
        path: PATH_PORTAL.student.root,
        navItemKey: 'students',
        requiredPermissions: REQUIRED_PERMISSIONS.STUDENT_MANAGEMENT,
        disabledReason: DISABLED_REASONS.NO_STUDENT_PERMISSION,
      },
      {
        id: OnboardingTaskId.AcademicLevels,
        title: 'Estructura de niveles',
        description: 'Establece los niveles académicos de tu colegio.',
        path: PATH_PORTAL.levelsGradesGroups.root,
        navItemKey: 'levelsGradesGroups',
        requiredMemberships: REQUIRED_MEMBERSHIPS.DIRECTORS,
        disabledReason: DISABLED_REASONS.DIRECTORS_ONLY,
      },
    ],
  },
  {
    id: 'concepts',
    title: 'Conceptos',
    tasks: [
      {
        id: OnboardingTaskId.CreateConcepts,
        title: 'Crea tus conceptos',
        description: 'Crea los conceptos que necesitas para operar.',
        path: PATH_PORTAL.concepts.root,
        navItemKey: 'concepts',
        requiredPermissions: REQUIRED_PERMISSIONS.CONCEPT_CREATION,
        disabledReason: DISABLED_REASONS.NO_CONCEPT_PERMISSION,
      },
      {
        id: OnboardingTaskId.AssignConcepts,
        title: 'Asigna tus conceptos',
        description: 'Asigna los concepto creados a estudiantes específico',
        path: PATH_PORTAL.concepts.root,
        navItemKey: 'concepts',
        requiredPermissions: REQUIRED_PERMISSIONS.CONCEPT_ASSIGNMENT,
        disabledReason: DISABLED_REASONS.NO_CONCEPT_ASSIGNMENT_PERMISSION,
      },
    ],
  },
  {
    id: 'scholarships',
    title: 'Becas',
    tasks: [
      {
        id: OnboardingTaskId.CreateScholarships,
        title: 'Crea tus becas',
        description: 'Crea las becas que necesitas para operar.',
        path: PATH_PORTAL.scholarships.root,
        navItemKey: 'scholarships',
        requiredPermissions: REQUIRED_PERMISSIONS.SCHOLARSHIP_MANAGEMENT,
        disabledReason: DISABLED_REASONS.NO_SCHOLARSHIP_PERMISSION,
      },
      {
        id: OnboardingTaskId.AssignScholarships,
        title: 'Asigna tus becas',
        description: 'Asigna las becas creados a estudiantes específicos',
        path: PATH_PORTAL.scholarships.root,
        navItemKey: 'scholarships',
        requiredPermissions: REQUIRED_PERMISSIONS.SCHOLARSHIP_MANAGEMENT,
        disabledReason: DISABLED_REASONS.NO_SCHOLARSHIP_ASSIGNMENT_PERMISSION,
      },
    ],
  },
];
