import { z } from 'zod';
import { StudentsServiceClient } from '/src/utils/apiStudents';
import { CometaServiceClient } from '/src/utils/api-cometa';
import handleTRPCError from '/src/utils/trpcErrorHandler';
import { checkFeatureFlag } from '../../optimizely';

import { createTRPCRouter, protectedProcedure } from '../trpc';

const studentsApiHeaders = { Authorization: `Bearer ${process.env.NEXT_PUBLIC_SCHOOLS_API_TOKEN}` };
const cometaApiHeaders = { Authorization: `Bearer ${process.env.NEXT_PUBLIC_COMETA_API_TOKEN}` };

export const locationRouter = createTRPCRouter({
  retrieveCountries: protectedProcedure.query(async ({ ctx }) => {
    try {
      const useCometaService = await checkFeatureFlag(ctx.session.user.id, 'use_cometa_service');

      const response = useCometaService
        ? await CometaServiceClient.getCountriesApiV1LocationsCountriesGet({
            headers: cometaApiHeaders,
          })
        : await StudentsServiceClient.getCountriesApiV1LocationCountriesGet({
            headers: studentsApiHeaders,
          });

      return response.data;
    } catch (err) {
      handleTRPCError(err);
    }
  }),
  retrieveStates: protectedProcedure.query(async ({ ctx }) => {
    try {
      const useCometaService = await checkFeatureFlag(ctx.session.user.id, 'use_cometa_service');

      const response = useCometaService
        ? await CometaServiceClient.getStatesApiV1LocationsStatesGet({
            headers: cometaApiHeaders,
          })
        : await StudentsServiceClient.getStatesApiV1LocationStatesGet({
            headers: studentsApiHeaders,
          });

      return response.data;
    } catch (err) {
      handleTRPCError(err);
    }
  }),
  getCountry: protectedProcedure
    .input(
      z.object({
        countryId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const useCometaService = await checkFeatureFlag(ctx.session.user.id, 'use_cometa_service');

        const response = useCometaService
          ? await CometaServiceClient.getCountryApiV1LocationsCountriesPkGet(input.countryId, {
              headers: cometaApiHeaders,
            })
          : await StudentsServiceClient.getCountryApiV1LocationCountriesPkGet(input.countryId, {
              headers: studentsApiHeaders,
            });

        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  getState: protectedProcedure
    .input(
      z.object({
        stateId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const useCometaService = await checkFeatureFlag(ctx.session.user.id, 'use_cometa_service');

        const response = useCometaService
          ? await CometaServiceClient.getStateApiV1LocationsStatesPkGet(input.stateId, {
              headers: cometaApiHeaders,
            })
          : await StudentsServiceClient.getStateApiV1LocationStatesPkGet(input.stateId, {
              headers: studentsApiHeaders,
            });

        return response.data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
});
