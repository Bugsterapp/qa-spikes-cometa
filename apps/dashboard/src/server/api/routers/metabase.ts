import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import handleTRPCError from '/src/utils/trpcErrorHandler';

const METABASE_SITE_URL = process.env.NEXT_PUBLIC_METABASE_URL;
const METABASE_SECRET_KEY = process.env.NEXT_PUBLIC_METABASE_SECRET;
const METABASE_COUNT_FILTERS = {
  '563': [2],
  '564': [2, 3],
  '794': [],
  '2906': [],
};

export const metabaseRouter = createTRPCRouter({
  getDashboard: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        dashboard_id: z.string(),
      })
    )
    .output(z.object({ url: z.string() }).optional())
    .query(async ({ input }) => {
      try {
        const expiryMinute10 = Math.round(Date.now() / 1000) + 10 * 60;
        const payload = {
          resource: { dashboard: Number(input.dashboard_id) },
          params: METABASE_COUNT_FILTERS[input.dashboard_id as keyof typeof METABASE_COUNT_FILTERS].reduce(
            (acc: Record<string, string[]>, count) => {
              acc[`school_id${count}`] = input.school_id ? [input.school_id] : [];
              return acc;
            },
            {
              school_id: input.school_id ? [input.school_id] : [],
            }
          ),
          exp: expiryMinute10,
        };

        const token = await jwt.sign(payload, METABASE_SECRET_KEY as string);
        const iframeUrl = `${METABASE_SITE_URL}/embed/dashboard/${token}#bordered=false&titled=false`;
        await fetch(iframeUrl);

        const data = {
          url: iframeUrl,
        };
        return data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
});
