import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { ServiceClient } from '~/utils/api';
import { StudentsServiceClient } from '~/utils/api-students';
import { GenderEnum, OnboardingStageEnum } from '@cometa/trpc/src/types';
import {
  ClassroomStudentAssignmentIncludeEnum,
  ClassroomIncludeEnum,
  EvaluationScoresByAssignmentCriteriaEnum,
} from '@cometa/trpc/src/students/types';

const SECRET = process.env.NEXT_PUBLIC_API_SECRET ?? '';
const studentsApiHeaders = { Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN ?? ''}` };

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
  getSchoolsCycles: protectedProcedure
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
        return response.data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
  getSchoolsCyclesByToken: publicProcedure
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
        return response.data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
  getSchoolsCycleById: protectedProcedure
    .input(z.object({ school_id: z.string(), school_cycle_id: z.string() }))
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.getApiV1SchoolsSchoolIdSchoolCyclesSchoolCycleIdGet(
          input.school_id,
          input.school_cycle_id,
          {
            headers: studentsApiHeaders,
          }
        );
        return response.data;
      } catch (err) {
        Sentry.captureException(err);
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
  getSectionsByToken: publicProcedure
    .input(
      z.object({
        school_id: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsSectionsTokenList(input.school_id, {
          headers: {
            secret: SECRET,
          },
        });
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
        const response = await ServiceClient.apiV1StudentsCreate(input.data, {
          headers: {
            token: ctx.session.token,
          },
        });
        return { data: response.data, status: response.status, error: false };
      } catch (err: any) {
        Sentry.captureException(err);
        if (Array.isArray(err.error)) {
          return { data: err.error[0], status: err.status, error: true };
        }
        return { data: err.error, status: err.status, error: true };
      }
    }),
  listClassroomStudentAssignments: protectedProcedure
    .input(
      z.object({
        student_id: z.string(),
        include: z.array(z.nativeEnum(ClassroomStudentAssignmentIncludeEnum)).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response =
          await StudentsServiceClient.listClassroomStudentAssignmentsApiV1AcademicClassroomStudentAssignmentsGet(
            {
              student_id: input.student_id,
              include: input.include ?? [],
            },
            {
              headers: studentsApiHeaders,
            }
          );
        return response.data;
      } catch (err) {
        Sentry.captureException(err);
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
          headers: studentsApiHeaders,
        });
        return response.data;
      } catch (err) {
        Sentry.captureException(err);
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
              headers: studentsApiHeaders,
            }
          );
        return response.data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
  getClassroomById: protectedProcedure
    .input(
      z.object({
        classroom_id: z.string(),
        include: z.array(z.nativeEnum(ClassroomIncludeEnum)).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.getClassroomApiV1AcademicClassroomsClassroomIdGet(
          input.classroom_id,
          {
            include: input.include ?? [],
          },
          {
            headers: studentsApiHeaders,
          }
        );
        return response.data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
  listClassrooms: protectedProcedure
    .input(
      z.object({
        classroom_ids: z.array(z.string()),
        include: z.array(z.nativeEnum(ClassroomIncludeEnum)).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.listClassroomsApiV1AcademicClassroomsGet(
          {
            id: input.classroom_ids,
            limit: input.classroom_ids.length,
            include: input.include ?? [],
          },
          {
            headers: studentsApiHeaders,
          }
        );
        return response.data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
});

export const createSchoolsCaller = schoolsRouter.createCaller;
