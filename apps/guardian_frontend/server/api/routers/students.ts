import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { StudentsServiceClient } from '~/utils/api-students';
import { GenderEnum } from '@cometa/trpc';
import {
  AcademicConfigOriginTypeEnum,
  InscriptionIncludeEnum,
  DocumentInstanceStatus,
  AttendanceRecordIncludeEnum,
  AttendanceContextTypeEnum,
} from '@cometa/trpc/src/students/types';

const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN ?? '';

export const studentsRouter = createTRPCRouter({
  getStudents: protectedProcedure
    .input(z.object({ guardianId: z.string(), schoolId: z.string() }))
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.listMainStudentsApiV1StudentsGet(
          {
            guardian_id: input.guardianId,
            school_id: input.schoolId,
          },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err: any) {
        if (err && err.status === 404) {
          return null;
        }

        Sentry.captureException(err);
      }
    }),
  getStudent: protectedProcedure.input(z.object({ studentId: z.string() })).query(async ({ input }) => {
    try {
      const response = await StudentsServiceClient.getMainStudentApiV1StudentsStudentIdGet(input.studentId, {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      });
      return response.data;
    } catch (err: any) {
      if (err && err.status === 404) {
        return null;
      }

      Sentry.captureException(err);
    }
  }),
  updateStudent: protectedProcedure
    .input(
      z.object({
        studentId: z.string(),
        data: z.object({
          first_name: z.string(),
          last_name: z.string(),
          identifier: z.string().nullable(),
          birthdate: z.string(),
          gender: z.nativeEnum(GenderEnum),
        }),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.updateMainStudentApiV1StudentsStudentIdPatch(
          input.studentId,
          input.data,
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err: any) {
        if (err && err.status === 404) {
          return null;
        }

        Sentry.captureException(err);
      }
    }),
  getStudentGuardians: protectedProcedure.input(z.object({ studentId: z.string() })).query(async ({ input }) => {
    try {
      const response = await StudentsServiceClient.getStudentGuardiansApiV1StudentsStudentIdGuardiansGet(
        input.studentId,
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        }
      );
      return response.data;
    } catch (err: any) {
      if (err && err.status === 404) {
        return null;
      }

      Sentry.captureException(err);
    }
  }),
  updateInscription: protectedProcedure
    .input(
      z.object({
        inscriptionId: z.string(),
        data: z.object({
          personal_step_completed_at: z.string().optional().nullable(),
          medical_step_completed_at: z.string().optional().nullable(),
          consentments_step_completed_at: z.string().optional().nullable(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.updateInscriptionApiV1InscriptionInscriptionIdPatch(
          input.inscriptionId,
          input.data,
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err: any) {
        if (err && err.status === 404) {
          return null;
        }

        Sentry.captureException(err);
      }
    }),
  getFiles: protectedProcedure
    .input(z.object({ entity_id: z.string(), download: z.boolean().optional().default(false) }))
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.listFilesApiV1FilesGet(
          {
            entity_id: input.entity_id,
            download: input.download,
          },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        const data = response.data;
        return data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
  deleteFile: protectedProcedure
    .input(
      z.object({
        file_id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.deleteFileApiV1FilesPkDelete(input.file_id, {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        });
        return response.data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
  getSchoolConfig: protectedProcedure
    .input(
      z.object({
        school_id: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.getSchoolConfigApiV1SchoolConfigsSchoolIdGet(input.school_id, {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        });
        const data = response.data;
        return data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
  listAcademicConfigs: protectedProcedure
    .input(
      z.object({
        origin_type: z.nativeEnum(AcademicConfigOriginTypeEnum),
        origin_id: z.union([z.string().uuid(), z.array(z.string().uuid())]),
        school_cycle_id: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.listAcademicConfigsApiV1AcademicAcademicConfigsGet(
          {
            origin_type: input.origin_type,
            origin_id: input.origin_id,
            school_cycle_id: input.school_cycle_id,
          },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
  listAttendanceRecords: protectedProcedure
    .input(
      z.object({
        student_id: z.string().uuid(),
        evaluation_period_id: z.array(z.string().uuid()),
        is_present: z.boolean().optional(),
        include: z.array(z.nativeEnum(AttendanceRecordIncludeEnum)).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.listAttendanceRecordsApiV1AcademicAttendanceRecordsGet(
          {
            student_id: input.student_id,
            evaluation_period_id: input.evaluation_period_id,
            is_present: input.is_present,
            include: input.include,
          },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        Sentry.captureException(err);
        return [];
      }
    }),
  countAttendanceRecords: protectedProcedure
    .input(
      z.object({
        student_id: z.string().uuid(),
        evaluation_period_id: z.array(z.string().uuid()).optional(),
        school_cycle_id: z.string().uuid().optional(),
        is_present: z.boolean().optional(),
        context_type: z.nativeEnum(AttendanceContextTypeEnum).optional(),
        include_by_context: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.countAttendanceRecordsApiV1AcademicAttendanceRecordsCountGet(
          {
            student_id: input.student_id,
            evaluation_period_id: input.evaluation_period_id,
            school_cycle_id: input.school_cycle_id,
            is_present: input.is_present,
            context_type: input.context_type,
            include_by_context: input.include_by_context,
          },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
  getInscription: protectedProcedure
    .input(z.object({ inscriptionId: z.string(), include: z.array(z.nativeEnum(InscriptionIncludeEnum)).optional() }))
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.getApiV2InscriptionsInscriptionIdGet(
          input.inscriptionId,
          {
            include: input.include,
          },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
  getScoreCard: protectedProcedure
    .input(
      z.object({
        student_id: z.string(),
        school_cycle_id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.generateScoreCardApiV1AcademicScoreCardsGet(
          {
            student_id: input.student_id,
            school_cycle_id: input.school_cycle_id,
          },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );

        return response.data;
      } catch (err) {
        Sentry.captureException(err);
        throw err;
      }
    }),
  getDocumentTemplate: protectedProcedure.input(z.object({ templateId: z.string() })).query(async ({ input }) => {
    try {
      const response = await StudentsServiceClient.getTemplateApiV1SignaturesTemplatesTemplateIdGet(input.templateId, {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      });
      return response.data;
    } catch (err) {
      Sentry.captureException(err);
    }
  }),
  listDocumentTemplates: protectedProcedure
    .input(
      z.object({
        id: z.union([z.string(), z.array(z.string())]).optional(),
        school_id: z.string().optional(),
        school_cycle_id: z.string().optional(),
        category: z.string().optional(),
        is_active: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.listTemplatesApiV1SignaturesTemplatesGet(
          {
            id: input.id,
            school_id: input.school_id,
            school_cycle_id: input.school_cycle_id,
            category: input.category as any,
            is_active: input.is_active,
          },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
  listDocumentInstances: protectedProcedure
    .input(
      z.object({
        school_id: z.string().optional(),
        signer_id: z.string().optional(),
        external_id: z.string().optional(),
        module: z.string().optional(),
        status: z.nativeEnum(DocumentInstanceStatus).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.listDocumentsApiV1SignaturesDocumentsInstancesGet(
          {
            school_id: input.school_id,
            signer_id: input.signer_id,
            external_id: input.external_id,
            module: input.module,
            status: input.status,
          },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        Sentry.captureException(err);
      }
    }),
  createDocumentInstance: protectedProcedure
    .input(
      z.object({
        template_id: z.string(),
        school_id: z.string(),
        signer_id: z.string(),
        signer_email: z.string().email(),
        signer_name: z.string(),
        external_id: z.string().optional(),
        module: z.string().optional(),
        send_immediately: z.boolean().optional(),
        metadata: z.record(z.any()).optional(),
        expires_in_days: z.number().optional(),
        notification_message: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await StudentsServiceClient.createDocumentInstanceApiV1SignaturesDocumentsInstancesPost(
          input,
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        Sentry.captureException(err);
        throw err;
      }
    }),
  getDocumentInstance: protectedProcedure.input(z.object({ documentId: z.string() })).query(async ({ input }) => {
    try {
      const response = await StudentsServiceClient.getDocumentApiV1SignaturesDocumentsInstancesDocumentIdGet(
        input.documentId,
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        }
      );
      return response.data;
    } catch (err) {
      Sentry.captureException(err);
    }
  }),
  updateDocumentStatus: protectedProcedure
    .input(
      z.object({
        documentId: z.string(),
        status: z.nativeEnum(DocumentInstanceStatus),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response =
          await StudentsServiceClient.updateDocumentStatusApiV1SignaturesDocumentsInstancesDocumentIdStatusPatch(
            input.documentId,
            {
              status: input.status,
              metadata: input.metadata,
            },
            {
              headers: {
                Authorization: `Bearer ${API_TOKEN}`,
              },
            }
          );
        return response.data;
      } catch (err) {
        Sentry.captureException(err);
        throw err;
      }
    }),
});
