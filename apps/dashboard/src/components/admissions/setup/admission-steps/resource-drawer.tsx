import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input } from '@cometa/recreo/v2';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@cometa/recreo/v2';
import { TextArea } from '@cometa/recreo';
import FileUploader from '@cometa/recreo/components/FileUploader';
import { Trash2 } from 'lucide-react';
import { SchoolStepResourceType, SchoolStepResourceEntity } from '@cometa/trpc/src/admissions/types';
import { ConfigurationDrawer } from '/src/components/admissions/setup/shared';
import { api } from '/src/utils/api';
import { useToast } from '/src/components/molecules/dashboard/Toast/useToast';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { useSession } from 'next-auth/react';
import { isValidUrl, normalizeUrl } from '/src/utils/url-validation';

const documentSchema = z
  .object({
    name: z.string().min(1, 'El nombre es requerido'),
    description: z.string().optional(),
    source: z.string(),
    type: z.nativeEnum(SchoolStepResourceType),
  })
  .refine(
    (data) => {
      if (data.type === SchoolStepResourceType.Url) {
        return data.source && data.source.length > 0;
      }
      return true;
    },
    {
      message: 'La URL es requerida',
      path: ['source'],
    }
  )
  .refine(
    (data) => {
      if (data.type === SchoolStepResourceType.Url && data.source) {
        return isValidUrl(data.source);
      }
      return true;
    },
    {
      message: 'Debe ser una URL válida (ej: https://ejemplo.com, www.ejemplo.com o ejemplo.com)',
      path: ['source'],
    }
  );

type DocumentFormData = z.infer<typeof documentSchema>;

interface DocumentConfigurationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  schoolStepId: string;
  document?: SchoolStepResourceEntity | null;
}

export function DocumentConfigurationDrawer({
  isOpen,
  onClose,
  onSuccess,
  schoolStepId,
  document,
}: DocumentConfigurationDrawerProps) {
  const { toast } = useToast();
  const utils = api.useUtils();
  const selectedSchool = useSelectedSchool();
  const { data: session } = useSession();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasExistingFile, setHasExistingFile] = useState(false);

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      name: document?.name || '',
      description: document?.description || '',
      source: document?.source || '',
      type: (document?.type as SchoolStepResourceType) || SchoolStepResourceType.File,
    },
  });

  const createResource = api.admissions.createSchoolStepResource.useMutation({
    onSuccess: () => {
      toast({ title: 'Los cambios han sido guardados', variant: 'success' });
      utils.admissions.getSchoolStepResources.invalidate({ school_step_id: schoolStepId });
      onSuccess();
      handleClose();
      setIsSubmitting(false);
    },
    onError: () => {
      toast({ title: 'Error al crear documento', variant: 'error' });
      setIsSubmitting(false);
    },
  });

  const updateResource = api.admissions.updateSchoolStepResource.useMutation({
    onSuccess: () => {
      toast({ title: 'Los cambios han sido guardados', variant: 'success' });
      utils.admissions.getSchoolStepResources.invalidate({ school_step_id: schoolStepId });
      onSuccess();
      handleClose();
      setIsSubmitting(false);
    },
    onError: () => {
      toast({ title: 'Error al actualizar documento', variant: 'error' });
      setIsSubmitting(false);
    },
  });

  const deleteResource = api.admissions.deleteSchoolStepResource.useMutation({
    onSuccess: () => {
      toast({ title: 'Los cambios han sido guardados', variant: 'success' });
      utils.admissions.getSchoolStepResources.invalidate({ school_step_id: schoolStepId });
      onSuccess();
      handleClose();
    },
    onError: () => {
      toast({ title: 'Error al eliminar documento', variant: 'error' });
    },
  });

  useEffect(() => {
    if (document) {
      const isFileResource = document.type === SchoolStepResourceType.File;
      form.reset({
        name: document.name || '',
        description: document.description || '',
        source: document.source || '',
        type: (document.type as SchoolStepResourceType) || SchoolStepResourceType.File,
      });
      setHasExistingFile(isFileResource && !!document.source);
    } else {
      form.reset({
        name: '',
        description: '',
        source: '',
        type: SchoolStepResourceType.File,
      });
      setHasExistingFile(false);
    }
    setSelectedFile(null);
  }, [document, form]);

  async function uploadFile(file: File, name: string, description?: string): Promise<string> {
    if (!selectedSchool?.id) {
      throw new Error('No se ha seleccionado una escuela');
    }
    if (!session?.token) {
      throw new Error('No se ha encontrado el token de autenticación');
    }

    try {
      const formData = new FormData();
      formData.append('file_in', file);
      if (name) formData.append('name', name);
      if (description) formData.append('description', description);

      const response = await fetch(`${process.env.NEXT_PUBLIC_ADMISSIONS_URL}/api/v1/files/${selectedSchool.id}`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${session.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      if (result?.id) {
        return result.id;
      }
      throw new Error('No se pudo obtener el ID del archivo subido');
    } catch (error) {
      throw new Error(`Error al subir el archivo: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async function onSubmit(data: DocumentFormData) {
    setIsSubmitting(true);

    try {
      if (data.type === SchoolStepResourceType.File && !selectedFile && !hasExistingFile) {
        form.setError('source', { message: 'Debe seleccionar un archivo' });
        setIsSubmitting(false);
        return;
      }

      let source = data.source;

      if (data.type === SchoolStepResourceType.File && selectedFile) {
        source = await uploadFile(selectedFile, data.name, data.description);
      } else if (data.type === SchoolStepResourceType.Url && data.source) {
        source = normalizeUrl(data.source);
      }

      const resourceData = {
        name: data.name,
        description: data.description,
        source,
        type: data.type,
      };

      if (document?.id) {
        updateResource.mutate({
          school_step_id: schoolStepId,
          resource_id: document.id,
          ...resourceData,
        });
      } else {
        createResource.mutate({
          school_step_id: schoolStepId,
          ...resourceData,
        });
      }
    } catch (error) {
      setIsSubmitting(false);
      toast({ title: 'Error al procesar el documento', variant: 'error' });
    }
  }

  function handleDelete() {
    if (document?.id) {
      deleteResource.mutate({
        school_step_id: schoolStepId,
        id: document.id,
      });
    }
  }

  function handleClose() {
    onClose();
    form.reset();
    setSelectedFile(null);
  }

  function handleFileChange(files: File[]) {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setHasExistingFile(false);
      form.setValue('source', 'file-selected');
      form.clearErrors('source');
    }
  }

  const isLoading = createResource.isPending || updateResource.isPending || deleteResource.isPending || isSubmitting;

  return (
    <ConfigurationDrawer
      isOpen={isOpen}
      onClose={handleClose}
      onSave={form.handleSubmit(onSubmit)}
      title="Configurar documento"
      isLoading={isLoading}
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre del documento</label>
            <Input
              {...form.register('name')}
              placeholder="Ej: Propuesta escolar"
              isError={!!form.formState.errors.name}
            />
            {form.formState.errors.name ? (
              <span className="text-xs text-red-500 mt-1">{form.formState.errors.name.message}</span>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Descripción</label>
            <TextArea
              {...form.register('description')}
              placeholder="Ej: Conoce nuestra propuesta escolar"
              className="h-[120px] resize-none"
              isLegacy={false}
            />
            {form.formState.errors.description ? (
              <span className="text-xs text-red-500 mt-1">{form.formState.errors.description.message}</span>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Tipo de documento</label>
            <Controller
              control={form.control}
              name="type"
              render={({ field: { onChange, value } }) => (
                <Select
                  onValueChange={(newValue) => {
                    onChange(newValue);
                    form.setValue('source', '');
                    setSelectedFile(null);
                    setHasExistingFile(false);
                    form.clearErrors('source');
                  }}
                  value={value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SchoolStepResourceType.File}>Archivo</SelectItem>
                    <SelectItem value={SchoolStepResourceType.Url}>URL</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="space-y-6">
          {form.watch('type') === SchoolStepResourceType.File ? (
            <div className="space-y-4">
              <FileUploader
                id="document-upload"
                label={
                  hasExistingFile && !selectedFile
                    ? `Reemplazar archivo (${document?.name || 'Archivo actual'})`
                    : 'Subir archivo'
                }
                placeholder="Arrastra el archivo o <span class='text-galaxy-600 font-semibold cursor-pointer underline'>haz click aquí</span> para seleccionarlo desde tu computadora"
                helperText={
                  hasExistingFile && !selectedFile
                    ? 'Selecciona un nuevo archivo para reemplazar el actual. Archivos permitidos: .jpg, .jpeg, .png, .pdf, .doc, .docx (Máximo 10 MB)'
                    : 'Archivos permitidos: .jpg, .jpeg, .png, .pdf, .doc, .docx (Máximo 10 MB)'
                }
                acceptedFileTypes={[
                  'image/jpeg',
                  'image/jpg',
                  'image/png',
                  'application/pdf',
                  'application/msword',
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                ]}
                maxFileSize={10 * 1024 * 1024}
                multiple={false}
                maxFiles={1}
                onFilesChange={handleFileChange}
                size="medium"
              />
              {form.formState.errors.source && form.watch('type') === SchoolStepResourceType.File ? (
                <span className="text-xs text-red-500 mt-1">{form.formState.errors.source.message}</span>
              ) : null}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">URL del documento</label>
              <Input
                {...form.register('source')}
                placeholder="ej: google.com, www.google.com, https://google.com"
                isError={!!form.formState.errors.source && form.watch('type') === SchoolStepResourceType.Url}
              />
              {form.formState.errors.source && form.watch('type') === SchoolStepResourceType.Url ? (
                <span className="text-xs text-red-500 mt-1">{form.formState.errors.source.message}</span>
              ) : null}
            </div>
          )}

          {document ? (
            <div className="flex items-center gap-2 py-4">
              <Button variant="ghost" type="button" onClick={handleDelete} disabled={isLoading}>
                <Trash2 className="w-6 h-6" />
                <span className="text-sm">Eliminar documento</span>
              </Button>
            </div>
          ) : null}
        </div>
      </form>
    </ConfigurationDrawer>
  );
}
