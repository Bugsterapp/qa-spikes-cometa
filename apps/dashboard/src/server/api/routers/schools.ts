import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient } from '/src/utils/api';
import { TRPCError } from '@trpc/server';
import { ContentType, TypeF30Enum } from '@cometa/trpc/src/types';

const querySchema = z.object({
  concepts: z.array(z.string()).optional(),
  search: z.string().optional(),
  delinquency: z.optional(z.array(z.enum(['high', 'low', 'mid', 'zero']))),
  has_debt: z.optional(z.boolean()),
  scholarships: z.optional(z.array(z.string())),
});

const querySchemaAssignments = z.object({
  concept: z.string(),
  students: z.array(z.string()),
  orders: z.array(z.string()),
});

export const schoolsRouter = createTRPCRouter({
  schoolsCycles: protectedProcedure
    .input(z.object({ school_id: z.string(), is_active: z.boolean().optional() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsCyclesList(
          input.school_id,
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
        Sentry.captureException(err);
      }
    }),
  schoolSpecialOverchargeCreate: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        is_visible: z.boolean(),
        order_id: z.string(),
        student_id: z.string(),
        type: z.nativeEnum(TypeF30Enum),
        value: z.string(),
        name: z.string(),
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsSpecialOverChargesCreate(
          input.school_id,
          {
            is_visible: input.is_visible,
            order: input.order_id,
            student: input.student_id,
            type: input.type,
            value: input.value,
            name: input.name,
            id: input.id,
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
        Sentry.captureException(err);
      }
    }),
  schoolSpecialOverchargeDestroy: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        special_over_charge_id: z.string(),
        student_id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsSpecialOverChargesDestroy(
          input.special_over_charge_id,
          input.school_id,
          {
            body: {
              student_id: input.student_id,
            },
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
            format: 'json',
            type: ContentType.Json,
          } as any
        );
        const data = response.data;
        return data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),

  schoolFiscalEntities: protectedProcedure.input(z.object({ school_id: z.string() })).query(async ({ input, ctx }) => {
    try {
      const response = await ServiceClient.apiV1DashboardSchoolsFiscalEntitiesList(input.school_id, {
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
  // bank account list
  bankAccountList: protectedProcedure
    .input(z.object({ school_id: z.string(), is_active: z.boolean().optional() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsBankAccountsList(
          input.school_id,
          {},
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
  schoolsConceptsList: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        school_cycles: z.array(z.string()).optional(),
        multiple_search: z.string().optional(),
        type: z.array(z.enum(['INSCRIPTION', 'MONTHLY_FEE', 'OTHER', 'PRE_DEBT', 'TRANSPORT'])).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsConceptsList(
          input.school_id,
          {
            school_cycles: input.school_cycles,
            type: input.type,
            multiple_search: input.multiple_search,
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
        Sentry.captureException(err);
      }
    }),
  schoolsConceptsCreate: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        // CreateConcept,
        data: z.any(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsConceptsCreate(input.school_id, input.data, {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
        });
        if (response.status === 400) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred, please try again later.',
            // optional: pass the original error to retain stack trace
            cause: 'errors',
          });
        }

        const data = response.data;
        if (!response.data) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred, please try again later.',
            // optional: pass the original error to retain stack trace
            cause: 'errors',
          });
        }
        return data;
      } catch (err) {
        Sentry.captureException(err);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: JSON.stringify((err as any)?.error || {}),
          cause: (err as any)?.error,
        });
      }
    }),

  schoolsConceptsFilters: protectedProcedure
    .input(z.object({ school_id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsConceptsFiltersRetrieve(input.school_id, {
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
  schoolsConceptDetail: protectedProcedure
    .input(z.object({ school_id: z.string(), concept_id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsConceptsRetrieve(input.concept_id, input.school_id, {
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
  schoolsConceptOrdersList: protectedProcedure
    .input(z.object({ concept_id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardConceptsOrdersList(
          input.concept_id,
          {},
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
  schoolsStudentsByLevelList: protectedProcedure
    .input(z.object({ school_id: z.string(), concept_id: z.string(), query: querySchema.optional() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsStudentsByLevelList(
          input.concept_id,
          input.school_id,
          input.query,
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
  //apiV1DashboardSchoolsMassiveAssignmentsCreate
  schoolsAssignmentsCreate: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        data: querySchemaAssignments,
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsMassiveAssignmentsCreate(
          input.school_id,
          input.data,
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );
        if (response.status === 400) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred, please try again later.',
            // optional: pass the original error to retain stack trace
            cause: 'errors',
          });
        }

        const data = response.data;
        if (!response.data) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred, please try again later.',
            // optional: pass the original error to retain stack trace
            cause: 'errors',
          });
        }
        return data;
      } catch (err) {
        Sentry.captureException(err);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: JSON.stringify((err as any)?.error || {}),
          cause: (err as any)?.error,
        });
      }
    }),

  schoolsStudentsByLevelFilters: protectedProcedure
    .input(z.object({ school_id: z.string(), concept_id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsStudentsByLevelFiltersRetrieve(
          input.concept_id,
          input.school_id,
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

  schoolsProductKeysList: protectedProcedure
    .input(z.object({ school_id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsConceptsProductKeysRetrieve(input.school_id, {
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
  schoolsTaxUnitsList: protectedProcedure.input(z.object({ school_id: z.string() })).query(async ({ input, ctx }) => {
    try {
      const response = await ServiceClient.apiV1DashboardSchoolsConceptsTaxUnitsRetrieve(input.school_id, {
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
  schoolsAttributesList: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        query: z
          .object({
            page: z.union([z.number().optional(), z.undefined()]),
            page_size: z.union([z.number().optional(), z.undefined()]),
          })
          .optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsAttributesList(input.school_id, input.query, {
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

  schoolsConceptsWithAttributesCreate: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        data: z.any(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsConceptsCreateWithAttributesCreate(
          input.school_id,
          input.data,
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
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: JSON.stringify((err as any)?.error || {}),
          cause: (err as any)?.error,
        });
      }
    }),
  schoolsConceptWithSingleOrderCreate: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        data: z.any(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsConceptsCreateWithSinglePaymentCreate(
          input.school_id,
          input.data,
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
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: JSON.stringify((err as any)?.error || {}),
          cause: (err as any)?.error,
        });
      }
    }),
  schoolsSpecialDiscountsDestroy: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsSpecialDiscountsDestroy(input.id, input.school_id, {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
          format: 'json',
          type: ContentType.Json,
        });
        if (!response.ok) {
          throw Error('Failed to inactivate student');
        }
        return response.data;
      } catch (err) {
        Sentry.captureException(err);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: JSON.stringify((err as any)?.error || {}),
          cause: (err as any)?.error,
        });
      }
    }),
});
