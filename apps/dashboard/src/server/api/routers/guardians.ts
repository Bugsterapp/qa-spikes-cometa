import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient } from '/src/utils/api';

export const guardianRouter = createTRPCRouter({
  getGuardianById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        schoolId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const response = await ServiceClient.apiV1DashboardSchoolsGuardiansRetrieve(input.id, input.schoolId, {
        headers: {
          Authorization: `Token ${ctx.session.token}`,
        },
      });
      return response.data;
    }),
  verifyGuardians: protectedProcedure
    .input(z.object({ guardianIds: z.array(z.string()) }))
    .query(async ({ input, ctx }) => {
      const response = await ServiceClient.apiV1DashboardGuardiansVerifyGuardiansCreate(
        { guardian_ids: input.guardianIds },
        {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
        }
      );
      return response.data;
    }),
  getDetails: protectedProcedure
    .input(z.object({ id: z.string(), schoolId: z.string() }))
    .query(async ({ input, ctx }) => {
      const response = await ServiceClient.apiV1DashboardSchoolsGuardiansInfoRetrieve(input.id, input.schoolId, {
        headers: {
          Authorization: `Token ${ctx.session.token}`,
        },
      });
      return response.data;
    }),
});
