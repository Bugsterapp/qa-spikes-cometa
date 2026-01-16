import {
  ClassroomIncludeEnum,
  CreateGradeAndGroupsDTO,
  LevelType,
  TableConfigUpsertDTO,
  UpdateGradeAndGroupDTO,
  AttendanceSessionIncludeEnum,
  AttendanceContextTypeEnum,
  AttendanceStatusEnum,
  AttendanceRecordIncludeEnum,
  AttendanceGranularityTypeEnum,
  SepEducationalLevel,
} from '@cometa/trpc/src/students/types';
import {
  AcademicConfigOriginTypeEnum,
  RoundingCriteria,
  ClassroomStudentAssignmentIncludeEnum,
  EvaluationScoreOriginTypeEnum,
  LevelIncludeDTO,
  EvaluationScoresByAssignmentCriteriaEnum,
  EvaluationScoresStatsByOriginCriteriaEnum,
  EvaluationScoreSystem,
  EvaluationNoteSystem,
  EvaluationNotesByAssignmentCriteriaEnum,
  EvaluationNoteOriginTypeEnum,
  TemplateCategory,
  DocumentInstanceStatus,
} from '@cometa/trpc/src/students/types';
import {
  ContentType,
  type DashboardStudentSearch,
  StateEnum,
  type StudentScholarshipCreate,
} from '@cometa/trpc/src/types';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { ServiceClient } from '/src/utils/api';
import { StudentsServiceClient } from '/src/utils/apiStudents';
import handleTRPCError from '/src/utils/trpcErrorHandler';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export type StudentWithScholarship = DashboardStudentSearch & {
  is_active_scholarships: boolean;
  grade: string;
};

const API_TOKEN = process.env.NEXT_PUBLIC_SCHOOLS_API_TOKEN;

const querySchema = z.object({
  is_active: z.optional(z.boolean()),
  concept_types: z.optional(z.array(z.enum(['INSCRIPTION', 'MONTHLY_FEE', 'OTHER', 'PRE_DEBT', 'TRANSPORT']))),
  state: z.optional(z.array(z.enum(['active', 'dropped_out', 'graduated', 'inactive', 'new_student']))),
  concepts: z.optional(z.array(z.string())),
  delinquency: z.optional(z.array(z.enum(['high', 'low', 'mid', 'zero']))),
  due_monthly_concepts: z.optional(z.array(z.enum(['high', 'low', 'mid', 'zero']))),
  due_orders: z.optional(z.array(z.enum(['high', 'low', 'mid', 'zero']))),
  fulfillment_statuses: z.optional(z.array(z.enum(['NOT_PAID', 'PARTIAL_PAID', 'WAITING_PAID']))),
  guardian: z.optional(z.array(z.string())),
  levels: z.optional(z.array(z.string())),
  scholarships: z.optional(z.array(z.string())),
  ordering: z.array(z.string()).optional(),
  orders: z.optional(z.array(z.string())),
  page: z.optional(z.number()),
  page_size: z.optional(z.number()),
  school_cycle: z.optional(z.string()),
  search: z.optional(z.string()),
  sections: z.optional(z.array(z.string())),
  inscription_status: z.optional(
    z.array(z.enum(['Inscrito', 'No inscrito', 'NOT_AVAILABLE', 'Reinscrito', 'Pendiente']))
  ),
});

const scholarshipDataSchema = z.array(
  z.object({
    scholarship_id: z.string(),
    orders_to_skip: z.array(z.string()),
    school_cycle_id: z.string(),
    student_id: z.string(),
    school_id: z.string(),
    date_ranges: z.array(z.object({ start_date: z.string(), end_date: z.string() })),
  })
);

const StudentScholarshipSchema = z.object({
  scholarship_id: z.string(),
  id: z.number(),
  orders_to_skip: z.array(z.string()).optional(),
  student_id: z.string(),
  school_cycle_id: z.string(),
  is_active: z.boolean().optional(),
  school_id: z.string(),
  date_ranges: z
    .array(
      z.object({
        id: z.number().optional(),
        start_date: z.string(),
        end_date: z.string(),
      })
    )
    .optional(),
});

const addressUpdateSchema = z.object({
  id: z.string().uuid().nullable(),
  street: z.string().nullable(),
  interior_number: z.string().nullable(),
  neighborhood: z.string().nullable(),
  state_id: z.string().nullable(),
  zip_code: z.string().nullable(),
  municipality: z.string().nullable(),
  home_phone: z.string().nullable(),
});

const medicalFormUpdateSchema = z.object({
  blood_type_code: z.string().nullable(),
  weight: z.number().optional(),
  height: z.number().optional(),
  laterality: z.string().optional(),
  personal_history: z.string().optional(),
  family_history: z.string().optional(),
  current_ailments: z.string().optional(),
  recent_interventions: z.string().optional(),
  other_history: z.string().optional(),
  has_allergies: z.boolean().optional(),
  require_drugs: z.boolean().optional(),
  drugs: z.string().optional(),
  authorize_emergency_transfer: z.boolean().optional(),
  authorize_physical_activity: z.boolean().optional(),
  food_allergies: z.string().nullable(),
  drug_allergies: z.string().nullable(),
  plant_allergies: z.string().nullable(),
  other_allergies: z.string().nullable(),
  dietary_restrictions: z.string().optional(),
  emergency_contact_id: z.string().optional().nullable(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_relationship: z.string().optional(),
  has_private_doctor: z.boolean().optional(),
  doctor_name: z.string().optional(),
  doctor_phone: z.string().optional(),
  doctor_clinic: z.string().optional(),
  has_private_insurance: z.boolean().optional(),
  has_all_vaccines: z.boolean().optional(),
  pending_vaccines: z.string().optional(),
  comments: z.string().optional(),
  created_at: z.string().optional(),
  modified_at: z.string().optional().nullable(),
});

const medicalInfoUpdateSchema = z.object({ id: z.string().uuid().nullable() }).merge(medicalFormUpdateSchema);

const permissionsAgreementsUpdateSchema = z.object({
  id: z.string().uuid().nullable(),
  hospital_transfer: z.boolean().nullable(),
  image_usage: z.boolean().nullable(),
  student_transport: z.boolean().nullable(),
  auth_external_care: z.boolean().nullable(),
  privacy_notice: z.boolean().nullable(),
  allow_solo_departure: z.boolean().nullable(),
  school_regulations: z.boolean().nullable(),
});

export const studentUpdateSchema = z.object({
  nationality_code: z.string().nullable(),
  birth_place_id: z.string().nullable(),
  address: addressUpdateSchema,
  medical_info: medicalInfoUpdateSchema,
  permissions_agreements: permissionsAgreementsUpdateSchema,
  note: z.string().optional().nullable(),
});

export type StudentUpdate = z.infer<typeof studentUpdateSchema>;

const addressSchema = z.object({
  street: z.string().optional().nullable(),
  interior_number: z.string().optional().nullable(),
  neighborhood: z.string().optional().nullable(),
  municipality: z.string().optional().nullable(),
  state_id: z.string().optional().nullable(),
  zip_code: z.string().optional().nullable(),
  home_phone: z.string().optional().nullable(),
});

const medicalInfoSchema = z.object({
  personal_history: z.string().optional().nullable(),
  family_history: z.string().optional().nullable(),
  food_allergies: z.string().optional().nullable(),
  drug_allergies: z.string().optional().nullable(),
  plant_allergies: z.string().optional().nullable(),
  other_allergies: z.string().optional().nullable(),
  blood_type_code: z.string().optional().nullable(),
});

const permissionsAgreementsSchema = z.object({
  image_usage: z.boolean(),
  student_transport: z.boolean(),
  auth_external_care: z.boolean(),
  privacy_notice: z.boolean(),
  allow_solo_departure: z.boolean(),
  school_regulations: z.boolean(),
  hospital_transfer: z.boolean(),
});

const studentSchema = z.object({
  student_id: z.string().uuid(),
  school_id: z.string().uuid(),
  address: addressSchema,
  medical_info: medicalInfoSchema,
  permissions_agreements: permissionsAgreementsSchema,
  nationality_code: z.string().optional().nullable(),
  birth_place_id: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

export const AcademicConfigSchema = z.object({
  lock_evaluation_score_editing_after_period_close: z.boolean().optional(),
  restrict_report_card_for_debtors: z.boolean().optional(),
});

export const LevelConfigSchema = z.object({
  level_id: z.string().uuid(),
  decimal_places: z.number().int().nonnegative(),
  rounding_criteria: z.nativeEnum(RoundingCriteria).nullable(),
});

export type StudentCreate = z.infer<typeof studentSchema>;

const studentsApiHeaders = {
  Authorization: `Bearer ${process.env.NEXT_PUBLIC_SCHOOLS_API_TOKEN}`,
};

const getInscriptionsFilterParams = z.object({
  school_cycle_id: z.string(),
  inscription_status: z.array(z.string()).optional(),
  section_ids: z.array(z.string()).optional(),
  group_by: z.string().optional(),
  order_by: z.string().optional(),
  search: z.string().optional(),
  student_state: z.array(z.string()).optional(),
  is_assigned: z.coerce.boolean().optional(),
  is_data_completed: z.coerce.boolean().optional(),
  are_consentments_completed: z.coerce.boolean().optional(),
  payment_status: z.array(z.enum(['PAID', 'PARTIAL_PAID', 'NOT_PAID'])).optional(),
  tab: z.enum(['reinscriptions', 'new_inscriptions']).optional(),
  cursor: z.string().nullish(),
  page: z.number().optional(),
});

export type GetInscriptionsFilterParams = z.infer<typeof getInscriptionsFilterParams>;

export const studentsRouter = createTRPCRouter({
  expiredScholarships: protectedProcedure.input(z.object({ studentId: z.string() })).query(async ({ input, ctx }) => {
    const params = {
      headers: {
        Authorization: `Token ${ctx.session.token}`,
      },
    };
    const response = await ServiceClient.apiV1DashboardStudentsExpiredScholarshipsList(input.studentId, {}, params);
    return response.data;
  }),

  generateExcelReport: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        search: z.string().optional(),
        guardian: z.array(z.string()).optional(),
        levels: z.array(z.string()).optional(),
        delinquency: z.array(z.enum(['low', 'high', 'mid', 'zero'])).optional(),
        sections: z.array(z.string()).optional(),
        concepts: z.array(z.string()).optional(),
        scholarships: z.array(z.string()).optional(),
        is_active: z.boolean().optional(),
        school_cycle: z.string().optional(),
        state: z.optional(z.array(z.enum(['active', 'dropped_out', 'graduated', 'inactive', 'new_student']))),
        inscription_status: z.optional(z.array(z.enum(['Inscrito', 'No inscrito', 'Pendiente', 'Reinscrito']))),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const params = {
        headers: {
          Authorization: `Token ${ctx.session.token}`,
        },
      };
      const response = await ServiceClient.apiV4DashboardSchoolsDueOrdersStudentsXlsCreate(
        input.school_id,
        input,
        params
      );
      return response.data;
    }),

  deleteClassroomStudentAssignment: protectedProcedure
    .input(z.object({ assignment_id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await StudentsServiceClient.deleteClassroomStudentAssignmentApiV1AcademicClassroomStudentAssignmentsAssignmentIdDelete(
          input.assignment_id,
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  studentScholarshipAssign: protectedProcedure
    .input(z.object({ studentId: z.string(), data: scholarshipDataSchema }))
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardStudentsStudentScholarshipsCreate(
          input.studentId,
          input.data as StudentScholarshipCreate[],
          undefined,
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
  studentScholarshipAssignV2: protectedProcedure
    .input(
      z.object({
        studentId: z.string(),
        data: scholarshipDataSchema,
        confirmSponsoredPayment: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const query = input.confirmSponsoredPayment
          ? { confirm_sponsored_payment: input.confirmSponsoredPayment }
          : undefined;

        const response = await ServiceClient.apiV1DashboardStudentsStudentScholarshipsCreate(
          input.studentId,
          input.data as StudentScholarshipCreate[],
          query,
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );
        return response.data;
      } catch (err: unknown) {
        const errorData =
          (err as { response?: { data?: unknown }; error?: unknown; data?: unknown })?.response?.data ||
          (err as { error?: unknown }).error ||
          (err as { data?: unknown }).data;
        const status =
          (err as { status?: number; response?: { status?: number } })?.status ||
          (err as { response?: { status?: number } })?.response?.status;
        if (status === 409 && errorData) {
          const typedErrorData = errorData as { error?: string; validation_method?: unknown; message?: string };
          if (typedErrorData.error === 'sponsored_payment_risk' || typedErrorData.validation_method) {
            const sponsoredError = new TRPCError({
              code: 'CONFLICT',
              message: typedErrorData.message || 'Sponsored payment validation required',
              cause: errorData,
            }) as TRPCError & { customData?: { sponsoredPayment: unknown } };
            sponsoredError.customData = { sponsoredPayment: errorData };
            throw sponsoredError;
          }
        }
        handleTRPCError(err);
      }
    }),
  dashboardSchoolDueOrdersStudents: protectedProcedure
    .input(
      z.object({
        cursor: z.union([z.number(), z.string()]).optional(),
        schoolId: z.string(),
        query: querySchema.optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const headers = {
          Authorization: `Token ${ctx.session.token}`,
        };

        const page = input.cursor ? parseInt(String(input.cursor)) : input.query?.page;
        const response = await ServiceClient.apiV4DashboardSchoolsDueOrdersStudentsList(
          input.schoolId,
          {
            ...input.query,
            page,
          } as Record<string, unknown>,
          {
            headers,
          }
        );

        const data = response.data;
        return data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  dashboardSchoolDueOrdersStudentDetail: protectedProcedure
    .input(z.object({ schoolId: z.string(), studentId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsDueOrdersStudentsRetrieve(
          input.studentId,
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
  studentUpdateSection: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        school_id: z.string(),
        data: z.object({
          section: z.string().optional(),
          school_cycle: z.string().optional(),
          status: z.enum(['Inscrito', 'No inscrito', 'Pendiente', 'Reinscrito']).optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsInscriptionsUpdate(
          input.id,
          input.school_id,
          {
            section: input.data.section,
            school_cycle: input.data.school_cycle,
            status: input.data.status,
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
  inactivateStudent: protectedProcedure
    .input(z.object({ forgive_debt: z.boolean(), studentId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardStudentsInactivateDestroy(input.studentId, {
          body: {
            forgive_debt: input.forgive_debt,
          },
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
          format: 'json',
          type: ContentType.Json,
        } as Record<string, unknown>);
        if (!response.ok) {
          throw Error('Failed to inactivate student');
        }

        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  reactivate: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardStudentsReactivatePartialUpdate(input.id, {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
        });
        return { data: response.data, status: response.status, error: false };
      } catch (err: unknown) {
        const typedErr = err as { error?: unknown; status?: number };
        return { data: typedErr.error, status: typedErr.status, error: true };
      }
    }),
  studentConcepts: protectedProcedure
    .input(
      z.object({
        studentId: z.string(),
        cycle_id: z.array(z.string()).optional(),
        type: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardStudentsConceptsList(
          input.studentId,
          {
            cycle_id: input.cycle_id,
            type: input.type,
          } as Record<string, unknown>,
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
  studentFilters: protectedProcedure.input(z.object({ school_id: z.string() })).query(async ({ input, ctx }) => {
    try {
      const response = await ServiceClient.apiV1DashboardSchoolsDueOrdersStudentsFiltersRetrieve(input.school_id, {
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
  studentsInscriptionsSummary: protectedProcedure
    .input(z.object({ schoolId: z.string(), schoolCycleId: z.string() }))
    .query(async ({ input, ctx }) => {
      const headers = {
        Authorization: `Token ${ctx.session.token}`,
      };

      try {
        const response = await ServiceClient.apiV1DashboardSchoolsStudentsInscriptionsSummaryRetrieve(
          input.schoolId,
          { school_cycle_id: input.schoolCycleId },
          {
            headers: headers,
            baseUrl: process.env.NEXT_PUBLIC_SERVER_API_BASE_URL,
          }
        );

        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  studentsAssignments: protectedProcedure
    .input(
      z.object({
        studentId: z.string(),
        ended: z.boolean().optional(),
        optional: z.boolean().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardStudentsAssignmentsList(
          input.studentId,
          {
            ended: input.ended,
            optional: input.optional,
          },
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
            baseUrl: process.env.NEXT_PUBLIC_SERVER_API_BASE_URL,
          }
        );
        const data = response.data;
        return data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  lastEnrolled: protectedProcedure.input(z.object({ schoolId: z.string() })).query(async ({ input, ctx }) => {
    try {
      const response = await ServiceClient.apiV1DashboardSchoolsStudentsLastEnrolledRetrieve(
        input.schoolId,
        {},
        {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
          baseUrl: process.env.NEXT_PUBLIC_SERVER_API_BASE_URL,
        }
      );
      const data = response.data;
      return data;
    } catch (err) {
      handleTRPCError(err);
    }
  }),
  studentConceptRetrieve: protectedProcedure
    .input(z.object({ studentId: z.string(), conceptId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV2DashboardStudentsConceptsRetrieve(input.conceptId, input.studentId, {
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
  studentsOrdersList: protectedProcedure
    .input(
      z.object({
        student_id: z.string(),
        concepts: z.array(z.string()).optional(),
        ordering: z.array(z.string()).optional(),
        cursor: z.string().nullish(),
        page_size: z.number().optional(),
        status: z.array(z.enum(['DUE', 'PENDING', 'OUTSTANDING'])).optional(),
        school_cycle: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardStudentsOrdersList(
          input.student_id,
          {
            concepts: input.concepts,
            page: input.cursor ? Number(input.cursor) : undefined,
            page_size: input.page_size,
            status: input.status,
            school_cycle: input.school_cycle,
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
  inscriptionsSummary: protectedProcedure
    .input(z.object({ schoolId: z.string(), studentId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsStudentsInscriptionsRetrieve(
          input.studentId,
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
  studentsScholarshipList: protectedProcedure
    .input(
      z.object({
        studentId: z.string(),
        cursor: z.string().nullish(),
        schoolCycleId: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardStudentsScholarshipsList(
          input.studentId,
          {
            page: input.cursor ? Number(input.cursor) : undefined,
            school_cycle_id: input.schoolCycleId,
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
  studentScholarships: protectedProcedure
    .input(z.object({ studentId: z.string(), scholarshipId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardStudentsStudentScholarshipsList(
          input.studentId,
          {
            scholarship_id: input.scholarshipId,
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
  getStudents: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        conceptTypes: z
          .array(
            z.enum([
              'BOOKS_AND_MATERIALS',
              'CAFETERIA',
              'DONATION',
              'EXAMS_AND_CERTIFICATES',
              'EXTRACURRICULAR',
              'INSCRIPTION',
              'MONTHLY_FEE',
              'OTHER',
              'PRE_DEBT',
              'REINSCRIPTION',
              'SPORTS',
              'TRANSPORT',
              'UNIFORMS_AND_MERCH',
            ])
          )
          .optional(),
        concepts: z.array(z.string()).optional(),
        guardians: z.array(z.string()).optional(),
        identifier: z.string().optional(),
        isActive: z.boolean().optional(),
        levels: z.array(z.string()).optional(),
        orders: z.array(z.string()).optional(),
        page: z.number().optional(),
        scholarship_school_cycle: z.string().uuid().optional(),
        scholarships: z.array(z.string()).optional(),
        scholarship_id: z.string().uuid().optional(),
        school_cycle: z.string().uuid().optional(),
        search: z.string().optional(),
        sections: z.array(z.string()).optional(),
        state: z.array(z.enum(['active', 'dropped_out', 'graduated', 'inactive', 'lead', 'new_student'])).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const PAGE_SIZE = 100;

        const params = {
          concept_types: input.conceptTypes,
          concepts: input.concepts,
          levels: input.levels,
          orders: input.orders,
          school_cycle: input.school_cycle,
          search: input.search,
          sections: input.sections,
          state: input.state,
          page_size: PAGE_SIZE,
        };

        const headers = {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
        };

        const initialResponse = await ServiceClient.apiV1DashboardSchoolsStudentsList(
          input.schoolId,
          { ...params, page: 1 },
          headers
        );
        const totalCount = initialResponse.data.count || 0;
        const totalPages = Math.ceil(totalCount / PAGE_SIZE);

        const requests = Array.from({ length: totalPages }, (_, i) =>
          ServiceClient.apiV1DashboardSchoolsStudentsList(input.schoolId, { ...params, page: i + 1 }, headers)
        );

        const responses = await Promise.all(requests);

        let allResults = responses.flatMap((response) => response.data.results);

        allResults = allResults
          .map((student) => ({
            ...student,
            is_active_scholarships:
              student?.scholarships?.some(
                (scholarship) =>
                  scholarship.scholarship_id === input.scholarship_id &&
                  scholarship.school_cycle_id === input.school_cycle
              ) || false,
          }))
          .filter((item) => item.state !== StateEnum.DroppedOut) as StudentWithScholarship[];

        return allResults;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  retrieveStudentAdditionalInfo: protectedProcedure
    .input(z.object({ studentId: z.string() }))
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.getStudentApiV1StudentPkGet(input.studentId, {
          headers: studentsApiHeaders,
        });
        return response.data;
      } catch (err: unknown) {
        const typedErr = err as { status?: number };
        if (err && typedErr.status === 404) {
          return null;
        }

        handleTRPCError(err);
      }
    }),
  createStudentAdditionalInfo: protectedProcedure
    .input(z.object({ data: studentSchema }))
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.createStudentApiV1StudentPost(
          input.data as Record<string, unknown>,
          {
            headers: studentsApiHeaders,
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  updateStudentAdditionalInfo: protectedProcedure
    .input(z.object({ studentId: z.string(), data: studentUpdateSchema }))
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.updateStudentApiV1StudentStudentIdPut(
          input.studentId,
          input.data as Record<string, unknown>,
          {
            headers: studentsApiHeaders,
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  updateMedicalInfo: protectedProcedure
    .input(z.object({ studentId: z.string(), data: medicalFormUpdateSchema }))
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.updateStudentMedicalInfoApiV1StudentStudentIdMedicalInfoPut(
          input.studentId,
          input.data,
          {
            headers: studentsApiHeaders,
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  unassignGuardian: protectedProcedure
    .input(z.object({ studentId: z.string(), guardianId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardStudentsGuardiansDestroy(input.guardianId, input.studentId, {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
        });
        if (!response.ok) {
          throw Error('Failed to unassign Guardian');
        }
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  schoolsDueOrdersResume: protectedProcedure
    .input(z.object({ schoolId: z.string(), schoolCycle: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsDueOrdersResumeRetrieve(
          input.schoolId,
          input.schoolCycle ? { school_cycle: input.schoolCycle } : undefined,
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
  studentScholarshipUnactive: protectedProcedure
    .input(z.object({ studentId: z.string(), scholarshipId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardStudentsStudentScholarshipsDestroy(
          input.scholarshipId,
          input.studentId,
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
  studentScholarshipDelete: protectedProcedure
    .input(z.object({ studentId: z.string(), scholarship_ids: z.array(z.string()) }))
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardStudentsStudentScholarshipsManyDestroy(
          input.studentId,
          {
            scholarship_ids: input.scholarship_ids,
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
  studentScholarshipUpdate: protectedProcedure
    .input(
      z.object({
        studentId: z.string(),
        scholarshipId: z.string(),
        data: z.array(StudentScholarshipSchema),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardStudentsStudentScholarshipsUpdate(
          input.scholarshipId,
          input.studentId,
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
  orderDetail: protectedProcedure
    .input(z.object({ studentId: z.string(), orderId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardStudentsOrdersRetrieve(input.orderId, input.studentId, {
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
  studentsAssignmentsList: protectedProcedure
    .input(
      z.object({
        studentId: z.string(),
        ended: z.boolean().optional(),
        optional: z.boolean().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardStudentsAssignmentsList(
          input.studentId,
          {
            ended: input.ended,
            optional: input.optional,
          },
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
            baseUrl: process.env.NEXT_PUBLIC_SERVER_API_BASE_URL,
          }
        );
        const data = response.data;
        return data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  changeSchoolCycle: protectedProcedure
    .input(
      z.object({
        schoolCycleId: z.string(),
        schoolId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsCyclesActivatePartialUpdate(
          input.schoolCycleId,
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
  getTableConfig: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        tableName: z.string(),
        schoolId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.getTableConfigsApiV1TableConfigGet(
          {
            user_id: input.userId,
            table_name: input.tableName,
            school_id: input.schoolId,
          },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  upsertTableConfig: protectedProcedure
    .input(
      z.object({
        id: z.string().optional(),
        userId: z.string(),
        tableName: z.string(),
        schoolId: z.string(),
        columnsConfig: z
          .array(
            z.object({
              columnId: z.string(),
              columnName: z.string(),
              isVisible: z.boolean(),
              order: z.number(),
            })
          )
          .nullable()
          .optional(),
        filtersConfig: z.record(z.any()).nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const requestPayload: TableConfigUpsertDTO = {
          id: input.id,
          user_id: input.userId,
          table_name: input.tableName,
          school_id: input.schoolId,
        };

        if (input.columnsConfig !== undefined) {
          requestPayload.columns_config = input.columnsConfig
            ? input.columnsConfig.map((column) => ({
                column_id: column.columnId,
                column_name: column.columnName,
                is_visible: column.isVisible,
                order: column.order,
              }))
            : null;
        }

        if (input.filtersConfig !== undefined) {
          requestPayload.filters_config = input.filtersConfig;
        }

        const response = await StudentsServiceClient.upsertTableConfigApiV1TableConfigPost(requestPayload, {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        });
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  getInscriptions: protectedProcedure.input(getInscriptionsFilterParams).query(async ({ input }) => {
    try {
      const response = await StudentsServiceClient.listInscriptionsApiV1InscriptionGet(
        {
          ...input,
          page: input.cursor ? Number(input.cursor) : undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        }
      );
      const data = response.data;
      return data;
    } catch (err) {
      handleTRPCError(err);
    }
  }),
  getInscriptionsFilters: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.listFiltersApiV1InscriptionFiltersGet(
          {
            school_id: input.schoolId,
          },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        const data = response.data;
        return data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  getInscriptionsSummary: protectedProcedure
    .input(
      z.object({
        schoolCycleId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.getSummaryApiV1InscriptionSummaryGet(
          {
            school_cycle_id: input.schoolCycleId,
          },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        const data = response.data;
        return data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  getInscriptionsSummaryList: protectedProcedure
    .input(
      z.object({
        schoolCycleId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.getSummaryListApiV1InscriptionSummaryListGet(
          {
            school_cycle_id: input.schoolCycleId,
          },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  getInscriptionsReport: protectedProcedure.input(getInscriptionsFilterParams).mutation(async ({ input, ctx }) => {
    try {
      const response = await StudentsServiceClient.getInscriptionReportApiV1InscriptionReportSummaryGet(input, {
        format: 'arrayBuffer',
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });

      if (!response.data) {
        throw new Error('No report data received');
      }

      const uint8Array = new Uint8Array(response.data);
      ctx.res?.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      return { data: uint8Array };
    } catch (err) {
      handleTRPCError(err);
    }
  }),
  getSchoolCycleGrades: protectedProcedure.input(z.object({ schoolCycleId: z.string() })).query(async ({ input }) => {
    try {
      const response = await StudentsServiceClient.getSchoolCycleGradesApiV1SchoolCycleGradesSchoolCycleIdGet(
        input.schoolCycleId,
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        }
      );
      const data = response.data;
      return data;
    } catch (err) {
      handleTRPCError(err);
    }
  }),
  upsertSchoolCycleGrades: protectedProcedure
    .input(
      z.object({
        data: z.array(
          z.object({
            school_cycle_id: z.string(),
            grade_id: z.string(),
            inscriptions_quota: z.number(),
            is_active: z.boolean().default(true),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.upsertSchoolCycleGradeApiV1SchoolCycleGradesPost(input.data, {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        });
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  getLevels: protectedProcedure.input(z.object({ schoolId: z.string() })).query(async ({ input }) => {
    try {
      const response = await StudentsServiceClient.getLevelsApiV1LevelsGet(
        {
          school_id: input.schoolId,
        },
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        }
      );
      const data = response.data;
      return data;
    } catch (err) {
      handleTRPCError(err);
    }
  }),
  getLevelsGroupsGrades: protectedProcedure.input(z.object({ schoolId: z.string() })).query(async ({ input }) => {
    try {
      const response = await StudentsServiceClient.getLevelsApiV1SchoolsSchoolIdLevelsGet(
        input.schoolId,
        {
          include: [LevelIncludeDTO.Grades, LevelIncludeDTO.Groups],
        },
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        }
      );
      const data = response.data;
      return data;
    } catch (err) {
      handleTRPCError(err);
    }
  }),
  createLevel: protectedProcedure
    .input(z.object({ schoolId: z.string(), name: z.string(), type: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.createLevelApiV1SchoolsSchoolIdLevelsPost(
          input.schoolId,
          {
            name: input.name,
            type: input.type as LevelType,
          },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  updateLevel: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        levelId: z.string(),
        name: z.string().nullable().optional(),
        type: z.string().nullable().optional(),
        order: z.number().nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.updateLevelApiV1SchoolsSchoolIdLevelsLevelIdPatch(
          input.schoolId,
          input.levelId,
          {
            name: input.name,
            type: input.type as LevelType | null,
            order: input.order,
          },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  deleteLevel: protectedProcedure
    .input(z.object({ schoolId: z.string(), levelId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.deleteLevelApiV1SchoolsSchoolIdLevelsLevelIdDelete(
          input.schoolId,
          input.levelId,
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  patchGroupsGrades: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        levelId: z.string(),
        grade: z.object({
          id: z.string(),
          name: z.string().nullable().optional(),
          is_last: z.boolean().nullable().optional(),
          next_id: z.string().nullable().optional(),
          level_id: z.string().nullable().optional(),
        }),
        groups: z
          .array(
            z.object({
              id: z.string().nullable().optional(),
              name: z.string().nullable().optional(),
            })
          )
          .nullable()
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const requestPayload: UpdateGradeAndGroupDTO = {
          grade: input.grade,
          groups: input.groups,
        };

        const response =
          await StudentsServiceClient.updateGradeAndGroupsApiV1SchoolsSchoolIdLevelsLevelIdGradesAndGroupsPatch(
            input.schoolId,
            input.levelId,
            requestPayload,
            {
              headers: {
                Authorization: `Bearer ${API_TOKEN}`,
              },
            }
          );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  createGradeAndGroups: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        levelId: z.string(),
        grade: z.object({
          id: z.string().nullable().optional(),
          name: z.string(),
          is_last: z.boolean(),
          next_id: z.string().nullable().optional(),
        }),
        groups: z
          .array(
            z.object({
              name: z.string(),
              is_last: z.boolean().nullable().optional(),
              next_id: z.string().nullable().optional(),
            })
          )
          .nullable()
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const requestPayload: CreateGradeAndGroupsDTO = {
          grade: input.grade,
          groups: input.groups,
        };

        const response =
          await StudentsServiceClient.createGradeAndGroupApiV1SchoolsSchoolIdLevelsLevelIdGradesAndGroupsPost(
            input.schoolId,
            input.levelId,
            requestPayload,
            {
              headers: {
                Authorization: `Bearer ${API_TOKEN}`,
              },
            }
          );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  deleteGrade: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        levelId: z.string(),
        gradeId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.deleteGradeApiV1SchoolsSchoolIdLevelsLevelIdGradesGradeIdDelete(
          input.schoolId,
          input.levelId,
          input.gradeId,
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  deleteGroup: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        levelId: z.string(),
        gradeId: z.string(),
        groupId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response =
          await StudentsServiceClient.deleteGroupApiV1SchoolsSchoolIdLevelsLevelIdGradesGradeIdGroupsGroupIdDelete(
            input.schoolId,
            input.levelId,
            input.gradeId,
            input.groupId,
            {
              headers: {
                Authorization: `Bearer ${API_TOKEN}`,
              },
            }
          );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  getFiles: protectedProcedure.input(z.object({ entity_id: z.string() })).query(async ({ input }) => {
    try {
      const response = await StudentsServiceClient.listFilesApiV1FilesGet(
        {
          entity_id: input.entity_id,
        },
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        }
      );
      const data = response.data;
      return data;
    } catch (err) {
      handleTRPCError(err);
    }
  }),
  deleteFile: protectedProcedure
    .input(
      z.object({
        file_id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.deleteFileApiV1FilesPkDelete(input.file_id, {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        });
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  getFile: protectedProcedure
    .input(
      z.object({
        file_id: z.string(),
        download: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.getFileApiV1FilesFileIdGet(
          input.file_id,
          {
            download: input.download,
          },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  getSchoolConfig: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.getSchoolConfigApiV1SchoolConfigsSchoolIdGet(input.school_id, {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        });
        const data = response.data;
        return data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  upsertSchoolConfig: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        hidden_medical_form_fields: z.string().optional(),
        hidden_application_form_fields: z.string().optional(),
        academic: AcademicConfigSchema.optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.upsertSchoolConfigApiV1SchoolConfigsPut(input, {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        });
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  listAcademicConfigs: protectedProcedure
    .input(
      z.object({
        origin_type: z.nativeEnum(AcademicConfigOriginTypeEnum),
        origin_id: z.union([z.string().uuid(), z.array(z.string().uuid())]),
        school_cycle_id: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.listAcademicConfigsApiV1AcademicAcademicConfigsGet(
          {
            origin_type: input.origin_type,
            origin_id: input.origin_id,
            school_cycle_id: input.school_cycle_id,
          },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  upsertAcademicConfig: protectedProcedure
    .input(
      z.object({
        origin_type: z.nativeEnum(AcademicConfigOriginTypeEnum),
        origin_id: z.string().uuid(),
        school_cycle_id: z.string().uuid(),
        scoring: z
          .object({
            evaluation_score_system: z.nativeEnum(EvaluationScoreSystem).nullable().optional(),
            evaluation_note_system: z.nativeEnum(EvaluationNoteSystem).nullable().optional(),
            decimal_places: z.number().int().nonnegative(),
            rounding_criteria: z.nativeEnum(RoundingCriteria).nullable(),
          })
          .nullable()
          .optional(),
        attendance: z
          .object({
            context: z.nativeEnum(AttendanceContextTypeEnum),
            granularity: z.nativeEnum(AttendanceGranularityTypeEnum),
          })
          .nullable()
          .optional(),
        sep: z
          .object({ level: z.nativeEnum(SepEducationalLevel) })
          .nullable()
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.upsertAcademicConfigApiV1AcademicAcademicConfigsPut(input, {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        });
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  generateEnrollmentCode: protectedProcedure
    .input(
      z.object({
        school_id: z.string().uuid(),
        school_cycle_id: z.string().uuid(),
        level_id: z.string().uuid(),
        student: z.object({
          first_name: z.string(),
          last_name: z.string(),
          identifier: z.string().nullable().optional(),
          entry_date: z.string().nullable().optional(),
          gender: z.string().nullable().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.generateEnrollmentCodeApiV1StudentsEnrollmentCodePost(input, {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        });
        return response.data;
      } catch (error) {
        handleTRPCError(error);
      }
    }),

  countClassrooms: protectedProcedure
    .input(
      z.object({
        school_cycle_id: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.countClassroomsApiV1AcademicClassroomsCountGet(input, {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        });
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  listClassrooms: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        cursor: z.string().nullish(),
        query: z
          .object({
            id: z.union([z.string(), z.array(z.string())]).optional(),
            course_id: z.union([z.string(), z.array(z.string())]).optional(),
            grade_id: z
              .union([z.string(), z.array(z.string())])
              .optional()
              .nullable(),
            group_id: z
              .union([z.string(), z.array(z.string())])
              .optional()
              .nullable(),
            level_id: z.union([z.string(), z.array(z.string())]).optional(),
            school_cycle_id: z.string().optional(),
            limit: z.number().default(50),
            include: z.array(z.string()).optional(),
            search: z.string().optional(),
            variant: z.string().optional(),
          })
          .optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.listClassroomsApiV1AcademicClassroomsGet(
          {
            ...input.query,
            page: input.cursor ? Number(input.cursor) : undefined,
            include: input.query?.include as ClassroomIncludeEnum[],
          },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  getClassroomFilters: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.getClassroomFiltersApiV1AcademicClassroomsFiltersGet(
          {
            school_id: input.school_id,
          },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  getClassroomById: protectedProcedure
    .input(
      z.object({
        classroom_id: z.string(),
        query: z
          .object({
            include: z.array(z.string()).optional(),
          })
          .optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.getClassroomApiV1AcademicClassroomsClassroomIdGet(
          input.classroom_id,
          {
            include: input.query?.include as ClassroomIncludeEnum[],
          },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  listTeacherProfiles: protectedProcedure
    .input(
      z.object({
        school_id: z.string().optional(),
        membership_id: z.union([z.string(), z.array(z.string())]).optional(),
        role: z.union([z.string(), z.array(z.string())]).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.listTeacherProfilesApiV1AcademicTeacherProfilesGet(input, {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        });
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  getTeacherProfile: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.getTeacherProfileApiV1AcademicTeacherProfilesTeacherProfileIdGet(
          input.id,
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  createTeacherProfile: protectedProcedure
    .input(
      z.object({
        membership_id: z.string().uuid(),
        role: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.createTeacherProfileApiV1AcademicTeacherProfilesPost(input, {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        });
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  updateTeacher: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        role: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response =
          await StudentsServiceClient.updateTeacherProfileApiV1AcademicTeacherProfilesTeacherProfileIdPatch(
            input.id,
            {
              role: input.role,
            },
            {
              headers: {
                Authorization: `Bearer ${API_TOKEN}`,
              },
            }
          );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  deleteTeacher: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response =
          await StudentsServiceClient.deleteTeacherProfileApiV1AcademicTeacherProfilesTeacherProfileIdDelete(input.id, {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          });
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  updateInscription: protectedProcedure
    .input(
      z.object({
        inscriptionId: z.string(),
        data: z.object({
          personal_step_completed_at: z.string().optional().nullable(),
          medical_step_completed_at: z.string().optional().nullable(),
          consentments_step_completed_at: z.string().optional().nullable(),
          level_id: z.string().optional().nullable(),
          grade_id: z.string().optional().nullable(),
          group_id: z.string().optional().nullable(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.updateInscriptionApiV1InscriptionInscriptionIdPatch(
          input.inscriptionId,
          input.data,
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err: unknown) {
        handleTRPCError(err);
      }
    }),

  listCourseGroups: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.listCourseGroupsApiV1AcademicCourseGroupsGet(
          {
            school_id: input.school_id,
          },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  getCourseGroup: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.getCourseGroupApiV1AcademicCourseGroupsCourseGroupIdGet(input.id, {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        });
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  listCourses: protectedProcedure
    .input(
      z.object({
        course_group_id: z.string().optional(),
        school_id: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.listCoursesApiV1AcademicCoursesGet(
          {
            course_group_id: input.course_group_id,
            school_id: input.school_id,
          },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  createCourse: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        course_group_id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.createCourseApiV1AcademicCoursesPost(input, {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        });
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  createClassroom: protectedProcedure
    .input(
      z.object({
        course_id: z.string(),
        group_id: z.string().optional(),
        level_id: z.string().optional(),
        school_cycle_id: z.string(),
        variant: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.createClassroomApiV1AcademicClassroomsPost(input, {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        });
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  updateClassroom: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        variant: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.updateClassroomApiV1AcademicClassroomsClassroomIdPatch(
          input.id,
          {
            variant: input.variant,
          },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  deleteClassroom: protectedProcedure
    .input(
      z.object({
        classroom_id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.deleteClassroomApiV1AcademicClassroomsClassroomIdDelete(
          input.classroom_id,
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  listClassroomStudentAssignments: protectedProcedure
    .input(
      z.object({
        classroom_id: z.string().optional(),
        student_id: z.string().optional(),
        include: z.array(z.nativeEnum(ClassroomStudentAssignmentIncludeEnum)).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response =
          await StudentsServiceClient.listClassroomStudentAssignmentsApiV1AcademicClassroomStudentAssignmentsGet(
            {
              classroom_id: input.classroom_id,
              student_id: input.student_id,
              include: input.include ?? [],
            },
            {
              headers: {
                Authorization: `Bearer ${API_TOKEN}`,
              },
            }
          );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  listClassroomTeacherAssignments: protectedProcedure
    .input(
      z.object({
        classroom_id: z.union([z.string(), z.array(z.string())]).optional(),
        membership_id: z.union([z.string(), z.array(z.string())]).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response =
          await StudentsServiceClient.listClassroomTeacherAssignmentsApiV1AcademicClassroomTeacherAssignmentsGet(
            {
              classroom_id: input.classroom_id,
              membership_id: input.membership_id,
            },
            {
              headers: {
                Authorization: `Bearer ${API_TOKEN}`,
              },
            }
          );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  countClassroomTeacherAssignments: protectedProcedure
    .input(
      z.object({
        classroom_id: z.string().optional(),
        membership_id: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response =
          await StudentsServiceClient.countClassroomTeacherAssignmentsApiV1AcademicClassroomTeacherAssignmentsCountGet(
            {
              classroom_id: input.classroom_id,
              membership_id: input.membership_id,
            },
            {
              headers: {
                Authorization: `Bearer ${API_TOKEN}`,
              },
            }
          );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  deleteClassroomTeacherAssignment: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response =
          await StudentsServiceClient.deleteClassroomTeacherAssignmentApiV1AcademicClassroomTeacherAssignmentsAssignmentIdDelete(
            input.id,
            {
              headers: {
                Authorization: `Bearer ${API_TOKEN}`,
              },
            }
          );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  createClassroomTeacherAssignment: protectedProcedure
    .input(
      z.object({
        classroom_id: z.string(),
        membership_id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response =
          await StudentsServiceClient.createClassroomTeacherAssignmentApiV1AcademicClassroomTeacherAssignmentsPost(
            {
              classroom_id: input.classroom_id,
              membership_id: input.membership_id,
            },
            {
              headers: {
                Authorization: `Bearer ${API_TOKEN}`,
              },
            }
          );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  bulkAssignStudentsToClassroom: protectedProcedure
    .input(
      z.object({
        classroom_id: z.string(),
        student_ids: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response =
          await StudentsServiceClient.bulkCreateClassroomStudentAssignmentsApiV1AcademicClassroomStudentAssignmentsBulkPost(
            {
              classroom_id: input.classroom_id,
              student_ids: input.student_ids,
            },
            {
              headers: {
                Authorization: `Bearer ${API_TOKEN}`,
              },
            }
          );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  listEvaluationPeriods: protectedProcedure
    .input(
      z.object({
        level_id: z.string().optional(),
        school_cycle_id: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.listEvaluationPeriodsApiV1AcademicEvaluationPeriodsGet(input, {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        });
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  listEvaluationScoresByAssignment: protectedProcedure
    .input(
      z.object({
        classroom_id: z.string().optional(),
        student_id: z.string().optional(),
        school_cycle_id: z.string().optional(),
        criteria: z.nativeEnum(EvaluationScoresByAssignmentCriteriaEnum),
      })
    )
    .query(async ({ input }) => {
      try {
        const response =
          await StudentsServiceClient.listEvaluationScoresByAssignmentApiV1AcademicEvaluationScoresByAssignmentGet(
            input,
            {
              headers: {
                Authorization: `Bearer ${API_TOKEN}`,
              },
            }
          );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  getEvaluationScoreCount: protectedProcedure
    .input(
      z.object({
        classroom_student_assignment_id: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.countEvaluationScoresApiV1AcademicEvaluationScoresCountGet(input, {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        });
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  upsertEvaluationScore: protectedProcedure
    .input(
      z.object({
        score: z.number(),
        origin_type: z.nativeEnum(EvaluationScoreOriginTypeEnum),
        origin_id: z.string(),
        classroom_student_assignment_id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.upsertEvaluationScoreApiV1AcademicEvaluationScoresPut(
          {
            score: input.score,
            origin_type: input.origin_type,
            origin_id: input.origin_id,
            classroom_student_assignment_id: input.classroom_student_assignment_id,
          },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  deleteEvaluationScore: protectedProcedure
    .input(
      z.object({
        evaluation_score_id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await StudentsServiceClient.deleteEvaluationScoreApiV1AcademicEvaluationScoresEvaluationScoreIdDelete(
          input.evaluation_score_id,
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  listEvaluationNotesByAssignment: protectedProcedure
    .input(
      z.object({
        classroom_id: z.string().optional(),
        student_id: z.string().optional(),
        school_cycle_id: z.string().optional(),
        criteria: z.nativeEnum(EvaluationNotesByAssignmentCriteriaEnum),
      })
    )
    .query(async ({ input }) => {
      try {
        const response =
          await StudentsServiceClient.listEvaluationNotesByAssignmentApiV1AcademicEvaluationNotesByAssignmentGet(
            input,
            {
              headers: {
                Authorization: `Bearer ${API_TOKEN}`,
              },
            }
          );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  upsertEvaluationNote: protectedProcedure
    .input(
      z.object({
        note: z.string(),
        origin_type: z.nativeEnum(EvaluationNoteOriginTypeEnum),
        origin_id: z.string(),
        classroom_student_assignment_id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.upsertEvaluationNoteApiV1AcademicEvaluationNotesPut(
          {
            note: input.note,
            origin_type: input.origin_type,
            origin_id: input.origin_id,
            classroom_student_assignment_id: input.classroom_student_assignment_id,
          },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  deleteEvaluationNote: protectedProcedure
    .input(
      z.object({
        evaluation_note_id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await StudentsServiceClient.deleteEvaluationNoteApiV1AcademicEvaluationNotesEvaluationNoteIdDelete(
          input.evaluation_note_id,
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  getEvaluationScoresStatsByOrigin: protectedProcedure
    .input(
      z.object({
        classroom_id: z.string().optional(),
        level_id: z.string().optional(),
        school_cycle_id: z.string().optional(),
        criteria: z.nativeEnum(EvaluationScoresStatsByOriginCriteriaEnum),
      })
    )
    .query(async ({ input }) => {
      try {
        const response =
          await StudentsServiceClient.getEvaluationScoresStatsByOriginApiV1AcademicEvaluationScoresStatsByOriginGet(
            input,
            {
              headers: {
                Authorization: `Bearer ${API_TOKEN}`,
              },
            }
          );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  updateEvaluationPeriod: protectedProcedure
    .input(
      z.object({
        evaluationPeriodId: z.string(),
        data: z.object({
          name: z.string().optional().nullable(),
          start_date: z.string().optional().nullable(),
          end_date: z.string().optional().nullable(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response =
          await StudentsServiceClient.updateEvaluationPeriodApiV1AcademicEvaluationPeriodsEvaluationPeriodIdPatch(
            input.evaluationPeriodId,
            input.data,
            {
              headers: {
                Authorization: `Bearer ${API_TOKEN}`,
              },
            }
          );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  sendScoreCards: protectedProcedure
    .input(
      z.object({
        evaluation_period_id: z.string().uuid(),
        requested_by_id: z.string().uuid(),
        filters_json: z.record(z.any()).optional().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.createScoreCardSubmissionApiV1AcademicScoreCardSubmissionsPost(
          {
            evaluation_period_id: input.evaluation_period_id,
            requested_by_id: input.requested_by_id,
            filters_json: input.filters_json ?? {},
          },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  listScoreCardSubmissions: protectedProcedure
    .input(
      z.object({
        evaluation_period_id: z.string().uuid().optional(),
        requested_by_id: z.string().uuid().optional(),
        level_id: z.string().uuid().optional(),
        school_cycle_id: z.string().uuid().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.listScoreCardSubmissionsApiV1AcademicScoreCardSubmissionsGet(
          {
            evaluation_period_id: input.evaluation_period_id,
            requested_by_id: input.requested_by_id,
            level_id: input.level_id,
            school_cycle_id: input.school_cycle_id,
          },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  downloadScoreCardSubmissionReport: protectedProcedure
    .input(
      z.object({
        campaign_id: z.string(),
        score_card_submission_id: z.string().uuid(),
        school_id: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response =
          await StudentsServiceClient.getScoreCardSubmissionReportApiV1AcademicScoreCardSubmissionsReportGet(
            {
              campaign_id: input.campaign_id,
              score_card_submission_id: input.score_card_submission_id,
              school_id: input.school_id,
            },
            {
              format: 'arrayBuffer',
              headers: {
                Authorization: `Bearer ${API_TOKEN}`,
                Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              },
            }
          );

        if (!response.data) {
          throw new Error('No report data received');
        }

        const uint8Array = new Uint8Array(response.data as ArrayBuffer);

        return { data: uint8Array };
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  getSepReportPreview: protectedProcedure
    .input(
      z.object({
        level_id: z.string().uuid(),
        school_cycle_id: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.getSepReportDataApiV1AcademicScoreCardsSepGet(
          {
            level_id: input.level_id,
            school_cycle_id: input.school_cycle_id,
          },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  listAttendanceSessions: protectedProcedure
    .input(
      z.object({
        school_id: z.string().optional(),
        evaluation_period_id: z.string().optional(),
        date: z.string().optional(),
        context_id: z.string().optional(),
        context_type: z.nativeEnum(AttendanceContextTypeEnum).optional(),
        is_closed: z.boolean().optional(),
        taken_by_id: z.string().optional(),
        include: z.array(z.nativeEnum(AttendanceSessionIncludeEnum)).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.listAttendanceSessionsApiV1AcademicAttendanceSessionsGet(input, {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        });
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  downloadSepReport: protectedProcedure
    .input(
      z.object({
        level_id: z.string().uuid(),
        school_cycle_id: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.generateSepReportApiV1AcademicScoreCardsSepReportGet(
          {
            level_id: input.level_id,
            school_cycle_id: input.school_cycle_id,
          },
          {
            format: 'arrayBuffer',
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
              Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
          }
        );

        if (!response.data) {
          throw new Error('No report data received');
        }

        const uint8Array = new Uint8Array(response.data as ArrayBuffer);

        return { data: uint8Array };
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  generateScoreCard: protectedProcedure
    .input(
      z.object({
        student_id: z.string(),
        school_cycle_id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.generateScoreCardApiV1AcademicScoreCardsGet(
          {
            student_id: input.student_id,
            school_cycle_id: input.school_cycle_id,
          },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  processAttendance: protectedProcedure
    .input(
      z.object({
        input: z.string(),
        school_id: z.string(),
        evaluation_period_id: z.string(),
        context_type: z.enum(['group', 'classroom']),
        context_id: z.string(),
        date: z.string(),
        taken_by_id: z.string(),
        confirm: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.processAttendanceApiV1AiAttendanceProcessPost(input, {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        });
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  getAvailableStudents: protectedProcedure
    .input(
      z.object({
        session_id: z.string().optional(),
        context_id: z.string().optional(),
        context_type: z.nativeEnum(AttendanceContextTypeEnum).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response =
          await StudentsServiceClient.getAvailableStudentsApiV1AcademicAttendanceSessionsAvailableStudentsGet(input, {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          });
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  bulkCreateAttendanceSession: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        evaluation_period_id: z.string(),
        date: z.string(),
        context_id: z.string(),
        context_type: z.nativeEnum(AttendanceContextTypeEnum),
        taken_by_id: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
        records: z
          .array(
            z.object({
              student_id: z.string(),
              status: z.nativeEnum(AttendanceStatusEnum),
            })
          )
          .default([]),
        recorded_by_id: z.string().optional().nullable(),
        attendanceHeaders: z
          .object({
            'X-Attendance-Mode': z.string().optional(),
            'X-Attendance-Flow-Id': z.string().optional(),
            'X-Attendance-Flow-Started-At': z.string().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { attendanceHeaders, ...requestBody } = input;
        const response = await StudentsServiceClient.bulkCreateAttendanceSessionApiV1AcademicAttendanceSessionsBulkPost(
          requestBody,
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
              ...(attendanceHeaders?.['X-Attendance-Mode'] && {
                'X-Attendance-Mode': attendanceHeaders['X-Attendance-Mode'],
              }),
              ...(attendanceHeaders?.['X-Attendance-Flow-Id'] && {
                'X-Attendance-Flow-Id': attendanceHeaders['X-Attendance-Flow-Id'],
              }),
              ...(attendanceHeaders?.['X-Attendance-Flow-Started-At'] && {
                'X-Attendance-Flow-Started-At': attendanceHeaders['X-Attendance-Flow-Started-At'],
              }),
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  bulkUpdateAttendanceRecords: protectedProcedure
    .input(
      z.object({
        session_id: z.string().uuid(),
        records: z.array(
          z.object({
            record_id: z.string().uuid(),
            status: z.nativeEnum(AttendanceStatusEnum).optional().nullable(),
            notes: z.string().optional().nullable(),
          })
        ),
        attendanceHeaders: z
          .object({
            'X-Attendance-Mode': z.string().optional(),
            'X-Attendance-Flow-Id': z.string().optional(),
            'X-Attendance-Flow-Started-At': z.string().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { attendanceHeaders, ...requestBody } = input;
        const response = await StudentsServiceClient.bulkUpdateAttendanceRecordsApiV1AcademicAttendanceRecordsBulkPatch(
          requestBody,
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
              ...(attendanceHeaders?.['X-Attendance-Mode'] && {
                'X-Attendance-Mode': attendanceHeaders['X-Attendance-Mode'],
              }),
              ...(attendanceHeaders?.['X-Attendance-Flow-Id'] && {
                'X-Attendance-Flow-Id': attendanceHeaders['X-Attendance-Flow-Id'],
              }),
              ...(attendanceHeaders?.['X-Attendance-Flow-Started-At'] && {
                'X-Attendance-Flow-Started-At': attendanceHeaders['X-Attendance-Flow-Started-At'],
              }),
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  getAttendanceSession: protectedProcedure
    .input(
      z.object({
        session_id: z.string(),
        include: z.array(z.nativeEnum(AttendanceSessionIncludeEnum)).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.getAttendanceSessionApiV1AcademicAttendanceSessionsSessionIdGet(
          input.session_id,
          { include: input.include },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  listAttendanceRecords: protectedProcedure
    .input(
      z.object({
        session_id: z.string(),
        student_id: z.string().optional().nullable(),
        status: z.nativeEnum(AttendanceStatusEnum).optional().nullable(),
        is_present: z.boolean().optional().nullable(),
        include: z.array(z.nativeEnum(AttendanceRecordIncludeEnum)).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.listAttendanceRecordsApiV1AcademicAttendanceRecordsGet(input, {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        });
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  listTemplates: protectedProcedure
    .input(
      z.object({
        school_id: z.string().optional(),
        school_cycle_id: z.string().optional(),
        category: z.nativeEnum(TemplateCategory).optional(),
        is_active: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.listTemplatesApiV1SignaturesTemplatesGet(
          {
            school_id: input.school_id ?? undefined,
            school_cycle_id: input.school_cycle_id ?? undefined,
            category: input.category ?? undefined,
            is_active: input.is_active ?? undefined,
          },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  getTemplate: protectedProcedure
    .input(
      z.object({
        template_id: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.getTemplateApiV1SignaturesTemplatesTemplateIdGet(
          input.template_id,
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  deleteTemplate: protectedProcedure
    .input(
      z.object({
        template_id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await StudentsServiceClient.deleteTemplateApiV1SignaturesTemplatesTemplateIdDelete(input.template_id, {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        });
        return { success: true };
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  generateEditTemplateAccess: protectedProcedure
    .input(
      z.object({
        template_id: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response =
          await StudentsServiceClient.generateTemplateEditAccessApiV1SignaturesTemplatesTemplateIdEditAccessPost(
            input.template_id,
            {
              headers: {
                Authorization: `Bearer ${API_TOKEN}`,
              },
            }
          );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  getTemplateFields: protectedProcedure
    .input(
      z.object({
        template_id: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.getTemplateFieldsApiV1SignaturesTemplatesTemplateIdFieldsGet(
          input.template_id,
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  listTemplateDocuments: protectedProcedure
    .input(
      z.object({
        template_id: z.string(),
        status: z.nativeEnum(DocumentInstanceStatus).optional(),
        from_date: z.string().optional(),
        to_date: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response =
          await StudentsServiceClient.listTemplateDocumentsApiV1SignaturesTemplatesTemplateIdDocumentsGet(
            input.template_id,
            {
              status: input.status,
              from_date: input.from_date,
              to_date: input.to_date,
            },
            {
              headers: {
                Authorization: `Bearer ${API_TOKEN}`,
              },
            }
          );

        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
});
