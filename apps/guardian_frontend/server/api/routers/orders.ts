import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient } from '~/utils/api';
import { StatusDc1Enum } from '@cometa/trpc/src/types';

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
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1SchoolsOptionalOrdersList(
          input.schoolId,
          { multiple_search: input.multiple_search },
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
});

export const createOrdersCaller = ordersRouter.createCaller;
