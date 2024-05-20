import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient } from '/src/utils/api';
import handleTRPCError from '/src/utils/trpcErrorHandler';
export const incomeRouter = createTRPCRouter({
  getPayinById: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        payinId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const client = ServiceClient['apiV1DashboardSchoolsPayinsRetrieve'];
        const response = await client(input.payinId, input.schoolId, {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
        });
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
});
