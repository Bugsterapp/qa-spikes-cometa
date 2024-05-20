import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient } from '~/utils/api';
import { GenderEnum, PatchedGuardianStudent } from '@cometa/trpc/src/types';
import { zodEnumFromObjKeys } from '~/utils/zod';

const genderSchema = zodEnumFromObjKeys(GenderEnum);

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
});
