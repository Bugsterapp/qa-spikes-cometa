export interface Order {
  order: string;
  student: string;
  orderType: string;
  orderName: string;
  studentName: string;
  price: string;
  commissions: Commissions;
}

export interface Commissions {
  oxxo: Commission;
  ticket: Commission;
  debit_card: Commission;
  credit_card: Commission;
  bank_transfer: Commission;
  amex_credit_card: Commission;
}

export interface Commission {
  fixed: number;
  percentage: number;
  value: number;
}
