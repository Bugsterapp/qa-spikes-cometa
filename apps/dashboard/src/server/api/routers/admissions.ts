import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import handleTRPCError from '/src/utils/trpcErrorHandler';
import { AdmissionsServiceClient } from '/src/utils/api-admissions';
import {
  AdmissionStepStatus,
  AvailableRulesType,
  GenderEnum,
  SchoolStepResourceType,
  SchoolStepStatusEnum,
  SchoolStepTags,
  SchoolStepTypeEnum,
  StatusEnum,
  UpdateStudentLeadInfoDTO,
  UpsertApplicationFormDto,
} from '@cometa/trpc/src/admissions/types';
import { ServiceClient } from '/src/utils/api';

const querySchema = z.object({
  page: z.optional(z.number()),
  limit: z.optional(z.number()),
  status: z.optional(z.array(z.string())),
  school_cycle_id: z.optional(z.array(z.string())),
  section_id: z.optional(z.array(z.string())),
  search: z.optional(z.string()),
  sorting: z.optional(z.string()),
  completed_school_step_ids: z.optional(z.array(z.string())),
  external_id: z.optional(z.array(z.string())),
});

export const admissionsRouter = createTRPCRouter({
  getAdmissions: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        page: z.number().optional(),
        cursor: z.string().nullish(),
        pageSize: z.number().optional(),
        query: querySchema.optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await AdmissionsServiceClient.listAdmissionsApiV1AdmissionsGet(
          {
            school_id: input.schoolId,
            ...input.query,
            page: input.cursor ? Number(input.cursor) : undefined,
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
  getAdmissionFilters: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await AdmissionsServiceClient.filtersApiV1AdmissionsFiltersSchoolIdGet(input.schoolId, {
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
  getAdmissionsReport: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        status: z.array(z.string()).optional(),
        section_id: z.array(z.string()).optional(),
        school_cycle_id: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await AdmissionsServiceClient.getAdmissionsReportApiV1AdmissionsReportGet(input, {
          format: 'arrayBuffer',
          headers: {
            Authorization: `Token ${ctx.session.token}`,
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
  createAdmission: protectedProcedure
    .input(
      z.object({
        first_name: z.string(),
        last_name: z.string(),
        school_cycle_id: z.string(),
        section_id: z.string(),
        origin_school: z.string(),
        change_reason: z.string(),
        comment: z.string().optional(),
        birthdate: z.string(),
        gender: z.nativeEnum(GenderEnum),
        created_by: z.string(),
        school_id: z.string(),
        guardian_lead: z.object({
          first_name: z.string(),
          last_name: z.string(),
          email: z.string(),
          phone: z.string(),
          relationship: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await AdmissionsServiceClient.createAdmissionApiV1AdmissionsPost(input, {
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
  getAdmissionDetail: protectedProcedure
    .input(
      z.object({
        admissionId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await AdmissionsServiceClient.getAdmissionApiV1AdmissionsPkGet(
          input.admissionId,
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
  createAdmissionStep: protectedProcedure
    .input(
      z.object({
        status: z.nativeEnum(AdmissionStepStatus),
        school_step_id: z.string(),
        student_lead_id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await AdmissionsServiceClient.createAdmissionStepApiV1AdmissionStepPost(input, {
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
  updateAdmissionStep: protectedProcedure
    .input(
      z.object({
        admissionStepId: z.string(),
        status: z.nativeEnum(AdmissionStepStatus),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await AdmissionsServiceClient.updateAdmissionStepApiV1AdmissionStepPkPut(
          input.admissionStepId,
          { status: input.status },
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
  upsertAdmissionStep: protectedProcedure
    .input(
      z.object({
        studentLeadId: z.string(),
        schoolStepId: z.string(),
        status: z.nativeEnum(AdmissionStepStatus),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await AdmissionsServiceClient.upsertAdmissionStepApiV1AdmissionStepPut(
          {
            student_lead_id: input.studentLeadId,
            school_step_id: input.schoolStepId,
            status: input.status,
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
  acceptAdmission: protectedProcedure
    .input(
      z.object({
        admissionId: z.string(),
        data: z.object({
          school_id: z.string(),
          identifier: z.string(),
          enrollment_code: z.string(),
          school_cycle_id: z.string(),
          section_id: z.string(),
          entry_date: z.string(),
          level_id: z.string(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await AdmissionsServiceClient.updateAdmissionApiV1AdmissionsPkPatch(
          input.admissionId,
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
  getAdmissionPayments: protectedProcedure
    .input(
      z.object({
        studentId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1AdmissionsCheckPaymentsRetrieve(input.studentId, {
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
  deleteAdmission: protectedProcedure
    .input(
      z.object({
        admissionId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await AdmissionsServiceClient.deleteAdmissionApiV1AdmissionsPkDelete(input.admissionId, {
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
  updateAdmissionStatus: protectedProcedure
    .input(
      z.object({
        admissionId: z.string(),
        data: z.object({
          status: z.nativeEnum(StatusEnum),
          dropped_out_reason: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await AdmissionsServiceClient.updateAdmissionStatusApiV1AdmissionsPkStatusPatch(
          input.admissionId,
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
  getApplicationForm: protectedProcedure
    .input(
      z.object({
        studentLeadId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await AdmissionsServiceClient.getApplicationFormApiV1AdmissionsPkApplicationFormGet(
          input.studentLeadId,
          {
            headers: {
              Authorization: ctx.session.token,
            },
          }
        );
        const data = response.data;
        return data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  getMedicalForm: protectedProcedure
    .input(
      z.object({
        studentLeadId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await AdmissionsServiceClient.getMedicalFormApiV1AdmissionsPkMedicalFormGet(
          input.studentLeadId,
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
  upsertMedicalForm: protectedProcedure
    .input(
      z.object({
        blood_type: z.string(),
        weight: z.number(),
        height: z.number(),
        laterality: z.string(),
        family_history: z.string(),
        personal_history: z.string(),
        current_ailments: z.string(),
        recent_interventions: z.string().optional(),
        other_history: z.string().optional(),
        has_allergies: z.boolean(),
        drug_allergies: z.string().optional(),
        food_allergies: z.string().optional(),
        plant_allergies: z.string().optional(),
        other_allergies: z.string().optional(),
        dietary_restrictions: z.string().optional(),
        require_drugs: z.boolean(),
        drugs: z.string().optional(),
        authorize_emergency_transfer: z.boolean(),
        authorize_physical_activity: z.boolean(),
        emergency_contact_id: z.string().optional().nullable(),
        emergency_contact_name: z.string().optional(),
        emergency_contact_phone: z.string().optional(),
        emergency_contact_relationship: z.string().optional(),
        has_private_doctor: z.boolean(),
        doctor_name: z.string().optional(),
        doctor_phone: z.string().optional(),
        doctor_clinic: z.string().optional(),
        has_private_insurance: z.boolean(),
        has_all_vaccines: z.boolean().optional(),
        pending_vaccines: z.string().optional(),
        comments: z.string().optional(),
        accept_truthfulness: z.boolean().optional(),
        student_lead_id: z.string(),
        changed_by: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await AdmissionsServiceClient.upsertMedicalFormApiV1AdmissionsPkMedicalFormPut(
          input.student_lead_id,
          input,
          {
            headers: {
              Authorization: ctx.session.token,
            },
          }
        );
        const data = response.data;
        return data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  upsertApplicationForm: protectedProcedure
    .input(
      z.object({
        curp: z.string(),
        birthplace: z.string(),
        is_outside_mx: z.boolean(),
        nationality: z.string(),
        homephone: z.string(),
        address: z.string(),
        interior_number: z.string(),
        neighborhood: z.string(),
        municipality: z.string(),
        state: z.string(),
        zipcode: z.string(),
        guardian_id: z.string(),
        guardian_relationship: z.string(),
        guardian_occupation: z.string().optional().nullable(),
        guardian_workplace: z.string().optional().nullable(),
        guardian_workphone: z.string().optional().nullable(),
        additional_guardian_id: z.string().optional().nullable(),
        additional_guardian_email: z.string().optional().nullable(),
        additional_guardian_phone: z.string().optional().nullable(),
        additional_guardian_first_name: z.string().optional().nullable(),
        additional_guardian_last_name: z.string().optional().nullable(),
        additional_guardian_relationship: z.string().optional().nullable(),
        additional_guardian_occupation: z.string().optional().nullable(),
        additional_guardian_workplace: z.string().optional().nullable(),
        additional_guardian_workphone: z.string().optional().nullable(),
        accept_truthfulness: z.boolean().optional().nullable(),
        student_lead_id: z.string(),
        school_id: z.string(),
        changed_by: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await AdmissionsServiceClient.upsertApplicationFormApiV1AdmissionsPkApplicationFormPut(
          input.student_lead_id,
          input as UpsertApplicationFormDto,
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
  updateStudenLead: protectedProcedure
    .input(
      z.object({
        first_name: z.string().optional(),
        last_name: z.string().optional(),
        birthdate: z.string().optional(),
        gender: z.string().optional(),
        section_id: z.string().optional(),
        school_cycle_id: z.string().optional(),
        origin_school: z.string().optional(),
        comment: z.string().optional(),
        student_lead_id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await AdmissionsServiceClient.updateStudentLeadApiV1AdmissionsPkStudentLeadPut(
          input.student_lead_id,
          input as UpdateStudentLeadInfoDTO,
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
  getSchoolSteps: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        includeDeleted: z.boolean().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await AdmissionsServiceClient.getSchoolStepsApiV1SchoolStepSchoolIdGet(
          input.schoolId,
          { include_deleted: input.includeDeleted },
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
  getSchoolStepDocs: protectedProcedure
    .input(
      z.object({
        school_step_id: z.string(),
        active: z.boolean().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await AdmissionsServiceClient.getSchoolStepDocsApiV1SchoolStepSchoolStepIdDocsGet(
          input.school_step_id,
          {
            active: input.active,
          },
          {
            headers: {
              Authorization: ctx.session.token,
            },
          }
        );
        const data = response.data;
        return data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  getSchoolStepDocsTags: protectedProcedure.query(async ({ ctx }) => {
    try {
      const response = await AdmissionsServiceClient.getSchoolStepDocsTagsApiV1SchoolStepDocsTagsGet({
        headers: {
          Authorization: ctx.session.token,
        },
      });
      const data = response.data;
      return data;
    } catch (err) {
      handleTRPCError(err);
    }
  }),
  upsertSchoolStepDocs: protectedProcedure
    .input(
      z.array(
        z.object({
          id: z.string().optional(),
          name: z.string(),
          description: z.string().optional(),
          tag: z.string(),
          active: z.boolean(),
          order: z.number(),
          school_step_id: z.string(),
          level_ids: z.string().optional(),
        })
      )
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const mappedInput = input.map((item) => ({
          ...item,
          description: item.description || '',
        }));
        const response = await AdmissionsServiceClient.upsertSchoolStepDocsApiV1SchoolStepDocsPost(mappedInput, {
          headers: {
            Authorization: ctx.session.token,
          },
        });
        const data = response.data;
        return data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  getSchoolStepResources: protectedProcedure
    .input(
      z.object({
        school_step_id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await AdmissionsServiceClient.listSchoolStepResourcesApiV1SchoolStepSchoolStepIdResourcesGet(
          input.school_step_id,
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
  createSchoolStepResource: protectedProcedure
    .input(
      z.object({
        school_step_id: z.string(),
        source: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        type: z.nativeEnum(SchoolStepResourceType),
        order: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { school_step_id, ...resourceData } = input;
        const response =
          await AdmissionsServiceClient.createSchoolStepResourcesApiV1SchoolStepSchoolStepIdResourcesPost(
            school_step_id,
            resourceData,
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
  updateSchoolStepResource: protectedProcedure
    .input(
      z.object({
        school_step_id: z.string(),
        resource_id: z.string(),
        source: z.string().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        type: z.nativeEnum(SchoolStepResourceType).optional(),
        order: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { school_step_id, resource_id, ...resourceData } = input;
        const response =
          await AdmissionsServiceClient.updateSchoolStepResourceApiV1SchoolStepSchoolStepIdResourcesResourceIdPatch(
            school_step_id,
            resource_id,
            resourceData,
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
  deleteSchoolStepResource: protectedProcedure
    .input(
      z.object({
        school_step_id: z.string(),
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response =
          await AdmissionsServiceClient.deleteSchoolStepResourceApiV1SchoolStepSchoolStepIdResourcesResourceIdDelete(
            input.school_step_id,
            input.id,
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
  upsertSchoolSteps: protectedProcedure
    .input(
      z.array(
        z.object({
          id: z.string().optional().nullable(),
          name: z.string(),
          order: z.number(),
          description: z.string(),
          type: z.nativeEnum(SchoolStepTypeEnum).optional(),
          school_id: z.string(),
          status: z.nativeEnum(SchoolStepStatusEnum),
          actions: z.object({
            to_do: z.object({
              label: z.string(),
              redirect_url: z.string(),
            }),
            in_progress: z.object({
              label: z.string(),
              redirect_url: z.string(),
            }),
            completed: z.object({
              label: z.string(),
              redirect_url: z.string(),
            }),
          }),
          tag: z.nativeEnum(SchoolStepTags),
          rules: z
            .array(
              z.object({
                apply_for: z.nativeEnum(AvailableRulesType),
                specific_rules: z.array(
                  z.object({
                    condition: z.string(),
                    value: z.string(),
                    type: z.string().optional(),
                  })
                ),
              })
            )
            .optional()
            .nullable(),
          deleted_at: z.string().optional().nullable(),
        })
      )
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await AdmissionsServiceClient.createSchoolStepsApiV1SchoolStepPost(
          input,
          { include_deleted: true },
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
  deleteSchoolStep: protectedProcedure
    .input(
      z.object({
        schoolStepId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await AdmissionsServiceClient.deleteSchoolStepApiV1SchoolStepSchoolStepIdDelete(
          input.schoolStepId,
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
  getFiles: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        ids: z.array(z.string()).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await AdmissionsServiceClient.getFilesApiV1FilesSchoolIdGet(
          input.school_id,
          {
            ids: input.ids,
            download: false,
          },
          {
            headers: {
              Authorization: ctx.session.token,
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
