import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { ServiceClient } from '/src/utils/api';
import { Type68EEnum } from '@cometa/trpc/src/types';
import handleTRPCError from '/src/utils/trpcErrorHandler';
export interface Root {
  collected_at: CollectedAt[];
  concepts: Concept[];
  orders: Order[];
  types: Type[];
  levels: Level[];
  sections: Section[];
}

export interface CollectedAt {
  id: string;
  name: string;
}

export interface Concept {
  id: string;
  name: string;
}

export interface Order {
  id: string;
  name: string;
}

export interface Type {
  id: string;
  name: string;
}

export interface Level {
  id: string;
  name: string;
}

export interface Section {
  id: string;
  name: string;
}

const querySchema = z.object({
  collected_at: z.array(z.enum(['collected_at_portal', 'collected_at_school'])).optional(),
  concepts: z.array(z.string()).optional(),
  billing_to: z.array(z.string()).optional(),
  end_date: z.string().optional(),
  guardians: z.array(z.string()).optional(),
  levels: z.array(z.string()).optional(),
  multiple_search: z.string().optional(),
  ordering: z.array(z.enum(['-created', '-paid_date', 'created', 'paid_date'])).optional(),
  orders: z.array(z.string()).optional(),
  page: z.number().optional(),
  page_size: z.number().optional(),
  search: z.string().optional(),
  sections: z.array(z.string()).optional(),
  start_date: z.string().optional(),
  students: z.array(z.string()).optional(),
  school_cycles: z.array(z.string()).optional(),
  registered_by: z.array(z.string()).optional(),
  invoice_statuses: z
    .array(
      z.union([
        z.literal('pending'),
        z.literal('canceled'),
        z.literal('canceling'),
        z.literal('failed'),
        z.literal('success'),
        z.literal('not_requested'),
      ])
    )
    .optional(),
  types: z
    .array(
      z.union([
        z.literal('account_money'),
        z.literal('atm'),
        z.literal('bank_transfer'),
        z.literal('credit'),
        z.literal('credit_card'),
        z.literal('debit_card'),
        z.literal('deposit_cash'),
        z.literal('deposit_check'),
        z.literal('multipay'),
        z.literal('nominal_check'),
        z.literal('prepaid_card'),
        z.literal('ticket'),
        z.literal('direct_debit'),
        z.literal('cash_payroll'),
        z.null(),
      ])
    )
    .optional(),
  concept_types: z.array(z.nativeEnum(Type68EEnum)).optional(),
});
export const paymentsRouter = createTRPCRouter({
  hello: publicProcedure.input(z.object({ text: z.string() })).query(({ input }) => ({
    greeting: `Hello ${input.text}`,
  })),

  payinsFulfillment: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        query: querySchema.optional(),
        cursor: z.string().nullish(), // <-- "cursor" needs to exist, but can be any type
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsPayinsFulfillmentsList(
          input.schoolId,
          {
            page: Number(input.cursor) || 1,
            page_size: 50,
            ...input.query,
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
  payinsFulfillmentFilters: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        query: querySchema.optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsPayinsFulfillmentsFiltersRetrieve(input.schoolId, {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
        });
        // had to do this because the typing is shit.
        const data = response.data;
        return data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  generatePayinFulfillmentsReportWithSegments: protectedProcedure
    .input(z.object({ schoolId: z.string(), query: querySchema.optional() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsPayinsFulfillmentsXlsWSegmentsCreate(
          input.schoolId,
          input.query,
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );

        return response;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
});
