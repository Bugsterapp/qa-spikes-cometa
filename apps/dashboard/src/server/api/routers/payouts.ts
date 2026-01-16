import { StatusFdeEnum } from '@cometa/trpc/src/types';
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
  statuses: z
    .nativeEnum(StatusFdeEnum)
    .array()
    .default([
      StatusFdeEnum.PROCESSING_STATUS,
      StatusFdeEnum.APPROVED_STATUS,
      StatusFdeEnum.SCHEDULED_STATUS,
      StatusFdeEnum.DECLINED_STATUS,
    ]),
  bank_accounts: z.string().array().optional(),
  school_cycles: z.string().array().optional(),
});
export const payoutsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        query: querySchema.optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsPayoutsList(
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
