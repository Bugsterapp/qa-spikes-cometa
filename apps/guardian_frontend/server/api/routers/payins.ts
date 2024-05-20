import { z } from 'zod';
import { Api } from '@cometa/trpc/src/types';
import * as Sentry from '@sentry/nextjs';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient } from '~/utils/api';

export const payinsRouter = createTRPCRouter({
  getGuardianPayins: protectedProcedure
    .input(z.object({ schoolId: z.string(), statuses: z.array(z.string()) }))
    .query(async ({ input, ctx }) => {
      const client = new Api();
      try {
        // FIXME: Fix backend schema
        const response = await client.api.apiV1SchoolsPayinsList(input.schoolId, {
          headers: {
            token: ctx.session.token,
          },
          baseUrl: process.env.NEXT_PUBLIC_SERVER_API_BASE_URL,
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
});
