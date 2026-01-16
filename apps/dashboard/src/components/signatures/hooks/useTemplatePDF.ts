import * as Sentry from '@sentry/nextjs';
import { useEffect, useState } from 'react';
import { StudentsServiceClient } from '/src/utils/apiStudents';

const API_TOKEN = process.env.NEXT_PUBLIC_SCHOOLS_API_TOKEN;

interface UseTemplatePDFProps {
  templateId: string;
  enabled?: boolean;
}

export function useTemplatePDF({ templateId, enabled = true }: UseTemplatePDFProps) {
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!templateId || !enabled) return;

    let isSubscribed = true;

    async function downloadPDF() {
      setIsLoading(true);
      setError(null);

      try {
        const response =
          await StudentsServiceClient.downloadTemplateFileApiV1SignaturesTemplatesTemplateIdFileDownloadGet(
            templateId,
            {
              headers: {
                Authorization: `Bearer ${API_TOKEN}`,
              },
              format: 'blob',
            }
          );

        if (isSubscribed && response.data) {
          const blob = new Blob([response.data], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          setPdfBlobUrl(url);
        }
      } catch (err) {
        Sentry.captureException(err);
        if (isSubscribed) {
          setError(err instanceof Error ? err : new Error('Error downloading PDF'));
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    }

    downloadPDF();

    // Cleanup: revocar el blob URL cuando el componente se desmonte o cambie el template
    return () => {
      isSubscribed = false;
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [templateId, enabled]);

  return {
    pdfBlobUrl,
    isLoading,
    error,
  };
}
