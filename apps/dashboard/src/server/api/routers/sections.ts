import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClient, ServiceClientRoot } from '/src/utils/api';
import handleTRPCError from '/src/utils/trpcErrorHandler';
export const sectionsRouter = createTRPCRouter({
  getSections: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        query: z.object({ levels: z.array(z.string()).optional() }).optional(),
        joinByPipe: z.boolean().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClient.apiV1DashboardSchoolsSectionsList(
          input.schoolId,
          {
            ...input.query,
            join_by_pipe: input.joinByPipe,
          },
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  getSectionsFormData: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClientRoot.academicCoordinator.academicCoordinatorSectionsFormDataRetrieve(
          {
            school_id: input.schoolId,
          },
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),

  createSectionsFormData: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        formData: z.record(z.any()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClientRoot.academicCoordinator.academicCoordinatorSectionsFormDataCreate(
          { school_id: input.schoolId },
          input.formData,
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  updateSectionsFromForm: protectedProcedure
    .input(
      z.object({
        payload: z.array(z.any()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ServiceClientRoot.academicCoordinator.academicCoordinatorSectionsUpdateFromFormCreate(
          input.payload,
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
});
