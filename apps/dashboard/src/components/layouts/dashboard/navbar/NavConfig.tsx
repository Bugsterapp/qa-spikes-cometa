import type { ConfigurationNavConfig, MainNavConfig } from '/src/components/nav-section/vertical/types';
import SvgIconStyle from '/src/components/SvgIconStyle';
import { PATH_AUTH, PATH_PORTAL } from '/src/routes/paths';
import { LogOut, Sparkles, UserSquare2, ScrollTextIcon, Megaphone } from 'lucide-react';

export function getIcon(name: string) {
  return <SvgIconStyle src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;
}

export const ICONS = {
  students: getIcon('students'),
  inscriptions: getIcon('inscriptions'),
  inscriptionsQuota: getIcon('replace-all'),
  admissions: getIcon('admissions'),
  academic: getIcon('academic'),
  classroom: getIcon('classroom'),
  teacher: getIcon('teacher'),
  charge: getIcon('charge'),
  ecommerce: getIcon('ic_ecommerce'),
  payments: getIcon('payments'),
  analytics: getIcon('income'),
  dashboard: getIcon('ic_dashboard'),
  invoice: getIcon('ic_invoice'),
  page: getIcon('ic_page'),
  close: getIcon('ic_close'),
  delinquency: getIcon('delinquency'),
  logout: <LogOut className="w-4 h-4" />,
  concepts: getIcon('concepts'),
  scholarships: getIcon('scholarships'),
  users: getIcon('users-round'),
  configuration: getIcon('configuration'),
  control_board: getIcon('fi-rr-dashboard'),
  school_cycle: getIcon('calendar-days'),
  levelsGradesGroups: getIcon('blocks'),
  institutionData: getIcon('institution'),
  invoicing: getIcon('ic_invoice_v2'),
  paymentBlock: getIcon('blocked'),
  fiscalEntities: getIcon('ic_landmark'),
  bankAccounts: getIcon('ic_circle_dollar_sign'),
  scholarshipsConfig: getIcon('badge-percent'),
  legalDocuments: getIcon('file-pen-line'),
  announcements: <Megaphone className="w-4 h-4" />,
  onboarding: getIcon('charge'),
  chat: <Sparkles className="w-4 h-4" />,
  credentials: <UserSquare2 className="w-4 h-4" />,
  signatures: <ScrollTextIcon className="w-4 h-4" />,
};

export const mainNav: MainNavConfig = {
  onboarding: [
    {
      key: 'onboarding',
      title: 'Onboarding inicial',
      path: PATH_PORTAL.onboarding.root,
      icon: ICONS.onboarding,
    },
  ],
  finance: [
    {
      key: 'control_board',
      title: 'Tablero de control',
      path: PATH_PORTAL.control_board.root,
      icon: ICONS.control_board,
    },
    { key: 'collections', title: 'Cobranzas', path: PATH_PORTAL.charge.root, icon: ICONS.charge },
    { key: 'delinquency', title: 'Morosidad', path: '/delinquency', icon: ICONS.delinquency },
    {
      key: 'payments',
      title: 'Pagos y Facturas',
      path: PATH_PORTAL.payments.root,
      icon: ICONS.payments,
    },
    { key: 'income', title: 'Ingresos', path: PATH_PORTAL.income.root, icon: ICONS.analytics },
    {
      key: 'chat',
      title: 'AI',
      path: '/chat',
      icon: ICONS.chat,
      target: '_blank',
    },
  ],
  edManagement: [
    {
      key: 'students',
      title: 'Estudiantes',
      path: PATH_PORTAL.student.root,
      icon: ICONS.students,
    },
    { key: 'inscriptions', title: 'Inscripciones', path: PATH_PORTAL.inscriptions.root, icon: ICONS.inscriptions },
    { key: 'admissions', title: 'Admisiones', path: PATH_PORTAL.admissions.root, icon: ICONS.admissions },
    {
      key: 'academic',
      title: 'Académico',
      path: PATH_PORTAL.academic.root,
      icon: ICONS.academic,
      children: [
        {
          icon: ICONS.classroom,
          key: 'classrooms',
          title: 'Clases',
          path: PATH_PORTAL.academic.classrooms,
        },
        {
          icon: ICONS.teacher,
          key: 'teachers',
          title: 'Maestros',
          path: PATH_PORTAL.academic.teachers,
        },
        {
          icon: ICONS.configuration,
          key: 'score_cards',
          title: 'Boletas',
          path: PATH_PORTAL.academic.scoreCards,
        },
        {
          icon: ICONS.configuration,
          key: 'academic_configurations',
          title: 'Configuraciones',
          path: PATH_PORTAL.academic.configurations,
        },
      ],
    },
    {
      key: 'concepts',
      title: 'Conceptos',
      path: PATH_PORTAL.concepts.root,
      icon: ICONS.concepts,
    },
    { key: 'scholarships', title: 'Becas y descuentos', path: PATH_PORTAL.scholarships.root, icon: ICONS.scholarships },
  ],
  announcements: [
    {
      key: 'announcements',
      title: 'Comunicados',
      path: PATH_PORTAL.announcements.root,
      icon: ICONS.announcements,
    },
  ],
};

export const configurationNav: ConfigurationNavConfig = {
  school_structure: [
    {
      key: 'school_cycle',
      title: 'Ciclos escolares',
      path: PATH_PORTAL.school_cycle.root,
      icon: ICONS.school_cycle,
    },
    {
      key: 'levelsGradesGroups',
      title: 'Niveles y grados',
      path: PATH_PORTAL.levelsGradesGroups.root,
      icon: ICONS.levelsGradesGroups,
    },
    {
      key: 'inscriptionsQuota',
      title: 'Cupos de inscripción',
      path: PATH_PORTAL.inscriptionsQuota.root,
      icon: ICONS.inscriptionsQuota,
    },
  ],
  payments_collections: [
    {
      key: 'scholarshipsConfig',
      title: 'Becas y recargos',
      path: PATH_PORTAL.scholarshipsConfig.root,
      icon: ICONS.scholarships,
    },
    {
      key: 'invoicing',
      title: 'Facturación',
      path: PATH_PORTAL.invoicing.root,
      icon: ICONS.invoicing,
    },
    {
      key: 'paymentBlock',
      title: 'Bloqueo de pagos',
      path: PATH_PORTAL.paymentBlock.root,
      icon: ICONS.paymentBlock,
    },
  ],
  organization: [
    {
      key: 'users',
      title: 'Usuarios',
      path: PATH_PORTAL.users.root,
      icon: ICONS.users,
    },
    {
      key: 'institutionData',
      title: 'Datos de la institución',
      path: PATH_PORTAL.institutionData.root,
      icon: ICONS.institutionData,
    },
    {
      key: 'fiscalEntities',
      title: 'Entidades fiscales',
      path: PATH_PORTAL.fiscalEntities.root,
      icon: ICONS.fiscalEntities,
    },
    {
      key: 'bankAccounts',
      title: 'Cuentas bancarias',
      path: PATH_PORTAL.bankAccounts.root,
      icon: ICONS.bankAccounts,
    },
    {
      key: 'legalDocuments',
      title: 'Documentos legales',
      path: PATH_PORTAL.legalDocuments.root,
      icon: ICONS.legalDocuments,
    },
    {
      key: 'credentials',
      title: 'Credenciales',
      path: PATH_PORTAL.credentials.root,
      icon: ICONS.credentials,
    },
    {
      key: 'signatures',
      title: 'Contratos',
      path: PATH_PORTAL.signatures.root,
      icon: ICONS.signatures,
    },
  ],
};

export const sidebarLogOut = {
  key: 'logout',
  title: 'Cerrar Sesión',
  path: PATH_AUTH.logout,
  icon: ICONS.logout,
};
