import {
  ConceptTypesEnum,
  CreateRefundDashboardRequestDTOPaymentMethodEnum,
  InvoiceActionEnum,
  Type11EEnum,
} from '@cometa/trpc/src/types';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient } from '/src/utils/api';
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
  ordering: z.array(z.string()).optional(),
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
  invoice_types: z.array(z.enum(['credit_note', 'invoice'])).optional(),
});
export const paymentsRouter = createTRPCRouter({
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
            ...(input.query as any),
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
          input.query as any,
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
  editFulfillmentBasePrice: protectedProcedure
    .input(
      z.object({
        fulfillmentId: z.string(),
        schoolId: z.string(),
        params: z.object({
          comment: z.string().optional(),
          base: z.string(),
          skip_sponsored_validation: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await ServiceClient.apiV1DashboardSchoolsFulfillmentsEditBasePartialUpdate(
          input.fulfillmentId,
          input.schoolId,
          input.params,
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );
      } catch (err: any) {
        const errorData = err?.response?.data || err?.error || err?.data;
        const status = err?.status || err?.response?.status;
        if (status === 400 && errorData) {
          if (errorData.requires_confirmation || errorData.error === 'sponsored_payment_confirmation_required') {
            const sponsoredError = new TRPCError({
              code: 'BAD_REQUEST',
              message: errorData.message || 'Sponsored payment confirmation required',
              cause: errorData,
            });
            (sponsoredError as any).customData = { sponsoredPayment: errorData };
            throw sponsoredError;
          }
        }
        handleTRPCError(err);
      }
    }),
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
        observations: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsInvoicesCreate(
          input.schoolId,
          {
            payin_fulfillment: input.payinFulfillmentId,
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
      } catch (err: any) {
        if ('error' in err) {
          return { data: null, error: err.error, status: err.status };
        }
        handleTRPCError(err);
      }
    }),
  cancelInvoice: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        invoiceId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await ServiceClient.apiV1DashboardSchoolsInvoicesDestroy(input.invoiceId, input.schoolId, {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
        });
      } catch (err) {
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
  retrieveFulfillment: protectedProcedure
    .input(z.object({ schoolId: z.string(), fulfillmentId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsFulfillmentsRetrieve(
          input.fulfillmentId,
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
  listFulfillment: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        query: z
          .object({
            collected_at: z.enum(['collected_at_portal', 'collected_at_school']).optional(),
            concept_type: z.array(z.nativeEnum(ConceptTypesEnum)).optional(),
            concepts: z.array(z.string()).optional(),
            end_date: z.string().optional(),
            guardians: z.array(z.string()).optional(),
            ids: z.array(z.string()).optional(),
            invoice_status: z
              .array(z.enum(['canceled', 'canceling', 'failed', 'multiple', 'not_requested', 'pending', 'success']))
              .optional(),
            is_manual: z.boolean().optional(),
            levels: z.array(z.string()).optional(),
            multiple_search: z.string().optional(),
            ordering: z.array(z.enum(['-paid_date', 'paid_date'])).optional(),
            orders: z.array(z.string()).optional(),
            page: z.number().optional(),
            page_size: z.number().optional(),
            payment_methods: z
              .array(
                z
                  .enum([
                    'atm',
                    'bank_transfer',
                    'cash_payroll',
                    'credit',
                    'credit_card',
                    'debit_card',
                    'deposit_cash',
                    'deposit_check',
                    'direct_debit',
                    'multipay',
                    'nominal_check',
                    'prepaid_card',
                    'ticket',
                  ])
                  .nullable()
              )
              .optional(),
            search: z.string().optional(),
            sections: z.array(z.string()).optional(),
            start_date: z.string().optional(),
            status: z.array(z.enum(['NOT_PAID', 'PAID', 'PARTIAL_PAID', 'WAITING_PAID'])).optional(),
            students: z.array(z.string()).optional(),
            school_cycle: z.string().optional(),
          })
          .optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsFulfillmentsList(
          input.schoolId,
          {
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
  editFulfillmentDueDate: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        fulfillmentId: z.string(),
        newDueDate: z.string(),
        comment: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsFulfillmentsEditDuePartialUpdate(
          input.fulfillmentId,
          input.schoolId,
          {
            due: input.newDueDate,
            comment: input.comment,
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
  zipInvoice: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        invoiceId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsInvoicesZipInvoiceCreate(
          input.invoiceId,
          input.schoolId,
          undefined,
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
  refund: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        payinFulfillmentId: z.string(),
        amount: z.number(),
        comment: z.string(),
        invoiceAction: z.nativeEnum(InvoiceActionEnum),
        registeredAt: z.string(),
        paymentMethod: z.nativeEnum(CreateRefundDashboardRequestDTOPaymentMethodEnum),
        unassignConcept: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsRefundCreate(
          input.schoolId,
          {
            amount: input.amount,
            comment: input.comment,
            invoice_action: input.invoiceAction,
            payin_fulfillment_id: input.payinFulfillmentId,
            registered_at: input.registeredAt,
            payment_method: input.paymentMethod,
            unassign_concept: input.unassignConcept,
          },
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
  forgiveInterest: protectedProcedure
    .input(z.object({ schoolId: z.string(), fulfillmentId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsFulfillmentsSwitchInterestForgivenPartialUpdate(
          input.fulfillmentId,
          input.schoolId,
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
  checkBlockedPeriods: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        date: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1SchoolsBlockedPeriodsCheckRetrieve(
          input.schoolId,
          input.date ? { date: input.date } : undefined,
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
  getAvailableBlockPeriods: protectedProcedure.query(async ({ ctx }) => {
    try {
      const response = await ServiceClient.apiV1AllowedBlockPeriodsAvailableList(
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
  getSchoolBlockedPeriods: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1SchoolsBlockedPeriodsList(
          input.schoolId,
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
  createBlockedPeriod: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1SchoolsBlockedPeriodsCreate(
          input.schoolId,
          {
            start_date: input.startDate,
            end_date: input.endDate,
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
  deleteBlockedPeriod: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        blockedPeriodId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await ServiceClient.apiV1SchoolsBlockedPeriodsDestroy(input.blockedPeriodId, input.schoolId, {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
        });
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  downloadYearlyInvoices: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        year: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsReportsYearlyInvoicesZipYearlyInvoicesZipCreate(
          input.schoolId,
          {
            year: input.year,
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
  yearlyInvoicesStatus: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        year: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response =
          await ServiceClient.apiV1DashboardSchoolsReportsYearlyInvoicesZipYearlyInvoicesZipStatusRetrieve(
            input.schoolId,
            {
              year: input.year,
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
});
