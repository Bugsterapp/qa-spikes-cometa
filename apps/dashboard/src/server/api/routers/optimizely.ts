import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import * as Sentry from '@sentry/node';
import { TRPCError } from '@trpc/server';
import { getOptimizelyInstance } from '../../optimizely';

export const optimizelyRouter = createTRPCRouter({
  getFlag: protectedProcedure
    .input(
      z.object({
        flagKey: z.string(),
        userId: z.string(),
        attributes: z.record(z.any()).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const client = getOptimizelyInstance();
        await client.onReady();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userContext = (client as any).createUserContext(input.userId, input.attributes || {});

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const decision = userContext.decide(input.flagKey);

        return {
          enabled: decision.enabled,
          variables: decision.variables,
          variationKey: decision.variationKey,
          ruleKey: decision.ruleKey,
          flagKey: decision.flagKey,
          userContext: {
            userId: input.userId,
            attributes: input.attributes || {},
          },
        };
      } catch (error) {
        Sentry.captureException(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get feature flag decision',
          cause: error,
        });
      }
    }),

  getFlags: protectedProcedure
    .input(
      z.object({
        flagKeys: z.array(z.string()),
        userId: z.string(),
        attributes: z.record(z.any()).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const client = getOptimizelyInstance();
        await client.onReady();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userContext = (client as any).createUserContext(input.userId, input.attributes || {});

        const decisions: Record<
          string,
          {
            enabled: boolean;
            variables: Record<string, unknown>;
            variationKey: string | null;
            ruleKey: string | null;
          }
        > = {};

        for (const flagKey of input.flagKeys) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const decision = userContext.decide(flagKey);

          decisions[flagKey] = {
            enabled: decision.enabled,
            variables: decision.variables,
            variationKey: decision.variationKey,
            ruleKey: decision.ruleKey,
          };
        }

        return decisions;
      } catch (error) {
        Sentry.captureException(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get feature flags decisions',
          cause: error,
        });
      }
    }),
});
