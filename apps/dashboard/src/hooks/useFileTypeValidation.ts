import { useState } from 'react';
import {
  FileType,
  MAX_FILE_SIZE,
  MAX_IMAGE_FILE_SIZE,
  ALLOWED_PDF_TYPES,
  ALLOWED_IMAGE_TYPES,
} from '../constants/legalDocuments';

export function useFileTypeValidation() {
  const [files, setFiles] = useState<File[]>([]);
  const [isValid, setIsValid] = useState(true);
  const [fileType, setFileType] = useState<FileType | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  function validateFiles(newFiles: File[]): { isValid: boolean; error: string | null } {
    if (newFiles.length === 0) {
      return { isValid: true, error: null };
    }

    const firstFile = newFiles[0];
    const isPdf = firstFile.type === 'application/pdf';
    const isImage = ALLOWED_IMAGE_TYPES.includes(firstFile.type);

    if (!isPdf && !isImage) {
      return { isValid: false, error: 'Tipo de archivo no permitido' };
    }

    const currentFileType: FileType = isPdf ? FileType.PDF : FileType.IMAGE;

    if (hasMixedTypes(newFiles, currentFileType)) {
      return {
        isValid: false,
        error: 'No puedes mezclar archivos PDF con imágenes. Selecciona solo un tipo de archivo.',
      };
    }

    const maxSize = isPdf ? MAX_FILE_SIZE : MAX_IMAGE_FILE_SIZE;

    const hasOversizedFiles = newFiles.some((file) => file.size > maxSize);
    if (hasOversizedFiles) {
      const maxSizeMB = '20 MB';
      return {
        isValid: false,
        error: `Uno o más archivos exceden el tamaño máximo permitido de ${maxSizeMB}`,
      };
    }

    return { isValid: true, error: null };
  }

  function handleFilesChange(newFiles: File[], valid: boolean) {
    const validation = validateFiles(newFiles);
    setFiles(newFiles);
    setIsValid(validation.isValid && valid);
    setValidationError(validation.error);

    if (newFiles.length > 0) {
      const firstFile = newFiles[0];
      const isPdf = firstFile.type === 'application/pdf';
      setFileType(isPdf ? FileType.PDF : FileType.IMAGE);
    } else {
      setFileType(null);
    }
  }

  function resetFiles() {
    setFiles([]);
    setIsValid(true);
    setFileType(null);
    setValidationError(null);
  }

  function hasMixedTypes(newFiles: File[], currentFileType: FileType) {
    return newFiles.some((file) => {
      const fileIsPdf = file.type === 'application/pdf';
      const fileIsImage = ALLOWED_IMAGE_TYPES.includes(file.type);
      return (currentFileType === FileType.PDF && !fileIsPdf) || (currentFileType === FileType.IMAGE && !fileIsImage);
    });
  }

  function getMaxFileSize(type: FileType | null) {
    if (type === FileType.PDF) return MAX_FILE_SIZE;
    return MAX_IMAGE_FILE_SIZE;
  }

  function getAcceptedFileTypes(type: FileType | null) {
    if (type === FileType.PDF) return ALLOWED_PDF_TYPES;
    if (type === FileType.IMAGE) return ALLOWED_IMAGE_TYPES;
    return [...ALLOWED_PDF_TYPES, ...ALLOWED_IMAGE_TYPES];
  }

  function getHelperText(type: FileType | null) {
    if (type === FileType.PDF) return 'Archivos permitidos: .pdf (Máximo 20 MB)';
    if (type === FileType.IMAGE) return 'Archivos permitidos: .jpg, .jpeg, .png (Máximo 20 MB)';
    return 'Archivos permitidos: .jpg, .jpeg, .png o .pdf (Máximo 20 MB)';
  }

  return {
    files,
    isValid,
    fileType,
    validationError,
    handleFilesChange,
    resetFiles,
    getMaxFileSize,
    getAcceptedFileTypes,
    getHelperText,
    setValidationError,
  };
}
