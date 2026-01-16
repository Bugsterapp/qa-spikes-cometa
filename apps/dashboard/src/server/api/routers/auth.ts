import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { ServiceClientAuth } from 'src/utils/api';
import handleTRPCError from 'src/utils/trpcErrorHandler';

export const authRouter = createTRPCRouter({
  login: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await ServiceClientAuth.authenticateWithLegacyMigrationApiV1AuthLoginPost({
          username: input.username,
          password: input.password,
        });

        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  createUser: protectedProcedure
    .input(
      z.object({
        first_name: z.string().min(1).max(100),
        last_name: z.string().min(1).max(100),
        email: z.string().email(),
        mobile: z.string().nullable().optional(),
        membership: z.string(),
        school_id: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClientAuth.createUserApiV1UsersPost(
          {
            first_name: input.first_name,
            last_name: input.last_name,
            email: input.email,
            mobile: input.mobile ?? undefined,
            membership: input.membership,
            school_id: input.school_id,
          },
          {
            headers: {
              Authorization: `Bearer ${ctx.session.token}`,
            },
          }
        );

        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  updateUser: protectedProcedure
    .input(
      z.object({
        user_id: z.string().uuid(),
        school_id: z.string().uuid(),
        data: z.object({
          first_name: z.string().min(1).max(100).optional(),
          last_name: z.string().min(1).max(100).optional(),
          email: z.string().email().optional(),
          mobile: z.string().nullable().optional(),
          membership: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { user_id, school_id, data } = input;
        const response = await ServiceClientAuth.updateUserApiV1UsersUserIdPatch(
          user_id,
          {
            ...data,
            school_id,
            mobile: data.mobile ?? undefined,
          },
          {
            headers: {
              Authorization: `Bearer ${ctx.session.token}`,
            },
          }
        );

        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  resetPassword: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await ServiceClientAuth.requestPasswordResetApiV1AuthResetPasswordPost({
          email: input.email,
        });

        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  refreshToken: publicProcedure
    .input(
      z.object({
        refresh_token: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await ServiceClientAuth.refreshTokenApiV1AuthRefreshPost({
          refresh_token: input.refresh_token,
        });

        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
});
