import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient } from '~/utils/api';
import { CardTypeEnum } from '@cometa/trpc';
import { TRPCError } from '@trpc/server';

const cardType = z.nativeEnum(CardTypeEnum);

export const subscriptionsRouter = createTRPCRouter({
  cancelSubscription: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.string(),
        schoolId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1SchoolsSubscriptionsDestroy(input.subscriptionId, input.schoolId, {
          headers: {
            token: ctx.session.token,
          },
        });
        const data = response.data;
        return data;
      } catch (err: unknown) {
        Sentry.captureException(err);
        if (err && (err as { status: number }).status === 404) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Subscription not found',
          });
        }
      }
    }),
  getSubscribables: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1SchoolsSubscriptionsConceptsList(input.schoolId, {
          headers: {
            token: ctx.session.token,
          },
        });
        return response.data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
  getActives: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1SchoolsSubscriptionsList(input.schoolId, {
          headers: {
            token: ctx.session.token,
          },
        });
        return response.data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
  subscribe: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        data: z.object({
          student_id: z.string(),
          concept_id: z.string(),
          start_date: z.string(),
          end_date: z.string().optional(),
          card_type: cardType,
          token: z.string(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const session = ctx.session;
        const response = await ServiceClient.apiV1SchoolsSubscriptionsCreate(
          input.schoolId,
          {
            ...input.data,
            guardian_id: session.user.id,
          },
          {
            headers: {
              token: session.token,
            },
          }
        );
        return response.data;
      } catch (err) {
        if ((err as any)?.error?.code !== '006') {
          Sentry.captureException(err);
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: JSON.stringify((err as any)?.error || {}),
          cause: (err as any)?.error,
        });
      }
    }),
});

export const createSubscriptionsCaller = subscriptionsRouter.createCaller;
