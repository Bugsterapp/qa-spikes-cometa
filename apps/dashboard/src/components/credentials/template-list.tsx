import { Button, Popover, PopoverContent, PopoverTrigger } from '@cometa/recreo/v2';
import { MoreVertical, Pencil, Copy, Trash } from 'lucide-react';
import { api } from '/src/utils/api';
import { useState } from 'react';
import { useRouter } from 'next/router';
import type { CredentialTemplateEntity } from '@cometa/trpc/src/students/types';
import * as Sentry from '@sentry/nextjs';
import { CredentialModal } from './credential-modal';
import { useCredentialFileUpload } from './hooks/useCredentialFileUpload';
import { useToast } from '/src/components/molecules/dashboard/Toast/useToast';

interface TemplateListProps {
  templates: CredentialTemplateEntity[];
  onCreateNew: () => void;
  onEdit: (templateId: string) => void;
  onDuplicate: (templateId: string) => void;
}

export function TemplateList({ templates, onCreateNew, onEdit, onDuplicate }: TemplateListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const utils = api.useUtils();
  const router = useRouter();
  const { deleteFile } = useCredentialFileUpload();
  const { toast } = useToast();

  const deleteMutation = api.credentials.deleteTemplate.useMutation({
    onSuccess: () => {
      utils.credentials.listTemplates.invalidate();
      toast({ title: 'Plantilla eliminada exitosamente', variant: 'success' });
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
      setIsDeleting(false);
    },
    onError: (error) => {
      setIsDeleting(false);
      toast({ title: 'Error al eliminar la plantilla', variant: 'error' });
      Sentry.captureException(error, {
        tags: {
          context: 'credential_template_delete',
          template_id: templateToDelete || 'unknown',
        },
      });
    },
  });

  function handleEdit(templateId: string) {
    onEdit(templateId);
  }

  function handleDuplicate(templateId: string) {
    onDuplicate(templateId);
  }

  function handleDelete(templateId: string) {
    setTemplateToDelete(templateId);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!templateToDelete) return;

    setIsDeleting(true);

    try {
      const template = templates.find((t) => t.id === templateToDelete);

      if (template?.config.type === 'student') {
        const { signature, digital_seal } = template.config.back_fields;

        if (signature.file_id) {
          try {
            await deleteFile(signature.file_id);
          } catch (error) {
            Sentry.captureException(error, {
              tags: {
                context: 'credential_signature_file_delete',
                file_id: signature.file_id,
                template_id: templateToDelete,
              },
            });
          }
        }

        if (digital_seal.file_id) {
          try {
            await deleteFile(digital_seal.file_id);
          } catch (error) {
            Sentry.captureException(error, {
              tags: {
                context: 'credential_digital_seal_file_delete',
                file_id: digital_seal.file_id,
                template_id: templateToDelete,
              },
            });
          }
        }
      }

      deleteMutation.mutate({ templateId: templateToDelete });
    } catch (error) {
      setIsDeleting(false);
      Sentry.captureException(error, {
        tags: {
          context: 'credential_template_delete_flow',
          template_id: templateToDelete,
        },
      });
    }
  }

  function handleGenerateCredential(templateId: string) {
    router.push(`/credentials/generate?templateId=${templateId}`);
  }

  return (
    <div className="w-full h-full px-8 py-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#141414] mb-2">Credenciales</h1>
            <p className="text-[#6B7280] text-base">
              Genera credenciales a partir de las plantillas que tengas creadas.
            </p>
          </div>
          <Button onClick={onCreateNew} size="lg" variant="neutral">
            Nueva plantilla
          </Button>
        </div>

        {/* Plantillas ya creadas */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[#141414] mb-4">Tus plantillas ya creadas:</h2>
          <div className="space-y-3">
            {templates.map((template) => (
              <TemplateItem
                key={template.id}
                template={template}
                onEdit={() => handleEdit(template.id)}
                onDuplicate={() => handleDuplicate(template.id)}
                onDelete={() => handleDelete(template.id)}
                onGenerateCredential={() => handleGenerateCredential(template.id)}
                isDeleting={isDeleting && templateToDelete === template.id}
              />
            ))}
          </div>
        </div>

        {/* Modal para confirmar eliminación */}
        <CredentialModal
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          variant="delete"
          loading={isDeleting}
        />
      </div>
    </div>
  );
}

interface TemplateItemProps {
  template: CredentialTemplateEntity;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onGenerateCredential: () => void;
  isDeleting?: boolean;
}

function TemplateItem({
  template,
  onEdit,
  onDuplicate,
  onDelete,
  onGenerateCredential,
  isDeleting,
}: TemplateItemProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  function handleEdit() {
    setIsPopoverOpen(false);
    onEdit();
  }

  function handleDuplicate() {
    setIsPopoverOpen(false);
    onDuplicate();
  }

  function handleDelete() {
    setIsPopoverOpen(false);
    onDelete();
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
      {/* Template Name */}
      <div className="flex-1">
        <h3 className="text-base font-medium text-[#141414]">{template.name}</h3>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button onClick={onGenerateCredential} variant="secondary" size="default">
          Generar credenciales
        </Button>

        {/* Menu Button with Popover */}
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-48 p-2">
            <div className="flex flex-col gap-1">
              <button
                onClick={handleEdit}
                className="w-full px-3 py-2 text-left text-sm text-[#141414] hover:bg-gray-100 rounded-md flex items-center gap-3 transition-colors"
              >
                <Pencil className="h-4 w-4" />
                Editar
              </button>

              <button
                onClick={handleDuplicate}
                className="w-full px-3 py-2 text-left text-sm text-[#141414] hover:bg-gray-100 rounded-md flex items-center gap-3 transition-colors"
              >
                <Copy className="h-4 w-4" />
                Duplicar
              </button>

              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full px-3 py-2 text-left text-sm text-[#DC2626] hover:bg-red-50 rounded-md flex items-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash className="h-4 w-4" />
                Eliminar
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
