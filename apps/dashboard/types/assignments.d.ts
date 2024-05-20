declare namespace Assignments {
  export interface RootObject {
    id: string;
    start_date: string;
    end_date: string;
    concept: Concepts.RootObject;
    orders_to_skip: string[];
  }
}
