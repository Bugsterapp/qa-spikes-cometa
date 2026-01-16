export type NavItemKey =
  | 'onboarding'
  | 'collections'
  | 'delinquency'
  | 'payments'
  | 'income'
  | 'students'
  | 'inscriptions'
  | 'admissions'
  | 'academic'
  | 'academic_configurations'
  | 'teachers'
  | 'classrooms'
  | 'concepts'
  | 'scholarships'
  | 'users'
  | 'levelsGradesGroups'
  | 'inscriptionsQuota'
  | 'configuration'
  | 'control_board'
  | 'school_cycle'
  | 'institutionData'
  | 'bankAccounts'
  | 'fiscalEntities'
  | 'scholarshipsConfig'
  | 'announcements'
  | 'credentials'
  | 'invoicing'
  | 'paymentBlock'
  | 'score_cards'
  | 'legalDocuments'
  | 'chat'
  | 'signatures';

export type NavItem = {
  key: NavItemKey;
  title: string;
  path: string;
  icon: React.ReactNode;
  children?: NavItem[];
  disabled?: boolean;
  target?: '_blank' | '_self';
};

export type MainNavConfig = {
  onboarding: NavItem[];
  finance: NavItem[];
  edManagement: NavItem[];
  announcements: NavItem[];
};

export type ConfigurationNavConfig = {
  school_structure: NavItem[];
  payments_collections: NavItem[];
  organization: NavItem[];
};

export type NavSection = keyof MainNavConfig | keyof ConfigurationNavConfig;
