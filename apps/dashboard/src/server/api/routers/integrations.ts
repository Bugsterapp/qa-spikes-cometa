import { createTRPCRouter, protectedProcedure } from '../trpc';
import { IntegrationsServiceClient } from '../../../utils/apiIntegrations';
import { z } from 'zod';
import { Surface } from '@cometa/trpc/src/integrations/types';
import handleTRPCError from '../../../utils/trpcErrorHandler';

const authHeader = `Bearer ${process.env.INTEGRATIONS_API_TOKEN}`;

export const integrationsRouter = createTRPCRouter({
  getBlockedFields: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        surface: z.nativeEnum(Surface),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await IntegrationsServiceClient.getBlockedFieldsSharedApiV1TenantsBlockedFieldsGet(
          {
            surface: input.surface,
            school_id: input.school_id,
          },
          {
            headers: {
              Authorization: authHeader,
            },
          }
        );

        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
});
