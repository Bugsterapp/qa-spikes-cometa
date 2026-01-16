import {
  ConceptTypesEnum,
  ContentType,
  type PaginatedStudentByLevelList,
  TypeF30Enum,
  ScholarshipLostConfigEnum,
  PartialPaymentInterestTypeEnum,
  OfferingEnum,
  type PatchedSlimBankAccount,
} from '@cometa/trpc/src/types';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '/src/server/api/trpc';
import { ServiceClient } from '/src/utils/api';
import handleTRPCError from '/src/utils/trpcErrorHandler';
import { StudentsServiceClient } from '/src/utils/apiStudents';

const studentsApiHeaders = { Authorization: `Bearer ${process.env.NEXT_PUBLIC_SCHOOLS_API_TOKEN}` };

const PAGE_SIZE_XL = 400;

const userQuerySchema = z.object({
  membership: z.array(z.string()).optional(),
  search: z.string().optional(),
  ignore_company_members: z.boolean().optional().default(true),
});

const querySchema = z.object({
  concepts: z.array(z.string()).optional(),
  search: z.string().optional(),
  delinquency: z.optional(z.array(z.enum(['high', 'low', 'mid', 'zero']))),
  has_debt: z.optional(z.boolean()),
  school_cycle: z.optional(z.string()),
  scholarships: z.optional(z.array(z.string())),
  required_fields: z.optional(z.array(z.string())),
});

const querySchemaAssignments = z.object({
  concept: z.string(),
  students: z.array(z.string()),
  orders: z.array(z.string()),
});

const schoolUpdateSchema = z.object({
  name: z.string().max(350).optional(),
  email: z.string().email().max(254).optional(),
  phone: z.string().optional(),
  does_invoice: z.boolean().optional(),
  can_invoice_to_general_public: z.boolean().optional(),
  emit_invoice_time: z.string().nullable().optional(),
  enable_manual_pay_invoice: z.boolean().optional(),
  invoice_discount_breakdown: z.boolean().optional(),
  scholarship_is_accumulative: z.boolean().optional(),
  scholarship_lost_config: z.nativeEnum(ScholarshipLostConfigEnum).optional(),
  scholarship_config: z
    .object({
      apply_interest: z.boolean().optional(),
      apply_early_bird: z.boolean().optional(),
    })
    .optional(),
  partial_payment_interest_freeze: z.boolean().optional(),
  partial_payment_interest_type: z.nativeEnum(PartialPaymentInterestTypeEnum).optional(),
  cfdi_use_config: z.record(z.string(), z.any()).optional(),
  logo: z
    .object({
      name: z.string(),
      type: z.string(),
      data: z.string(),
    })
    .optional(),
});

export const schoolsRouter = createTRPCRouter({
  schoolsList: protectedProcedure.query(async ({ ctx }) => {
    try {
      const response = await ServiceClient.apiV1DashboardSchoolsList({
        headers: {
          Authorization: `Token ${ctx.session.token}`,
        },
      });
      const data = response.data;
      return data;
    } catch (err) {
      handleTRPCError(err);
      return [];
    }
  }),
  schoolDetail: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
    try {
      const response = await ServiceClient.apiV1DashboardSchoolsRetrieve(input.id, {
        headers: {
          Authorization: `Token ${ctx.session.token}`,
        },
      });
      return response.data;
    } catch (err) {
      handleTRPCError(err);
    }
  }),
  getDefaultCfdiConfig: protectedProcedure.query(async ({ ctx }) => {
    try {
      const response = await ServiceClient.apiV1DashboardSchoolsDefaultCfdiConfigRetrieve({
        headers: {
          Authorization: `Token ${ctx.session.token}`,
        },
      });
      return response.data;
    } catch (err) {
      handleTRPCError(err);
    }
  }),
  // schoolsCycles: protectedProcedure
  //   .input(z.object({ school_id: z.string(), is_active: z.boolean().optional() }))
  //   .query(async ({ input, ctx }) => {
  //     try {
  //       const response = await ServiceClient.apiV1DashboardSchoolsCyclesList(
  //         input.school_id,
  //         {
  //           is_active: input.is_active,
  //         },
  //         {
  //           headers: {
  //             Authorization: `Token ${ctx.session.token}`,
  //           },
  //         }
  //       );
  //       const data = response.data;
  //       return data;
  //     } catch (err) {
  //       handleTRPCError(err);
  //     }
  //   }),
  schoolsCycles: protectedProcedure
    .input(z.object({ school_id: z.string(), is_active: z.boolean().optional() }))
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.listApiV1SchoolsSchoolIdSchoolCyclesGet(
          input.school_id,
          {
            is_active: input.is_active,
          },
          {
            headers: studentsApiHeaders,
          }
        );
        const data = response.data;
        return data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  schoolsCollectionsConceptTypes: protectedProcedure
    .input(z.object({ school_id: z.string(), school_cycle: z.array(z.string()) }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsCollectionsConceptTypesRetrieve(
          input.school_id,
          { school_cycle: input.school_cycle },
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
  schoolSpecialOverchargeCreate: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        is_visible: z.boolean(),
        order_id: z.string(),
        student_id: z.string(),
        type: z.nativeEnum(TypeF30Enum),
        value: z.string(),
        name: z.string(),
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsSpecialOverChargesCreate(
          input.school_id,
          {
            is_visible: input.is_visible,
            order: input.order_id,
            student: input.student_id,
            type: input.type,
            value: input.value,
            name: input.name,
            id: input.id,
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
  schoolSpecialOverchargeDestroy: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        special_over_charge_id: z.string(),
        student_id: z.string(),
        sponsored_confirmation: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsSpecialOverChargesDestroy(
          input.special_over_charge_id,
          input.school_id,
          {
            body: {
              student_id: input.student_id,
              ...(input.sponsored_confirmation && { sponsored_confirmation: true }),
            },
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
            format: 'json',
            type: ContentType.Json,
          } as any
        );
        const data = response.data;
        return data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  schoolSpecialOverchargeValidateDeletion: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        special_over_charge_id: z.string(),
        student_id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsSpecialOverChargesValidateDeletionCreate(
          input.special_over_charge_id,
          input.school_id,
          {
            student_id: input.student_id,
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

  schoolFiscalEntities: protectedProcedure.input(z.object({ school_id: z.string() })).query(async ({ input, ctx }) => {
    try {
      const response = await ServiceClient.apiV1DashboardSchoolsFiscalEntitiesList(input.school_id, {
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
  // bank account list
  bankAccountList: protectedProcedure
    .input(z.object({ school_id: z.string(), is_active: z.boolean().optional(), archived: z.boolean().optional() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsBankAccountsList(
          input.school_id,
          {
            archived: input.archived,
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
  bankAccountPartialUpdate: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        school_id: z.string(),
        data: z.custom<PatchedSlimBankAccount>(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsBankAccountsPartialUpdate(
          input.id,
          input.school_id,
          input.data,
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        await handleResponseError(err);
      }
    }),
  bankAccountReassign: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        school_id: z.string(),
        data: z.record(z.any()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsBankAccountsReassignCreate(
          input.id,
          input.school_id,
          input.data,
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );

        return response.data;
      } catch (err) {
        await handleResponseError(err);
      }
    }),
  bankAccountDelete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        school_id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsBankAccountsDestroy(input.id, input.school_id, {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
        });
        return response.data;
      } catch (err) {
        await handleResponseError(err);
      }
    }),
  bankAccountsHistoryList: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        archived: z.boolean().optional(),
        ordering: z.array(z.enum(['-id', 'id'])).optional(),
        cursor: z.number().optional(),
        page_size: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.bankAccountsHistoryList(
          input.school_id,
          {
            archived: input.archived,
            ordering: input.ordering,
            page: input.cursor ?? 1,
            page_size: input.page_size,
          },
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        await handleResponseError(err);
      }
    }),
  schoolsConceptsList: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        bank_account: z.string().optional(),
        school_cycles: z.array(z.string()).optional(),
        multiple_search: z.string().optional(),
        cursor: z.string().nullish(),
        page_size: z.number().optional(),
        type: z.array(z.nativeEnum(ConceptTypesEnum)).optional(),
        ordering: z.array(z.string()).optional(),
        offering: z.array(z.nativeEnum(OfferingEnum)).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsConceptsList(
          input.school_id,
          {
            bank_account: input.bank_account,
            school_cycles: input.school_cycles,
            type: input.type,
            multiple_search: input.multiple_search,
            ordering: input.ordering,
            // @ts-ignore
            page: input.cursor ? Number(input.cursor) : undefined,
            page_size: input.page_size,
            offering: input.offering,
          } as any,
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );
        const data = response.data || [];
        return data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  schoolsConceptsCreate: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        // CreateConcept,
        data: z.any(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsConceptsCreate(input.school_id, input.data, {
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

        const data = response.data;
        if (!response.data) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred, please try again later.',
            // optional: pass the original error to retain stack trace
            cause: 'errors',
          });
        }
        return data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  schoolsConceptsFilters: protectedProcedure
    .input(z.object({ school_id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsConceptsFiltersRetrieve(input.school_id, {
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
  schoolsConceptDetail: protectedProcedure
    .input(z.object({ school_id: z.string(), concept_id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsConceptsRetrieve(input.concept_id, input.school_id, {
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
  schoolsConceptOrdersList: protectedProcedure
    .input(z.object({ concept_id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardConceptsOrdersList(
          input.concept_id,
          { page_size: PAGE_SIZE_XL },
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
  schoolsStudentsByLevelList: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        concept_id: z.string(),
        query: querySchema.optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsStudentsByLevelList(
          input.concept_id,
          input.school_id,
          input.query,
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );
        const data = response.data as PaginatedStudentByLevelList['results'];
        return data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  schoolsStudentsByLevelListWithoutConcept: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        query: querySchema.optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV2DashboardSchoolsStudentsByLevelList(
          input.school_id,
          input.query as any,
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );
        const data = response.data as PaginatedStudentByLevelList['results'];
        return data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  schoolsAssignmentsCreate: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        data: querySchemaAssignments,
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsMassiveAssignmentsCreate(
          input.school_id,
          input.data,
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

        const data = response.data;
        if (!response.data) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred, please try again later.',
            // optional: pass the original error to retain stack trace
            cause: 'errors',
          });
        }
        return data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  schoolsStudentsByLevelFilters: protectedProcedure
    .input(z.object({ school_id: z.string(), concept_id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsStudentsByLevelFiltersRetrieve(
          input.concept_id,
          input.school_id,
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

  schoolsProductKeysList: protectedProcedure
    .input(z.object({ school_id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsConceptsProductKeysRetrieve(input.school_id, {
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
  schoolsTaxUnitsList: protectedProcedure.input(z.object({ school_id: z.string() })).query(async ({ input, ctx }) => {
    try {
      const response = await ServiceClient.apiV1DashboardSchoolsConceptsTaxUnitsRetrieve(input.school_id, {
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
  schoolsAttributesList: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        query: z
          .object({
            page: z.union([z.number().optional(), z.undefined()]),
            page_size: z.union([z.number().optional(), z.undefined()]),
          })
          .optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsAttributesList(input.school_id, input.query, {
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

  schoolsConceptsWithAttributesCreate: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        data: z.any(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsConceptsCreateWithAttributesCreate(
          input.school_id,
          input.data,
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
  schoolsConceptWithSingleOrderCreate: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        data: z.any(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsConceptsCreateWithSinglePaymentCreate(
          input.school_id,
          input.data,
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
  schoolsConceptsStudentsAssignedList: protectedProcedure
    .input(
      z.object({
        conceptId: z.string(),
        schoolId: z.string(),
        cursor: z.string().nullish(),
        query: z
          .object({
            page_size: z.number().optional(),
            with_payment_data: z.boolean().optional(),
            search: z.string().optional(),
            school_cycles: z.array(z.string()).optional(),
            sections: z.array(z.string()).optional(),
            levels: z.array(z.string()).optional(),
            concept_types: z.array(z.nativeEnum(ConceptTypesEnum)).optional(),
            scholarships: z.array(z.string()).optional(),
            paid_status: z.array(z.string()).optional(),
            ordering: z.array(z.string()).optional(),
          })
          .optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsConceptsStudentsList(
          input.conceptId,
          input.schoolId,
          {
            page: input.cursor ? Number(input.cursor) : undefined,
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
  schoolsPayinsFulfillmentsColumns: protectedProcedure
    .input(z.object({ schoolId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsPayinsFulfillmentsColumnsRetrieve(input.schoolId, {
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

  schoolsConceptsStudentsAssignedIdsList: protectedProcedure
    .input(
      z.object({
        conceptId: z.string(),
        schoolId: z.string(),
        query: z
          .object({
            page_size: z.number().optional(),
            with_payment_data: z.boolean().optional(),
            search: z.string().optional(),
            school_cycles: z.array(z.string()).optional(),
            sections: z.array(z.string()).optional(),
            levels: z.array(z.string()).optional(),
            concept_types: z.array(z.string()).optional(),
            scholarships: z.array(z.string()).optional(),
            paid_status: z.array(z.string()).optional(),
          })
          .optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsConceptsStudentsList(
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
  schoolsSpecialDiscountsDestroy: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsSpecialDiscountsDestroy(input.id, input.school_id, {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
          format: 'json',
          type: ContentType.Json,
        });
        if (!response.ok) {
          throw Error('Failed to inactivate student');
        }
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  schoolsResume: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        school_cycle: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const params = {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
        };

        const query = { school_cycle: input.school_cycle };

        const response = await ServiceClient.apiV1DashboardSchoolsStudentsResumeBySchoolV2Retrieve(
          input.school_id,
          query,
          params
        );
        const data = response.data;
        return data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  schoolsConceptsOrdersRetrive: protectedProcedure
    .input(
      z.object({
        concept_id: z.string(),
        school_id: z.string(),
        search: z.string().optional(),
        ordering: z.array(z.string()).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsConceptsOrdersList(
          input.concept_id,
          input.school_id,
          {
            search: input.search,
            ordering: input.ordering,
          } as any,
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
  schoolsScholarshipsList: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        cursor: z.string().nullish(),
        ordering: z.array(z.string()).optional(),
        resume: z.boolean().optional(),
        search: z.string().optional(),
        school_cycle: z.string().nullable().optional(),
        levels: z.array(z.string()).optional(),
        sections: z.array(z.string()).optional(),
        scholarships: z.array(z.string()).optional(),
        is_active: z.boolean().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsScholarshipsList(
          input.school_id,
          {
            page: input.cursor ? Number(input.cursor) : undefined,
            // @ts-ignore
            school_cycle: input.school_cycle ? input.school_cycle : undefined,
            ordering: input.ordering?.[0],
            // @ts-ignore
            resume: input.resume,
            search: input.search,
            levels: input.levels,
            sections: input.sections,
            scholarships: input.scholarships,
            is_active: input.is_active,
          } as any,
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
  schoolsScholarshipsFilters: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsScholarshipsFiltersRetrieve(
          input.school_id,
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
  schoolsStudentsScholarships: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        cursor: z.string().nullish(),
        query: z.object({
          page_size: z.number().optional(),
          search: z.string().optional(),
          scholarship_school_cycle: z.string().optional(),
          scholarships: z.array(z.string()).optional(),
          levels: z.array(z.string()).optional(),
          sections: z.array(z.string()).optional(),
          concepts: z.array(z.string()).optional(),
          ordering: z.array(z.string()).optional(),
        }),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsStudentsList(
          input.school_id,
          {
            ...input.query,
            page: input.cursor ? Number(input.cursor) : undefined,
          } as any,
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
  schoolsStudentsScholarshipsFilters: protectedProcedure
    .input(z.object({ school_id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsStudentsFiltersRetrieve(
          input.school_id,
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
  schoolsScholarshipRetrieve: protectedProcedure
    .input(z.object({ school_id: z.string(), scholarship_id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsScholarshipsRetrieve(
          input.scholarship_id,
          input.school_id,
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
  schoolsPayoutsFiltersList: protectedProcedure
    .input(z.object({ school_id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsPayoutsFiltersRetrieve(input.school_id, {
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
  payoutsResume: protectedProcedure.input(z.object({ schoolId: z.string() })).query(async ({ input, ctx }) => {
    try {
      const response = await ServiceClient.apiV1DashboardSchoolsPayoutsResumeRetrieve(input.schoolId, {
        headers: {
          Authorization: `Token ${ctx.session.token}`,
        },
      });
      return response.data;
    } catch (err) {
      handleTRPCError(err);
    }
  }),
  getUsersFilters: protectedProcedure.input(z.object({ schoolId: z.string() })).query(async ({ input, ctx }) => {
    try {
      const response = await ServiceClient.apiV1DashboardSchoolsUsersFiltersRetrieve(input.schoolId, {
        headers: {
          Authorization: `Token ${ctx.session.token}`,
        },
      });
      return response.data;
    } catch (err) {
      handleTRPCError(err);
    }
  }),
  getUsers: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        query: userQuerySchema.optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsUsersList(input.schoolId, input.query, {
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
  createUser: protectedProcedure
    .input(z.object({ school_id: z.string(), data: z.any() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsUsersCreate(input.school_id, input.data, {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
        });
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  getUser: protectedProcedure
    .input(z.object({ school_id: z.string(), user_id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsUsersRetrieve(input.user_id, input.school_id, {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
        });
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  getUserByEmail: protectedProcedure
    .input(z.object({ school_id: z.string(), email: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsUsersByEmailRetrieve(
          input.school_id,
          {
            email: input.email,
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
  getUserByMembershipId: protectedProcedure
    .input(z.object({ school_id: z.string(), membership_id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsUsersByMembershipRetrieve(
          input.school_id,
          {
            membership_id: input.membership_id,
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
  getUserPermissions: protectedProcedure
    .input(z.object({ school_id: z.string(), user_id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsUsersPermissionsAllRetrieve(
          input.user_id,
          input.school_id,
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
  updateUserPermissions: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        user_id: z.string(),
        data: z.any(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsUsersPermissionsPartialUpdate(
          input.user_id,
          input.school_id,
          input.data,
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
  updateUser: protectedProcedure
    .input(z.object({ school_id: z.string(), user_id: z.string(), data: z.any() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsUsersUpdate(
          input.user_id,
          input.school_id,
          input.data,
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
  deleteUser: protectedProcedure
    .input(z.object({ school_id: z.string(), user_id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsUsersDestroy(input.user_id, input.school_id, {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
        });
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  partialUpdateSchool: protectedProcedure
    .input(z.object({ school_id: z.string(), data: schoolUpdateSchema }))
    .mutation(async ({ input, ctx }) => {
      try {
        const logo = input.data.logo;
        let processedData = { ...input.data };

        if (logo) {
          if (logo.data?.startsWith('data:')) {
            const splitData = logo.data.split(',');
            if (splitData.length > 1) {
              const base64Data = splitData[1];
              if (base64Data) {
                const binaryData = Buffer.from(base64Data, 'base64');
                const uint8Array = new Uint8Array(binaryData);
                const logoFile = new File([uint8Array], logo.name, { type: logo.type });
                processedData = { ...processedData, logo: logoFile as any };
              }
            }
          } else {
            throw new Error('Invalid logo data format provided');
          }
        }

        const response = await ServiceClient.schoolsPartialUpdate(input.school_id, processedData as any, {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
        });
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  createSchool: protectedProcedure
    .input(
      z.object({
        data: z.object({
          name: z.string(),
          phone: z.string(),
          email: z.string().email(),
          institutional_id: z.string(),
          organization_id: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.createSchoolApiV1SchoolsPost(input.data, {
          headers: studentsApiHeaders,
        });
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
});

async function handleResponseError(err: unknown): Promise<never> {
  if (err instanceof Response) {
    try {
      const errorBody = await err.clone().json();
      const errorToThrow = new Error(
        Array.isArray(errorBody.error) ? errorBody.error[0] : errorBody.error || 'An error occurred'
      );
      (errorToThrow as any).status = err.status;
      (errorToThrow as any).response = { data: errorBody };
      handleTRPCError(errorToThrow);
    } catch {
      const errorText = await err.clone().text();
      const errorToThrow = new Error(errorText || 'An error occurred');
      (errorToThrow as any).status = err.status;
      handleTRPCError(errorToThrow);
    }
  } else {
    handleTRPCError(err);
  }
  throw new Error('Unreachable');
}
