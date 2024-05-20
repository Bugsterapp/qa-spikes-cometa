import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import ApiClient from '/src/services/ApiClient';
import { ServiceClient } from '/src/utils/api';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { UpdateQuantityRequestActionEnum } from '@cometa/trpc/src/types';
import handleTRPCError from '/src/utils/trpcErrorHandler';
export const conceptTypesEnum = z.enum([
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
]);
export const conceptsRouter = createTRPCRouter({
  deleteConcept: protectedProcedure
    .input(
      z.object({
        conceptId: z.string(),
        schoolId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsConceptsDestroy(input.conceptId, input.schoolId, {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
        });
        if (response.status === 403) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to delete this concept.',
          });
        }
        const data = response.data;
        return data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  conceptsProductKeysList: publicProcedure.query(async () => {
    try {
      // for some reason our ServiceClient doesnt work when it doesnt have a token or something, i dont know why it doesnt work, i'm sorry
      const response = await ApiClient.getProductKeys();
      return response as string[];
    } catch (err) {
      handleTRPCError(err);
    }
  }),
  conceptsTaxUnitsList: publicProcedure.query(async () => {
    try {
      // for some reason our ServiceClient doesnt work when it doesnt have a token or something, i dont know why it doesnt work, i'm sorry
      const response = await ApiClient.getTaxUnits();
      return response as string[];
    } catch (err) {
      handleTRPCError(err);
    }
  }),
  conceptsGetAssignStatus: protectedProcedure
    .input(z.object({ id: z.string(), schoolId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsMassiveAssignmentsRetrieve(input.id, input.schoolId, {
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
  conceptsGetDeassignStatus: protectedProcedure
    .input(z.object({ id: z.string(), schoolId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsMassiveDissassignmentsStatusRetrieve(
          input.id,
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
  conceptsStockHistoryList: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        schoolId: z.string(),
        page: z.number().optional(),
        cursor: z.string().nullish(),
        pageSize: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsStockHistoryList(
          input.schoolId,
          input.id,
          {
            page: Number(input.cursor) || 1,
            page_size: Number(input.pageSize) || 10,
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
  conceptsEditOrdersPrices: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        schoolId: z.string(),
        orders: z.array(z.string()),
        price: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsConceptsChangeOrderPricesPartialUpdate(
          input.id,
          input.schoolId,
          {
            orders: input.orders,
            price: input.price,
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
  conceptTypes: protectedProcedure
    .input(z.object({ schoolId: z.string(), school_cycle: z.array(z.string()) }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsCollectionsConceptTypesRetrieve(
          input.schoolId,
          {
            school_cycle: input.school_cycle ? [...input.school_cycle] : [],
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
  conceptsDeleteAssign: protectedProcedure
    .input(z.object({ id: z.string(), schoolId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsMassiveAssignmentsDestroy(input.id, input.schoolId, {
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
        if (response.status === 200) {
          return { success: true };
        }
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  conceptsUpdateQuantity: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        schoolId: z.string(),
        action: z.nativeEnum(UpdateQuantityRequestActionEnum),
        quantity: z.number(),
        observations: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsStockUpdateQuantityPartialUpdate(
          input.id,
          input.schoolId,
          { action: input.action, quantity: input.quantity, observations: input.observations },
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
        if (response.status === 200) {
          return response.data;
        }
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  conceptsChangeLimitedType: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        stock_id: z.string(),
        is_limited: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsStockChangeLimitPartialUpdate(
          input.stock_id,
          input.school_id,
          {
            is_limited: input.is_limited,
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
  conceptsGetStudentStatus: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        concept_id: z.string(),
        student_ids: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response =
          await ServiceClient.apiV1DashboardSchoolsMassiveDissassignmentsAssignmentStatusForStudentsCreate(
            input.school_id,
            {
              concept_id: input.concept_id,
              students_ids: input.student_ids,
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
  conceptsDeassignStudents: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        concept_id: z.string(),
        students_ids: z.array(z.string()),
        keep_debt: z.boolean(),
        delete_all: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsMassiveDissassignmentsDissasignCreate(
          input.school_id,
          {
            concept_id: input.concept_id,
            students_ids: input.students_ids,
            keep_debt: input.keep_debt,
            delete_all: input.delete_all,
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
  optionalConceptsOrdersList: protectedProcedure
    .input(
      z.object({
        conceptId: z.string(),
        schoolId: z.string(),
        query: z.object({ search: z.string().optional(), school: z.string().optional() }).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsOptionalConceptsOrdersList(
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
});
