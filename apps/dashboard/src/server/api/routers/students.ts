import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient } from '/src/utils/api';
import handleTRPCError from '/src/utils/trpcErrorHandler';

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
  ordering: z.array(z.string()).optional(),
  orders: z.optional(z.array(z.string())),
  page: z.optional(z.number()),
  page_size: z.optional(z.number()),
  school_cycle: z.optional(z.string()),
  search: z.optional(z.string()),
  sections: z.optional(z.array(z.string())),
  inscription_status: z.optional(
    z.array(z.enum(['Inscrito', 'No inscrito', 'NOT_AVAILABLE', 'Reinscrito', 'Pendiente']))
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
        concepts: z.array(z.string()).optional(),
        scholarships: z.array(z.string()).optional(),
        is_active: z.boolean().optional(),
        school_cycle: z.string().optional(),
        inscription_status: z.optional(
          z.array(z.enum(['Inscrito', 'NOT_AVAILABLE', 'No inscrito', 'Pendiente', 'Reinscrito']))
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const response = await ServiceClient.apiV2DashboardSchoolsDueOrdersStudentsXlsCreate(input.school_id, input, {
        headers: {
          Authorization: `Token ${ctx.session.token}`,
        },
      });
      return response.data;
    }),
  dashboardSchoolDueOrdersStudents: protectedProcedure
    .input(z.object({ schoolId: z.string(), v3: z.boolean(), query: querySchema.optional() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = input.v3
          ? await ServiceClient.apiV3DashboardSchoolsDueOrdersStudentsList(input.schoolId, input.query as any, {
              headers: {
                Authorization: `Token ${ctx.session.token}`,
              },
            })
          : await ServiceClient.apiV2DashboardSchoolsDueOrdersStudentsList(input.schoolId, input.query as any, {
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
        handleTRPCError(err);
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
        handleTRPCError(err);
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
        handleTRPCError(err);
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
      handleTRPCError(err);
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
        handleTRPCError(err);
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
        handleTRPCError(err);
      }
    }),
  lastEnrolled: protectedProcedure.input(z.object({ schoolId: z.string() })).query(async ({ input, ctx }) => {
    try {
      const response = await ServiceClient.apiV1DashboardSchoolsStudentsLastEnrolledRetrieve(
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
  studentConceptRetrive: protectedProcedure
    .input(z.object({ studentId: z.string(), conceptId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV2DashboardStudentsConceptsRetrieve(input.conceptId, input.studentId, {
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
  studentsOrdersList: protectedProcedure
    .input(
      z.object({
        student_id: z.string(),
        concepts: z.array(z.string()).optional(),
        ordering: z.array(z.string()).optional(),
        cursor: z.string().nullish(),
        page_size: z.number().optional(),
        status: z.array(z.enum(['DUE', 'PENDING', 'OUTSTANDING'])).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardStudentsOrdersList(
          input.student_id,
          {
            concepts: input.concepts,
            page: input.cursor ? Number(input.cursor) : undefined,
            page_size: input.page_size,
            status: input.status,
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
  inscriptionsSummary: protectedProcedure
    .input(z.object({ schoolId: z.string(), studentId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsStudentsInscriptionsRetrieve(
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
        handleTRPCError(err);
      }
    }),
});
