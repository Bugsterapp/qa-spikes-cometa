import * as Sentry from '@sentry/nextjs';
import { useState, useMemo } from 'react';
import { XIcon } from 'lucide-react';
import { Button, Input, Label, Dialog, DialogContent } from '@cometa/recreo/v2';
import FileUploader from '@cometa/recreo/components/FileUploader';
import { api } from '/src/utils/api';
import { StudentsServiceClient } from '/src/utils/apiStudents';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { useSchoolCycleSelector } from '/src/components/organisms/dashboard/SchoolCycleSelector';
import { useSession } from 'next-auth/react';
import { DocumentTemplateEntity, TemplateCategory } from '@cometa/trpc/src/students/types';
import { PDFPreview } from './pdf-preview';
import { TemplateEditView } from '../views/template-edit';
import { useTemplates } from '../hooks/useTemplates';

const API_TOKEN = process.env.NEXT_PUBLIC_SCHOOLS_API_TOKEN;

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTemplateDialog({ open, onOpenChange }: CreateTemplateDialogProps) {
  const [step, setStep] = useState<'create' | 'edit'>('create');
  const [createdTemplateId, setCreatedTemplateId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicatedTemplate, setDuplicatedTemplate] = useState<DocumentTemplateEntity | null>(null);

  const selectedSchool = useSelectedSchool();
  const { activeCycle } = useSchoolCycleSelector();
  const { data: session } = useSession();
  const utils = api.useUtils();
  const { templates } = useTemplates();

  const handleClose = () => {
    setStep('create');
    setCreatedTemplateId(null);
    setName('');
    setFiles([]);
    setIsValid(false);
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleFilesChange = (newFiles: File[], valid: boolean) => {
    setFiles(newFiles);
    setIsValid(valid);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || files.length === 0 || !selectedSchool?.id || !session?.user?.id) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await StudentsServiceClient.createTemplateApiV1SignaturesTemplatesPost(
        {
          school_id: selectedSchool.id,
          category: TemplateCategory.Contract,
          name: name.trim(),
          created_by: session.user.id,
          pdf_file: files[0],
          school_cycle_id: activeCycle?.id ?? undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        }
      );

      await utils.students.listTemplates.invalidate();

      setCreatedTemplateId(response.data.id);
      setStep('edit');
      setIsSubmitting(false);
    } catch (error) {
      Sentry.captureException(error);
      setIsSubmitting(false);
    }
  };

  const canSubmit = name.trim() !== '' && files.length > 0 && isValid && !isSubmitting;

  const pdfBlobUrl = useMemo(() => {
    if (files.length === 0) return null;
    return URL.createObjectURL(files[0]);
  }, [files]);

  useMemo(
    () => () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    },
    [pdfBlobUrl]
  );

  function handleOnChangeName(name: string) {
    setName(name);
    setDuplicatedTemplate(templates.find((template) => template.name === name) ?? null);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="w-full max-w-full sm:max-w-full h-screen p-0 flex flex-col rounded-none"
        showCloseButton={false}
      >
        {step === 'create' ? (
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex items-center justify-between px-8 py-4 border-b bg-white flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-900">Crear contrato</h2>
              <button type="button" onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                <XIcon size={20} />
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="w-1/3 flex flex-col border-r bg-white">
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="template-name" className="text-sm font-medium text-gray-700">
                      Nombre del contrato *
                    </Label>
                    <Input
                      id="template-name"
                      type="text"
                      placeholder="Ej: Contrato Primaria 2025/2026"
                      value={name}
                      onChange={(e) => handleOnChangeName(e.target.value)}
                      required
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="template-file" className="text-sm font-medium text-gray-700">
                      Archivo PDF *
                    </Label>
                    <FileUploader
                      id="template-file"
                      multiple={false}
                      maxFiles={1}
                      maxFileSize={10 * 1024 * 1024} // 10MB
                      acceptedFileTypes={['application/pdf']}
                      onFilesChange={handleFilesChange}
                      placeholder="Arrastra el archivo PDF o <span class='text-blue-600 font-bold cursor-pointer underline'>haz click aquí</span>"
                      helperText="Archivo máximo de 10MB"
                      pdfPreview={false}
                      required
                    />
                  </div>
                </div>

                {duplicatedTemplate && (
                  <div className="p-4 bg-orange-50 border border-orange-200 text-yellow-600 rounded-lg mx-4 text-sm">
                    Ya existe un contrato con el nombre{' '}
                    <a
                      href={`signatures/${duplicatedTemplate.id}`}
                      target="_blank"
                      className="font-bold underline"
                      rel="noreferrer"
                    >
                      {duplicatedTemplate.name}
                    </a>
                    . Por favor, elige otro nombre.
                  </div>
                )}
                <div className="flex items-center justify-end gap-2 px-7 py-4">
                  <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={!canSubmit || duplicatedTemplate !== null} variant="neutral">
                    {isSubmitting ? 'Creando...' : 'Siguiente'}
                  </Button>
                </div>
              </div>

              <div className="w-2/3 bg-gray-50 overflow-y-auto">
                {pdfBlobUrl ? (
                  <div className="p-8">
                    <PDFPreview pdfUrl={pdfBlobUrl} fields={[]} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400 text-sm">Sube un PDF para ver la vista previa</p>
                  </div>
                )}
              </div>
            </div>
          </form>
        ) : (
          <div className="flex-1 min-h-0 overflow-hidden">
            {createdTemplateId && <TemplateEditView templateId={createdTemplateId} onClose={handleClose} />}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
