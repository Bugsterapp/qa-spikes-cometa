import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient } from '~/utils/api';

export const payinsRouter = createTRPCRouter({
  getGuardianPayins: protectedProcedure
    .input(z.object({ schoolId: z.string(), statuses: z.array(z.string()) }))
    .query(async ({ input, ctx }) => {
      try {
        // FIXME: Fix backend schema
        const response = await ServiceClient.apiV1SchoolsPayinsList(input.schoolId, {
          headers: {
            token: ctx.session.token,
          },
          query: {
            'fulfillment_statuses[]': input.statuses,
          },
        } as any);
        const data = response.data;
        return data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
  reportAsPaid: protectedProcedure
    .input(
      z.object({
        payinId: z.string(),
        schoolId: z.string(),
        data: z.object({
          is_paid: z.boolean(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1SchoolsPayinsReportAsPaidCreate(
          input.payinId,
          input.schoolId,
          input.data,
          {
            headers: {
              token: ctx.session.token,
            },
          }
        );
        return response.data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
  deletePayin: protectedProcedure
    .input(z.object({ payinId: z.string(), schoolId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        return await ServiceClient.apiV1SchoolsPayinsDestroy(input.payinId, input.schoolId, {
          headers: {
            token: ctx.session.token,
          },
        });
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
  history: protectedProcedure
    .input(z.object({ schoolId: z.string(), page: z.number().optional(), pageSize: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV2SchoolsPayinsList(
          input.schoolId,
          {
            page: input.page,
            page_size: input.pageSize,
          },
          {
            headers: {
              token: ctx.session.token,
            },
          }
        );
        return response.data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
  details: protectedProcedure
    .input(z.object({ schoolId: z.string(), payinId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV2SchoolsPayinsRetrieve(input.payinId, input.schoolId, {
          headers: {
            token: ctx.session.token,
          },
        });
        return response.data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
});
