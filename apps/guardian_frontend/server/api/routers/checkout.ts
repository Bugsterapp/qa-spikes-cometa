import { z } from 'zod';
import { CardTypeEnum } from '@cometa/trpc';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient } from '~/utils/api';
import { PreferenceTypeEnum } from '@cometa/trpc';
import * as Sentry from '@sentry/node';
import { TRPCError } from '@trpc/server';

export const checkoutRouter = createTRPCRouter({
  checkoutPayment: protectedProcedure
    .input(
      z.object({
        items: z.array(z.object({ student: z.string().nullable(), order: z.string() })),
        cardType: z.nativeEnum(CardTypeEnum).optional(),
        preferenceType: z.nativeEnum(PreferenceTypeEnum),
        token: z.string().optional(),
        guardian: z.string(),
        cardBrand: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const items = input.items.map((item) => ({ ...item, student: item.student ?? undefined }));
      try {
        const res = await ServiceClient.apiV1PaymentsV2CheckoutCreate(
          {
            items,
            card_type: input.cardType,
            token: input.token,
            guardian: input.guardian,
            preference_type: input.preferenceType,
            card_brand: input.cardBrand,
          },
          {
            headers: {
              token: ctx.session.token,
            },
          }
        );

        return res.data;
      } catch (error) {
        Sentry.captureException(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: JSON.stringify((error as any)?.error || {}),
          cause: (error as any)?.error,
        });
      }
    }),
  paymentStatus: protectedProcedure
    .input(
      z.object({
        paymentId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const res = await ServiceClient.apiV1PaymentsV2PaymentStatusRetrieve(input.paymentId, {
          headers: {
            token: ctx.session.token,
          },
        });

        return res.data;
      } catch (error) {
        Sentry.captureException(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: JSON.stringify((error as any)?.error || {}),
          cause: (error as any)?.error,
        });
      }
    }),
  markPaymentAsBlocked: protectedProcedure
    .input(
      z.object({
        paymentId: z.string(),
        spanId: z.string().optional(),
        traceId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await ServiceClient.apiV1PaymentsV2MarkPaymentAsBlockedCreate(
          {
            payment_id: input.paymentId,
            span_id: input.spanId,
            trace_id: input.traceId,
          },
          {
            headers: {
              token: ctx.session.token,
            },
          }
        );
      } catch (error) {
        Sentry.captureException(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: JSON.stringify((error as any)?.error || {}),
          cause: (error as any)?.error,
        });
      }
    }),
  checkBlockedPeriods: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        date: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1SchoolsBlockedPeriodsCheckRetrieve(
          input.schoolId,
          input.date ? { date: input.date } : undefined,
          {
            headers: {
              token: ctx.session.token,
            },
          }
        );
        return response.data;
      } catch (error) {
        Sentry.captureException(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: JSON.stringify((error as any)?.error || {}),
          cause: (error as any)?.error,
        });
      }
    }),
});
