import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient } from '/src/utils/api';
import handleTRPCError from '/src/utils/trpcErrorHandler';

export const usersRouter = createTRPCRouter({
  getMe: protectedProcedure.input(z.object({ schoolId: z.string() })).query(async ({ input, ctx }) => {
    try {
      const response = await ServiceClient.apiV1DashboardSchoolsAdminsMeRetrieve(input.schoolId, {
        headers: {
          Authorization: `Token ${ctx.session.token}`,
        },
      });
      const data = response.data;
      return data;
    } catch (err) {
      handleTRPCError(err);
    }
  }),
});
