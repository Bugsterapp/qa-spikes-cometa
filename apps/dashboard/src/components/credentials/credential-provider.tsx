import { useState, useMemo, useCallback, useRef, type ReactNode } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Sentry from '@sentry/nextjs';
import type { CredentialConfig, CredentialSide, SchoolData, StudentData } from './types';
import { DEFAULT_CREDENTIAL_CONFIG, SAMPLE_STUDENT_DATA, CREDENTIAL_SIDE } from './types';
import { CredentialContext } from './credential-context';
import { useSelectedSchool } from '../../guards/AuthGuard';
import { formatValidity } from './utils/format-validity';
import { api } from '../../utils/api';
import { mapToBackendDTO, mapFromBackendConfig } from './utils/backend-mapper';
import { generateDuplicateName } from './utils/name-generator';
import { useCredentialFileUpload } from './hooks/useCredentialFileUpload';
import { useToast } from '../molecules/dashboard/Toast/useToast';
import { credentialFormSchema, type CredentialFormData } from './types/form-types';
import { convertConfigToFormData, convertFormDataToConfig } from './utils/form-converters';

type CredentialProviderProps = {
  children: ReactNode;
  initialStudentData?: StudentData;
};

export function CredentialProvider({ children, initialStudentData = SAMPLE_STUDENT_DATA }: CredentialProviderProps) {
  const formMethods = useForm({
    resolver: zodResolver(credentialFormSchema),
    defaultValues: convertConfigToFormData(DEFAULT_CREDENTIAL_CONFIG),
    mode: 'onChange',
  });

  const { watch, reset, setValue, control } = formMethods;

  // IMPORTANT: Destructure formState properties directly to subscribe to them
  const { isDirty, isValid } = formMethods.formState;

  const formData = useWatch({ control });

  const config = useMemo(() => {
    if (!formData) return DEFAULT_CREDENTIAL_CONFIG;
    return convertFormDataToConfig(formData as CredentialFormData);
  }, [formData]);

  const [side, setSide] = useState<CredentialSide>(CREDENTIAL_SIDE.FRONT);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const selectedSchool = useSelectedSchool();
  const schoolData = useMemo<SchoolData>(
    () => ({
      name: selectedSchool?.name || '',
      logo: selectedSchool?.logo || '',
    }),
    [selectedSchool]
  );

  const studentData = useMemo<StudentData>(() => {
    const validityValue = formatValidity(config.front_fields.expires_at.value || '');

    return {
      ...initialStudentData,
      validity: validityValue,
    };
  }, [config.front_fields.expires_at.value, initialStudentData]);

  const utils = api.useUtils();
  const { uploadFile, downloadFile, deleteFile } = useCredentialFileUpload();
  const { toast } = useToast();

  const createSuccessCallbackRef = useRef<(() => void) | null>(null);
  const updateSuccessCallbackRef = useRef<(() => void) | null>(null);
  // Flag to silence update toast when called from create
  const silentUpdateRef = useRef(false);

  const createTemplateMutation = api.credentials.createTemplate.useMutation({
    onSuccess: () => {
      utils.credentials.listTemplates.invalidate();
      toast({ title: 'Plantilla creada exitosamente', variant: 'success' });
      createSuccessCallbackRef.current?.();
      createSuccessCallbackRef.current = null;
    },
    onError: () => {
      toast({ title: 'Error al crear la plantilla', variant: 'error' });
      createSuccessCallbackRef.current = null;
    },
  });
  const updateTemplateMutation = api.credentials.updateTemplate.useMutation({
    onSuccess: () => {
      utils.credentials.listTemplates.invalidate();
      // Only show toast if not in silent mode
      if (!silentUpdateRef.current) {
        toast({ title: 'Plantilla actualizada exitosamente', variant: 'success' });
      }
      silentUpdateRef.current = false;
      updateSuccessCallbackRef.current?.();
      updateSuccessCallbackRef.current = null;
    },
    onError: () => {
      silentUpdateRef.current = false;
      toast({ title: 'Error al actualizar la plantilla', variant: 'error' });
      updateSuccessCallbackRef.current = null;
    },
  });

  const updateConfig = useCallback(
    (updates: Partial<CredentialConfig>) => {
      const newConfig = { ...config, ...updates };

      Object.entries(newConfig).forEach(([key, value]) => {
        if (
          key !== 'signatureFile' &&
          key !== 'digitalSealFile' &&
          key !== 'originalSignatureFileId' &&
          key !== 'originalDigitalSealFileId'
        ) {
          setValue(key as keyof CredentialFormData, value, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
      });
    },
    [config, setValue]
  );

  const setConfig = useCallback(
    (newConfig: CredentialConfig) => {
      const currentData = watch();
      reset(
        convertConfigToFormData(newConfig, {
          signatureFile: currentData.signatureFile,
          digitalSealFile: currentData.digitalSealFile,
          originalSignatureFileId: currentData.originalSignatureFileId,
          originalDigitalSealFileId: currentData.originalDigitalSealFileId,
        })
      );
    },
    [watch, reset]
  );

  function setSignatureFile(file: File | null) {
    setValue('signatureFile', file, { shouldDirty: true, shouldValidate: true });
  }

  function setDigitalSealFile(file: File | null) {
    setValue('digitalSealFile', file, { shouldDirty: true, shouldValidate: true });
  }

  function toggleSide() {
    setSide((prev) => (prev === CREDENTIAL_SIDE.FRONT ? CREDENTIAL_SIDE.BACK : CREDENTIAL_SIDE.FRONT));
  }

  async function createTemplate(onSuccess?: () => void) {
    if (!selectedSchool?.id) {
      setCreateError('No hay escuela seleccionada');
      return;
    }

    if (!config.templateName.trim()) {
      setCreateError('El nombre de la plantilla es requerido');
      return;
    }

    setCreateError(null);

    try {
      // Store callback to be called from mutation's onSuccess
      createSuccessCallbackRef.current = onSuccess || null;

      const dto = mapToBackendDTO(config, selectedSchool.id, config.templateName);
      const result = await createTemplateMutation.mutateAsync(dto);
      const templateId = result.id;
      setCurrentTemplateId(templateId);

      const currentFormData = watch();
      const updatedConfig = { ...config };
      let hasFileUpdates = false;

      if (currentFormData.signatureFile) {
        const signatureFileId = await uploadFile(
          selectedSchool.id,
          templateId,
          'signature',
          currentFormData.signatureFile
        );
        updatedConfig.back_fields.signature.file_id = signatureFileId;
        hasFileUpdates = true;
      }

      if (currentFormData.digitalSealFile) {
        const digitalSealFileId = await uploadFile(
          selectedSchool.id,
          templateId,
          'digital_seal',
          currentFormData.digitalSealFile
        );
        updatedConfig.back_fields.digital_seal.file_id = digitalSealFileId;
        hasFileUpdates = true;
      }

      if (hasFileUpdates) {
        const updateDto = mapToBackendDTO(updatedConfig, selectedSchool.id, updatedConfig.templateName);

        // Silence update toast during creation to avoid duplicate notifications
        silentUpdateRef.current = true;

        await updateTemplateMutation.mutateAsync({
          templateId,
          data: {
            name: updateDto.name,
            config: updateDto.config,
          },
        });

        reset(
          convertConfigToFormData(updatedConfig, {
            signatureFile: currentFormData.signatureFile,
            digitalSealFile: currentFormData.digitalSealFile,
            originalSignatureFileId: updatedConfig.back_fields.signature.file_id || null,
            originalDigitalSealFileId: updatedConfig.back_fields.digital_seal.file_id || null,
          })
        );
      } else {
        reset();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear la plantilla';
      setCreateError(errorMessage);
      throw error;
    }
  }

  async function updateTemplate(onSuccess?: () => void) {
    if (!selectedSchool?.id) {
      setUpdateError('No hay escuela seleccionada');
      return;
    }

    if (!currentTemplateId) {
      setUpdateError('No hay plantilla para actualizar');
      return;
    }

    if (!config.templateName.trim()) {
      setUpdateError('El nombre de la plantilla es requerido');
      return;
    }

    setUpdateError(null);

    try {
      // Store callback to be called from mutation's onSuccess
      updateSuccessCallbackRef.current = onSuccess || null;
      const currentFormData = watch();
      const updatedConfig = { ...config };
      let hasFileUpdates = false;

      if (
        currentFormData.signatureFile &&
        currentFormData.signatureFile instanceof File &&
        !currentFormData.signatureFile.name.startsWith('downloaded-')
      ) {
        if (currentFormData.originalSignatureFileId) {
          try {
            await deleteFile(currentFormData.originalSignatureFileId);
          } catch {
            // Continue if file doesn't exist
          }
        }
        const signatureFileId = await uploadFile(
          selectedSchool.id,
          currentTemplateId,
          'signature',
          currentFormData.signatureFile
        );
        updatedConfig.back_fields.signature.file_id = signatureFileId;
        hasFileUpdates = true;
      } else if (!currentFormData.signatureFile && currentFormData.originalSignatureFileId) {
        try {
          await deleteFile(currentFormData.originalSignatureFileId);
        } catch {
          // Continue if file doesn't exist
        }
        updatedConfig.back_fields.signature.file_id = '';
        hasFileUpdates = true;
      }

      if (
        currentFormData.digitalSealFile &&
        currentFormData.digitalSealFile instanceof File &&
        !currentFormData.digitalSealFile.name.startsWith('downloaded-')
      ) {
        if (currentFormData.originalDigitalSealFileId) {
          try {
            await deleteFile(currentFormData.originalDigitalSealFileId);
          } catch {
            // Continue if file doesn't exist
          }
        }
        const digitalSealFileId = await uploadFile(
          selectedSchool.id,
          currentTemplateId,
          'digital_seal',
          currentFormData.digitalSealFile
        );
        updatedConfig.back_fields.digital_seal.file_id = digitalSealFileId;
        hasFileUpdates = true;
      } else if (!currentFormData.digitalSealFile && currentFormData.originalDigitalSealFileId) {
        try {
          await deleteFile(currentFormData.originalDigitalSealFileId);
        } catch {
          // Continue if file doesn't exist
        }
        updatedConfig.back_fields.digital_seal.file_id = '';
        hasFileUpdates = true;
      }

      const finalConfig = hasFileUpdates ? updatedConfig : config;

      const dto = mapToBackendDTO(finalConfig, selectedSchool.id, config.templateName);
      const result = await updateTemplateMutation.mutateAsync({
        templateId: currentTemplateId,
        data: {
          name: dto.name,
          config: dto.config,
        },
      });
      setCurrentTemplateId(result.id);

      // Reset form with saved config to mark as pristine
      reset(
        convertConfigToFormData(finalConfig, {
          signatureFile: currentFormData.signatureFile,
          digitalSealFile: currentFormData.digitalSealFile,
          originalSignatureFileId: finalConfig.back_fields.signature.file_id || null,
          originalDigitalSealFileId: finalConfig.back_fields.digital_seal.file_id || null,
        })
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar la plantilla';
      setUpdateError(errorMessage);
      throw error;
    }
  }

  async function loadTemplate(templateId: string) {
    if (!selectedSchool?.id) {
      setLoadError('No hay escuela seleccionada');
      return;
    }

    setLoadError(null);

    try {
      const response = await utils.client.credentials.getTemplate.query({
        templateId,
        schoolId: selectedSchool.id,
      });

      if (response) {
        const mappedConfig = mapFromBackendConfig(response);
        setCurrentTemplateId(templateId);

        // Intentar descargar archivos si existen, pero no fallar si hay error
        let downloadedSignatureFile: File | null = null;
        let downloadedDigitalSealFile: File | null = null;

        if (mappedConfig.back_fields.signature.file_id) {
          try {
            const file = await downloadFile(mappedConfig.back_fields.signature.file_id);
            if (file) {
              downloadedSignatureFile = file;
            }
          } catch {
            // Continuar sin el archivo - error downloading is non-critical
          }
        }

        if (mappedConfig.back_fields.digital_seal.file_id) {
          try {
            const file = await downloadFile(mappedConfig.back_fields.digital_seal.file_id);
            if (file) {
              downloadedDigitalSealFile = file;
            }
          } catch {
            // Continue without file - error downloading is non-critical
          }
        }

        // CRITICAL: reset() updates defaultValues and clears isDirty
        reset(
          convertConfigToFormData(mappedConfig, {
            signatureFile: downloadedSignatureFile,
            digitalSealFile: downloadedDigitalSealFile,
            originalSignatureFileId: mappedConfig.back_fields.signature.file_id || null,
            originalDigitalSealFileId: mappedConfig.back_fields.digital_seal.file_id || null,
          })
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar la plantilla';
      setLoadError(errorMessage);
      throw error;
    }
  }

  const duplicateFromTemplate = useCallback(
    async (sourceTemplateId: string) => {
      if (!selectedSchool?.id) {
        throw new Error('No hay escuela seleccionada');
      }

      try {
        // Obtener template completo del backend
        const template = await utils.client.credentials.getTemplate.query({
          templateId: sourceTemplateId,
          schoolId: selectedSchool.id,
        });

        if (!template) {
          throw new Error('No se pudo cargar el template');
        }

        const mappedConfig = mapFromBackendConfig(template);

        const templatesData = await utils.client.credentials.listTemplates.query({
          schoolId: selectedSchool.id,
          page: 1,
          limit: 100,
        });
        const templates = templatesData?.results || [];

        const newName = generateDuplicateName(mappedConfig.templateName, templates);

        let downloadedSignatureFile: File | null = null;
        let downloadedDigitalSealFile: File | null = null;

        if (mappedConfig.back_fields.signature.file_id) {
          try {
            const file = await downloadFile(mappedConfig.back_fields.signature.file_id);
            if (file) {
              downloadedSignatureFile = file;
            }
          } catch (error) {
            // Continue without file - download error is non-critical
            Sentry.captureException(error, {
              tags: {
                context: 'credential_duplicate_signature_download',
                file_id: mappedConfig.back_fields.signature.file_id,
              },
            });
          }
        }

        if (mappedConfig.back_fields.digital_seal.file_id) {
          try {
            const file = await downloadFile(mappedConfig.back_fields.digital_seal.file_id);
            if (file) {
              downloadedDigitalSealFile = file;
            }
          } catch (error) {
            // Continue without file - download error is non-critical
            Sentry.captureException(error, {
              tags: {
                context: 'credential_duplicate_digital_seal_download',
                file_id: mappedConfig.back_fields.digital_seal.file_id,
              },
            });
          }
        }

        const duplicatedConfig: CredentialConfig = {
          ...mappedConfig,
          templateName: newName,
          back_fields: {
            ...mappedConfig.back_fields,
            signature: {
              ...mappedConfig.back_fields.signature,
              file_id: '',
            },
            digital_seal: {
              ...mappedConfig.back_fields.digital_seal,
              file_id: '',
            },
          },
        };

        // CRITICAL: reset() updates defaultValues and clears isDirty
        // Don't set currentTemplateId - must remain null to create new template
        reset(
          convertConfigToFormData(duplicatedConfig, {
            signatureFile: downloadedSignatureFile,
            digitalSealFile: downloadedDigitalSealFile,
            originalSignatureFileId: null,
            originalDigitalSealFileId: null,
          })
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error al duplicar la plantilla';
        toast({ title: errorMessage, variant: 'error' });
        Sentry.captureException(error, {
          tags: {
            context: 'credential_duplicate_template',
            template_id: sourceTemplateId,
          },
        });
        throw error;
      }
    },
    [selectedSchool, utils, downloadFile, toast, reset]
  );

  const isCreating = createTemplateMutation.isPending;
  const isUpdating = updateTemplateMutation.isPending;
  const isLoading = false;

  return (
    <CredentialContext.Provider
      value={{
        formMethods,
        isDirty,
        isValid,
        config,
        setConfig,
        updateConfig,
        side,
        setSide,
        toggleSide,
        studentData,
        schoolData,
        signatureFile: formData?.signatureFile ?? null,
        setSignatureFile,
        digitalSealFile: formData?.digitalSealFile ?? null,
        setDigitalSealFile,
        createTemplate,
        updateTemplate,
        loadTemplate,
        duplicateFromTemplate,
        isCreating,
        isUpdating,
        isLoading,
        createError,
        updateError,
        loadError,
        currentTemplateId,
      }}
    >
      {children}
    </CredentialContext.Provider>
  );
}
