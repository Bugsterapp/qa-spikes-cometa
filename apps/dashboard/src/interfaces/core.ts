export interface School {
  id: string;
  job_title: string;
  name: string;
  config_dashboard: {
    emit_invoice_time?: string;
    enable_manual_pay_invoice: boolean;
    default_manual_pay_invoice: boolean;
    student_identifier_is_required: boolean;
    enable_student_identifier: boolean;
    payment_only_in_dashboard: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
}

export interface Session {
  user: User;
  expires: string;
  token: string;
  iat: number;
  exp: number;
  jti: string;
}
