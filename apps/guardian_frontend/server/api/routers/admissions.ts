import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { AdmissionsServiceClient } from '~/utils/api-admissions';
import { AdmissionStepStatus, GenderEnum, SchoolStepTags, SchoolStepTypeEnum } from '@cometa/trpc/src/admissions/types';

const SECRET = process.env.NEXT_PUBLIC_API_SECRET ?? '';

const querySchema = z.object({
  page: z.optional(z.number()),
  limit: z.optional(z.number()),
  status: z.optional(z.array(z.string())),
  school_cycle_id: z.optional(z.array(z.string())),
  section_id: z.optional(z.array(z.string())),
  search: z.optional(z.string()),
  sorting: z.optional(z.string()),
  guardian_lead_id: z.optional(z.array(z.string())),
  external_guardian_id: z.optional(z.array(z.string())),
  external_id: z.optional(z.array(z.string())),
});

const schoolStepQuerySchema = z.object({
  include_deleted: z.boolean().optional(),
  type: z.nativeEnum(SchoolStepTypeEnum).optional(),
  tag: z.nativeEnum(SchoolStepTags).optional(),
});

export const admissionsRouter = createTRPCRouter({
  createAdmission: protectedProcedure
    .input(
      z.object({
        first_name: z.string(),
        last_name: z.string(),
        school_cycle_id: z.string(),
        section_id: z.string(),
        origin_school: z.string(),
        change_reason: z.string(),
        meet_reason: z.string(),
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
            Authorization: ctx.session.token,
          },
        });
        return response.data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
  createPublicAdmission: publicProcedure
    .input(
      z.object({
        first_name: z.string(),
        last_name: z.string(),
        school_cycle_id: z.string(),
        section_id: z.string(),
        origin_school: z.string(),
        change_reason: z.string(),
        meet_reason: z.string(),
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
          accept_terms: z.boolean(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await AdmissionsServiceClient.createAdmissionApiV1AdmissionsPost(input, {
          headers: {
            Authorization: SECRET,
          },
        });
        return response.data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
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
        Sentry.captureException(err);
      }
    }),
  getAdmission: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        includeNames: z.boolean().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await AdmissionsServiceClient.getAdmissionApiV1AdmissionsPkGet(
          input.id,
          { include_names: input.includeNames ?? false },
          {
            headers: {
              Authorization: ctx.session.token,
            },
          }
        );
        const data = response.data;
        return data;
      } catch (err) {
        Sentry.captureException(err);
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
        Sentry.captureException(err);
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
        guardian_occupation: z.string().optional(),
        guardian_workplace: z.string().optional(),
        guardian_workphone: z.string().optional(),
        additional_guardian_id: z.string().optional(),
        additional_guardian_email: z.string().optional(),
        additional_guardian_phone: z.string().optional(),
        additional_guardian_first_name: z.string().optional(),
        additional_guardian_last_name: z.string().optional(),
        additional_guardian_relationship: z.string().optional(),
        additional_guardian_occupation: z.string().optional(),
        additional_guardian_workplace: z.string().optional(),
        additional_guardian_workphone: z.string().optional(),
        accept_truthfulness: z.boolean(),
        student_lead_id: z.string(),
        school_id: z.string(),
        changed_by: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await AdmissionsServiceClient.upsertApplicationFormApiV1AdmissionsPkApplicationFormPut(
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
        Sentry.captureException(err);
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
              Authorization: ctx.session.token,
            },
          }
        );
        const data = response.data;
        return data;
      } catch (err) {
        Sentry.captureException(err);
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
        accept_truthfulness: z.boolean(),
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
        Sentry.captureException(err);
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
        Sentry.captureException(err);
      }
    }),
  upsertAdmissionStep: protectedProcedure
    .input(
      z.object({
        student_lead_id: z.string(),
        school_step_id: z.string(),
        status: z.nativeEnum(AdmissionStepStatus),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await AdmissionsServiceClient.upsertAdmissionStepApiV1AdmissionStepPut(input, {
          headers: {
            Authorization: ctx.session.token,
          },
        });
        const data = response.data;
        return data;
      } catch (err) {
        Sentry.captureException(err);
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
        Sentry.captureException(err);
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
              Authorization: ctx.session.token,
            },
          }
        );
        const data = response.data;
        return data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
  getSchoolSteps: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        query: schoolStepQuerySchema,
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await AdmissionsServiceClient.getSchoolStepsApiV1SchoolStepSchoolIdGet(
          input.school_id,
          {
            ...input.query,
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
        Sentry.captureException(err);
      }
    }),
  listSignatureTemplates: protectedProcedure
    .input(
      z.object({
        school_step_id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await AdmissionsServiceClient.listSignatureTemplatesApiV1SignatureTemplatesGet(
          {
            school_step_id: input.school_step_id,
          },
          {
            headers: {
              Authorization: ctx.session.token,
            },
          }
        );
        return response.data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
});
