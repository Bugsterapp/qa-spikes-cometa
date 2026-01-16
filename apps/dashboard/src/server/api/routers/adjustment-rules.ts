import { z } from 'zod';
import { ModeEnum, RuleTypeEnum, TypeAceEnum } from '@cometa/trpc/src/types';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient } from '/src/utils/api';
import handleTRPCError from '/src/utils/trpcErrorHandler';

/**
 * TRPC Router for Adjustment Rules
 * Handles the configuration of payment adjustment order (scholarships, discounts, interest, overcharges)
 */
export const adjustmentRulesRouter = createTRPCRouter({
  /**
   * List all active adjustment rules for a school
   */
  list: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        page: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.adjustmentRulesList(
          input.schoolId,
          {
            page: input.page,
          },
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  /**
   * Get a single adjustment rule by ID
   */
  retrieve: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        ruleId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.adjustmentRulesRetrieve(input.ruleId, input.schoolId, {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
        });
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  /**
   * Bulk create/update all adjustment rules for a school
   * Used for both onboarding and reconfiguration
   */
  bulkCreate: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        apply_independently: z.boolean(),
        rules: z.array(
          z.object({
            rule_type: z.nativeEnum(RuleTypeEnum),
            order: z.number(),
            is_active: z.boolean(),
            config: z.record(z.any()).optional(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.adjustmentRulesBulkCreate(
          input.schoolId,
          {
            apply_independently: input.apply_independently,
            rules: input.rules.map((rule) => ({
              rule_type: rule.rule_type,
              order: rule.order,
              is_active: rule.is_active,
              config: rule.config || {},
            })),
          },
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  /**
   * Update a single adjustment rule
   */
  update: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        ruleId: z.string(),
        order: z.number().optional(),
        is_active: z.boolean().optional(),
        config: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.adjustmentRulesPartialUpdate(
          input.ruleId,
          input.schoolId,
          {
            order: input.order,
            is_active: input.is_active,
            config: input.config,
          },
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  /**
   * Delete (soft delete) an adjustment rule
   */
  delete: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        ruleId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await ServiceClient.adjustmentRulesDestroy(input.ruleId, input.schoolId, {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
        });
        return { success: true };
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  /**
   * Simulate adjustment calculations without saving
   * Used for real-time preview
   */
  simulate: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        base_amount: z.string(),
        mode: z.nativeEnum(ModeEnum),
        adjustments: z.array(
          z.object({
            type: z.nativeEnum(TypeAceEnum),
            percentage: z.string().optional(),
            amount: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.adjustmentRulesSimulate(
          input.schoolId,
          {
            base_amount: input.base_amount,
            mode: input.mode,
            adjustments: input.adjustments.map((adj) => ({
              type: adj.type,
              ...(adj.percentage !== undefined && { percentage: adj.percentage }),
              ...(adj.amount !== undefined && { amount: adj.amount }),
            })),
          },
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  /**
   * Get configuration change history
   * Used for displaying adjustment rules configuration history
   */
  configurationHistory: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        page: z.number().optional(),
        page_size: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.adjustmentRulesConfigurationHistory(
          input.schoolId,
          {
            page: input.page,
            page_size: input.page_size,
          },
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
});
