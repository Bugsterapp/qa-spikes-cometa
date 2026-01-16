import { Button } from '@cometa/recreo';
import FileUploader from '@cometa/recreo/components/FileUploader';
import LoadingSpinner from '~/public/icons/loading-spinner.svg';
import { useDocumentDefinitions } from './hooks/useDocumentDefinitions';
import { useDocumentFiles } from './hooks/useDocumentFiles';

const DEFAULT_ERROR_MESSAGE = 'Debes completar correctamente este campo para continuar.';

type DocumentManagerProps = {
  entityId: string;
  schoolStepId: string;
  levelId?: string;
  onSubmit?: () => void;
  submitButtonText?: string;
  showSubmitButton?: boolean;
  isSubmitButtonDisabled?: boolean;
  preview?: boolean;
  acceptedFileTypes?: string[];
  placeholder?: string;
  fileUploaderSize?: 'small' | 'medium' | 'large';
  maxFileSize?: number;
  helperText?: string;
};

export function DocumentManager({
  entityId,
  schoolStepId,
  levelId,
  onSubmit,
  submitButtonText = 'Enviar documentos',
  showSubmitButton = true,
  isSubmitButtonDisabled = false,
  preview = true,
  acceptedFileTypes = ['image/*', 'application/pdf'],
  placeholder = '<span class="text-blue-600 font-bold cursor-pointer underline">Haz click aquí</span> para subir los archivos',
  fileUploaderSize = 'small',
  maxFileSize = 10 * 1024 * 1024,
  helperText,
}: DocumentManagerProps) {
  const { documentDefinitions, isLoading: isLoadingDefinitions } = useDocumentDefinitions({
    schoolStepId,
    levelId,
    enabled: !!schoolStepId,
  });

  const {
    filesByDocId,
    areFilesValidByDocId,
    isLoading: isLoadingFiles,
    isSubmitting,
    onFilesChange,
    handleSubmit,
  } = useDocumentFiles({
    entityId,
    documentDefinitions,
    enabled: !!entityId,
  });

  const isLoading = isLoadingDefinitions || isLoadingFiles;

  async function onSubmitHandler() {
    const success = await handleSubmit(onSubmit);
    return success;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner className="w-24 h-24 text-blue-100" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {documentDefinitions.map((doc) => {
        const docId = doc.id;
        const isInvalid = areFilesValidByDocId[docId] === false;

        return (
          <div key={docId}>
            <FileUploader
              preview={preview}
              id={docId}
              initialFiles={filesByDocId[docId]?.fileDetails || []}
              label={doc.isRequired ? doc.name : `${doc.name} (opcional)`}
              onFilesChange={(files, isValid) => onFilesChange(docId, files, isValid)}
              acceptedFileTypes={acceptedFileTypes}
              placeholder={placeholder}
              size={fileUploaderSize}
              maxFileSize={maxFileSize}
              helperText={helperText}
            />
            {isInvalid && <p className="text-red-500 text-sm mt-1 ml-2">{DEFAULT_ERROR_MESSAGE}</p>}
          </div>
        );
      })}

      {showSubmitButton && (
        <Button
          className="w-full"
          color="black"
          onClick={onSubmitHandler}
          disabled={isSubmitting || isSubmitButtonDisabled}
          isLoading={isSubmitting}
        >
          {submitButtonText}
        </Button>
      )}
    </div>
  );
}
