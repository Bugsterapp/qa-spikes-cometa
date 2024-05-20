import { z } from 'zod';
import { Api } from '@cometa/trpc/src/types';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import handleTRPCError from '/src/utils/trpcErrorHandler';

// const client = new Api();

// type Params = Parameters<typeof client.api.apiV1DashboardSchoolsDueOrdersStudentsList>;

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure.input(z.object({ text: z.string() })).query(({ input }) => ({
    greeting: `Hello ${input.text}`,
  })),

  dashboardSchoolDueOrdersStudents: protectedProcedure
    .input(z.object({ schoolId: z.string() }))
    .query(async ({ input, ctx }) => {
      const client = new Api();
      try {
        const response = await client.api.apiV1DashboardSchoolsDueOrdersStudentsList(
          input.schoolId,
          {},
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
            baseUrl: process.env.NEXT_PUBLIC_SERVER_API_BASE_URL,
          }
        );
        const data = response.data;
        return data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
});
