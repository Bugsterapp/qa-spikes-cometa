import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient } from '~/utils/api';
import { CardTypeEnum, PreferenceTypeEnum } from '@cometa/trpc';
import { TRPCError } from '@trpc/server';
import { stockError } from '~/utils/errorsMessages';
import type { TCommissionValues } from '~/components/forms/CreditCardForm';

export const kushkiRouter = createTRPCRouter({
  checkoutCashIn: protectedProcedure
    .input(z.object({ items: z.array(z.object({ student: z.string().nullable(), order: z.string() })) }))
    .mutation(async ({ input, ctx }) => {
      try {
        const res = await ServiceClient.apiV1KushkiCheckoutPreferencesCreate(
          {
            guardian: ctx.session.user.id,
            items: input.items,
            preference_type: PreferenceTypeEnum.CASH_IN,
          },
          {
            headers: {
              token: ctx.session.token,
            },
          }
        );
        return res.data as any;
      } catch (err) {
        Sentry.captureException(err);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: JSON.stringify((err as any)?.error || {}),
          cause: (err as any)?.error,
        });
      }
    }),
  checkoutTransferIn: protectedProcedure
    .input(z.object({ items: z.array(z.object({ student: z.string().nullable(), order: z.string() })) }))
    .mutation(async ({ input, ctx }) => {
      try {
        const res = await ServiceClient.apiV1KushkiCheckoutPreferencesCreate(
          {
            guardian: ctx.session.user.id,
            items: input.items,
            preference_type: PreferenceTypeEnum.TRANSFER_IN,
          },
          {
            headers: {
              token: ctx.session.token,
            },
          }
        );
        return res.data as any;
      } catch (err) {
        Sentry.captureException(err);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: JSON.stringify((err as any)?.error || {}),
          cause: (err as any)?.error,
        });
      }
    }),
  checkoutCard: protectedProcedure
    .input(
      z.object({
        items: z.array(z.object({ student: z.string().nullable(), order: z.string() })),
        cardType: z.nativeEnum(CardTypeEnum),
        kushkiToken: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const res = await ServiceClient.apiV1KushkiCheckoutPreferencesCreate(
          {
            guardian: ctx.session.user.id,
            items: input.items,
            preference_type: PreferenceTypeEnum.CARD,
            token: input.kushkiToken,
            card_type: input.cardType,
          },
          {
            headers: {
              token: ctx.session.token,
            },
          }
        );
        return res.data as any;
      } catch (err) {
        // Omit errors for declined transactions
        if ((err as any)?.error?.code !== '006') {
          Sentry.captureException(err);
        }
        if ((err as any)?.error?.items?.[0]?.non_field_errors?.some((e: any) => e === stockError)) {
          throw new Error('stock');
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: JSON.stringify((err as any)?.error || {}),
          cause: (err as any)?.error,
        });
      }
    }),
  getCommissionValues: protectedProcedure
    .input(
      z.object({
        items: z.array(z.object({ student: z.string(), order: z.string() })),
        preference_type: z.nativeEnum(PreferenceTypeEnum),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const res = await ServiceClient.apiV1ValidatePreferencesCreate(
          {
            items: input.items,
            guardian: ctx.session.user.id,
            preference_type: input.preference_type,
          },
          {
            headers: {
              token: ctx.session.token,
            },
          }
        );
        return res.data as TCommissionValues;
      } catch (err) {
        Sentry.captureException(err);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: JSON.stringify((err as any)?.error || {}),
          cause: (err as any)?.error,
        });
      }
    }),
});
