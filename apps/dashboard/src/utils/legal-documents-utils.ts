import type { FileResponse, LegalDocumentsResponse, LegalDocumentsStatus } from '@cometa/trpc/src/bot/types';
import { OnboardingStatus } from '@cometa/trpc/src/bot/types';
import { compressImage } from './file-utils';
import { DocumentSection, type DocumentType } from '../constants/legalDocuments';

function getTRPCErrorCode(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null;

  if ('data' in error && typeof error.data === 'object' && error.data !== null) {
    if ('code' in error.data && typeof error.data.code === 'string') {
      return error.data.code;
    }
  }

  return null;
}

export function getErrorMessage(error: unknown, context = 'legal documents'): string {
  const errorCode = getTRPCErrorCode(error);

  const errorString = error instanceof Error ? error.message : String(error);
  if (errorString.toLowerCase().includes('network') || errorString.toLowerCase().includes('fetch')) {
    return 'Error de conexión. Por favor, verifica tu conexión a internet e inténtalo nuevamente.';
  }

  const errorMessages: Record<string, string> = {
    BAD_REQUEST: 'Error al procesar la solicitud. Por favor, verifica la información e inténtalo nuevamente.',
    UNAUTHORIZED: 'No tienes autorización para realizar esta acción.',
    FORBIDDEN: 'No tienes permisos para realizar esta acción.',
    NOT_FOUND: 'No se encontró el recurso solicitado. Por favor, recarga la página e inténtalo nuevamente.',
    CONFLICT: 'Ya existe un registro con esta información.',
    UNPROCESSABLE_CONTENT:
      'Los datos ingresados no son válidos. Por favor, verifica la información e inténtalo nuevamente.',
    INTERNAL_SERVER_ERROR:
      'Error desconocido. Por favor, inténtalo nuevamente más tarde o contacta al equipo de soporte.',
  };

  return (
    (errorCode ? errorMessages[errorCode] : null) ||
    `Error al guardar ${context}. Por favor, inténtalo nuevamente o contacta al equipo de soporte.`
  );
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'No especificada';

  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateForInput(dateString: string | null | undefined): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
}

type DeleteMutation = {
  mutateAsync: (params: { legalDocumentsId: string; fileId: string }) => Promise<void>;
};

type UploadMutation = {
  mutateAsync: (input: FormData, options?: Record<string, unknown>) => Promise<unknown>;
};

type SetIsUploadingFiles = (isUploading: boolean) => void;

export async function deleteExistingFiles(
  legalDocuments: LegalDocumentsResponse | undefined | null,
  legalDocumentsId: string,
  documentType: DocumentType,
  filesKey: keyof Pick<
    LegalDocumentsResponse,
    'articles_of_incorporation_files' | 'proof_of_address_files' | 'legal_representative_files'
  >,
  deleteMutation: DeleteMutation
) {
  const existingFiles = legalDocuments?.[filesKey] || [];
  const filesToDelete = existingFiles.filter((f: FileResponse) => f.document_type === documentType);

  for (const file of filesToDelete) {
    await deleteMutation.mutateAsync({
      legalDocumentsId,
      fileId: file.id,
    });
  }
}

export async function uploadFiles(
  files: File[],
  legalDocumentsId: string,
  documentType: DocumentType,
  uploadMutation: UploadMutation,
  setIsUploadingFiles?: SetIsUploadingFiles
) {
  if (files.length === 0) return;

  if (setIsUploadingFiles) {
    setIsUploadingFiles(true);
  }

  try {
    for (const file of files) {
      const fileToUpload = file.type.startsWith('image/') ? await compressImage(file, 500) : file;

      const formData = new FormData();
      formData.append('legalDocumentsId', legalDocumentsId);
      formData.append('documentType', documentType);
      formData.append('file', fileToUpload);

      await uploadMutation.mutateAsync(formData);
    }
  } finally {
    if (setIsUploadingFiles) {
      setIsUploadingFiles(false);
    }
  }
}

export function getDocumentFiles(
  legalDocuments: LegalDocumentsResponse | undefined | null,
  filesKey: keyof Pick<
    LegalDocumentsResponse,
    'articles_of_incorporation_files' | 'proof_of_address_files' | 'legal_representative_files'
  >,
  documentType: DocumentType
): FileResponse[] {
  return legalDocuments?.[filesKey]?.filter((f: FileResponse) => f.document_type === documentType) || [];
}

export function hasArticlesData(legalDocuments: LegalDocumentsResponse | undefined | null): boolean {
  const files = getDocumentFiles(legalDocuments, 'articles_of_incorporation_files', 'articles_of_incorporation');
  return files.length > 0;
}

export function hasProofOfAddressData(legalDocuments: LegalDocumentsResponse | undefined | null): boolean {
  const files = getDocumentFiles(legalDocuments, 'proof_of_address_files', 'proof_of_address');
  return files.length > 0;
}

export function hasLegalRepresentativeData(legalDocuments: LegalDocumentsResponse | undefined | null): boolean {
  const files = getDocumentFiles(legalDocuments, 'legal_representative_files', 'legal_representative');
  return (
    files.length > 0 || !!legalDocuments?.legal_representative_name || !!legalDocuments?.legal_representative_last_name
  );
}

export function getDocumentStatus(
  legalDocuments: LegalDocumentsResponse | undefined | null,
  statusKey: keyof LegalDocumentsStatus
): OnboardingStatus | null {
  const status = legalDocuments?.status?.[statusKey];
  return status ?? null;
}

export function getStatusProps(status: OnboardingStatus | null) {
  if (status === null) {
    return { badge: 'pending' as const, chip: undefined };
  }

  switch (status) {
    case OnboardingStatus.Approved:
      return { badge: 'completed' as const, chip: { variant: 'success' as const, text: 'Aprobada' } };
    case OnboardingStatus.Pending:
      return { badge: 'in-review' as const, chip: { variant: 'warning' as const, text: 'En revisión' } };
    case OnboardingStatus.Declined:
      return { badge: 'error' as const, chip: { variant: 'error' as const, text: 'Requiere correcciones' } };
    default:
      return { badge: 'pending' as const, chip: undefined };
  }
}

export const HAS_DATA_FUNCTIONS = {
  [DocumentSection.Articles]: hasArticlesData,
  [DocumentSection.ProofOfAddress]: hasProofOfAddressData,
  [DocumentSection.LegalRepresentative]: hasLegalRepresentativeData,
};
