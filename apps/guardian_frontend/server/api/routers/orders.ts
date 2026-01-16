import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient } from '~/utils/api';
import { OfferingEnum, StatusDc1Enum } from '@cometa/trpc/src/types';

const enumStatus = z.array(z.nativeEnum(StatusDc1Enum));
const enumDueStatus = z.enum(['future', 'outstanding']);
const inputs = z.object({
  schoolId: z.string(),
  status: enumStatus.optional(),
  due_status: enumDueStatus.optional(),
});

export const ordersRouter = createTRPCRouter({
  getSchoolOrders: protectedProcedure.input(inputs).query(async ({ input, ctx }) => {
    try {
      const response = await ServiceClient.apiV1SchoolsOrdersList(
        input.schoolId,
        {
          status: input.status,
          page_size: 300, // hardcoded until we have a better solution
        },
        {
          headers: {
            token: ctx.session.token,
          },
        }
      );
      const data = response.data;
      return data;
    } catch (err) {
      Sentry.captureException(err);
    }
  }),
  getGuardiansOptionalOrders: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        multiple_search: z.string().optional(),
        page: z.number().min(1).optional(),
        page_size: z.number().min(1).optional(),
        offering: z.array(z.nativeEnum(OfferingEnum)).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1SchoolsOptionalOrdersList(
          input.schoolId,
          {
            multiple_search: input.multiple_search,
            page: input.page,
            page_size: input.page_size,
            offering: input.offering?.length ? input.offering : undefined,
          },
          {
            headers: {
              token: ctx.session.token,
            },
          }
        );
        const data = response.data;
        return data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
  getOnlineStore: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        multiple_search: z.string().optional(),
        page: z.number().min(1).optional(),
        page_size: z.number().min(1).optional(),
        offering: z.array(z.nativeEnum(OfferingEnum)).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1SchoolsOnlineStoreList(
          input.schoolId,
          {
            multiple_search: input.multiple_search,
            page: input.page,
            page_size: input.page_size,
            offering: input.offering?.length ? input.offering : undefined,
          },
          {
            headers: {
              token: ctx.session.token,
            },
          }
        );
        const data = response.data;
        return data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
  getInvoiceUrls: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        studentId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1StudentsOrdersInvoiceUrlsRetrieve(input.orderId, input.studentId, {
          headers: {
            token: ctx.session.token,
          },
        });
        const data = response.data;
        return data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
  validateStock: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        data: z.array(
          z.object({
            order_id: z.string(),
            quantity: z.number().min(1),
          })
        ),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1SchoolsValidateStockCreate(
          input.schoolId,
          { data: input.data },
          {
            headers: {
              token: ctx.session.token,
            },
          }
        );
        const data = response.data;
        return data;
      } catch (err) {
        Sentry.captureException(err);
        return false;
      }
    }),
});

export const createOrdersCaller = ordersRouter.createCaller;
