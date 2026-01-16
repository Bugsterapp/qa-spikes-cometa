import { addColorsToDependents } from '../../../utils/colors';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { ServiceClient } from '~/utils/api';
import {
  BlankEnum,
  MethodEnum,
  OnboardingStageEnum,
  PatchedUpdateGuardian,
  TaxingTypeEnum,
} from '@cometa/trpc/src/types';
import { zodEnumFromObjKeys } from '~/utils/zod';
import { TRPCError } from '@trpc/server';

const onboardingSchema = zodEnumFromObjKeys(OnboardingStageEnum);
const taxingTypeSchema = z.nativeEnum(TaxingTypeEnum).or(z.nativeEnum(BlankEnum));

const SECRET = process.env.NEXT_PUBLIC_API_SECRET ?? '';

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
          gender: z.enum(['M', 'F']).optional(),
        }),
        query: z
          .object({
            force: z.boolean().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1GuardiansPartialUpdate(
          input.id,
          input.data as Partial<PatchedUpdateGuardian>, // Needed to assure the onboarding_stage value equals to a Enum value
          input.query,
          {
            headers: {
              token: ctx.session.token,
            },
          }
        );
        return { data: response.data, error: false, status: response.status } as const;
      } catch (err: any) {
        Sentry.captureException(err);
        return { data: err.error, status: err.status, error: true };
      }
    }),
  verifyGuardians: protectedProcedure
    .input(z.object({ guardianIds: z.array(z.string()) }))
    .query(async ({ ctx, input }) => {
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
  login: publicProcedure.input(z.object({ hash: z.string() })).mutation(async ({ input }) => {
    try {
      const response = await ServiceClient.apiV1GuardiansLoginCreate(input, {
        headers: {
          secret: SECRET,
        },
      });
      return response.data;
    } catch (err) {
      Sentry.captureException(err);
    }
  }),
  sendCode: publicProcedure
    .input(z.object({ method: z.nativeEnum(MethodEnum), value: z.string() }))
    .mutation(async ({ input }) =>
      ServiceClient.apiV1GuardiansLoginSendCodeCreate(input, {
        headers: {
          secret: SECRET,
        },
      }).catch((err) => {
        Sentry.captureException(err);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: JSON.stringify((err as any)?.error || {}),
          cause: (err as any)?.error,
        });
      })
    ),
  featuresToggle: protectedProcedure.query(async ({ ctx }) => {
    try {
      const response = await ServiceClient.apiV1PortalFeaturesList({
        headers: {
          token: ctx.session.token,
        },
      });
      return response.data;
    } catch (err) {
      Sentry.captureException(err);
    }
  }),
  openNotification: publicProcedure.input(z.object({ notificationId: z.string() })).mutation(async ({ input }) => {
    ServiceClient.apiV1GuardianNotificationOpenedUpdate(input.notificationId, {
      headers: {
        secret: SECRET,
      },
    }).catch((err) => {
      Sentry.captureException(err);
    });
  }),
  existGuardian: publicProcedure
    .input(
      z.object({
        schoolId: z.string(),
        query: z
          .object({
            id: z.string().optional(),
            email: z.string().optional(),
            phone: z.string().optional(),
          })
          .optional(),
      })
    )
    .query(async ({ input }) => {
      const response = await ServiceClient.apiV1DashboardSchoolsGuardiansList(input.schoolId, input.query as any, {
        headers: {
          secret: SECRET,
        },
      });
      return response.data;
    }),
  sendInvoicesToEmail: protectedProcedure
    .input(
      z.object({
        payinId: z.string(),
        schoolId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1SchoolsPayinsSendInvoicesToEmailCreate(
          input.payinId,
          input.schoolId,
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
  getGuardianDebt: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const response = await ServiceClient.apiAppSchoolsGuardiansDebtRetrieve(input.school_id, {
        headers: {
          token: ctx.session.token,
        },
      });
      return response.data;
    }),
});
