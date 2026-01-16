import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient } from '/src/utils/api';
import handleTRPCError from '/src/utils/trpcErrorHandler';

export const invoiceSeriesRouter = createTRPCRouter({
  invoiceSeriesList: protectedProcedure.input(z.object({ schoolId: z.string() })).query(async ({ input, ctx }) => {
    try {
      const response = await ServiceClient.apiV1DashboardSchoolsInvoiceSeriesList(input.schoolId, undefined, {
        headers: { Authorization: `Token ${ctx.session.token}` },
      });
      const data = response.data.results;
      return data;
    } catch (err) {
      handleTRPCError(err);
    }
  }),
});
