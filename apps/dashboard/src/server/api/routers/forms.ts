import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { AdmissionsServiceClient } from '/src/utils/api-admissions';
import { SchoolStepTags } from '@cometa/trpc/src/admissions/types';

export const formsRouter = createTRPCRouter({
  getDynamicForm: protectedProcedure
    .input(
      z.object({
        tag: z.nativeEnum(SchoolStepTags).optional(),
        schoolId: z.string().optional(),
        category: z.string().optional(),
        createdBy: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await AdmissionsServiceClient.getFormsApiV1FormsGet(
          { tag: input.tag, school_id: input.schoolId, category: input.category, created_by: input.createdBy },
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
  getAnswers: protectedProcedure
    .input(
      z.object({
        form_id: z.string(),
        answered_for: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await AdmissionsServiceClient.getAnswersApiV1FormsPkAnswersGet(
          input.form_id,
          { answered_for: input.answered_for },
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
  upsertAnswersAndCompleteStep: protectedProcedure
    .input(
      z.object({
        form_id: z.string(),
        data: z.array(
          z.object({
            answer: z.string(),
            answered_by: z.string(),
            answered_for: z.string(),
            question_id: z.string(),
            form_id: z.string(),
            field_type: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await AdmissionsServiceClient.upsertAnswersAndCompleteStepApiV1FormsPkAnswersPut(
          input.form_id,
          input.data,
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
  upsertAnswers: protectedProcedure
    .input(
      z.object({
        data: z.array(
          z.object({
            answer: z.string(),
            answered_by: z.string(),
            answered_for: z.string(),
            question_id: z.string(),
            form_id: z.string(),
            field_type: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await AdmissionsServiceClient.upsertAnswersApiV1AnswersPut(input.data, {
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
  createForm: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().nullable(),
        layout: z.array(z.any()),
        created_by: z.string(),
        category: z.string().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await AdmissionsServiceClient.createFormApiV1FormsPost(input, {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
        });
        return response.data;
      } catch (err) {
        Sentry.captureException(err);
        throw err;
      }
    }),
  updateForm: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          name: z.string(),
          description: z.string().nullable(),
          layout: z.array(z.any()),
          created_by: z.string(),
          category: z.string().nullable(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await AdmissionsServiceClient.updateFormApiV1FormsPkPatch(input.id, input.data, {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
        });
        return response.data;
      } catch (err) {
        Sentry.captureException(err);
        throw err;
      }
    }),
});
