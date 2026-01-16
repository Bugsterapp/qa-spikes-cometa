import {
  ConceptTypesEnum,
  CreateDashboardCreditNoteRequestDTOPaymentMethodEnum,
  Type11EEnum,
} from '@cometa/trpc/src/types';
import { ServiceClient } from 'src/utils/api';
import handleTRPCError from 'src/utils/trpcErrorHandler';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

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
  types: z.array(z.nativeEnum(Type11EEnum)).optional(),
  concept_types: z.array(z.nativeEnum(ConceptTypesEnum)).optional(),
});
export const invoicesRouter = createTRPCRouter({
  listInvoices: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        query: querySchema.optional(),
        cursor: z.string().nullish(), // <-- "cursor" needs to exist, but can be any type
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsInvoicesList(
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
  invoicesFilters: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsInvoicesFiltersRetrieve(input.schoolId, {
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
  retrieveInvoice: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        invoiceId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsInvoicesRetrieve(input.invoiceId, input.schoolId, {
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
  emitInvoice: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        payinFulfillmentId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsInvoicesCreate(
          input.schoolId,
          { payin_fulfillment: input.payinFulfillmentId },
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );
        const data = response.data;
        return data;
      } catch (err: any) {
        if ('error' in err) {
          return err.error;
        }
        handleTRPCError(err);
      }
    }),
  retrieveInvoiceReportColumns: protectedProcedure
    .input(z.object({ schoolId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsInvoicesColumnsRetrieve(input.schoolId, {
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
  createCreditNote: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        invoiceId: z.string(),
        amount: z.string(),
        payment_method: z.nativeEnum(CreateDashboardCreditNoteRequestDTOPaymentMethodEnum),
        observations: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsInvoicesCreditNoteCreate(
          input.invoiceId,
          input.schoolId,
          {
            amount: input.amount,
            payment_method: input.payment_method,
            observations: input.observations,
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
  reinvoice: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        invoiceId: z.string(),
        with_relation: z.boolean(),
        observations: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsInvoicesReinvoiceCreate(
          input.schoolId,
          {
            invoice_id: input.invoiceId,
            with_relation: input.with_relation,
            observations: input.observations,
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
  retry: protectedProcedure
    .input(z.object({ schoolId: z.string(), invoiceId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsInvoicesRetryCreate(
          input.schoolId,
          { invoice_id: input.invoiceId },
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
  sendEmail: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        invoiceId: z.string(),
        guardianId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        ServiceClient.apiV1DashboardSchoolsInvoicesSendEmailCreate(
          input.invoiceId,
          input.schoolId,
          { guardian_id: input.guardianId },
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );
      } catch (err) {
        handleTRPCError(err);
      }
    }),
});
