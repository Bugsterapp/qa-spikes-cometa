import { createTRPCRouter, protectedProcedure } from '/src/server/api/trpc';
import handleTRPCError from '/src/utils/trpcErrorHandler';
import { ServiceClientAnnouncements } from '/src/utils/api';

import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';

export const AnnouncementSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  school_id: z.string().min(1, 'El ID de la escuela es requerido').optional(),
  created_by: z.string().min(1, 'El ID del creador es requerido').optional(),
  cover_image: z
    .any()
    .refine((file) => !file || file instanceof File, {
      message: 'cover_image debe ser un archivo válido',
    })
    .optional(),
  files_list: z
    .array(z.any())
    .refine((files) => files.every((f) => typeof File !== 'undefined' && f instanceof File), {
      message: 'Todos los elementos deben ser archivos',
    })
    .refine(
      (files) =>
        files.every(
          (f) => typeof File !== 'undefined' && f instanceof File && f.size <= 25 * 1024 * 1024 // 25MB in bytes
        ),
      {
        message: 'Cada archivo debe tener un tamaño máximo de 25MB',
      }
    )
    .optional(),
  requires_signature: z.boolean().optional(),
  communication_status: z.string(),
  filters: z
    .object({
      student_ids: z
        .array(z.string(), {
          required_error: 'Debes proporcionar una lista de estudiantes',
        })
        .optional(),
    })
    .optional(),
});

// Función auxiliar para enviar el fetch
async function sendAnnouncementToDashboard(formData: FormData) {
  const response = await fetch('https://cometardo.prd.getcometa.com/dashboard/', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_ANNOUNCEMENTS_API_TOKEN}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al enviar anuncio: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

export const announcementsRouter = createTRPCRouter({
  getAnnouncementResponses: protectedProcedure
    .input(
      z.object({
        announcementId: z.string(),
        page: z.number().optional(),
        filters: z.any().optional(),
        groupBy: z.string().optional(),
        cursor: z.string().nullish().optional(),
        pageSize: z.number().optional(),
        query: z.any().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response =
          await ServiceClientAnnouncements.dashboard.getFilteredNotificationsDashboardCommunicationsCommunicationIdNotificationsFilteredGet(
            input.announcementId,
            {
              ...input.query,
              filters: input.filters ? JSON.stringify(input.filters) : undefined,
              group_by: input.groupBy || undefined,
              page: input.cursor ? Number(input.cursor) : undefined,
              limit: 100,
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_ANNOUNCEMENTS_API_TOKEN}`,
              },
            }
          );
        const data = response.data;
        return data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  getAnnouncements: protectedProcedure
    .input(
      z.object({
        schoolId: z.string(),
        page: z.number().optional(),
        cursor: z.string().nullish().optional(),
        pageSize: z.number().optional(),
        query: z.any().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await ServiceClientAnnouncements.dashboard.getDashboardListDashboardSchoolIdListGet(
          input.schoolId,
          {
            ...input.query,
            page: input.cursor ? Number(input.cursor) : undefined,
            limit: 100,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_ANNOUNCEMENTS_API_TOKEN}`,
            },
          }
        );
        const data = response.data;
        return data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  getAnnouncementById: protectedProcedure
    .input(
      z.object({
        announcementId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClientAnnouncements.dashboard.getCommunicationDashboardCommunicationIdGet(
          input.announcementId,
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_ANNOUNCEMENTS_API_TOKEN}`,
              Auth: `Token ${ctx.session.token}`,
            },
          }
        );
        const data = response.data;
        return data;
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  deleteAnnouncement: protectedProcedure.input(z.object({ announcementId: z.string() })).mutation(async ({ input }) => {
    try {
      const response = await ServiceClientAnnouncements.dashboard.deleteCommunicationDashboardCommunicationIdDelete(
        input.announcementId,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_ANNOUNCEMENTS_API_TOKEN}`,
          },
        }
      );
      return response.data;
    } catch (err) {
      handleTRPCError(err);
    }
  }),
  downloadResponsesCsv: protectedProcedure
    .input(
      z.object({
        announcementId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response =
          await ServiceClientAnnouncements.dashboard.downloadNotificationsCsvDashboardCommunicationIdExportNotificationsGet(
            input.announcementId,
            {
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_ANNOUNCEMENTS_API_TOKEN}`,
              },
            }
          );

        // Handle the response based on its type
        let csvData = '';
        let filename = `respuestas_${input.announcementId}.csv`;

        // Check if response is a Response object with a ReadableStream
        if (response && typeof response === 'object' && 'body' in response) {
          // It's a Response object, extract the CSV from the body
          const responseObj = response as any;

          // Get filename from headers if available
          const contentDisposition = responseObj.headers?.get?.('content-disposition');
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/);
            if (filenameMatch) {
              filename = filenameMatch[1];
            }
          }

          // Read the stream
          if (responseObj.body) {
            csvData = await responseObj.text();
          }
        } else if ((response as any).data) {
          // Handle axios-style response
          const responseData = (response as any).data;
          if (typeof responseData === 'string') {
            csvData = responseData;
          } else if (responseData instanceof Blob) {
            csvData = await responseData.text();
          } else {
            csvData = JSON.stringify(responseData);
          }
        }

        return { csv: csvData, filename };
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  createAnnouncement: protectedProcedure
    .input(
      z.object({
        formData: z.any(), // FormData no se puede validar con Zod directamente
      })
    )
    .mutation(async ({ input }) => {
      try {
        const responseData = await sendAnnouncementToDashboard(input.formData);
        return responseData;
      } catch (err) {
        Sentry.captureException(err);
        throw err;
      }
    }),
});
