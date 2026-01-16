import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient } from '/src/utils/api';
import handleTRPCError from '/src/utils/trpcErrorHandler';
import { OfferingType } from '/src/constants/offering';
import { OrderType } from '/src/constants/orders';
import { DashboardDependentFulfillment, GuardianDependentOrder, OptionalOrder } from '@cometa/trpc/src/types';

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
      handleTRPCError(err);
    }
  }),
  fulfillments: protectedProcedure
    .input(
      z.object({
        guardian_id: z.string(),
        school_id: z.string(),
      })
    )
    .output(
      z.any().transform((data) => ({
        ...data,
        results:
          data.results?.map((item: DashboardDependentFulfillment) => ({
            ...item,
            orderType: OrderType.SCHOLAR as const,
          })) || [],
      }))
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
        handleTRPCError(err);
      }
    }),
  guardianOptionalOrders: protectedProcedure
    .input(
      z.object({
        guardian_id: z.string(),
        multiple_search: z.string().optional(),
        page_size: z.number().optional(),
        school_id: z.string(),
        offering: z.array(z.enum([OfferingType.SCHOLAR, OfferingType.OPEN_LOOP, OfferingType.MIX])).optional(),
      })
    )
    .output(
      z.any().transform((data) => ({
        ...data,
        results:
          data.results?.map((item: GuardianDependentOrder) => ({ ...item, orderType: OrderType.OPTIONAL as const })) ||
          [],
      }))
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardGuardiansOptionalOrdersList(
          input.guardian_id,
          {
            multiple_search: input.multiple_search,
            school: input.school_id,
            page_size: input.page_size,
            offering: input.offering,
          },
          { headers: { Authorization: `Token ${ctx.session.token}` } }
        );
        const data = response.data;
        return data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  schoolOptionalOrders: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        multiple_search: z.string().optional(),
        page_size: z.number().optional(),
        offering: z.array(z.enum([OfferingType.SCHOLAR, OfferingType.OPEN_LOOP, OfferingType.MIX])).optional(),
      })
    )
    .output(
      z.any().transform((data) => ({
        ...data,
        results:
          data.results?.map((item: OptionalOrder) => ({ ...item, orderType: OrderType.ONLINE_STORE as const })) || [],
      }))
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsOptionalOrdersList(
          input.school_id,
          {
            multiple_search: input.multiple_search,
            page_size: input.page_size,
            offering: input.offering,
          },
          { headers: { Authorization: `Token ${ctx.session.token}` } }
        );
        const data = response.data;
        return data;
      } catch (err) {
        handleTRPCError(err);
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
      handleTRPCError(err);
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
        handleTRPCError(err);
      }
    }),
});
