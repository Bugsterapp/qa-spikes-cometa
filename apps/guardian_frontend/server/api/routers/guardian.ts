import { addColorsToDependents } from '../../../utils/colors';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient } from '~/utils/api';
import { OnboardingStageEnum, PatchedUpdateGuardian, TaxingTypeEnum } from '@cometa/trpc/src/types';
import { zodEnumFromObjKeys } from '~/utils/zod';

const onboardingSchema = zodEnumFromObjKeys(OnboardingStageEnum);
const taxingTypeSchema = zodEnumFromObjKeys(TaxingTypeEnum);

export type taxingTypeValues = z.infer<typeof taxingTypeSchema>;

export const guardianRouter = createTRPCRouter({
  get: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    try {
      const response = await ServiceClient.apiV1GuardiansRetrieve(input.id, {
        headers: {
          token: ctx.session.token,
        },
      });
      return response.data;
    } catch (err) {
      Sentry.captureException(err);
    }
  }),
  me: protectedProcedure.query(async ({ ctx }) => {
    try {
      const response = await ServiceClient.apiV1GuardiansMeRetrieve({
        headers: {
          token: ctx.session.token,
        },
      });
      return response.data;
    } catch (err) {
      Sentry.captureException(err);
    }
  }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          first_name: z.string().max(250).optional(),
          last_name: z.string().max(250).optional(),
          email: z.string().optional(),
          phone: z.string().nullable().optional(),
          landline: z.string().nullable().optional(),
          tax_id: z.string().optional(),
          address_name: z.string().optional(),
          address_number: z.string().optional(),
          address_complement: z.string().optional().nullable(),
          postal_code: z.string().optional(),
          onboarding_stage: onboardingSchema.optional(),
          billable_dependents: z.array(z.string()).optional(),
          billing_name: z.string().optional(),
          terms_acceptance: z.record(z.string(), z.any()).optional(),
          tour_completed: z.record(z.string(), z.boolean()).optional(),
          taxing_system: z.string().optional(),
          taxing_type: taxingTypeSchema.optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1GuardiansPartialUpdate(
          input.id,
          input.data as Partial<PatchedUpdateGuardian>, // Needed to assure the onboarding_stage value equals to a Enum value
          {
            headers: {
              token: ctx.session.token,
            },
          }
        );
        return { data: response.data, error: false, status: response.status };
      } catch (err: any) {
        Sentry.captureException(err);
        return { data: err.error, status: err.status, error: true };
      }
    }),
  verifyGuardians: protectedProcedure
    .input(z.object({ guardianIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      try {
        const response = await ServiceClient.apiV1GuardiansVerifyGuardiansCreate(
          { guardian_ids: input.guardianIds },
          {
            headers: {
              token: ctx.session.token,
            },
          }
        );
        return response.data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
  studentList: protectedProcedure.query(async ({ ctx }) => {
    try {
      const response = await ServiceClient.apiV1StudentsList({
        headers: {
          token: ctx.session.token,
        },
      });
      return addColorsToDependents(response.data);
    } catch (err) {
      Sentry.captureException(err);
    }
  }),
});
