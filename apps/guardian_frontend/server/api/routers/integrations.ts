import { createTRPCRouter, protectedProcedure } from '../trpc';
import { IntegrationsServiceClient } from '~/utils/api-integrations';
import { z } from 'zod';
import { Surface, SupportedPartners } from '@cometa/trpc/src/integrations/types';
import { TRPCError } from '@trpc/server';
import * as Sentry from '@sentry/nextjs';

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
        const response = await IntegrationsServiceClient.shared.getBlockedFieldsSharedApiV1TenantsBlockedFieldsGet(
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
        Sentry.captureException(err);
      }
    }),

  encryptFulfillments: protectedProcedure
    .input(
      z.object({
        partner: z.nativeEnum(SupportedPartners),
        fulfillments: z
          .array(
            z.object({
              concept: z.string().min(1),
              student_id: z.string().min(1),
              price: z.number().min(1),
            })
          )
          .min(1),
      })
    )
    .mutation(async ({ input, ctx: _ctx }) => {
      try {
        const response = await IntegrationsServiceClient.api.encryptFulfillmentsApiV1EncryptionFulfillmentsPartnerPost(
          input.partner,
          {
            fulfillments: input.fulfillments,
          },
          {
            headers: {
              Authorization: authHeader,
            },
          }
        );

        return response.data.data;
      } catch (error) {
        Sentry.captureException(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al procesar la solicitud de encriptación',
          cause: error,
        });
      }
    }),
});
