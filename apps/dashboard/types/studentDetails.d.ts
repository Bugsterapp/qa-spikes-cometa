declare namespace StudentDetails {
  interface BillingInfo {
    tax_id: string;
    billing_name: string;
    billable_dependents: BillableDependent[];
    postal_code?: string;
    taxing_system?: string;
    address_complement?: string;
    address_name?: string;
    address_number?: string;
    city?: string;
    district?: string;
    state?: string;
  }
  export interface Guardian {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    tax_id: string;
    billing_name: string;
    billing_info: BillingInfo;
  }

  export interface Section {
    id: string;
    grade: string;
    group: string;
    level_name: string;
    level: string;
  }

  export interface BillableDependents {
    id: string;
    first_name: string;
    last_name: string;
    enrollment_code: string;
    level: string;
    section: Section;
  }

  export interface BillingGuardianInfo {
    tax_id: string;
    billing_name: string;
    billable_dependents?: BillableDependents[];
  }

  export interface Section {
    id: string;
    grade: string;
    group: string;
    level_name: string;
    level: string;
  }

  export interface RootObject {
    id: string;
    enrollment_code: string;
    first_name: string;
    last_name: string;
    guardians: Array<Guardian>;
    billing_guardian_info: BillingGuardianInfo;
    section: Section | string;
    due_orders: number;
    due_total_price: number;
    identifier: string;
    birthdate: string;
    gender: string;
    entry_date: string;
    has_partial_payins: boolean;
    school_cycle_id: string;
    level: string;
    grade: string;
    group: string;
  }
}
