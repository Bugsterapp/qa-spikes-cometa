import { ConceptCategory, InstitutionalUnitType } from '@cometa/trpc/src/concepts/types';
import { type AvailableScholarship, TypeF30Enum } from '@cometa/trpc/src/types';
import { ServiceClient } from 'src/utils/api';
import { ConceptsServiceClient } from 'src/utils/apiConcepts';
import {
  scopeAdjustmentSchema,
  typeAdjustmentSchema,
  typeCalculationAdjustmentSchema,
} from 'src/utils/static_data/zEnums';
import handleTRPCError from 'src/utils/trpcErrorHandler';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '../trpc';

const CONCEPTS_API_TOKEN = process.env.NEXT_PUBLIC_CONCEPTS_API_TOKEN;

interface QueryParams {
  page: number;
  page_size: number;
  order_by?: string;
  order_type?: string;

  [key: string]: unknown;
}

const createAndUpdateScholarshipSchema = {
  institutional_id: z.string(),
  institutional_type: z.nativeEnum(InstitutionalUnitType).default(InstitutionalUnitType.SCHOOL),
  name: z.string(),
  scope: scopeAdjustmentSchema,
  categories: z.array(z.nativeEnum(ConceptCategory)).optional(),
  specificConcepts: z.array(z.string()).optional(),
  type: typeAdjustmentSchema.default('SCHOLARSHIP'),
  calculation_type: typeCalculationAdjustmentSchema,
  calculation_value: z.number().or(z.string()),
};

export const scholarshipsRouter = createTRPCRouter({
  scholarships: protectedProcedure.input(z.object({ studentId: z.string() })).query(async ({ input, ctx }) => {
    try {
      const response = await ServiceClient.apiV1DashboardStudentsAvailableScholarshipsList(input.studentId, {
        headers: {
          Authorization: `Token ${ctx.session.token}`,
        },
      });
      return response.data;
    } catch (err) {
      handleTRPCError(err);
    }
  }),
  scholarshipDetails: protectedProcedure
    .input(z.object({ scholarshipId: z.string(), studentId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardStudentsAvailableScholarshipsRetrieve(
          input.scholarshipId,
          input.studentId,
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
  generateStudentsScholarshipsReport: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        levels: z.array(z.string()).optional(),
        sections: z.array(z.string()).optional(),
        scholarships: z.array(z.string()),
        school_cycle: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsScholarshipAssignmentsXlsV2Create(
          input.schoolId,
          {
            school_cycle: input.school_cycle,
            levels: input.levels,
            sections: input.sections,
            scholarships: input.scholarships,
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

  avoidScholarship: protectedProcedure
    .input(
      z.object({
        fulfillment_id: z.string(),
        school_id: z.string(),
        data: z.object({
          scholarship_id: z.string(),
          action: z.enum(['perform', 'revert']),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsFulfillmentsAvoidScholarshipPartialUpdate(
          input.fulfillment_id,
          input.school_id,
          input.data,
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

  forceScholarship: protectedProcedure
    .input(
      z.object({
        fulfillment_id: z.string(),
        school_id: z.string(),
        data: z.object({
          scholarship_id: z.string(),
          action: z.enum(['perform', 'revert']),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsFulfillmentsForceScholarshipPartialUpdate(
          input.fulfillment_id,
          input.school_id,
          input.data,
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
  assignScholarship: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        data: z.object({
          school_cycle: z.string(),
          students: z.array(z.string()),
          scholarship_id: z.string(),
        }),
        confirmSponsoredPayment: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const query = input.confirmSponsoredPayment
          ? { confirm_sponsored_payment: input.confirmSponsoredPayment }
          : undefined;

        const response = await ServiceClient.apiV1DashboardSchoolsMassiveScholarshipAssignmentsCreate(
          input.school_id,
          {
            school_cycle_ids: [input.data.school_cycle],
            student_ids: input.data.students,
            scholarship_id: input.data.scholarship_id,
          },
          query,
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );
        return response.data;
      } catch (err: any) {
        const errorData = err?.response?.data || err?.error || err?.data;
        const status = err?.status || err?.response?.status;
        if (status === 409 && errorData) {
          if (errorData.error === 'sponsored_payment_risk' || errorData.validation_method) {
            const sponsoredError = new TRPCError({
              code: 'CONFLICT',
              message: errorData.message || 'Sponsored payment validation required',
              cause: errorData,
            });
            (sponsoredError as any).customData = { sponsoredPayment: errorData };
            throw sponsoredError;
          }
        }
        handleTRPCError(err);
      }
    }),

  getAssignmentStatus: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        assignment_id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsMassiveScholarshipAssignmentsRetrieve(
          input.assignment_id,
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

  cancelAssignment: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        assignment_id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await ServiceClient.apiV1DashboardSchoolsMassiveScholarshipAssignmentsDestroy(
          input.assignment_id,
          input.school_id,
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );
        return { success: true };
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  listScholarships: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        cursor: z.string().nullish(),
        page_size: z.number().default(10),
        search: z.string().optional(),
        ordering: z.array(z.string()).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const page = input.cursor ? Number(input.cursor) : 1;

        const filters = [
          {
            field: 'institutional_unit_id',
            operator: 'eq',
            value: input.school_id,
          },
          {
            field: 'type',
            operator: 'eq',
            value: 'SCHOLARSHIP',
          },
        ];

        if (input.search) {
          filters.push({
            field: 'name',
            operator: 'contains',
            value: input.search,
          });
        }

        const requestParams: {
          headers: { Authorization: string };
          query: QueryParams;
        } = {
          headers: {
            Authorization: `Bearer ${CONCEPTS_API_TOKEN}`,
          },
          query: {
            page,
            page_size: input.page_size,
          },
        };

        filters.forEach((filter, index) => {
          requestParams.query[`filters[${index}][field]`] = filter.field;
          requestParams.query[`filters[${index}][operator]`] = filter.operator;
          requestParams.query[`filters[${index}][value]`] = filter.value;
        });

        if (input.ordering) {
          requestParams.query.ordering = input.ordering;
        }

        const response = await ConceptsServiceClient.findAdjustmentsApiV1AdjustmentsGet(requestParams);

        const results = response.data.results.map((adjustment) => ({
          id: adjustment.id,
          name: adjustment.name,
          type: adjustment.calculation.type === 'PERCENTAGE' ? TypeF30Enum.PERCENT : TypeF30Enum.FIXED,
          value: adjustment.calculation.value,
          affected_concept_types:
            adjustment.applicability.scope === 'BY_CATEGORY' ? adjustment.applicability.categories : [],
          concepts:
            adjustment.applicability.scope === 'SPECIFIC_CONCEPTS'
              ? adjustment.applicability.specificConcepts.map((id: string) => ({ id }))
              : [],
        }));

        const nextCursor =
          response.data.currentPage < response.data.totalPages ? String(response.data.currentPage + 1) : null;
        const prevCursor = response.data.currentPage > 1 ? String(response.data.currentPage - 1) : null;

        return {
          count: response.data.count,
          next: nextCursor,
          previous: prevCursor,
          results,
        };
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  availableScholarships: protectedProcedure
    .input(
      z.object({
        studentId: z.string(),
        schoolId: z.string(),
        page: z.number().default(1),
        page_size: z.number().default(300),
      })
    )
    .query(async ({ input }) => {
      try {
        const filters = [
          {
            field: 'institutional_unit_id',
            operator: 'eq',
            value: input.schoolId,
          },
          {
            field: 'type',
            operator: 'eq',
            value: 'SCHOLARSHIP',
          },
        ];

        const requestParams: {
          headers: { Authorization: string };
          query: QueryParams;
        } = {
          headers: {
            Authorization: `Bearer ${CONCEPTS_API_TOKEN}`,
          },
          query: {
            page: input.page,
            page_size: input.page_size,
          },
        };

        filters.forEach((filter, index) => {
          requestParams.query[`filters[${index}][field]`] = filter.field;
          requestParams.query[`filters[${index}][operator]`] = filter.operator;
          requestParams.query[`filters[${index}][value]`] = filter.value;
        });

        requestParams.query.order_by = 'name';
        requestParams.query.order_type = 'asc';

        const response = await ConceptsServiceClient.findAdjustmentsApiV1AdjustmentsGet(requestParams);

        const scholarships = response.data.results.map((adjustment) => ({
          id: adjustment.id,
          name: adjustment.name,
          type: adjustment.calculation.type === 'PERCENTAGE' ? TypeF30Enum.PERCENT : TypeF30Enum.FIXED,
          value: adjustment.calculation.value,
          is_already_assigned: false,
          concepts: [],
          scholarship: adjustment.id,
        }));

        return scholarships as AvailableScholarship[];
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  getScholarshipById: protectedProcedure.input(z.object({ scholarshipId: z.string() })).query(async ({ input }) => {
    try {
      const response = await ConceptsServiceClient.findAdjustmentByIdApiV1AdjustmentsAdjustmentIdGet(
        input.scholarshipId,
        {
          headers: {
            Authorization: `Bearer ${CONCEPTS_API_TOKEN}`,
          },
        }
      );
      return response.data;
    } catch (err) {
      handleTRPCError(err);
    }
  }),
  create: protectedProcedure.input(z.object(createAndUpdateScholarshipSchema)).mutation(async ({ input, ctx }) => {
    try {
      const response = await ConceptsServiceClient.createAdjustmentApiV1AdjustmentsPost(
        {
          type: input.type,
          calculation: {
            type: input.calculation_type,
            value: input.calculation_value,
          },
          name: input.name,
          applicability: {
            scope: input.scope,
            categories: input.categories,
            specificConcepts: input.specificConcepts,
          },
          institutionalContext: {
            unitId: input.institutional_id,
            unitType: input.institutional_type,
          },
          createdById: ctx.session.user.id,
        },
        {
          headers: {
            Authorization: `Bearer ${CONCEPTS_API_TOKEN}`,
          },
        }
      );
      return response.data;
    } catch (err) {
      handleTRPCError(err);
    }
  }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await ConceptsServiceClient.deleteAdjustmentApiV1AdjustmentsAdjustmentIdDelete(input.id, {
          headers: {
            Authorization: `Bearer ${CONCEPTS_API_TOKEN}`,
          },
        });
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        ...createAndUpdateScholarshipSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const data = {
          applicability: {
            scope: input.scope,
            categories: input.categories,
            specificConcepts: input.specificConcepts,
          },
          calculation: {
            type: input.calculation_type,
            value: input.calculation_value,
          },
          institutionalContext: {
            unitId: input.institutional_id,
            unitType: input.institutional_type,
          },
          name: input.name,
          type: input.type,
          updatedById: ctx.session.user.id,
        };
        const response = await ConceptsServiceClient.updateAdjustmentApiV1AdjustmentsAdjustmentIdPatch(input.id, data, {
          headers: {
            Authorization: `Bearer ${CONCEPTS_API_TOKEN}`,
          },
        });
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
});
