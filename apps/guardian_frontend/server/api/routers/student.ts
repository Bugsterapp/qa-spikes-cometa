import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient } from '~/utils/api';
import { GenderEnum, GuardianStudent, PatchedGuardianStudent } from '@cometa/trpc/src/types';
import { zodEnumFromObjKeys } from '~/utils/zod';
import { StudentsServiceClient } from '~/utils/api-students';
import { AddressUpdate, MedicalInfoUpdateDTO, StudentCreate, StudentUpdate } from '@cometa/trpc/src/students/types';

const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN ?? '';

const genderSchema = zodEnumFromObjKeys(GenderEnum);

const addressUpdateSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  street: z.string().optional().nullable(),
  interior_number: z.string().optional().nullable(),
  neighborhood: z.string().optional().nullable(),
  state_id: z.string().optional().nullable(),
  zip_code: z.string().optional().nullable(),
  municipality: z.string().optional().nullable(),
  home_phone: z.string().optional().nullable(),
});

const medicalFormUpdateSchema = z.object({
  blood_type_code: z.string().optional().nullable(),
  weight: z.number().optional().nullable(),
  height: z.number().optional().nullable(),
  laterality: z.string().optional().nullable(),
  personal_history: z.string().optional().nullable(),
  family_history: z.string().optional().nullable(),
  current_ailments: z.string().optional().nullable(),
  recent_interventions: z.string().optional().nullable(),
  other_history: z.string().optional().nullable(),
  has_allergies: z.boolean().optional().nullable(),
  require_drugs: z.boolean().optional().nullable(),
  drugs: z.string().optional().nullable(),
  authorize_emergency_transfer: z.boolean().optional().nullable(),
  authorize_physical_activity: z.boolean().optional().nullable(),
  food_allergies: z.string().optional().nullable(),
  drug_allergies: z.string().optional().nullable(),
  plant_allergies: z.string().optional().nullable(),
  other_allergies: z.string().optional().nullable(),
  dietary_restrictions: z.string().optional().nullable(),
  emergency_contact_id: z.string().optional().nullable(),
  emergency_contact_name: z.string().optional().nullable(),
  emergency_contact_phone: z.string().optional().nullable(),
  emergency_contact_relationship: z.string().optional().nullable(),
  has_private_doctor: z.boolean().optional().nullable(),
  doctor_name: z.string().optional().nullable(),
  doctor_phone: z.string().optional().nullable(),
  doctor_clinic: z.string().optional().nullable(),
  has_private_insurance: z.boolean().optional().nullable(),
  has_all_vaccines: z.boolean().optional().nullable(),
  pending_vaccines: z.string().optional().nullable(),
  comments: z.string().optional().nullable(),
  created_at: z.string().optional().nullable(),
  modified_at: z.string().optional().nullable(),
});

const medicalInfoUpdateSchema = z.object({ id: z.string().uuid() }).merge(medicalFormUpdateSchema);

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

export const studentRouter = createTRPCRouter({
  assignBillings: protectedProcedure
    .input(
      z.object({
        data: z.object({
          students: z.array(
            z.object({
              id: z.string(),
              billing_guardian: z.string().nullable().optional(),
            })
          ),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1GuardiansAssignBillingsPartialUpdate(input.data, {
          headers: {
            token: ctx.session.token,
          },
        });
        return response.data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
  get: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
    try {
      const response = await ServiceClient.apiV1StudentsRetrieve(input.id, {
        headers: {
          token: ctx.session.token,
        },
      });
      return response.data as GuardianStudent;
    } catch (err: any) {
      Sentry.captureException(err);
      return { data: err.error, status: err.status, error: true };
    }
  }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          identifier: z.string().max(20).optional(),
          first_name: z.string().max(250).optional(),
          last_name: z.string().max(250).optional(),
          birthdate: z.string().max(10).optional(),
          gender: genderSchema.optional(),
          section: z.string().optional().nullable(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1StudentsPartialUpdate(
          input.id,
          input.data as Partial<PatchedGuardianStudent>, // Needed to assure gender value equals to a Enum value
          {
            headers: {
              token: ctx.session.token,
            },
          }
        );
        return { data: response.data, status: response.status, error: false };
      } catch (err: any) {
        Sentry.captureException(err);
        return { data: err.error, status: err.status, error: true };
      }
    }),
  updateStudentAdditionalInfo: protectedProcedure
    .input(
      z.object({
        studentId: z.string(),
        data: z.object({
          nationality_code: z.string().optional().nullable(),
          birth_place_id: z.string().optional().nullable(),
          address: addressUpdateSchema.optional(),
          medical_info: medicalInfoUpdateSchema.optional(),
          permissions_agreements: permissionsAgreementsUpdateSchema.optional(),
          note: z.string().optional().nullable(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.updateStudentApiV1StudentStudentIdPut(
          input.studentId,
          input.data as StudentUpdate,
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err: any) {
        Sentry.captureException(err);
        return { data: err.error, status: err.status, error: true };
      }
    }),
  createStudentAdditionalInfo: protectedProcedure
    .input(
      z.object({
        data: z.object({
          student_id: z.string(),
          nationality_code: z.string().optional().nullable().default(null),
          birth_place_id: z.string().optional().nullable().default(null),
          address: addressUpdateSchema.optional(),
          medical_info: medicalInfoUpdateSchema.optional(),
          permissions_agreements: permissionsAgreementsUpdateSchema.optional(),
          note: z.string().optional().nullable().default(null),
        }),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.createStudentApiV1StudentPost(input.data as StudentCreate, {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        });
        return response.data;
      } catch (err: any) {
        Sentry.captureException(err);
        return { data: err.error, status: err.status, error: true };
      }
    }),
  getCountries: protectedProcedure.query(async () => {
    try {
      const response = await StudentsServiceClient.getCountriesApiV1LocationCountriesGet({
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      });
      return response.data;
    } catch (err: any) {
      Sentry.captureException(err);
      return { data: err.error, status: err.status, error: true };
    }
  }),
  getCountry: protectedProcedure
    .input(
      z.object({
        countryId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.getCountryApiV1LocationCountriesPkGet(input.countryId, {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        });
        const data = response.data;
        return data;
      } catch (err: any) {
        Sentry.captureException(err);
        return { data: err.error, status: err.status, error: true };
      }
    }),
  getStates: protectedProcedure.query(async () => {
    try {
      const response = await StudentsServiceClient.getStatesApiV1LocationStatesGet({
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      });
      return response.data;
    } catch (err: any) {
      Sentry.captureException(err);
      return { data: err.error, status: err.status, error: true };
    }
  }),
  getState: protectedProcedure
    .input(
      z.object({
        stateId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.getStateApiV1LocationStatesPkGet(input.stateId, {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        });
        const data = response.data;
        return data;
      } catch (err: any) {
        Sentry.captureException(err);
        return { data: err.error, status: err.status, error: true };
      }
    }),
  getStudentAdditionalInfo: protectedProcedure.input(z.object({ studentId: z.string() })).query(async ({ input }) => {
    try {
      const response = await StudentsServiceClient.getStudentApiV1StudentPkGet(input.studentId, {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      });
      return response.data;
    } catch (err: any) {
      if (err && err.status === 404) {
        return null;
      }

      Sentry.captureException(err);
    }
  }),
  updateAddress: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          street: z.string().optional(),
          interior_number: z.string().optional(),
          neighborhood: z.string().optional(),
          state_id: z.string().optional(),
          municipality: z.string().optional(),
          zip_code: z.string().optional(),
          home_phone: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.updateAddressApiV1LocationAddressesPkPut(
          input.id,
          input.data as AddressUpdate,
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return { data: response.data, status: response.status, error: false };
      } catch (err: any) {
        Sentry.captureException(err);
        return { data: err.error, status: err.status, error: true };
      }
    }),
  upsertMedicalForm: protectedProcedure
    .input(
      z.object({
        studentId: z.string(),
        data: medicalFormUpdateSchema,
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.updateStudentMedicalInfoApiV1StudentStudentIdMedicalInfoPut(
          input.studentId,
          input.data as MedicalInfoUpdateDTO,
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return { data: response.data, status: response.status, error: false };
      } catch (err: any) {
        Sentry.captureException(err);
        return { data: err.error, status: err.status, error: true };
      }
    }),
});
