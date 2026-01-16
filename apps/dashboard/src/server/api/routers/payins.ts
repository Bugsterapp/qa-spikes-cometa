import { Type11EEnum } from '@cometa/trpc/src/types';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient } from '/src/utils/api';
import handleTRPCError from '/src/utils/trpcErrorHandler';

const querySchema = z.object({
  end_date: z.string().optional(),
  page: z.number().optional(),
  page_size: z.number().optional(),
  start_date: z.string().optional(),
  multiple_search: z.string().optional(),
  ordering: z.array(z.string()).optional(),
  bank_accounts: z.string().array().optional(),
  school_cycles: z.string().array().optional(),
  types: z.nativeEnum(Type11EEnum).array().optional(),
  users: z.string().array().optional(),
  guardians: z.string().array().optional(),
});
export const payinsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        query: querySchema.optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsPayinsList(
          input.schoolId,
          {
            ...(input.query as any),
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
