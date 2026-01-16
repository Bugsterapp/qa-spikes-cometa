'use client';

import { useRef, useState, useEffect } from 'react';
import { Cloud, X } from 'lucide-react';
import { DndContext, useDroppable } from '@dnd-kit/core';

interface ExistingFile {
  url: string;
  name: string;
  isExisting: true;
  size?: number;
}

type FileItem = File | ExistingFile;

interface FileDropZoneProps {
  dataFiles?: FileItem[];
  onFilesChange?: (files: FileItem[]) => void;
  error?: string;
}

export default function FileDropZone({ dataFiles, onFilesChange, error }: FileDropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<FileItem[]>(dataFiles || []);
  const [isOver, setIsOver] = useState(false);
  const [fileErrors, setFileErrors] = useState<string[]>([]);

  const { setNodeRef } = useDroppable({ id: 'file-drop-zone' });

  useEffect(() => {
    setFiles(dataFiles || []);
  }, [dataFiles]);

  const validateFileSize = (newFiles: FileItem[]): { validFiles: FileItem[]; errors: string[] } => {
    const maxTotalSize = 25 * 1024 * 1024; // 25MB total in bytes
    const errors: string[] = [];

    // Calculate current total size of existing files
    const currentTotalSize = files.reduce((sum, file) => {
      if (file instanceof File) {
        return sum + file.size;
      }
      return sum;
    }, 0);

    // Calculate total size if we add the new files
    const newFilesSize = newFiles.reduce((sum, file) => {
      if (file instanceof File) {
        return sum + file.size;
      }
      return sum;
    }, 0);

    const totalSizeAfterAdding = currentTotalSize + newFilesSize;

    if (totalSizeAfterAdding > maxTotalSize) {
      errors.push('El tamaño total de todos los archivos debe ser máximo 25MB');
      return { validFiles: [], errors };
    }

    return { validFiles: newFiles, errors };
  };

  const updateFiles = (newFiles: FileItem[]) => {
    setFiles(newFiles);
    onFilesChange?.(newFiles);
  };

  const getFileDisplayInfo = (file: FileItem) => {
    if ('isExisting' in file) {
      return {
        name: file.name,
        isExisting: true,
        url: file.url,
        size: file.size,
      };
    }
    return {
      name: file.name,
      isExisting: false,
      size: file.size,
    };
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files) as FileItem[];
      const { validFiles, errors } = validateFileSize(newFiles);

      setFileErrors(errors);
      updateFiles([...files, ...validFiles]);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files) as FileItem[];
      const { validFiles, errors } = validateFileSize(droppedFiles);

      setFileErrors(errors);
      updateFiles([...files, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    updateFiles(updated);
    // Clear file errors when removing files
    setFileErrors([]);
  };

  return (
    <DndContext>
      <div
        ref={setNodeRef}
        onClick={(e) => {
          if ((e.target as HTMLElement).tagName !== 'BUTTON') {
            handleClick();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer flex items-center justify-center space-x-2 text-sm transition ${
          isOver ? 'bg-gray-100 border-blue-500 text-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
        }`}
      >
        <Cloud className="w-5 h-5 text-gray-400 shrink-0" />
        <span>
          Arrastra los archivos o{' '}
          <button type="button" onClick={handleClick} className="text-blue-600 hover:underline font-bold">
            haz click aquí
          </button>{' '}
          para seleccionarlos desde tu computadora
        </span>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
      </div>

      {/* Display file size validation errors */}
      {fileErrors.length > 0 && (
        <div className="mt-4 space-y-2">
          {fileErrors.map((errorMessage, index) => (
            <div
              key={`error-${index}-${errorMessage}`}
              className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md"
            >
              <div className="text-red-600 text-sm font-medium">Error:</div>
              <div className="text-red-600 text-sm">{errorMessage}</div>
            </div>
          ))}
        </div>
      )}

      {/* Display form validation error if passed as prop */}
      {error && (
        <div className="mt-4">
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="text-red-600 text-sm font-medium">Error:</div>
            <div className="text-red-600 text-sm">{error}</div>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <ul className="space-y-2 mt-4">
          {files.map((file, index) => {
            const fileInfo = getFileDisplayInfo(file);
            return (
              <li key={index} className="flex items-center justify-between bg-gray-100 rounded-md px-4 py-2 text-sm">
                <div className="flex items-center gap-2 truncate">
                  <span className="truncate">{fileInfo.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-gray-500 hover:text-red-500 shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </DndContext>
  );
}
