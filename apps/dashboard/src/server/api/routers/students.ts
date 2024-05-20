import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient } from '/src/utils/api';

const querySchema = z.object({
  is_active: z.optional(z.boolean()),
  concept_types: z.optional(z.array(z.enum(['INSCRIPTION', 'MONTHLY_FEE', 'OTHER', 'PRE_DEBT', 'TRANSPORT']))),
  concepts: z.optional(z.array(z.string())),
  delinquency: z.optional(z.array(z.enum(['high', 'low', 'mid', 'zero']))),
  due_monthly_concepts: z.optional(z.array(z.enum(['high', 'low', 'mid', 'zero']))),
  due_orders: z.optional(z.array(z.enum(['high', 'low', 'mid', 'zero']))),
  fulfillment_statuses: z.optional(z.array(z.enum(['NOT_PAID', 'PARTIAL_PAID', 'WAITING_PAID']))),
  guardian: z.optional(z.array(z.string())),
  levels: z.optional(z.array(z.string())),
  scholarships: z.optional(z.array(z.string())),
  ordering: z.optional(
    z.array(
      z.enum([
        '-due_orders',
        '-due_orders_total',
        '-first_name',
        '-last_name',
        '-level',
        '-section',
        'due_orders',
        'due_orders_total',
        'first_name',
        'last_name',
        'level',
        'section',
      ])
    )
  ),
  orders: z.optional(z.array(z.string())),
  page: z.optional(z.number()),
  page_size: z.optional(z.number()),
  school_cycle: z.optional(z.string()),
  search: z.optional(z.string()),
  sections: z.optional(z.array(z.string())),
  inscription_status: z.optional(
    z.array(z.enum(['Inscrito', 'No inscrito', 'NOT_AVAILABLE', 'Pending', 'Reinscrito', 'Pendiente']))
  ),
});
export const studentsRouter = createTRPCRouter({
  generateExcelReport: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        search: z.string().optional(),
        guardian: z.array(z.string()).optional(),
        levels: z.array(z.string()).optional(),
        delinquency: z.array(z.enum(['low', 'high', 'mid', 'zero'])).optional(),
        sections: z.array(z.string()).optional(),
        is_active: z.boolean().optional(),
        school_cycle: z.string().optional(),
        inscription_status: z.optional(
          z.array(z.enum(['Inscrito', 'NOT_AVAILABLE', 'No inscrito', 'Pendiente', 'Reinscrito']))
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const response = await ServiceClient.apiV1DashboardSchoolsStudentsExcelCreate(
        input.school_id,
        //TODO: Check schema to accept nullish values
        null as any,
        input,
        {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
        }
      );
      return response.data;
    }),
  dashboardSchoolDueOrdersStudents: protectedProcedure
    .input(z.object({ schoolId: z.string(), query: querySchema.optional() }))
    .query(async ({ input, ctx }) => {
      try {
        //@ts-ignore
        const response = await ServiceClient.apiV1DashboardSchoolsDueOrdersStudentsList(input.schoolId, input.query, {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
        });
        const data = response.data;
        return data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
  dashboardSchoolDueOrdersStudentDetail: protectedProcedure
    .input(z.object({ schoolId: z.string(), studentId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsDueOrdersStudentsRetrieve(
          input.studentId,
          input.schoolId,
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );
        const data = response.data;
        return data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
  inactivateStudent: protectedProcedure
    .input(z.object({ forgive_debt: z.boolean(), studentId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardStudentsInactivateDestroy(input.studentId, {
          body: {
            forgive_debt: input.forgive_debt,
          },
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
          format: 'json',
          type: 'application/json',
        } as any);
        if (!response.ok) {
          throw Error('Failed to inactivate student');
        }

        return response.data;
      } catch (err: any) {
        Sentry.captureException(err);
        throw Error(err.message);
      }
    }),
  studentConcepts: protectedProcedure
    .input(z.object({ studentId: z.string(), cycle_id: z.array(z.string()).optional() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardStudentsConceptsList(
          input.studentId,
          {
            cycle_id: input.cycle_id,
          } as any,
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );
        const data = response.data;
        return data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
  schoolCycleList: protectedProcedure.input(z.object({ schoolId: z.string() })).query(async ({ input, ctx }) => {
    try {
      const response = await ServiceClient.apiV1DashboardSchoolsCyclesList(
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
      Sentry.captureException(err);
    }
  }),
  studentFilters: protectedProcedure.input(z.object({ school_id: z.string() })).query(async ({ input, ctx }) => {
    try {
      const response = await ServiceClient.apiV1DashboardSchoolsDueOrdersStudentsFiltersRetrieve(input.school_id, {
        headers: {
          Authorization: `Token ${ctx.session.token}`,
        },
      });
      const data = response.data;
      return data;
    } catch (err) {
      Sentry.captureException(err);
    }
  }),
  studentsInscriptionsDetail: protectedProcedure
    .input(z.object({ schoolId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsStudentsInscriptionsSummaryRetrieve(input.schoolId, {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
          baseUrl: process.env.NEXT_PUBLIC_SERVER_API_BASE_URL,
        });
        const data = response.data;
        return data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
  studentsAssignments: protectedProcedure
    .input(z.object({ studentId: z.string(), ended: z.boolean().optional(), optional: z.boolean() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardStudentsAssignmentsList(
          input.studentId,
          {
            ended: input.ended,
            optional: input.optional,
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
        Sentry.captureException(err);
      }
    }),
});
