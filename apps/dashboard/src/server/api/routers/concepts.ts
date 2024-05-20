import * as Sentry from '@sentry/nextjs';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import ApiClient from '/src/services/ApiClient';
import { ServiceClient } from '/src/utils/api';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

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
        Sentry.captureException(err);
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this concept.',
        });
      }
    }),
  conceptsProductKeysList: publicProcedure.query(async () => {
    try {
      // for some reason our ServiceClient doesnt work when it doesnt have a token or something, i dont know why it doesnt work, i'm sorry
      const response = await ApiClient.getProductKeys();
      return response as string[];
    } catch (err) {
      Sentry.captureException(err);
    }
  }),
  conceptsTaxUnitsList: publicProcedure.query(async () => {
    try {
      // for some reason our ServiceClient doesnt work when it doesnt have a token or something, i dont know why it doesnt work, i'm sorry
      const response = await ApiClient.getTaxUnits();
      return response as string[];
    } catch (err) {
      Sentry.captureException(err);
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
        Sentry.captureException(err);
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
        Sentry.captureException(err);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred, please try again later.',
          // optional: pass the original error to retain stack trace
          cause: JSON.stringify(err),
        });
      }
    }),
});
