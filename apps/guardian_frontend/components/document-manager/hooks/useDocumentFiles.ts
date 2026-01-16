import { useState, useEffect, useCallback } from 'react';
import { api } from '~/utils/api';
import { StudentsServiceClient } from '~/utils/api-students';
import { useSelectedSchool } from '~/stores/globalStore';
import { useSession } from 'next-auth/react';
import { useAlert } from '~/hooks';
import { FileEntity } from '@cometa/trpc/src/students/types';
import mime from 'mime-types';
import type { DocumentDefinition } from './useDocumentDefinitions';
import * as Sentry from '@sentry/nextjs';

type FileByDocId = {
  fileId?: string;
  fileDetails: File[];
};

type UseDocumentFilesParams = {
  entityId: string;
  documentDefinitions: DocumentDefinition[];
  enabled?: boolean;
};

type UseDocumentFilesReturn = {
  filesByDocId: Record<string, FileByDocId>;
  areFilesValidByDocId: Record<string, boolean>;
  isLoading: boolean;
  isSubmitting: boolean;
  onFilesChange: (docId: string, files: File[], isValid: boolean) => void;
  handleSubmit: (onSuccess?: () => void) => Promise<boolean>;
  validateAll: () => boolean;
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

export function useDocumentFiles({
  entityId,
  documentDefinitions,
  enabled = true,
}: UseDocumentFilesParams): UseDocumentFilesReturn {
  const selectedSchool = useSelectedSchool();
  const { data: session } = useSession();
  const { setAlert } = useAlert();

  const [filesByDocId, setFilesByDocId] = useState<Record<string, FileByDocId>>({});
  const [areFilesValidByDocId, setAreFilesValidByDocId] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: files, refetch: refetchFiles } = api.students.getFiles.useQuery(
    { entity_id: entityId, download: true },
    {
      enabled: enabled && !!entityId,
      networkMode: 'always',
    }
  );

  const deleteFile = api.students.deleteFile.useMutation();

  const downloadFiles = useCallback(async () => {
    if (!files || documentDefinitions.length === 0) return;

    setIsLoading(true);

    const filesByTypeId = files.reduce((acc, file) => {
      acc[file.type_id as string] = file;
      return acc;
    }, {} as Record<string, FileEntity>);

    const newFilesByDocId: Record<string, FileByDocId> = {};

    const fileProcessing = documentDefinitions.map(async (doc) => {
      const file = filesByTypeId[doc.id];

      if (!file?.file_details) {
        newFilesByDocId[doc.id] = {
          fileId: undefined,
          fileDetails: [],
        };
        return;
      }

      const convertedFiles = await Promise.all(
        file.file_details.map((detail) => urlToFile(detail.download_url as string))
      );

      newFilesByDocId[doc.id] = {
        fileId: file.id as string,
        fileDetails: convertedFiles,
      };
    });

    await Promise.all(fileProcessing);

    setFilesByDocId(newFilesByDocId);
    setIsLoading(false);
  }, [files, documentDefinitions]);

  useEffect(() => {
    downloadFiles();
  }, [downloadFiles]);

  const onFilesChange = useCallback((docId: string, files: File[], isValid: boolean) => {
    setFilesByDocId((prev) => {
      const current = prev[docId];

      return {
        ...prev,
        [docId]: {
          fileId: current?.fileId,
          fileDetails: files,
        },
      };
    });

    setAreFilesValidByDocId((prev) => ({
      ...prev,
      [docId]: isValid,
    }));
  }, []);

  const validateAll = useCallback((): boolean => {
    const validationResults: Record<string, boolean> = {};
    let formIsValid = true;

    documentDefinitions.forEach((doc) => {
      const hasFiles = filesByDocId[doc.id] && filesByDocId[doc.id].fileDetails.length > 0;

      if (!doc.isRequired && !hasFiles) {
        validationResults[doc.id] = true;
        return;
      }

      const isValid = hasFiles && areFilesValidByDocId[doc.id] === true;

      if (!isValid) {
        formIsValid = false;
      }

      validationResults[doc.id] = isValid;
    });

    setAreFilesValidByDocId(validationResults);

    return formIsValid;
  }, [documentDefinitions, filesByDocId, areFilesValidByDocId]);

  const recreateFiles = useCallback(async () => {
    const recreation = documentDefinitions.map(async (doc) => {
      const fileByDoc = filesByDocId[doc.id];

      if (!fileByDoc || fileByDoc.fileDetails.length === 0) return;

      if (fileByDoc.fileId) {
        await deleteFile.mutateAsync({ file_id: fileByDoc.fileId });
      }

      await StudentsServiceClient.createFileApiV1FilesSchoolIdPost(
        selectedSchool?.id as string,
        {
          name: doc.name,
          files_in: fileByDoc.fileDetails,
          entity_id: entityId,
          type_id: doc.id,
          created_by: session?.user.id as string,
          description: '',
          tag: doc.tag,
        },
        {
          headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}` },
        }
      );
    });

    await Promise.all(recreation);
  }, [documentDefinitions, filesByDocId, entityId, selectedSchool, session, deleteFile]);

  const handleSubmit = useCallback(
    async (onSuccess?: () => void): Promise<boolean> => {
      setIsSubmitting(true);

      const isValid = validateAll();

      if (!isValid) {
        setIsSubmitting(false);
        setAlert('Por favor completa todos los documentos requeridos', 'error');
        return false;
      }

      try {
        await recreateFiles();
        await refetchFiles();

        setAlert('Documentos subidos correctamente', 'success');

        if (onSuccess) {
          onSuccess();
        }

        setIsSubmitting(false);
        return true;
      } catch (error) {
        Sentry.captureException(error);
        setAlert('Error subiendo documentos', 'error');
        setIsSubmitting(false);
        return false;
      }
    },
    [validateAll, recreateFiles, refetchFiles, setAlert]
  );

  return {
    filesByDocId,
    areFilesValidByDocId,
    isLoading,
    isSubmitting,
    onFilesChange,
    handleSubmit,
    validateAll,
  };
}
