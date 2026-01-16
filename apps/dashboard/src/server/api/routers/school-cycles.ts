import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '/src/server/api/trpc';
import { ServiceClient } from '/src/utils/api';
import handleTRPCError from '/src/utils/trpcErrorHandler';

export const schoolCyclesRouter = createTRPCRouter({
  currentCycle: protectedProcedure.input(z.object({ schoolId: z.string() })).query(async ({ input, ctx }) => {
    try {
      const response = await ServiceClient.apiV1DashboardSchoolsCyclesCurrentRetrieve(input.schoolId, {
        headers: {
          Authorization: `Token ${ctx.session.token}`,
        },
      });
      return response.data;
    } catch (err) {
      handleTRPCError(err);
    }
  }),
  validateChangeCycle: protectedProcedure
    .input(z.object({ schoolId: z.string(), id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await ServiceClient.apiV1DashboardSchoolsCyclesValidateActivateCreate(input.id, input.schoolId, {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
        });
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  activateCycle: protectedProcedure
    .input(z.object({ schoolId: z.string(), id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await ServiceClient.apiV1DashboardSchoolsCyclesActivatePartialUpdate(input.id, input.schoolId, {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
        });
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  statusChangeCycle: protectedProcedure.input(z.object({ schoolId: z.string() })).query(async ({ input, ctx }) => {
    try {
      const response = await ServiceClient.apiV1DashboardSchoolsCyclesStatusChangeCycleRetrieve(input.schoolId, {
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
