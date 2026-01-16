import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient } from '/src/utils/api';
import handleTRPCError from '/src/utils/trpcErrorHandler';

export const tableLinksRouter = createTRPCRouter({
  upsertTableLink: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        table_name: z.string(),
        relative_url: z.string(),
        filters: z.record(z.any()).optional(),
        columns: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardTableLinksUpsertCreate(
          {
            school_id: input.school_id,
            table_name: input.table_name,
            relative_url: input.relative_url,
            filters: input.filters,
            columns: input.columns,
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
  getTableLinkByHash: protectedProcedure
    .input(
      z.object({
        hash: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardTableLinksHashRetrieve(input.hash, {
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
