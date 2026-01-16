import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient, ServiceClientRoot } from '/src/utils/api';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  UpdateQuantityRequestActionEnum,
  DiscountTypeEnum,
  CompoundingEnum,
  TypeF30Enum,
  FulfillmentStatusesEnum,
  OfferingEnum,
} from '@cometa/trpc/src/types';
import handleTRPCError from '/src/utils/trpcErrorHandler';

const optionalConceptsQuerySchema = z.object({
  multiple_search: z.string().optional(),
  school: z.string().optional(),
  offering: z.array(z.nativeEnum(OfferingEnum)).optional(),
  ordering: z.array(z.string()).optional(),
});

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
  conceptsProductKeysList: protectedProcedure.input(z.object({ search: z.string() })).query(async ({ ctx, input }) => {
    try {
      const response = await ServiceClient.apiV1DashboardConceptsProductKeysList(
        {
          input: input.search,
        },
        {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
        }
      );

      if ('Message' in response.data) {
        return [];
      }

      return response.data.filter((item) => item.Value !== '0');
    } catch (err) {
      handleTRPCError(err);
    }
  }),
  conceptsTaxUnitsList: protectedProcedure.query(async ({ ctx }) => {
    try {
      const response = await ServiceClient.apiV1DashboardConceptsTaxUnitsRetrieve({
        headers: {
          Authorization: `Token ${ctx.session.token}`,
        },
      });
      return response.data;
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
    .input(z.object({ schoolId: z.string(), school_cycle: z.array(z.string()).optional() }))
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
        query: optionalConceptsQuerySchema.optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsOptionalConceptsOrdersList(
          input.conceptId,
          input.schoolId,
          (input.query as any) || {},
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
  autoAssignCreate: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        sectionIds: z.string().array().min(1, 'Selecciona al menos una sesión'),
        conceptId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsConceptsConceptAutoAssignCreate(
          input.conceptId,
          input.schoolId,
          {
            section_ids: input.sectionIds,
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
  autoAssignRemove: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        conceptAvailabilityId: z.string().uuid().array().min(1, 'Selecciona al menos una sesión'),
        deleteConceptAssignments: z.boolean().default(false),
        conceptId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsConceptsConceptAutoAssignRemove(
          input.conceptId,
          input.schoolId,
          {
            concept_auto_assign_ids: input.conceptAvailabilityId,
            delete_concept_assignments: input.deleteConceptAssignments,
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
  updateConcept: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        updateFields: z.object({
          name: z.string().optional(),
          type: z.string().optional(),
          school_cycle_id: z.string().optional(),
          bank_account_id: z.string().optional(),
          not_invoicing_bank_account_id: z.string().uuid().optional(),
          payment_only_in_dashboard: z.boolean().optional(),
          early_bird_discounts: z
            .array(
              z.object({
                name: z.string(),
                discount_type: z.nativeEnum(DiscountTypeEnum),
                up_to_days: z.number(),
                discount_value: z.number(),
              })
            )
            .optional(),
          interest_schema: z
            .array(
              z.object({
                compounding: z.nativeEnum(CompoundingEnum),
                type: z.nativeEnum(TypeF30Enum),
                value: z.number().min(-3).describe('@format double'),
                day_offset: z.number().min(-3),
                month_offset: z.number().min(0),
              })
            )
            .optional(),
          tax_code: z
            .string()
            .max(30)
            .optional()
            .nullable()
            .transform((val) => val || undefined),
          tax_unit: z
            .string()
            .max(30)
            .optional()
            .nullable()
            .transform((val) => val || undefined),
          has_sales_tax: z.boolean().optional(),
          use_education_complement: z.boolean().optional(),
          institutional_id: z
            .string()
            .max(32)
            .optional()
            .nullable()
            .transform((val) => val || undefined),
          offering: z.nativeEnum(OfferingEnum).optional(),
          does_invoice_as_general_public: z.boolean().optional(),
          is_billable: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClientRoot.bookKeeper.bookKeeperConceptsPartialUpdate(
          input.id,
          {
            name: input.updateFields.name,
            type: input.updateFields.type,
            school_cycle_id: input.updateFields.school_cycle_id,
            bank_account_id: input.updateFields.bank_account_id,
            not_invoicing_bank_account_id: input.updateFields.not_invoicing_bank_account_id,
            payment_only_in_dashboard: input.updateFields.payment_only_in_dashboard,
            early_bird_discounts: input.updateFields.early_bird_discounts,
            interest_schema: input.updateFields.interest_schema,
            tax_code: input.updateFields.tax_code,
            tax_unit: input.updateFields.tax_unit,
            has_sales_tax: input.updateFields.has_sales_tax,
            use_education_complement: input.updateFields.use_education_complement,
            institutional_id: input.updateFields.institutional_id,
            offering: input.updateFields.offering,
            does_invoice_as_general_public: input.updateFields.does_invoice_as_general_public,
            is_billable: input.updateFields.is_billable,
          },
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );
        const data = response.data;
        return data;
      } catch (err: unknown) {
        const error = err as { status?: number; error?: { code?: string; detail?: string } };
        if (error?.status === 400 && error?.error?.code) {
          const errorCode = error.error.code;
          const errorMessages: Record<string, string> = {
            SCHOOL_DOES_NOT_INVOICE:
              'Este concepto no puede marcarse como facturable porque el colegio no emite facturación. Si necesitas hacer cambios, por favor contáctanos.',
            BANK_ACCOUNT_NOT_CONFIGURED:
              'Este concepto no puede marcarse como facturable porque no tienes configurada una cuenta de abono para pagos facturados. Contáctanos para resolverlo.',
            PAYOUT_CONFIG_NOT_CONFIGURED:
              'No puedes marcar este concepto como facturable porque necesitas configurar una cuenta de abono para pagos no facturados, que se usará en caso de que la cuenta facturable falle.',
            INVALID_BILLING_DATA:
              'Los datos de facturación son inválidos. Por favor, verifica que todos los campos estén correctamente completados.',
          };

          const message = errorMessages[errorCode] || error.error.detail || 'Hubo un error al actualizar el concepto.';

          throw new TRPCError({
            code: 'BAD_REQUEST',
            message,
            cause: errorCode,
          });
        }

        handleTRPCError(err);
      }
    }),
  conceptFulfillments: protectedProcedure
    .input(
      z.object({
        conceptId: z.string(),
        schoolId: z.string(),
        statuses: z.array(z.nativeEnum(FulfillmentStatusesEnum)),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsFulfillmentsList(
          input.schoolId,
          { concepts: [input.conceptId], status: input.statuses },
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
  getRootConcept: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        schoolId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsRootConceptsRetrieve(input.id, input.schoolId, {
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
});
