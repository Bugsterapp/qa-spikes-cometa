import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient } from '/src/utils/api';
import handleTRPCError from '/src/utils/trpcErrorHandler';
export const collectionsRouter = createTRPCRouter({
  chargeGraphic: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        concepts: z.array(z.string()),
        school_cycle: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsCollectionsGraphicList(
          input.schoolId,
          {
            concepts: input.concepts,
            school_cycle: input.school_cycle,
          },
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );
        const data = response.data;
        return data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  studentsTable: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        concepts: z.array(z.string()),
        month: z.number(),
        year: z.number(),
        school_cycle: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsCollectionsTableRetrieve(
          input.schoolId,
          {
            concepts: input.concepts,
            school_cycle: input.school_cycle,
            month: input.month,
            year: input.year,
          },
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );
        const data = response.data;
        return data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
});
