import { Button } from '@cometa/recreo/v2';
import { Input } from '@cometa/recreo/v2';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@cometa/recreo/v2';
import Sheet from '/src/components/atoms/Sheet';
import { XIcon } from 'lucide-react';
import { cn } from '@cometa/utils';
import { useEffect, useState } from 'react';
import FileUploader from '@cometa/recreo/components/FileUploader';
import { useContentScroll } from '/src/components/organisms/dashboard/DynamicForms';

type DocumentUploadSheetProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (files: File[], documentTag: string, documentType: string | null, description?: string) => Promise<void>;
  documentTypes: Array<{ type: string; label: string }>;
  documentTypesUnavailable?: string[];
  preselectedDocument?: { name: string; typeId: string; tagId: string } | null;
};

export function DocumentUploadSheet({
  open,
  onClose,
  onSubmit,
  documentTypes,
  documentTypesUnavailable = [],
  preselectedDocument = null,
}: DocumentUploadSheetProps) {
  const { showShadow, targetRef } = useContentScroll();
  const [files, setFiles] = useState<File[]>([]);
  const [isValid, setIsValid] = useState(true);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [selectedDocumentTag, setSelectedDocumentTag] = useState<string>('');
  const [documentDescription, setDocumentDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const isOtherType = selectedDocumentTag === 'other';

  // Filter out unavailable document types
  const availableDocumentTypes = documentTypes.filter((docType) => !documentTypesUnavailable.includes(docType.type));

  // Set preselected document type when opening from table row
  useEffect(() => {
    if (open && preselectedDocument) {
      setSelectedDocumentType(preselectedDocument.typeId);
      setSelectedDocumentTag(preselectedDocument.tagId);
      // If it's "other" type, set the description as well
      if (preselectedDocument.tagId === 'other') {
        setDocumentDescription(preselectedDocument.name);
      }
    }
  }, [open, preselectedDocument]);

  async function handleSubmit() {
    if (!isValid || files.length === 0 || !selectedDocumentTag) return;
    if (isOtherType && !documentDescription.trim()) return;

    try {
      setIsLoading(true);
      await onSubmit(
        files,
        selectedDocumentTag,
        selectedDocumentType || null,
        isOtherType ? documentDescription : undefined
      );

      // Reset form
      setFiles([]);
      setSelectedDocumentType('');
      setSelectedDocumentTag('');
      setDocumentDescription('');
    } finally {
      setIsLoading(false);
    }
  }

  function handleClose() {
    setFiles([]);
    setSelectedDocumentType('');
    setSelectedDocumentTag('');
    setDocumentDescription('');
    setIsValid(true);
    onClose();
  }

  return (
    <Sheet open={open} onOpenChange={(newOpen) => !newOpen && handleClose()}>
      <Sheet.Content className="max-h-[calc(100vh-16px)] h-full max-w-2xl w-full m-2 rounded-2xl font-lota antialiased overflow-hidden shadow-[0px_20px_40px_-4px_rgba(145,158,171,0.16)]">
        <div
          className={cn(
            'flex items-center justify-between bg-white border-b border-[#D5DEED] px-8 py-5 sticky top-0 z-10',
            { 'shadow-[0px_20px_40px_-4px_rgba(145,158,171,0.16)]': showShadow }
          )}
        >
          <h3 className="text-[#454D64] font-bold text-lg">Cargar documento</h3>

          <div className="flex items-center gap-2">
            <div className="h-8 w-[1px] bg-[#919EAB]/24" />
            <span onClick={handleClose} className="px-2 py-1 hover:cursor-pointer hover:bg-[#F0F0F0] rounded-full">
              <XIcon className="text-[#98A2B3] w-4" />
            </span>
          </div>
        </div>

        <div className="bg-[#FBFCFD] overflow-y-auto h-[calc(100vh)]">
          <div className="h-1" ref={targetRef} />
          <div className="flex flex-col gap-6 px-8 py-7">
            <div className="flex flex-col gap-6">
              {!preselectedDocument && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[#1C1C1D]">
                    Tipo de documento <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={selectedDocumentTag}
                    onValueChange={(value) => {
                      setSelectedDocumentTag(value);
                      // Reset description when changing type
                      if (value !== 'other') {
                        setDocumentDescription('');
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una opción" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDocumentTypes.map((type) => (
                        <SelectItem key={type.type} value={type.type}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {isOtherType && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[#1C1C1D]">
                    Nombre del documento <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={documentDescription}
                    onChange={(e) => setDocumentDescription(e.target.value)}
                    placeholder="Certificado de solvencia económica"
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#1C1C1D]">
                  Adjunta el documento a cargar <span className="text-red-500">*</span>
                </label>
                {open ? (
                  <FileUploader
                    id="document-upload"
                    helperText="Archivos permitidos .pdf, .jpg, .jpeg, .png (Máximo 10 MB)"
                    acceptedFileTypes={['image/*', 'application/pdf']}
                    maxFileSize={10 * 1024 * 1024} // 10MB
                    preview
                    onFilesChange={(newFiles, valid) => {
                      setFiles(newFiles);
                      setIsValid(valid);
                    }}
                    size="large"
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border-t border-[#E4EBF6] px-8 py-4 flex justify-end items-center gap-3 sticky bottom-0">
          <Button onClick={handleClose} size="default" variant="outline" disabled={isLoading}>
            Descartar
          </Button>
          <Button
            onClick={handleSubmit}
            size="default"
            variant="default"
            disabled={
              isLoading ||
              files.length === 0 ||
              !isValid ||
              !selectedDocumentTag ||
              (isOtherType && !documentDescription.trim())
            }
          >
            Guardar
          </Button>
        </div>
      </Sheet.Content>
    </Sheet>
  );
}
