import { PartialPayin } from './due-orders';
import type { CometaCurrency } from '@cometa/utils';

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  enrollment_code: string;
  section: string;
}

export interface Guardian {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

type Status = 'pending' | 'failed' | 'success' | 'canceled' | 'canceling' | 'not_requested' | 'multiple' | 'sponsored';

export interface Invoice {
  failed_reason?: string;
  id?: string;
  pdf_url?: string;
  status: Status;
  fiscal_identifier?: string;
  billing_guardian?: string;
  billing_guardian_fullname?: string;
  client_identifier?: string;
  billing_name?: string;
  tax_id?: string;
  created?: string;
  paid_date?: string;
  is_paid_invoice?: boolean;
  service_identifier?: string;
  fail_origin?: string;
}
export interface PaidOrder {
  id: string;
  order_name: string;
  student: Student;
  guardian: Guardian;
  amount: string;
  final_amount: string;
  paid_date: string;
  paid_status: string;
  invoices: Invoice[];
  invoice_status: string | Status;
  has_partial_payins: boolean;
  paid_amount: string;
  payin_type: string;
  correlative_id?: string;
  collected_at_school: boolean;
  payin_correlative_id?: string;
  payin_id?: string;
  payout?: {
    id: string;
    correlative_id: string;
  };
  partial_payins: Pick<PartialPayin, 'id' | 'correlative_id'>[];
  payins: PartialPayin[];
  total_paid: string;
  status: string;
  is_sponsored: boolean;
}

interface FulfillmentCurrency extends PaidOrder {
  amount: CometaCurrency;
  final_amount: CometaCurrency;
  paid_amount: CometaCurrency;
}
export interface FulfillmentTable {
  count: number;
  next: string;
  previous?: string;
  results: FulfillmentCurrency[];
  total_amount: CometaCurrency;
}

export interface EarlyBirdDiscounts {
  discount_type: 'PERCENT' | 'AMOUNT' | 'FIXED' | 'BRILLAMONT';
  discount_value: number;
  up_to_days: number;
  name: string;
}

export interface ConceptInterest {
  compounding: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SINGLE';
  payday?: { day: number; month: number } | null;
  type: 'PERCENT' | 'AMOUNT' | 'FIXED' | 'BRILLAMONT';
  value: number;
}

export interface ConceptAssignment {
  early_bird_discounts: EarlyBirdDiscounts[];
  id: string;
  interests: ConceptInterest[];
  name: string;
  orders: any[];
  payday: number;
  price: string;
  scholarships: any[];
  type?: string;
}
export interface Concept {
  id: string;
  name: string;
  type: string;
}

export interface Order {
  id: string;
  name: string;
  concept: string;
}

export interface Section {
  id: string;
  name: string;
}

export interface Level {
  id: string;
  name: string;
}
export interface PaymentMethods {
  id: string;
  name: string;
}

export interface CollectedAt {
  id: string;
  name: string;
}
export interface BasicBankAccounts {
  id: string;
  name: string;
}
export interface FulfillmentFiltersFromApi {
  concepts: Concept[];
  orders: Order[];
  sections: Section[];
  levels: Level[];
  payment_methods: string[][];
  collected_at: string[][];
}

export interface FulfillmentFiltersTransformed {
  concepts: Concept[];
  orders: Order[];
  sections: Section[];
  levels: Level[];
  payment_methods: PaymentMethods[];
  collected_at: CollectedAt[];
}

type FormValue = {
  id: string;
  name: string;
  checked: boolean;
};

export interface FormFulfillmentFilters {
  concepts: FormValue[];
  orders: FormValue[];
  payment_methods: FormValue[];
  levels: FormValue[];
  sections: FormValue[];
  collected_at: FormValue[];
}

export interface ScholarshipAffectedConcept {
  id: string;
  name: string;
  prev_price: number;
  new_price: number;
  fulfillments: { name: string; status: string; order: string }[];
}

export interface AvailableScholarship {
  affected_concept_types: string[];
  affected_concepts: ScholarshipAffectedConcept[];
  id: string;
  name: string;
  type: string;
  value: number;
}
