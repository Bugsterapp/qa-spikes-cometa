import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { ServiceClient } from '~/utils/api';
import { GenderEnum, OnboardingStageEnum } from '@cometa/trpc/src/types';
import ApiClient from '~/services/ApiClient';
import axios from 'axios';

const SECRET = process.env.NEXT_PUBLIC_API_SECRET ?? '';

const onboardingSchema = z.nativeEnum(OnboardingStageEnum);
const genderSchema = z.nativeEnum(GenderEnum);

export const schoolsRouter = createTRPCRouter({
  getBySlugName: publicProcedure
    .input(
      z.object({
        slug: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await ServiceClient.apiV1SchoolsRetrieve(input.slug, {
          headers: {
            secret: SECRET,
          },
        });
        const data = response.data;
        return data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
  signUpGuardian: publicProcedure
    .input(
      z.object({
        school_id: z.string(),
        data: z.object({
          first_name: z.string().max(250),
          last_name: z.string().max(250).optional(),
          email: z.string(),
          phone: z.string(),
          onboarding_stage: onboardingSchema,
        }),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await ServiceClient.apiV1SchoolsSignupCreate(input.school_id, input.data, {
          headers: {
            secret: SECRET,
          },
        });
        return { data: response.data, status: response.status, error: false };
      } catch (err: any) {
        Sentry.captureException(err);
        return { data: err.error, status: err.status, error: true };
      }
    }),
  getLevels: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const response = await ServiceClient.apiV1SchoolsLevelsList(
          input.school_id,
          {},
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
  getSections: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
        levels: z.array(z.string()).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const response = await ServiceClient.apiV1SchoolsSectionsList(
          input.school_id,
          {
            levels: input.levels,
          },
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
  createStudent: protectedProcedure
    .input(
      z.object({
        data: z.array(
          z.object({
            first_name: z.string().max(250),
            last_name: z.string().max(250).optional(),
            identifier: z.string().max(250).optional(),
            birthdate: z.string().max(250).optional(),
            gender: genderSchema.optional(),
            section: z.string().optional().nullable(),
            school: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const response = await ApiClient.createStudents(input.data, {
          headers: {
            token: ctx.session.token,
          },
        });
        return { data: response.data, status: response.status, error: false };
      } catch (err: any) {
        if (axios.isAxiosError(err)) {
          const data = err.response?.data ?? {};
          Sentry.captureException(err);
          if (Array.isArray(data)) {
            return { data: data[0], status: err.response?.status, error: true };
          }
          return { data, status: err.response?.status, error: true };
        }
        return { data: err.error, status: err.status, error: true };
      }
    }),
});

export const createSchoolsCaller = schoolsRouter.createCaller;
