import { ContainerError } from '@cometa/recreo';
import FileUploader from '@cometa/recreo/components/FileUploader';
import { useFileTypeValidation } from '../../../../hooks/useFileTypeValidation';
import { FileType, COMMON_PLACEHOLDERS } from '../../../../constants/legalDocuments';

type LegalDocumentFileUploaderProps = {
  id: string;
  onFilesChange: (files: File[], valid: boolean) => void;
  maxFiles?: number;
  fileType?: FileType | null;
  helperText?: string;
  error?: string | null;
  label?: string;
  multiple?: boolean;
  pdfPreview?: boolean;
};

export function LegalDocumentFileUploader({
  id,
  onFilesChange,
  maxFiles,
  fileType,
  helperText,
  error,
  label,
  multiple = true,
  pdfPreview = true,
}: Readonly<LegalDocumentFileUploaderProps>) {
  const { getMaxFileSize, getAcceptedFileTypes } = useFileTypeValidation();

  const handleFileChange = (files: File[], valid = true) => {
    onFilesChange(files, valid);
  };

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className="text-[#22283a] text-base font-normal">
          {label}
        </label>
      )}
      <FileUploader
        id={id}
        multiple={maxFiles !== 1 && multiple}
        maxFiles={maxFiles}
        maxFileSize={getMaxFileSize(fileType ?? null)}
        acceptedFileTypes={getAcceptedFileTypes(fileType ?? null)}
        preview
        pdfPreview={pdfPreview}
        required={false}
        onFilesChange={handleFileChange}
        helperText={helperText}
        placeholder={COMMON_PLACEHOLDERS.fileUpload}
        className="w-full"
      />
      <ContainerError error={error as string} />
    </div>
  );
}
