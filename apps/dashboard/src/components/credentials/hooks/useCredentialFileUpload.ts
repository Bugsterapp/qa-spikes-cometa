import { useCallback } from 'react';
import { StudentsServiceClient } from '/src/utils/apiStudents';
import { useSession } from 'next-auth/react';
import mime from 'mime-types';
import * as Sentry from '@sentry/nextjs';

const API_TOKEN = process.env.NEXT_PUBLIC_SCHOOLS_API_TOKEN;

type FileField = 'signature' | 'digital_seal';

const FILE_TAGS: Record<FileField, string> = {
  signature: 'credential_signature',
  digital_seal: 'credential_digital_seal',
};

const FILE_NAMES: Record<FileField, string> = {
  signature: 'Firma Digital',
  digital_seal: 'Sello Digital',
};

async function urlToFile(url: string): Promise<File> {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();

  const mimeType = mime.contentType(res.headers.get('Content-Type') || '') || undefined;

  let filename = new URL(url).pathname.split('/').pop() || '';

  const contentDisposition = res.headers.get('Content-Disposition');
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1] || filename;
    }
  }

  return new File([buf], decodeURIComponent(filename), { type: mimeType });
}

export function useCredentialFileUpload() {
  const { data: session } = useSession();

  const uploadFile = useCallback(
    async (schoolId: string, templateId: string, field: FileField, file: File): Promise<string> => {
      const params = {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      };

      try {
        const response = await StudentsServiceClient.createFileApiV1FilesSchoolIdPost(
          schoolId,
          {
            files_in: [file],
            entity_id: templateId,
            created_by: session?.user?.id as string,
            name: FILE_NAMES[field],
            description: `${FILE_NAMES[field]} para plantilla de credencial`,
            tag: FILE_TAGS[field],
          },
          params
        );

        return response.data.id as string;
      } catch (error) {
        Sentry.captureException(error, {
          tags: {
            context: 'credential_file_upload',
            field,
            template_id: templateId,
            school_id: schoolId,
          },
        });
        throw error;
      }
    },
    [session]
  );

  const downloadFile = useCallback(async (fileId: string): Promise<File | null> => {
    const params = {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    };

    try {
      const response = await StudentsServiceClient.getFileApiV1FilesFileIdGet(fileId, { download: true }, params);

      if (!response.data.file_details || response.data.file_details.length === 0) {
        return null;
      }

      const downloadUrl = response.data.file_details[0]?.download_url;
      if (!downloadUrl) {
        return null;
      }

      return await urlToFile(downloadUrl);
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          context: 'credential_file_download',
          file_id: fileId,
        },
      });
      return null;
    }
  }, []);

  const deleteFile = useCallback(async (fileId: string): Promise<void> => {
    const params = {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    };

    try {
      await StudentsServiceClient.deleteFileApiV1FilesPkDelete(fileId, params);
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          context: 'credential_file_delete',
          file_id: fileId,
        },
      });
      throw error;
    }
  }, []);

  return {
    uploadFile,
    downloadFile,
    deleteFile,
  };
}
