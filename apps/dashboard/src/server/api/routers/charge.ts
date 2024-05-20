import { z } from 'zod';
import { Api } from '@cometa/trpc/src/types';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient } from '/src/utils/api';
import handleTRPCError from '/src/utils/trpcErrorHandler';

enum ConceptTypes {
  INSCRIPTION = 'INSCRIPTION',
  MONTHLY_FEE = 'MONTHLY_FEE',
  OTHER = 'OTHER',
  PRE_DEBT = 'PRE_DEBT',
  TRANSPORT = 'TRANSPORT',
}

export const chargeRouter = createTRPCRouter({
  generateExcelReport: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        start_date: z.string().optional(),
        end_date: z.string().optional(),
        concepts: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const response = await ServiceClient.apiV1DashboardSchoolsDelinquencyStudentsExcelCreate(
        input.schoolId,
        {
          start_date: input.start_date,
          end_date: input.end_date,
          concepts: input.concepts,
        },
        //TODO: Check schema to accept nullish values
        null as any,
        {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
        }
      );
      return response.data;
    }),
  schoolCycleList: protectedProcedure
    .input(z.object({ schoolId: z.string(), is_active: z.boolean().optional() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsCyclesList(
          input.schoolId,
          {
            is_active: input.is_active,
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
  conceptsList: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        school_cycles: z.array(z.string()).optional(),
        type: z.array(z.nativeEnum(ConceptTypes)).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const client = new Api();
      try {
        const response = await client.api.apiV1DashboardSchoolsConceptsList(
          input.schoolId,
          {
            school_cycles: input.school_cycles,
            type: input.type,
          },
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
  conceptTypesList: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const client = new Api();
      try {
        const response = await client.api.apiV1DashboardSchoolsResumeRetrieve(input.schoolId, {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
          baseUrl: process.env.NEXT_PUBLIC_SERVER_API_BASE_URL,
        });
        const data = response.data;
        return data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
});
