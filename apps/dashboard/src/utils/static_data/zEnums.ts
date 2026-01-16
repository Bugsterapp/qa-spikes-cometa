import { z } from 'zod';

export const typeAdjustmentSchema = z.enum([
  'SCHOLARSHIP',
  'EARLY_PAYMENT_DISCOUNT',
  'SPECIAL_DISCOUNT',
  'SURCHARGE',
  'INTEREST',
]);
export const typeCalculationAdjustmentSchema = z.enum(['PERCENTAGE', 'FIXED_AMOUNT']);
export const scopeAdjustmentSchema = z.enum(['ALL_CATEGORIES', 'BY_CATEGORY', 'SPECIFIC_CONCEPTS'], {
  required_error: 'Debe seleccionar donde aplicar el ajuste',
});
export type TypeCalculationAdjustment = z.infer<typeof typeCalculationAdjustmentSchema>;
