import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient } from '~/utils/api';

export const fulfillmentsRouter = createTRPCRouter({
  getFulfillments: protectedProcedure
    .input(z.object({ schoolId: z.string(), status: z.array(z.string()) }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1SchoolsFulfillmentsList(input.schoolId, {
          query: {
            'statuses[]': input.status,
          },
          headers: {
            token: ctx.session.token,
          },
        } as any);
        const data = response.data;
        return data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
});
