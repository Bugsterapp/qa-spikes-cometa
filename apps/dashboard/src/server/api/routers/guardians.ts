import { DashboardGuardianActionSendMessageTypeEnum, TaxingSystemEnum, TaxingTypeEnum } from '@cometa/trpc/src/types';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient } from '/src/utils/api';
import handleTRPCError from '/src/utils/trpcErrorHandler';

const billingGuardianInfoSchema = z.object({
  tax_id: z.string().max(20).optional(),
  billing_name: z.string().max(128).nullable().optional(),
  taxing_system: z.nativeEnum(TaxingSystemEnum).optional(),
  postal_code: z.string().max(16).optional(),
  address_name: z.string().max(128).optional(),
  address_number: z.string().max(32).optional(),
  address_complement: z.string().max(32).nullable().optional(),
  district: z.string().max(64).nullable().optional(),
  city: z.string().max(64).optional(),
  state: z.string().max(64).optional(),
  cfdi_config: z
    .object({
      OTHER: z.string().optional(),
      TRANSPORT: z.string().optional(),
      MONTHLY_FEE: z.string().optional(),
      INSCRIPTION: z.string().optional(),
    })
    .optional(),
  taxing_type: z.nativeEnum(TaxingTypeEnum).optional(),
});

const dashboardPatchGuardianSchema = z.object({
  id: z.string().uuid(),
  first_name: z.string().max(250).optional(),
  last_name: z.string().max(250).optional(),
  phone: z.string().max(128).optional().nullable(),
  email: z.string().max(254).email().optional(),
  birthdate: z.string().optional().nullable().optional(),
  send_emails: z.boolean().optional(),
  send_whatsapps: z.boolean().optional(),
  due_total: z.string().optional(),
  billing_info: billingGuardianInfoSchema,
  dependents: z.any().optional(),
});

const slimGuardianSchema = z.object({
  id: z.string().uuid().optional(),
  first_name: z.string().max(250),
  last_name: z.string().max(250),
  email: z.string().email().max(254),
  phone: z.string().max(128),
  gender: z.enum(['m', 'f']).optional(),
  student_id: z.string(),
  relationship: z.string().optional(),
});

const dashboardGuardianActionSendMessageSchema = z.object({
  id: z.string(),
  type: z
    .nativeEnum(DashboardGuardianActionSendMessageTypeEnum)
    .default(DashboardGuardianActionSendMessageTypeEnum.Onboard),
  selectedSchool: z.string(),
});

export const guardianRouter = createTRPCRouter({
  getGuardianById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        schoolId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const response = await ServiceClient.apiV1DashboardSchoolsGuardiansRetrieve(input.id, input.schoolId, {
        headers: {
          Authorization: `Token ${ctx.session.token}`,
        },
      });
      return response.data;
    }),
  verifyGuardians: protectedProcedure
    .input(z.object({ guardianIds: z.array(z.string()) }))
    .query(async ({ input, ctx }) => {
      const response = await ServiceClient.apiV1DashboardGuardiansVerifyGuardiansCreate(
        { guardian_ids: input.guardianIds },
        {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
        }
      );
      return response.data;
    }),
  getDetails: protectedProcedure
    .input(z.object({ id: z.string(), schoolId: z.string() }))
    .query(async ({ input, ctx }) => {
      const response = await ServiceClient.apiV1DashboardSchoolsGuardiansInfoRetrieve(input.id, input.schoolId, {
        headers: {
          Authorization: `Token ${ctx.session.token}`,
        },
      });
      return response.data;
    }),
  update: protectedProcedure.input(dashboardPatchGuardianSchema).mutation(async ({ input, ctx }) => {
    try {
      const { id, ...rest } = input;
      const response = await ServiceClient.apiV1DashboardGuardiansPartialUpdate(id, rest, {
        headers: {
          Authorization: `Token ${ctx.session.token}`,
        },
      });
      return response.data;
    } catch (err: any) {
      if ('error' in err) {
        return {
          errors: err.error,
          type: 'error',
        };
      }
      handleTRPCError(err);
      Sentry.captureException(err);
    }
  }),
  sendWhatsappInvitedMail: protectedProcedure
    .input(dashboardGuardianActionSendMessageSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardGuardiansOutboundCreate(
          input.id,
          {
            action: {
              selected_school: input.selectedSchool,
              type: input.type,
            },
          },
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );
        return response.data;
      } catch (err: any) {
        if ('error' in err) {
          return {
            errors: err.error,
            type: 'error',
          };
        }
        handleTRPCError(err);
        Sentry.captureException(err);
      }
    }),
  createGuardian: protectedProcedure
    .input(z.object({ schoolId: z.string(), data: slimGuardianSchema }))
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsGuardiansCreate(input.schoolId, input.data, {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
        });
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  downloadFamilyAccountStatement: protectedProcedure
    .input(z.object({ guardian_id: z.string().uuid(), school_cycle_id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const params = {
        headers: {
          Authorization: `Token ${ctx.session.token}`,
        },
      };
      const response = await ServiceClient.apiV1DashboardGuardiansFulfillmentsXlsV2Create(
        input.guardian_id,
        { school_cycle: input.school_cycle_id },
        params
      );
      return response.data;
    }),
});
