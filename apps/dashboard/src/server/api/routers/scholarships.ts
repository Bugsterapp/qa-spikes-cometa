import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient } from '/src/utils/api';

export const scholarshipsRouter = createTRPCRouter({
  scholarships: protectedProcedure.input(z.object({ studentId: z.string() })).query(async ({ input, ctx }) => {
    try {
      const response = await ServiceClient.apiV1DashboardStudentsAvailableScholarshipsList(input.studentId, {
        headers: {
          Authorization: `Token ${ctx.session.token}`,
        },
      });
      const data = response.data;
      //    ^?
      return data;
    } catch (err) {
      Sentry.captureException(err);
    }
  }),
  scholarshipDetails: protectedProcedure
    .input(z.object({ scholarshipId: z.string(), studentId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardStudentsAvailableScholarshipsRetrieve(
          input.scholarshipId,
          input.studentId,
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );
        const data = response.data;
        //    ^?
        return data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
});
