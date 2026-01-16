import { z } from 'zod';
import { StudentsServiceClient } from '/src/utils/apiStudents';
import handleTRPCError from '/src/utils/trpcErrorHandler';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import type {
  CredentialTemplateType,
  CreateCredentialTemplateDTO,
  UpdateCredentialTemplateDTO,
  GenerateFilteredCredentialsDTO,
} from '@cometa/trpc/src/students/types';

const API_TOKEN = process.env.NEXT_PUBLIC_SCHOOLS_API_TOKEN;

export const credentialsRouter = createTRPCRouter({
  listTemplates: protectedProcedure
    .input(
      z.object({
        schoolId: z.string().uuid(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(100),
        name: z.string().optional(),
        type: z.string().optional() as z.ZodType<CredentialTemplateType | undefined>,
      })
    )
    .query(async ({ input }) => {
      const params = {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      };

      try {
        const response = await StudentsServiceClient.listCredentialTemplatesApiV1CredentialsTemplatesGet(
          {
            school_id: input.schoolId,
            page: input.page,
            limit: input.limit,
            name: input.name,
            type: input.type,
          },
          params
        );

        return response.data;
      } catch (error) {
        throw handleTRPCError({
          error,
          message: 'Error al obtener las plantillas de credenciales',
        });
      }
    }),

  getTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.string().uuid(),
        schoolId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      const params = {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      };

      try {
        const response = await StudentsServiceClient.getCredentialTemplateApiV1CredentialsTemplatesTemplateIdGet(
          input.templateId,
          params
        );

        return response.data;
      } catch (error) {
        throw handleTRPCError({
          error,
          message: 'Error al obtener la plantilla de credencial',
        });
      }
    }),

  deleteTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      const params = {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      };

      try {
        await StudentsServiceClient.deleteCredentialTemplateApiV1CredentialsTemplatesTemplateIdDelete(
          input.templateId,
          params
        );

        return { success: true };
      } catch (error) {
        throw handleTRPCError({
          error,
          message: 'Error al eliminar la plantilla de credencial',
        });
      }
    }),

  createTemplate: protectedProcedure.input(z.custom<CreateCredentialTemplateDTO>()).mutation(async ({ input }) => {
    const params = {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    };

    try {
      const response = await StudentsServiceClient.createCredentialTemplateApiV1CredentialsTemplatesPost(input, params);

      return response.data;
    } catch (error) {
      throw handleTRPCError({
        error,
        message: 'Error al crear la plantilla de credencial',
      });
    }
  }),

  updateTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.string().uuid(),
        data: z.custom<UpdateCredentialTemplateDTO>(),
      })
    )
    .mutation(async ({ input }) => {
      const params = {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      };

      try {
        const response = await StudentsServiceClient.updateCredentialTemplateApiV1CredentialsTemplatesTemplateIdPatch(
          input.templateId,
          input.data,
          params
        );

        return response.data;
      } catch (error) {
        throw handleTRPCError({
          error,
          message: 'Error al actualizar la plantilla de credencial',
        });
      }
    }),

  generateFilteredCredentials: protectedProcedure
    .input(
      z.object({
        templateId: z.string().uuid(),
        schoolId: z.string().uuid(),
        studentIds: z.array(z.string().uuid()).min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const data: GenerateFilteredCredentialsDTO = {
          school_id: input.schoolId,
          student_ids: input.studentIds,
        };

        const response =
          (await StudentsServiceClient.generateFilteredCredentialsZipApiV1CredentialsTemplatesTemplateIdGenerateFilteredZipPost(
            input.templateId,
            data,
            {
              format: 'arrayBuffer',
              headers: {
                Authorization: `Bearer ${API_TOKEN}`,
                Accept: 'application/zip',
              },
            }
          )) as unknown as { data: ArrayBuffer };

        if (!response.data) {
          throw new Error('No credential data received');
        }

        const uint8Array = new Uint8Array(response.data);
        ctx.res?.setHeader('Content-Type', 'application/zip');

        return { data: Array.from(uint8Array) };
      } catch (error) {
        throw handleTRPCError({
          error,
          message: 'Error al generar las credenciales',
        });
      }
    }),
  generateFilteredCredentialsZip: protectedProcedure
    .input(
      z.object({
        templateId: z.string().uuid(),
        data: z.custom<GenerateFilteredCredentialsDTO>(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const params = {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          'X-User-Email': ctx.session.user.email ?? '',
        },
      };

      try {
        const response =
          await StudentsServiceClient.generateFilteredCredentialsZipAsyncApiV1CredentialsTemplatesTemplateIdGenerateFilteredZipAsyncPost(
            input.templateId,
            input.data,
            params
          );

        return response.data;
      } catch (error) {
        throw handleTRPCError({
          error,
          message: 'Error al generar las credenciales',
        });
      }
    }),
});
