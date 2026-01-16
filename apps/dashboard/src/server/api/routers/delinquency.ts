import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient } from '/src/utils/api';
import handleTRPCError from '/src/utils/trpcErrorHandler';
import { ConceptTypesEnum, FulfillmentStatusesEnum } from '@cometa/trpc/src/types';

const querySchema = z.object({
  concepts: z.array(z.string()).optional(),
  due_monthly_concepts: z.array(z.string(z.enum(['high', 'low', 'mid', 'zero']))).optional(),
  fulfillment_statuses: z.array(z.string(z.enum(['NOT_PAID', 'PARTIAL_PAID', 'WAITING_PAID']))).optional(),
  concept_types: z.array(z.nativeEnum(ConceptTypesEnum)).optional(),
  guardian: z.string().optional(),
  levels: z.array(z.string()).optional(),
  orders: z.array(z.string()).optional(),
  page: z.number().optional(),
  search: z.string().optional(),
  sections: z.array(z.string()).optional(),
  school_cycles: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
  state: z.optional(z.array(z.enum(['active', 'dropped_out', 'graduated', 'inactive', 'new_student']))),
  exclude_student_leads: z.boolean().optional(),
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
        const response = await ServiceClient.apiV1DashboardSchoolsStudentsDelinquencySummaryList(
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
  getDelinquentFulfillments: protectedProcedure
    .input(
      z.object({
        student_id: z.string(),
        query: querySchema.optional(),
        cursor: z.string().nullish(), // <-- "cursor" needs to exist, but can be any type
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardStudentsFulfillmentsList(
          input.student_id,
          {
            page: Number(input.cursor) || 1,
            group: 'delinquent',
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
  studentsList: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        cursor: z.string().nullish(),
        query: z.object({
          concepts: z.array(z.string()),
          end_date: z.string().optional(),
          is_active: z.boolean().optional(),
          page: z.number().optional(),
          page_size: z.number().optional(),
          start_date: z.string().optional(),
        }),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsDelinquencyStudentsList(
          input.schoolId,
          {
            ...input.query,
            page: input.query.page || 1,
            page_size: input.query.page_size || 10,
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
        throw err;
      }
    }),
  retrieveInvoiceReportColumns: protectedProcedure
    .input(z.object({ schoolId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsStudentsDelinquencyColumnsRetrieve(input.schoolId, {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
        });
        const data = response.data;
        return data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  getReport: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        data: z.object({
          concepts: z.array(z.string()).optional(),
          due_monthly_concepts: z.array(z.string(z.enum(['high', 'low', 'mid', 'zero']))).optional(),
          fulfillment_statuses: z.array(z.nativeEnum(FulfillmentStatusesEnum)).optional(),
          concept_types: z.array(z.nativeEnum(ConceptTypesEnum)).optional(),
          guardian: z.string().optional(),
          levels: z.array(z.string()).optional(),
          orders: z.array(z.string()).optional(),
          page: z.number().optional(),
          search: z.string().optional(),
          sections: z.array(z.string()).optional(),
          school_cycles: z.array(z.string()).optional(),
          is_active: z.boolean().optional(),
          state: z.optional(z.array(z.enum(['active', 'dropped_out', 'graduated', 'inactive', 'new_student']))),
          exclude_student_leads: z.boolean().optional(),
        }),
        config: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsStudentsDelinquencyXlsV2Create(
          input.schoolId,
          {
            ...input.data,
            config: input.config,
          },
          undefined,
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
