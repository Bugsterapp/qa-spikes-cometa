export interface SponsoredOrder {
  fulfillment_id?: string;
  concept_name?: string;
  concept_type?: string;
  base_amount?: number;
  current_discount?: number;
  new_discount?: number;
  scholarship_discount?: number;
  interest?: number;
  over_charge?: number;
  total_paid?: number;
  order_id?: string;
  order_name?: string;
  due_date?: string;
  amount?: number;
  display_base_total?: number;
  display_final_amount?: number;
  display_description?: string;
}
