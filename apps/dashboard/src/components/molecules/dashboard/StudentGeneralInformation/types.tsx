export interface IStudentGeneralInformationProps {
  student: StudentDetails.RootObject | undefined;
  isLoading?: boolean;
  action: () => void;
}
export interface StudentDetailProps {
  id: string;
  enrollment_code: string;
  first_name: string;
  last_name: string;
  guardians: Array<GuardianProps>;
  billing_guardian_info: BillingGuardianProps;
  section: SectionProps;
  due_orders: number;
  due_total_price: number;
  identifier: string;
  birthdate: string;
  gender: string;
  entry_date: string;
}
export interface BillingGuardianProps {
  tax_id: string;
  billing_name: string;
}
export interface GuardianProps {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  tax_id: string;
}
export interface SectionProps {
  id: string;
  grade: string;
  group: string;
  level_name: string;
  level: string;
}

export interface SectionsProps {
  Array: SectionListProp;
}

export interface LevelsProps {
  [x: string]: any;
  Array: LevelProps;
}

export interface LevelProps {
  id: string;
  name: string;
}

export interface SectionListProp {
  id: string;
  name: string;
  level: string;
}
