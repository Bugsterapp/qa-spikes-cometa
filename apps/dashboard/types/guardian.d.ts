export interface BillableDependent {
  id: string;
  first_name: string;
  last_name: string;
  enrollment_code: string;
  level: string;
  section: string;
}

export interface BillingInfo {
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

export interface Section {
  id: string;
  grade: string;
  group: string;
  level_name: string;
  level: string;
}

export interface GuardianLite {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  tax_id?: string;
}

export interface Student {
  id: string;
  enrollment_code: string;
  first_name: string;
  last_name: string;
  guardians: GuardianLite[];
  billing_guardian_info: BillingInfo;
  section: Section;
  due_orders: number;
  due_total_price: number;
}

export interface Guardian {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  birthdate?: string;
  send_emails: boolean;
  send_whatsapps: boolean;
  due_total: number;
  billing_info?: BillingInfo;
  dependents: Student[];
}
