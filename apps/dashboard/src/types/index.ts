import { DashboardStudentDelinquencySummary } from '@cometa/trpc';

export type DelinquentConcept = {
  id: string;
  name: string;
  due_date: string;
  total_debt: string;
  number_of_past_due_orders: number;
};

export type DelinquentStudentExtended = DashboardStudentDelinquencySummary & {
  delinquent_concept_id: string;
  delinquent_concept_name: string;
  level: string;
  section: string;
};

export type DelinquencyData = {
  total_debt: number;
  students: DashboardStudentDelinquencySummary[];
  previous: string | null;
  next: string | null;
};

export type Fulfillment = {
  id: string;
  status: string;
  concept_name: string;
  student_name: string;
  due_date: string;
  total: string;
};
