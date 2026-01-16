import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClientRoot } from '/src/utils/api';
import { z } from 'zod';
import handleTRPCError from '/src/utils/trpcErrorHandler';

export const bookKeeperRouter = createTRPCRouter({
  getSchoolHistory: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        modelName: z.string().default('schools.School'),
        excludeEmptyUsers: z.boolean().optional().default(true),
        excludeStaff: z.boolean().optional(),
        includeFields: z.string().optional(),
        historyTypes: z.string().optional(),
        objectId: z.string().optional(),
        page: z.number().optional(),
        pageSize: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const optionalFieldMapping: Record<string, string> = {
          excludeStaff: 'exclude_staff',
          includeFields: 'include_fields',
          historyTypes: 'history_types',
          objectId: 'object_id',
          page: 'page',
          pageSize: 'page_size',
        };

        const queryParams: Record<string, unknown> = {
          model_name: input.modelName,
          history_types: input.historyTypes,
          exclude_empty_users: input.excludeEmptyUsers,
          ...Object.entries(optionalFieldMapping).reduce((acc, [inputKey, apiKey]) => {
            const value = input[inputKey as keyof typeof input];
            if (value !== undefined) {
              acc[apiKey] = value;
            }
            return acc;
          }, {} as Record<string, unknown>),
        };

        const response = await ServiceClientRoot.bookKeeper.bookKeeperHistorySchoolsList(
          input.schoolId,
          queryParams as Parameters<typeof ServiceClientRoot.bookKeeper.bookKeeperHistorySchoolsList>[1],
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
