'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import * as Dialog from '@radix-ui/react-dialog';
import {
  X,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FileText,
  FileSpreadsheet,
  FileImage,
  File as FileIcon,
  Video,
} from 'lucide-react';
import { useGetWebview } from '~/stores/globalStore';

export interface FileMetadata {
  name: string;
  url: string;
  extension: string;
  size?: number | null;
}

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: FileMetadata[];
  initialIndex?: number;
  onDownload?: (file: FileMetadata) => void;
}

const getFileType = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  const mimeTypes: Record<string, string> = {
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    bmp: 'image/bmp',
    webp: 'image/webp',
    tiff: 'image/tiff',
    tif: 'image/tiff',

    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',

    // Text
    txt: 'text/plain',
    csv: 'text/csv',
    html: 'text/html',
    htm: 'text/html',

    // Video
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogg: 'video/ogg',
  };

  return mimeTypes[extension || ''] || 'application/octet-stream';
};

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) {
    return <FileImage className="w-8 h-8" />;
  }
  if (fileType.startsWith('video/')) {
    return <Video className="w-8 h-8" />;
  }
  if (fileType === 'application/pdf') {
    return <FileText className="w-8 h-8" />;
  }
  if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType === 'text/csv') {
    return <FileSpreadsheet className="w-8 h-8" />;
  }
  if (fileType.includes('word') || fileType.includes('document') || fileType.includes('presentation')) {
    return <FileText className="w-8 h-8" />;
  }
  return <FileIcon className="w-8 h-8" />;
};

const getFileColor = (fileType: string): string => {
  if (fileType.startsWith('image/')) return 'bg-purple-100 text-purple-600';
  if (fileType.startsWith('video/')) return 'bg-pink-100 text-pink-600';
  if (fileType === 'application/pdf') return 'bg-red-100 text-red-600';
  if (fileType.includes('spreadsheet') || fileType.includes('excel')) return 'bg-green-100 text-green-600';
  if (fileType.includes('word') || fileType.includes('document')) return 'bg-blue-100 text-blue-600';
  if (fileType.includes('presentation')) return 'bg-orange-100 text-orange-600';
  return 'bg-gray-100 text-gray-600';
};

const isImageFile = (fileType: string) => fileType.startsWith('image/');

export default function FilePreviewModal({
  isOpen,
  onClose,
  files,
  initialIndex = 0,
  onDownload,
}: FilePreviewModalProps) {
  const isWebView = useGetWebview();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [viewerKey, setViewerKey] = useState(0);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  // Force remount of DocViewer when modal opens or file changes
  // This works around a known issue in @cyntler/react-doc-viewer where
  // PDF content doesn't display after re-renders (Issue #161)
  useEffect(() => {
    if (isOpen) {
      setViewerKey((prev) => prev + 1);
    }
  }, [isOpen, currentIndex]);

  // Force remount when tab visibility changes
  // This fixes the issue where DocViewer shows blank after switching tabs
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isOpen) {
        setViewerKey((prev) => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isOpen]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : files.length - 1));
  }, [files.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < files.length - 1 ? prev + 1 : 0));
  }, [files.length]);

  // Compute all values before any conditional returns (Rules of Hooks)
  const currentFile = files[currentIndex] || files[0];
  const currentFileType = currentFile ? getFileType(currentFile.name) : '';
  const isImage = isImageFile(currentFileType);

  // Extract primitive values to use as stable dependencies
  const currentFileUrl = currentFile?.url;
  const currentFileName = currentFile?.name;

  // Memoize documents array to prevent DocViewer from remounting
  // Only depends on primitive values, not object references
  const documents = useMemo(
    () =>
      currentFileUrl && currentFileName
        ? [
            {
              uri: currentFileUrl,
              fileName: currentFileName,
              fileType: currentFileType,
            },
          ]
        : [],
    [currentFileUrl, currentFileName, currentFileType]
  );

  const isOfficeDocument = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ].includes(currentFileType);

  const handleDownload = useCallback(() => {
    if (!currentFile) return;
    if (onDownload) {
      onDownload(currentFile);
    } else {
      // Fallback: open in new tab if no download handler provided
      window.open(currentFile.url, '_blank');
    }
  }, [onDownload, currentFile]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowLeft') {
        handlePrevious();
      } else if (event.key === 'ArrowRight') {
        handleNext();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, handlePrevious, handleNext]);

  if (files.length === 0) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md h-screen translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg shadow-lg focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <Dialog.Title className="text-lg font-semibold text-neutral-900 truncate flex-1 mr-4">
              {currentFile.name}
            </Dialog.Title>
            <div className="flex items-center gap-2">
              {onDownload && (
                <button
                  onClick={handleDownload}
                  className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                  title="Descargar archivo"
                >
                  <Download className="w-5 h-5 text-neutral-600" />
                </button>
              )}
              <Dialog.Close asChild>
                <button className="p-2 rounded-lg hover:bg-neutral-100 transition-colors" aria-label="Cerrar">
                  <X className="w-5 h-5 text-neutral-600" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            {isWebView && isOfficeDocument && (
              <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-900">Documento de Office detectado</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Algunos documentos de Office pueden no visualizarse correctamente. Si tienes problemas, usa el
                      botón "Abrir en navegador".
                    </p>
                  </div>
                  <button
                    onClick={() => window.open(currentFile.url, '_blank')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded-md hover:bg-amber-700 transition-colors whitespace-nowrap"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Abrir en navegador
                  </button>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-hidden relative">
              {files.length > 1 && (
                <>
                  <button
                    onClick={handlePrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
                    aria-label="Archivo anterior"
                  >
                    <ChevronLeft className="w-6 h-6 text-neutral-800" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
                    aria-label="Siguiente archivo"
                  >
                    <ChevronRight className="w-6 h-6 text-neutral-800" />
                  </button>
                </>
              )}

              {isImage ? (
                <div className="w-full h-full flex items-center justify-center p-8 bg-neutral-50">
                  <img
                    src={currentFile.url}
                    alt={currentFile.name}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                  />
                </div>
              ) : (
                <div className="w-full h-full min-h-0 relative overflow-hidden bg-white">
                  <style>{`
                    /* Hide only the document header, keep page navigation controls */
                    #react-doc-viewer #header-bar {
                      display: none !important;
                    }
                    .react-pdf__Page__textContent.textLayer {
                      display: none !important;
                    }
                  `}</style>
                  <div
                    className="absolute inset-0 overflow-auto [&_*]:max-w-full"
                    style={{
                      contain: 'layout style paint',
                      isolation: 'isolate',
                    }}
                  >
                    <DocViewer
                      key={viewerKey}
                      documents={documents}
                      pluginRenderers={DocViewerRenderers}
                      config={{
                        header: {
                          disableHeader: true,
                          disableFileName: true,
                        },
                        pdfVerticalScrollByDefault: true,
                      }}
                      style={{
                        height: '100%',
                        width: '100%',
                      }}
                      theme={{
                        primary: '#3b82f6',
                        secondary: '#64748b',
                        tertiary: '#f1f5f9',
                        textPrimary: '#0f172a',
                        textSecondary: '#475569',
                        textTertiary: '#94a3b8',
                        disableThemeScrollbar: false,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {files.length > 1 && (
            <div className="border-t bg-neutral-50 px-4 py-3">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent">
                {files.map((file, index) => {
                  const fileType = getFileType(file.name);
                  const isImageThumb = isImageFile(fileType);
                  const isActive = index === currentIndex;

                  return (
                    <button
                      key={file.name}
                      onClick={() => setCurrentIndex(index)}
                      className={`flex-shrink-0 relative rounded-lg overflow-hidden transition-all ${
                        isActive ? 'scale-105 opacity-100' : 'hover:scale-105 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {isImageThumb ? (
                        <img src={file.url} alt={file.name} className="w-14 h-14 object-cover" />
                      ) : (
                        <div className={`w-14 h-14 flex items-center justify-center ${getFileColor(fileType)}`}>
                          <div className="scale-75">{getFileIcon(fileType)}</div>
                        </div>
                      )}

                      {!isImageThumb && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] font-medium px-1 py-0.5 text-center truncate">
                          {file.extension.replace('.', '').toUpperCase()}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
