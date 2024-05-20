import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient } from '/src/utils/api';
import handleTRPCError from '/src/utils/trpcErrorHandler';

const querySchema = z.object({
  concepts: z.array(z.string()).optional(),
  due_monthly_concepts: z.array(z.string(z.enum(['high', 'low', 'mid', 'zero']))).optional(),
  fulfillment_statuses: z.array(z.string(z.enum(['NOT_PAID', 'PARTIAL_PAID', 'WAITING_PAID']))).optional(),
  concept_types: z.array(
    z.optional(
      z.enum([
        'BOOKS_AND_MATERIALS',
        'CAFETERIA',
        'EXAMS_AND_CERTIFICATES',
        'EXTRACURRICULAR',
        'INSCRIPTION',
        'MONTHLY_FEE',
        'OTHER',
        'PRE_DEBT',
        'REINSCRIPTION',
        'SPORTS',
        'TRANSPORT',
        'UNIFORMS_AND_MERCH',
      ])
    )
  ),
  guardian: z.string().optional(),
  levels: z.array(z.string()).optional(),
  orders: z.array(z.string()).optional(),
  page: z.number().optional(),
  search: z.string().optional(),
  sections: z.array(z.string()).optional(),
  school_cycles: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
});

export const delinquencyRouter = createTRPCRouter({
  getDelinquency: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        query: querySchema.optional(),
        cursor: z.string().nullish(), // <-- "cursor" needs to exist, but can be any type
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsStudentsDelinquencyList(
          input.school_id,
          {
            page: Number(input.cursor) || 1,
            page_size: 25,
            ...(input.query as any),
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
  getDelinquencyByStudentId: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        student_id: z.string(),
        cursor: z.string().nullish(), // <-- "cursor" needs to exist, but can be any type
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsStudentsDelinquencyRetrieve(
          input.student_id,
          input.school_id,
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
  getDelinquencyFilters: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        query: querySchema.optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsStudentsDelinquencyFiltersRetrieve(input.schoolId, {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
        });
        // had to do this because the typing is shit.
        const data = response.data;
        return data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
});
