import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient } from '/src/utils/api';

export const manualPaymentsRouter = createTRPCRouter({
  bankAccountList: protectedProcedure.input(z.object({ schoolId: z.string() })).query(async ({ input, ctx }) => {
    try {
      const response = await ServiceClient.apiV1DashboardSchoolsBankAccountsList(
        input.schoolId,
        {},
        {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
        }
      );
      const data = response.data;
      //    ^?
      return data;
    } catch (err) {
      Sentry.captureException(err);
    }
  }),
  fulfillments: protectedProcedure
    .input(
      z.object({
        guardian_id: z.string(),
        school_id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardGuardiansFulfillmentsList(
          input.guardian_id,
          {
            status: ['NOT_PAID', 'PARTIAL_PAID', 'WAITING_PAID'],
            school: input.school_id,
            page_size: 700,
          },
          { headers: { Authorization: `Token ${ctx.session.token}` } }
        );
        const data = response.data;
        return data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
  optionalOrders: protectedProcedure
    .input(
      z.object({
        guardian_id: z.string(),
        multiple_search: z.string().optional(),
        page_size: z.number().optional(),
        school_id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardGuardiansOptionalOrdersList(
          input.guardian_id,
          // @ts-ignore should fix when this type is correct
          { multiple_search: input.multiple_search, school: input.school_id, page_size: input.page_size },
          { headers: { Authorization: `Token ${ctx.session.token}` } }
        );
        const data = response.data;
        return data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
  studentDetails: protectedProcedure.input(z.object({ studentId: z.string() })).query(async ({ input, ctx }) => {
    try {
      const response = await ServiceClient.apiV1DashboardStudentsRetrieve(input.studentId, {
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
  patchRFC: protectedProcedure
    .input(z.object({ studentId: z.string(), billing_guardian: z.string().nullable() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardStudentsPartialUpdate(
          input.studentId,
          {
            billing_guardian: input.billing_guardian,
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
});
