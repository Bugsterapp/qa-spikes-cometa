declare namespace Guardian {
  export interface Credit {
    methods: string[];
    is_active: boolean;
  }

  export interface CashTicket {
    is_active: boolean;
  }

  export interface BankTransfer {
    is_active: boolean;
  }

  export interface Preferences {
    credit: Credit;
    cash_ticket: CashTicket;
    bank_transfer: BankTransfer;
  }

  export interface School {
    id: string;
    name: string;
    logo?: any;
    preferences: Preferences;
  }

  export interface BillingGuardian {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    billing_name: string;
  }

  export interface Dependent {
    id: string;
    identifier: string;
    enrollment_code: string;
    first_name: string;
    last_name: string;
    section: string;
    billing_guardian: BillingGuardian;
  }

  export interface CfdiConfig {
    OTHER: string;
    PRE_DEBT?: any;
    TRANSPORT: string;
    INSCRIPTION: string;
    MONTHLY_FEE: string;
  }

  export interface OTHER {
    name: string;
    code: string;
    description: string;
  }

  export interface TRANSPORT {
    name: string;
    code: string;
    description: string;
  }

  export interface INSCRIPTION {
    name: string;
    code: string;
    description: string;
  }

  export interface MONTHLYFEE {
    name: string;
    code: string;
    description: string;
  }

  export interface CfdiConfigDetail {
    OTHER: OTHER;
    TRANSPORT: TRANSPORT;
    INSCRIPTION: INSCRIPTION;
    MONTHLY_FEE: MONTHLYFEE;
  }

  export interface Guardian {
    dependents_count: ReactNode;
    id: string;
    hash: string;
    first_name: string;
    last_name: string;
    gender?: any;
    email: string;
    phone?: any;
    landline?: any;
    tax_id: string;
    dependents: Dependent[];
    onboarding_stage: string;
    taxing_system: string;
    address_name: string;
    address_number: string;
    address_complement?: any;
    district?: any;
    city: string;
    state: string;
    postal_code: string;
    billing_name: string;
    cfdi_config: CfdiConfig;
    tour_completed: unknown;
    external_id: string;
    cfdi_config_detail: CfdiConfigDetail;
  }
}
