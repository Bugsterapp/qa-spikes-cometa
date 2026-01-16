import { api } from '../utils/api';
import { BotServiceClient } from '../utils/apiBot';
import * as Sentry from '@sentry/nextjs';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

export function useLegalDocumentsMutations() {
  const utils = api.useUtils();
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  const createLegalDocumentsMutation = api.bot.createLegalDocuments.useMutation({
    onSuccess: async () => {
      await utils.bot.getLegalDocuments.invalidate();
    },
  });

  const updateLegalDocumentsMutation = api.bot.updateLegalDocuments.useMutation({
    onSuccess: async () => {
      await utils.bot.getLegalDocuments.invalidate();
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: async (input: FormData) => {
      try {
        const legalDocumentsId = input.get('legalDocumentsId') as string;
        const documentType = input.get('documentType') as
          | 'articles_of_incorporation'
          | 'proof_of_address'
          | 'legal_representative';
        const file = input.get('file') as File;

        const token = process.env.NEXT_PUBLIC_BOT_API_TOKEN;
        if (!token) {
          throw new Error('Missing NEXT_PUBLIC_BOT_API_TOKEN');
        }

        const headers = { Authorization: `Token ${token}` };

        const response =
          await BotServiceClient.uploadLegalDocumentFileApiV1LegalDocumentsLegalDocumentsIdUploadFilePost(
            legalDocumentsId,
            {
              document_type: documentType,
              file,
            },
            { headers }
          );

        return response.data;
      } catch (error) {
        Sentry.captureException(error);
        throw error;
      }
    },
  });

  const deleteFileMutation = api.bot.deleteLegalDocumentFile.useMutation();

  const isSaving =
    createLegalDocumentsMutation.isPending ||
    updateLegalDocumentsMutation.isPending ||
    uploadFileMutation.isPending ||
    deleteFileMutation.isPending ||
    isUploadingFiles;

  return {
    createLegalDocumentsMutation,
    updateLegalDocumentsMutation,
    uploadFileMutation,
    deleteFileMutation,
    isSaving,
    setIsUploadingFiles,
  };
}
