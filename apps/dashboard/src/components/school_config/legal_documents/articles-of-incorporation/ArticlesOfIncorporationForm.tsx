import { useFileTypeValidation } from '../../../../hooks/useFileTypeValidation';
import { BaseLegalDocumentForm } from '../shared/BaseLegalDocumentForm';
import { LegalDocumentFileUploader } from '../shared/LegalDocumentFileUploader';

type ArticlesOfIncorporationFormProps = {
  onClose: () => void;
  onSave: (files: File[]) => Promise<void>;
  isLoading?: boolean;
};

export function ArticlesOfIncorporationForm({
  onClose,
  onSave,
  isLoading = false,
}: Readonly<ArticlesOfIncorporationFormProps>) {
  const {
    files,
    isValid,
    fileType,
    validationError,
    handleFilesChange,
    resetFiles,
    getHelperText,
    setValidationError,
  } = useFileTypeValidation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (files.length === 0) {
      setValidationError('Debes subir al menos un archivo');
      return;
    }

    if (!isValid) return;

    await onSave(files);
    onClose();
  }

  function handleCancel() {
    resetFiles();
    onClose();
  }

  return (
    <BaseLegalDocumentForm
      title="Acta constitutiva"
      onClose={handleCancel}
      isLoading={isLoading}
      onSubmit={handleSubmit}
      info="Sube los archivos del acta constitutiva de tu institución. Puedes subir hasta 5 archivos. Puedes subir archivos PDF o imágenes (máximo 20 MB), pero no puedes mezclar ambos tipos."
    >
      <LegalDocumentFileUploader
        id="articles-of-incorporation"
        onFilesChange={handleFilesChange}
        maxFiles={5}
        fileType={fileType}
        helperText={getHelperText(fileType)}
        error={validationError}
      />
    </BaseLegalDocumentForm>
  );
}
