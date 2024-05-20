export type OrderStatus = 'to_pay' | 'future' | 'historic' | 'pending';

export type OrderType = 'paid' | 'due' | 'outstanding' | 'future';

export type PriceModifiers = {
  earlyBird: {
    percent: string;
    untilDate: string | null;
  };
  discounts: {
    amount: string;
    name: string;
    active: boolean;
  }[];
  interest: string | null;
};

export interface NormalizedOrder {
  price: {
    subtotal: string;
    modifiers: PriceModifiers;
    total: string;
    currency: string;
  };
  concept: Concept;
  id: string;
  due: string;
  payin: any;
  invoice: any[] | null;
  dependent: Dependent;
  partial_payins: any[];
  commissions: Commissions;
  guardian_commission: string;
  orders_required: {
    all_orders: any[];
    proxy: any[];
  };
  name: string;
  pending: boolean;
  type: OrderType;
  has_partial_payins: boolean;
}

export interface Order {
  id: string;
  concept: Concept;
  name: string;
  price: string;
  price_currency: string;
  due: string;
  status: string;
  interest?: any;
  discount: string;
  discount_breakdown: DiscountBreakdown;
  pending: boolean;
  expiration: string;
  invoice?: any;
  dependent: Dependent;
  has_partial_payins: boolean;
  payins: any[];
  paid_amount: string;
  commissions: Commissions;
  guardian_commission: string;
  paid_orders_required: string[];
  paid_orders_required_proxy: string[];
  final_amount?: string;
  pending_amount?: string;
}

export interface Commissions {
  oxxo: CommissionDetail;
  ticket: CommissionDetail;
  debit_card: CommissionDetail;
  credit_card: CommissionDetail;
  bank_transfer: CommissionDetail;
  amex_credit_card: CommissionDetail;
}

export interface CommissionDetail {
  fixed: number;
  percentage: number;
  value: number;
}

export interface Dependent {
  id: string;
  first_name: string;
  last_name: string;
}

export interface DiscountBreakdown {
  total: number;
  details: Details;
}

export interface Details {
  scholarships: Scholarships;
  special: Scholarships;
  early_bird: Earlybird;
}

export interface Earlybird {
  total: number;
  details: Detail2[];
}

export interface Detail2 {
  name: string;
  discount: number;
  until_date: string;
}

export interface Scholarships {
  total: number;
  details: ScholarshipsDetail[];
}

interface ScholarshipsDetail extends Detail {
  active: boolean;
}
export interface Detail {
  id: string;
  name: string;
  discount: number;
}

export interface Concept {
  id: string;
  name: string;
  type: string;
  payment_only_in_dashboard?: boolean;
}

export interface PartialPayin {
  id: string;
  type: string;
  total: string;
  total_currency: string;
  invoice_pdf: string;
  total_unpaid: number;
  invoice_fiscal_identifier: string;
  collected_at_school: boolean;
  correlative_id: string;
  created_by: CreatedBy;
  created: string;
  guardian: Guardian;
  paid_date: Date;
  manual_payment_account: ManualPaymentAccount;
}

export interface CreatedBy {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  name: string;
}

export interface ManualPaymentAccount {
  id: string;
  account_type: string;
  owner: string;
  nickname: string;
  bank_name: string;
  public_summary: string;
}

export interface Guardian {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  dependents_count: number;
  phone: string;
}
