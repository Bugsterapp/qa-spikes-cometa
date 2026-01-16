import React, { useState, useRef, useMemo } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginPdfPreview from 'filepond-plugin-pdf-preview-with-types';
import { FilePondErrorDescription, FilePondFile } from 'filepond';
import FilePondPluginFileViewer from './VisualizerPlugin';
import './filepond.d.ts';
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import './filepond.css';
import 'filepond-plugin-pdf-preview-with-types/dist/filepond-plugin-pdf-preview.min.css';
import { cn } from '@cometa/utils';
import { Label } from '../ui';

registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize,
  FilePondPluginImagePreview,
  FilePondPluginPdfPreview,
  FilePondPluginFileViewer
);

type FileUploaderProps = {
  id: string;
  label?: string;
  placeholder?: string;
  helperText?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxFileSize?: number;
  acceptedFileTypes?: string[];
  disabled?: boolean;
  initialFiles?: File[] | string[];
  required?: boolean;
  readOnly?: boolean;
  onFilesChange?: (files: File[], isValid: boolean) => void;
  onRemoveFile?: (file: File) => void;
  preview?: boolean;
  pdfPreview?: boolean;
  visualizer?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  acceptedFileSuffixes?: string[];
};

const defaultPlaceholder =
  'Arrastra los archivos o <span class="text-blue-600 font-bold cursor-pointer underline">haz click aquí</span> para seleccionar desde tu computadora';

const processInitialFiles = (files: File[] | string[]) => {
  if (files.length === 0) return [];

  if (typeof files[0] === 'string') {
    return files as string[];
  }

  return files as File[];
};

const createCustomFileTypeDetector = (acceptedSuffixes: string[]) => (source: any, type: string) =>
  new Promise<string>((resolve) => {
    const fileName = source.name.toLowerCase();

    for (const suffix of acceptedSuffixes) {
      if (fileName.endsWith(suffix.toLowerCase())) {
        const fileType = suffix;
        resolve(fileType);
        return;
      }
    }

    resolve(type);
  });

export default function FileUploader({
  id,
  label,
  placeholder = defaultPlaceholder,
  helperText,
  multiple = true,
  maxFiles = 15,
  maxFileSize,
  acceptedFileTypes,
  onFilesChange,
  onRemoveFile,
  disabled = false,
  initialFiles = [],
  required = true,
  readOnly = false,
  preview = false,
  pdfPreview = true,
  visualizer = false,
  size = 'medium',
  className,
  acceptedFileSuffixes,
}: Readonly<FileUploaderProps>) {
  const [files, setFiles] = useState<(File | string)[]>(() => processInitialFiles(initialFiles));
  const pond = useRef<FilePond>(null);

  const combinedAcceptedFileTypes = useMemo(() => {
    const types = acceptedFileTypes ? [...acceptedFileTypes] : [];
    if (acceptedFileSuffixes) {
      types.push(...acceptedFileSuffixes);
    }
    return types.length > 0 ? types : undefined;
  }, [acceptedFileTypes, acceptedFileSuffixes]);

  function handleUpdateFiles(fileItems: FilePondFile[]) {
    const newFiles = fileItems.map((fileItem) => fileItem.file).filter((file): file is File => file !== null);
    const isValid = maxFileSize ? fileItems.every((f) => f.fileSize < maxFileSize) : true;

    setFiles(newFiles);

    if (onFilesChange) {
      onFilesChange(newFiles, isValid);
    }
  }

  function handleRemoveFile(error: FilePondErrorDescription | null, fileItem: FilePondFile) {
    if (onRemoveFile && fileItem.file) {
      onRemoveFile(fileItem.file as File);
    }
  }

  return (
    <div className={className}>
      {label ? (
        <Label htmlFor={id} className="text-md">
          {label}
        </Label>
      ) : null}
      <FilePond
        ref={pond}
        id={id}
        files={files}
        labelIdle={placeholder}
        allowMultiple={multiple}
        maxFiles={maxFiles}
        acceptedFileTypes={combinedAcceptedFileTypes}
        fileValidateTypeDetectType={
          acceptedFileSuffixes ? createCustomFileTypeDetector(acceptedFileSuffixes) : undefined
        }
        required={required}
        disabled={disabled}
        onupdatefiles={handleUpdateFiles}
        onremovefile={handleRemoveFile}
        styleButtonRemoveItemPosition="right"
        maxFileSize={maxFileSize as unknown as string}
        labelMaxFileSize="El tamaño máximo es de {filesize}"
        labelMaxFileSizeExceeded="Archivo es demasiado grande"
        className={cn(`size-${size}`, {
          'with-preview': preview,
        })}
        allowBrowse={!readOnly}
        allowDrop={!readOnly}
        allowPaste={!readOnly}
        allowRevert={!readOnly}
        allowRemove={!readOnly}
        allowImagePreview={preview}
        allowPdfPreview={pdfPreview && preview}
        allowVisualizer={visualizer}
      />
      {helperText ? <div className="text-xs text-gray-500 w-full text-left mt-1">{helperText}</div> : null}
    </div>
  );
}
