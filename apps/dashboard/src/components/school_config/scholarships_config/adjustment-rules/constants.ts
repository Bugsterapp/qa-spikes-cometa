import { RuleTypeEnum } from '@cometa/trpc/src/types';

/**
 * Default percentages/amounts for adjustment rule simulations
 * Used for preview calculations in the adjustment rules configuration UI
 */
export const ADJUSTMENT_RULE_DEFAULT_VALUES: Record<RuleTypeEnum, number> = {
  [RuleTypeEnum.Scholarship]: 10,
  [RuleTypeEnum.EarlyBird]: 20,
  [RuleTypeEnum.SpecialDiscount]: 250,
  [RuleTypeEnum.Interest]: 5,
  [RuleTypeEnum.SpecialOvercharge]: 100,
};
