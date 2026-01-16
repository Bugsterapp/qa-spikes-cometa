export interface DayMonthYear {
  year: string;
  month: string;
  day: string;
}

export type StudentCreateType = StudentDetails.RootObject & DayMonthYear;
