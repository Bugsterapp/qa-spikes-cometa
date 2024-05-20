import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient } from '~/utils/api';
import { PreferenceTypeEnum } from '@cometa/trpc/src/types';

const inputs = z.object({
  guardian: z.string(),
  items: z.array(z.object({ student: z.string(), order: z.string() })),
  backUrlsBase: z.string(),
});

export const mercadopagoRouter = createTRPCRouter({
  checkout: protectedProcedure.input(inputs).mutation(async ({ input, ctx }) => {
    try {
      const response = await ServiceClient.apiV1MpcpPreferencesCreate(
        {
          guardian: input.guardian,
          items: input.items,
          back_urls: {
            failure: `${input.backUrlsBase}/`,
            pending: `${input.backUrlsBase}/`,
            success: `${input.backUrlsBase}/success/`,
          },
          preference_type: PreferenceTypeEnum.CARD,
        },
        {
          headers: {
            token: ctx.session.token,
          },
        }
      );
      const data = response.data;
      return data;
    } catch (err) {
      Sentry.captureException(err);
    }
  }),
});
