'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@cometa/recreo/v2';
import { Info } from 'lucide-react';
import { cn } from '@cometa/utils';
import * as Sentry from '@sentry/nextjs';
import { FrontConfiguration } from './front-configuration';
import { BackConfiguration } from './back-configuration';
import { ConfigurationLayout, CredentialMockup, ColorPickerMenu } from './shared';
import { CredentialCard } from './shared/credential-card';
import { CredentialProvider } from './credential-provider';
import { useCredential } from './credential-context';
import { Loading } from './loading';
import { LoadingScreen } from './loading-screen';
import { SAMPLE_STUDENT_DATA, CREDENTIAL_SIDE, type CredentialConfig, type CredentialSide } from './types';

type CredentialDesignerProps = {
  onSave?: (config: CredentialConfig) => void;
  onCancel?: () => void;
  onConfigChange?: (isDirty: boolean) => void;
  templateId?: string;
  duplicateFromTemplateId?: string;
  isEditing?: boolean;
};

function CredentialDesignerContent({
  onSave,
  onConfigChange,
  templateId,
  duplicateFromTemplateId,
  isEditing = false,
}: {
  onSave?: (config: CredentialConfig) => void;
  onConfigChange?: (isDirty: boolean) => void;
  templateId?: string;
  duplicateFromTemplateId?: string;
  isEditing?: boolean;
}) {
  const {
    config,
    setConfig,
    updateConfig,
    side,
    setSide,
    currentTemplateId,
    createTemplate,
    updateTemplate,
    loadTemplate,
    duplicateFromTemplate,
    isDirty,
    isValid,
  } = useCredential();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    setIsFlipped(side === CREDENTIAL_SIDE.BACK);
  }, [side]);

  useEffect(() => {
    if (hasLoadedRef.current) return;

    // Edit mode: load existing template
    if (templateId && isEditing) {
      hasLoadedRef.current = true;
      setIsLoadingTemplate(true);
      loadTemplate(templateId)
        .catch((error) => {
          Sentry.captureException(error, {
            tags: {
              context: 'credential_template_load',
              template_id: templateId,
            },
          });
        })
        .finally(() => {
          setIsLoadingTemplate(false);
        });
    }
    // Duplicate mode: clone from source template
    else if (duplicateFromTemplateId) {
      hasLoadedRef.current = true;
      setIsLoadingTemplate(true);
      duplicateFromTemplate(duplicateFromTemplateId)
        .catch((error) => {
          Sentry.captureException(error, {
            tags: {
              context: 'credential_template_duplicate',
              template_id: duplicateFromTemplateId,
            },
          });
        })
        .finally(() => {
          setIsLoadingTemplate(false);
        });
    }

    // Reset flag when entering create mode or closing drawer
    if (!templateId && !duplicateFromTemplateId) {
      hasLoadedRef.current = false;
    }
  }, [templateId, isEditing, duplicateFromTemplateId, loadTemplate, duplicateFromTemplate]);

  useEffect(() => {
    onConfigChange?.(isDirty);
  }, [isDirty, onConfigChange]);

  function handleSideChange(newSide: CredentialSide) {
    setSide(newSide);
  }

  async function handleSave() {
    try {
      // Callback is invoked from mutation's onSuccess to close drawer before loading completes
      const successCallback = () => onSave?.(config);

      if (currentTemplateId) {
        await updateTemplate(successCallback);
      } else {
        await createTemplate(successCallback);
      }
    } catch (error) {
      // Errors already handled in context
    }
  }

  if (isLoadingTemplate) {
    return (
      <LoadingScreen
        title="Cargando plantilla..."
        description="Estamos cargando la plantilla de credencial. En unos segundos estará lista para editar."
      />
    );
  }

  const leftContent = (
    <div className="space-y-[30px]">
      <div className="flex flex-col gap-[8px]">
        <h1 className="text-[28px] font-semibold text-neutral-900 leading-[34px]">
          {isEditing ? 'Diseño' : 'Nueva plantilla'}
        </h1>
        <p className="text-base text-neutral-700 leading-6">
          {isEditing ? 'Edita el diseño de tu credencial.' : 'Define el diseño de tu credencial.'}
        </p>
      </div>

      <div className="flex flex-col gap-[4px]">
        <label htmlFor="template-name" className="text-sm text-neutral-600 font-normal">
          Nombre de la plantilla
        </label>
        <Input
          id="template-name"
          type="text"
          value={config.templateName}
          onChange={(e) => updateConfig({ templateName: e.target.value })}
          placeholder=""
          className="h-[49px] border-[#c0c9d8] rounded-[6px] px-[16px] py-[12px]"
        />
      </div>

      <div className="flex flex-col gap-[24px]">
        <div className="flex items-center gap-1">
          <h3 className="text-lg font-semibold text-neutral-900">Orientación</h3>
          <Info className="w-4 h-4 text-neutral-500" />
        </div>

        <div className="flex gap-[23px]">
          <button
            type="button"
            onClick={() => setConfig({ ...config, orientation: 'portrait' })}
            className={cn(
              'flex-1 flex items-center justify-center gap-[11px] px-[10.194px] py-2.5 rounded-[5.097px] border-2 transition-all',
              {
                'bg-neutral-25 border-galaxy-500': config.orientation === 'portrait',
                'bg-neutral-25 border-neutral-75': config.orientation !== 'portrait',
              }
            )}
          >
            <div className="w-[37.399px] h-[21.999px] bg-neutral-900 rounded-[2.75px] rotate-90" />
            <span
              className={cn('text-sm font-semibold', {
                'text-neutral-900': config.orientation === 'portrait',
                'text-neutral-700': config.orientation !== 'portrait',
              })}
            >
              Vertical
            </span>
          </button>

          <button
            type="button"
            onClick={() => setConfig({ ...config, orientation: 'landscape' })}
            className={cn(
              'flex-1 flex items-center justify-center gap-2.5 px-[10.194px] py-[6px] h-[57px] rounded-[5.097px] border transition-all',
              {
                'bg-neutral-25 border-2 border-galaxy-500': config.orientation === 'landscape',
                'bg-neutral-25 border border-neutral-75': config.orientation !== 'landscape',
              }
            )}
          >
            <div className="w-[37.399px] h-[21.999px] bg-neutral-700 rounded-[2.75px] rotate-180" />
            <span
              className={cn('text-sm font-semibold', {
                'text-neutral-900': config.orientation === 'landscape',
                'text-neutral-700': config.orientation !== 'landscape',
              })}
            >
              Horizontal
            </span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-[24px]">
        <div className="flex flex-col gap-[10px]">
          <div className="flex items-center gap-1">
            <h3 className="text-lg font-semibold text-neutral-900">Información general</h3>
          </div>
          <p className="text-base text-neutral-700 leading-6">
            Define el contenido que se mostrará en la credencial. Recuerda que el logo, nombre de colegio, nombre y
            apellido de estudiante y foto de estudiante no son editables.
          </p>
        </div>

        <div className="bg-[#f8f9fb] rounded-[50px] p-[4px] flex gap-[4px] h-[48px]">
          <button
            type="button"
            onClick={() => handleSideChange(CREDENTIAL_SIDE.FRONT)}
            className={cn(
              'flex-1 rounded-[48px] flex items-center justify-center px-3 py-1 transition-all',
              side === CREDENTIAL_SIDE.FRONT
                ? 'bg-[#873aff] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)]'
                : 'bg-transparent'
            )}
          >
            <span
              className={cn(
                'text-sm leading-5',
                side === CREDENTIAL_SIDE.FRONT ? 'font-semibold text-white' : 'font-normal text-[#a5acc4]'
              )}
            >
              Frente
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleSideChange(CREDENTIAL_SIDE.BACK)}
            className={cn(
              'flex-1 rounded-[48px] flex items-center justify-center px-3 py-1 transition-all',
              side === CREDENTIAL_SIDE.BACK
                ? 'bg-[#873aff] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)]'
                : 'bg-transparent'
            )}
          >
            <span
              className={cn(
                'text-sm leading-5',
                side === CREDENTIAL_SIDE.BACK ? 'font-semibold text-white' : 'font-normal text-[#a5acc4]'
              )}
            >
              Dorso
            </span>
          </button>
        </div>

        {side === CREDENTIAL_SIDE.FRONT ? (
          <FrontConfiguration
            config={config}
            onConfigChange={updateConfig}
            /*onSideChange={handleSideChange}*/
            /*currentSide={side}*/
          />
        ) : (
          <BackConfiguration config={config} onConfigChange={updateConfig} />
        )}
      </div>
    </div>
  );

  return (
    <ConfigurationLayout
      leftContent={leftContent}
      rightContent={
        <>
          <ColorPickerMenu />
          <motion.div
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <CredentialMockup orientation={config.orientation}>
              <CredentialCard />
            </CredentialMockup>
          </motion.div>
        </>
      }
      footer={{
        buttonLabel: 'Finalizar',
        buttonAction: handleSave,
        disabled: !isValid,
      }}
    />
  );
}

export function CredentialDesigner({
  onSave,
  onConfigChange,
  templateId,
  duplicateFromTemplateId,
  isEditing,
}: CredentialDesignerProps) {
  return (
    <CredentialProvider initialStudentData={SAMPLE_STUDENT_DATA}>
      <Loading />
      <CredentialDesignerContent
        onSave={onSave}
        onConfigChange={onConfigChange}
        templateId={templateId}
        duplicateFromTemplateId={duplicateFromTemplateId}
        isEditing={isEditing}
      />
    </CredentialProvider>
  );
}
