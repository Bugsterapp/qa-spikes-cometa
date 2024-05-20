import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient } from '/src/utils/api';
import { TRPCError } from '@trpc/server';
import { ContentType, TypeF30Enum } from '@cometa/trpc/src/types';
import handleTRPCError from '/src/utils/trpcErrorHandler';

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
export const typesOfConcepts = z.union([
  z.literal('BOOKS_AND_MATERIALS'),
  z.literal('CAFETERIA'),
  z.literal('EXAMS_AND_CERTIFICATES'),
  z.literal('EXTRACURRICULAR'),
  z.literal('INSCRIPTION'),
  z.literal('MONTHLY_FEE'),
  z.literal('OTHER'),
  z.literal('PRE_DEBT'),
  z.literal('REINSCRIPTION'),
  z.literal('SPORTS'),
  z.literal('TRANSPORT'),
  z.literal('UNIFORMS_AND_MERCH'),
]);
export const conceptType = z.array(typesOfConcepts);

export const schoolsRouter = createTRPCRouter({
  schoolsList: protectedProcedure.query(async ({ ctx }) => {
    try {
      const response = await ServiceClient.apiV1DashboardSchoolsList({
        headers: {
          Authorization: `Token ${ctx.session.token}`,
        },
      });
      const data = response.data;
      return data;
    } catch (err) {
      handleTRPCError(err);
      return [];
    }
  }),
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
        handleTRPCError(err);
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
        handleTRPCError(err);
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
        handleTRPCError(err);
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
      handleTRPCError(err);
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
        handleTRPCError(err);
      }
    }),
  schoolsConceptsList: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        school_cycles: z.array(z.string()).optional(),
        multiple_search: z.string().optional(),
        cursor: z.string().nullish(),
        page_size: z.number().optional(),
        type: z.array(typesOfConcepts).optional(),
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
            // @ts-ignore
            page: input.cursor ? Number(input.cursor) : undefined,
            page_size: input.page_size,
          },
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );
        const data = response.data || [];
        return data;
      } catch (err) {
        handleTRPCError(err);
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
        handleTRPCError(err);
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
        handleTRPCError(err);
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
        handleTRPCError(err);
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
        handleTRPCError(err);
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
        handleTRPCError(err);
      }
    }),
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
        handleTRPCError(err);
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
        handleTRPCError(err);
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
        handleTRPCError(err);
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
      handleTRPCError(err);
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
        handleTRPCError(err);
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
        handleTRPCError(err);
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
        handleTRPCError(err);
      }
    }),
  schoolsConceptsStudentsAssignedList: protectedProcedure
    .input(
      z.object({
        conceptId: z.string(),
        schoolId: z.string(),
        cursor: z.string().nullish(),
        query: z
          .object({
            page_size: z.number().optional(),
            with_payment_data: z.boolean().optional(),
            search: z.string().optional(),
            school_cycles: z.array(z.string()).optional(),
            sections: z.array(z.string()).optional(),
            levels: z.array(z.string()).optional(),
            concept_types: z.array(z.string()).optional(),
            scholarships: z.array(z.string()).optional(),
            paid_status: z.array(z.string()).optional(),
          })
          .optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsConceptsStudentsList(
          input.conceptId,
          input.schoolId,
          { ...input.query, page: input.cursor ? Number(input.cursor) : undefined },
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
  schoolsPayinsFulfillmentsColumns: protectedProcedure
    .input(z.object({ schoolId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsPayinsFulfillmentsColumnsRetrieve(input.schoolId, {
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

  schoolsConceptsStudentsAssignedIdsList: protectedProcedure
    .input(
      z.object({
        conceptId: z.string(),
        schoolId: z.string(),
        query: z
          .object({
            page_size: z.number().optional(),
            with_payment_data: z.boolean().optional(),
            search: z.string().optional(),
            school_cycles: z.array(z.string()).optional(),
            sections: z.array(z.string()).optional(),
            levels: z.array(z.string()).optional(),
            concept_types: z.array(z.string()).optional(),
            scholarships: z.array(z.string()).optional(),
            paid_status: z.array(z.string()).optional(),
          })
          .optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsConceptsStudentsList(
          input.conceptId,
          input.schoolId,
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
        handleTRPCError(err);
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
        handleTRPCError(err);
      }
    }),
  schoolsResume: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        school_cycle: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsStudentsResumeBySchoolRetrieve(
          input.school_id,
          { school_cycle: input.school_cycle },
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
  schoolsConceptsOrdersRetrive: protectedProcedure
    .input(z.object({ concept_id: z.string(), school_id: z.string(), search: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsConceptsOrdersList(
          input.concept_id,
          input.school_id,
          {
            search: input.search,
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
});
