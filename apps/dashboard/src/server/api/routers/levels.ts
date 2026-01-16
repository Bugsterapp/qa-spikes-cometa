import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient } from '/src/utils/api';
import handleTRPCError from '/src/utils/trpcErrorHandler';
export const levelsRouter = createTRPCRouter({
  getLevels: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        query: z.object({ sections: z.array(z.string()).optional() }).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsLevelsList(
          input.schoolId,
          {
            ...input.query,
          },
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
});
