import type { Invoice } from './paid-orders';
import type { Intent } from '../src/components/payments/FulfillmentDetail/FulfillmentChip';
import type { ManualPaymentAccount } from '/src/components/organisms/dashboard/OrderTableForPayins';
import type { TypeSpecialDiscount } from '/src/constants/specialDiscountTypes';
import type { User } from '/src/interfaces/core';

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  section: string;
  level: string;
  enrollment_code: string;
  due_orders?: number;
}

export interface EarlyBirds {
  total: number;
  details: EarlyBirdDetail[];
}
export interface EarlyBirdDetail {
  name: string;
  discount: number;
  until_date: string;
}
export interface Scholarships {
  total: number;
  details: ScholarshipDetail[];
}
export interface ScholarshipDetail {
  id: string;
  name: string;
  discount: number;
  type?: TypeSpecialDiscount;
  active?: boolean;
}
export interface DiscountBreakdownDetails {
  scholarships?: Scholarships;
  special?: Scholarships;
  early_bird?: EarlyBirds;
}
export interface DiscountBreakdown {
  total?: number;
  details?: DiscountBreakdownDetails;
}

export type IDependent = {
  enrollment_code?: string;
  first_name: string;
  id: string;
  last_name: string;
  level: string;
  section: string;
  due_orders?: number;
};
export type IOvercharge = {
  id: string;
  is_visible: boolean;
  name: string;
  value: string;
};
export type IDueOrder = {
  id: string;
  name: string;
  amount: string;
  currency: string;
  dependent: Student;
  discount: string;
  due: string;
  final_amount: string;
  has_partial_payins: boolean;
  interest?: string;
  paid_amount: string;
  pending: boolean;
  status: string;
  discount_breakdown?: DiscountBreakdown;
  partial_payins?: PartialPayin[];
  pre_tax_price_amount?: string;
  special_over_charges?: IOvercharge[];
  tax_amount?: string;
  pending_amount?: string;
  fulfillment_id?: string;
  payins?: PartialPayin[];
  status?: Intent;
  total_charge: string;
};

export interface PayinFulfillment {
  fulfillment: string;
  id: number;
  invoice: Invoice;
  is_partial: boolean;
  order: string;
  payin: string;
  total_paid: number;
  paid_date: string;
}

export interface Guardian {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  billing_name: string;
}

export interface PartialPayin {
  id: string;
  type: string;
  total: string;
  total_currency: string;
  invoice_pdf?: string;
  total_unpaid: number;
  invoice_fiscal_identifier?: string;
  collected_at_school: boolean;
  correlative_id: string;
  created_by?: CreatedBy;
  created: string;
  guardian: PartialPayinGuardian;
  paid_date: string;
  manual_payment_account: ManualPaymentAccount;
  invoices: Invoice[];
  collected_at: string;
}

export interface CreatedBy extends User {
  name: string;
}

export interface PartialPayinGuardian extends Omit<Guardian, 'billing_name'> {
  dependents_count: number;
  phone: string;
}

export interface Payout {
  id: string;
  correlative_id: string;
  status: string;
  transaction_started?: string;
  scheduled_date: string;
  deposit_date: string;
}
