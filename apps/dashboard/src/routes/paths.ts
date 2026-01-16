function path(root: string, subLink: string) {
  return `${root}${subLink}`;
}

const ROOTS_AUTH = '/auth';
const ROOTS_PORTAL = '/';

export const PATH_AUTH = {
  root: ROOTS_AUTH,
  login: path(ROOTS_AUTH, '/login'),
  verify: path(ROOTS_AUTH, '/verify'),
  resetPassword: path(ROOTS_AUTH, '/reset-password'),
  logout: path(ROOTS_AUTH, '/logout'),
};

export const PATH_STUDENT = (studentId: string) => ({
  root: `/students/${studentId}`,
});

export const PATH_PORTAL = {
  root: ROOTS_PORTAL,
  schools: {
    root: path(ROOTS_PORTAL, 'schools'),
    onlyOne: (schoolId: string) => path(ROOTS_PORTAL, `schools/${schoolId}`),
  },
  welcome: path(ROOTS_PORTAL, 'welcome'),
  pay: {
    root: path(ROOTS_PORTAL, 'payments'),
    manual: path(ROOTS_PORTAL, 'payments/manual'),
  },
  income: {
    root: path(ROOTS_PORTAL, 'income'),
  },
  payments: {
    root: path(ROOTS_PORTAL, 'payments'),
  },
  concepts: {
    root: path(ROOTS_PORTAL, 'concepts'),
  },
  charge: {
    root: path(ROOTS_PORTAL, 'charge'),
  },
  admissions: {
    root: path(ROOTS_PORTAL, 'admissions'),
  },
  academic: {
    root: path(ROOTS_PORTAL, 'academic'),
    classrooms: path(ROOTS_PORTAL, 'academic/classrooms'),
    teachers: path(ROOTS_PORTAL, 'academic/teachers'),
    configurations: path(ROOTS_PORTAL, 'academic/configurations'),
    scoreCards: path(ROOTS_PORTAL, 'academic/score-cards'),
  },
  inscriptions: {
    root: path(ROOTS_PORTAL, 'inscriptions'),
  },
  student: {
    root: path(ROOTS_PORTAL, 'student'),
  },
  proofOfPayment: {
    root: path(ROOTS_PORTAL, 'proof-of-payment'),
  },
  scholarships: {
    root: path(ROOTS_PORTAL, 'scholarships'),
  },
  users: {
    root: path(ROOTS_PORTAL, 'users'),
  },
  levelsGradesGroups: {
    root: path(ROOTS_PORTAL, 'school_config/levels_grades_groups'),
  },
  institutionData: {
    root: path(ROOTS_PORTAL, 'school_config/institution_data'),
  },
  invoicing: {
    root: path(ROOTS_PORTAL, 'school_config/invoicing'),
  },
  paymentBlock: {
    root: path(ROOTS_PORTAL, 'school_config/payment_block'),
  },
  fiscalEntities: {
    root: path(ROOTS_PORTAL, 'school_config/fiscal_entities'),
  },
  bankAccounts: {
    root: path(ROOTS_PORTAL, 'school_config/bank_accounts'),
  },
  scholarshipsConfig: {
    root: path(ROOTS_PORTAL, 'school_config/scholarships_config'),
  },
  legalDocuments: {
    root: path(ROOTS_PORTAL, 'school_config/legal_documents'),
  },
  inscriptionsQuota: {
    root: path(ROOTS_PORTAL, 'inscriptions/quota'),
  },
  control_board: {
    root: path(ROOTS_PORTAL, 'control_board'),
  },
  school_cycle: {
    root: path(ROOTS_PORTAL, 'school_cycle'),
  },
  announcements: {
    root: path(ROOTS_PORTAL, 'announcements'),
  },
  credentials: {
    root: path(ROOTS_PORTAL, 'credentials'),
  },
  onboarding: {
    root: path(ROOTS_PORTAL, 'onboarding'),
  },
  signatures: {
    root: path(ROOTS_PORTAL, 'signatures'),
  },
};

export const PATH_PAGE = {
  about: '/about-us',
  contact: '/contact-us',
  page404: '/404',
  page500: '/500',
  components: '/components',
  onlyDesktop: '/only-desktop',
};
