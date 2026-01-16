import { z } from 'zod';
import { Api, ConceptTypesEnum } from '@cometa/trpc/src/types';
import { createTRPCRouter, protectedProcedure } from '../trpc';
// import { ServiceClient } from '/src/utils/api';
import { StudentsServiceClient } from '/src/utils/apiStudents';
import handleTRPCError from '/src/utils/trpcErrorHandler';

export type ConceptType = { id: ConceptTypesEnum; name: string };

const studentsApiHeaders = { Authorization: `Bearer ${process.env.NEXT_PUBLIC_SCHOOLS_API_TOKEN}` };

export const chargeRouter = createTRPCRouter({
  // schoolCycleList: protectedProcedure
  //   .input(z.object({ schoolId: z.string(), is_active: z.boolean().optional() }))
  //   .query(async ({ input, ctx }) => {
  //     try {
  //       const response = await ServiceClient.apiV1DashboardSchoolsCyclesList(
  //         input.schoolId,
  //         {
  //           is_active: input.is_active,
  //         },
  //         {
  //           headers: {
  //             Authorization: `Token ${ctx.session.token}`,
  //           },
  //         }
  //       );
  //       const data = response.data;
  //       return data;
  //     } catch (err) {
  //       handleTRPCError(err);
  //     }
  //   }),
  schoolCycleList: protectedProcedure
    .input(z.object({ schoolId: z.string(), is_active: z.boolean().optional() }))
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.listApiV1SchoolsSchoolIdSchoolCyclesGet(
          input.schoolId,
          {
            is_active: input.is_active,
          },
          {
            headers: studentsApiHeaders,
          }
        );
        const data = response.data;
        return data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  conceptsList: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        school_cycles: z.array(z.string()).optional(),
        type: z.array(z.nativeEnum(ConceptTypesEnum)).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const client = new Api();
      try {
        const response = await client.api.apiV1DashboardSchoolsConceptsList(
          input.schoolId,
          {
            school_cycles: input.school_cycles,
            type: input.type,
          },
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
            baseUrl: process.env.NEXT_PUBLIC_SERVER_API_BASE_URL,
          }
        );
        const data = response.data;
        return data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  conceptTypesList: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const client = new Api();
      try {
        const response = await client.api.apiV1DashboardSchoolsResumeRetrieve(input.schoolId, {
          headers: {
            Authorization: `Token ${ctx.session.token}`,
          },
          baseUrl: process.env.NEXT_PUBLIC_SERVER_API_BASE_URL,
        });
        const data = response.data.concepts_types.map((concept) => ({
          id: concept[0],
          name: concept[1],
        })) as ConceptType[];
        return data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
});
