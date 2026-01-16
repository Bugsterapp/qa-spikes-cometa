import { Button } from '@cometa/recreo/v2';
import { BotFiscalEntityDTO, OnboardingStatus } from '@cometa/trpc/src/bot/types';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Sentry from '@sentry/nextjs';
import InfoCircleIcon from 'public/assets/icons/ic_info_circle_outline.svg';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import useSendTrackEventWithUserName from '../../../../hooks/useSendTrackEventWithUserName';
import { useFiscalEntityForm, type FiscalEntityFormData } from '../../../../stores/fiscalEntityFormStore';
import { parseCertificateWithDates } from '../../../../utils/certificate-parser';
import { handleDownloadFile } from '../../../../utils/file-utils';
import SidebarActions from '../../../atoms/SidebarActions';
import SidebarHeader from '../../../molecules/dashboard/SidebarHeader';
import DeclinedAlert from '../../DeclinedAlert';
import { FieldsForm } from './FieldsForm';
import { FileForm } from './FileForm';
import { schema, type FiscalEntityForm } from './types';

const FORM_STEPS = {
  FILE: 'file',
  FIELDS: 'fields',
};

type FiscalEntityFormProps = {
  onClose: () => void;
  onSave: (data: FiscalEntityForm) => void;
  onDelete?: (fiscalEntityId: string) => void;
  fiscalEntity?: BotFiscalEntityDTO | null;
};

export function FiscalEntityFormDrawer({ onClose, onSave, onDelete, fiscalEntity }: Readonly<FiscalEntityFormProps>) {
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const [currentStep, setCurrentStep] = useState(FORM_STEPS.FILE);
  const isEditing = !!fiscalEntity?.id;
  const isDeclined = fiscalEntity?.status === OnboardingStatus.Declined;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { formData, files, setFormField, storeFile, clearEntityForm, clearNewEntityForm } = useFiscalEntityForm();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    setError,
    clearErrors,
  } = useForm<FiscalEntityForm>({
    resolver: zodResolver(schema),
    defaultValues: formData,
    mode: 'onChange',
    shouldFocusError: true,
  });

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (!name) return;

      const isNonFileField = (key: string): key is keyof FiscalEntityFormData =>
        key !== 'fiscal_entity_file' && key !== 'csd_key_file' && key !== 'csd_certificate_file';

      if (isNonFileField(name)) {
        const fieldValue = value[name];
        if (fieldValue !== undefined) {
          setFormField(name, fieldValue);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setFormField]);

  async function handleDownloadFileWithFallback(url: string, filename: string) {
    try {
      await handleDownloadFile(url, filename);
    } catch (error) {
      Sentry.captureException(error);
      window.open(url, '_blank');
    }
  }

  async function onSubmit(data: FiscalEntityForm) {
    const completeFormData = {
      ...data,
      fiscal_entity_file: files.fiscal_entity_file,
      csd_key_file: files.csd_key_file,
      csd_certificate_file: files.csd_certificate_file,
    };
    onSave(completeFormData);
  }

  function handleDelete() {
    if (fiscalEntity?.id && onDelete) {
      sendTrackEventWithUserName('dashboard: Fiscal Entity declined | Clicked delete');
      onDelete(fiscalEntity.id);
    }
  }

  function handleCancelClick() {
    sendTrackEventWithUserName('dashboard: Fiscal Entity edit | Clicked cancel');
    if (isEditing && fiscalEntity?.id) {
      clearEntityForm(fiscalEntity.id);
    } else {
      clearNewEntityForm();
    }
    onClose();
  }

  function getButtonLabel(isEditing: boolean): string {
    return isEditing ? 'Actualizar' : 'Guardar';
  }

  async function handleCertificateUpload(files: File[]) {
    const file = files[0];
    if (!file) {
      storeFile('csd_certificate_file', null);
      return;
    }

    clearErrors('csd_certificate_file');
    storeFile('csd_certificate_file', file);

    try {
      const metadata = await parseCertificateWithDates(file);

      if (metadata.rfc) {
        setValue('tax_id', metadata.rfc);
      }

      if (metadata.legalName) {
        setValue('name', metadata.legalName);
      }

      if (metadata.issuedAt) {
        setValue('issued_at', metadata.issuedAt);
      }

      if (metadata.expiresAt) {
        setValue('expires_at', metadata.expiresAt);
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  async function handleNextStep(e?: React.MouseEvent<HTMLButtonElement>) {
    e?.preventDefault();

    if (currentStep === FORM_STEPS.FILE) {
      let hasErrors = false;

      if (!files.fiscal_entity_file) {
        setError('fiscal_entity_file', {
          type: 'manual',
          message: 'La constancia de situación fiscal es requerida',
        });
        hasErrors = true;
      }

      if (!files.csd_key_file) {
        setError('csd_key_file', {
          type: 'manual',
          message: 'El archivo .key es requerido',
        });
        hasErrors = true;
      }

      if (!files.csd_certificate_file) {
        setError('csd_certificate_file', {
          type: 'manual',
          message: 'El archivo .cer es requerido',
        });
        hasErrors = true;
      }

      const password = watch('csd_password');
      if (!password || password.trim() === '') {
        setError('csd_password', {
          type: 'manual',
          message: 'La contraseña CSD es requerida',
        });
        hasErrors = true;
      }

      if (hasErrors) {
        return;
      }

      setCurrentStep(FORM_STEPS.FIELDS);
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handlePrevStep() {
    if (currentStep === FORM_STEPS.FIELDS) {
      setCurrentStep(FORM_STEPS.FILE);
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <div className="flex flex-col h-full">
      <SidebarHeader
        title={isEditing ? 'Editar entidad fiscal' : 'Agregar entidad fiscal'}
        onClose={onClose}
        boxClassName="border-b border-[#d0d8e9] px-8 py-4 rounded-tl-[8px] rounded-tr-[8px] shrink-0"
        titleClassName="text-[#22283a] text-[18px] font-semibold mr-2"
      />
      <form className="flex flex-col flex-1 min-h-0" onSubmit={handleSubmit(onSubmit)}>
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-8">
          <div className="flex flex-col gap-8 mb-6 pt-8">
            <StatusAlert isDeclined={isDeclined} reason={fiscalEntity?.reason ?? undefined} />

            {currentStep === FORM_STEPS.FILE ? (
              <FileForm
                register={register}
                errors={errors}
                setValue={setValue}
                clearErrors={clearErrors}
                watch={watch}
                isEditing={isEditing}
                fiscalEntity={fiscalEntity}
                onCertificateUpload={handleCertificateUpload}
                onDownloadFile={handleDownloadFileWithFallback}
              />
            ) : (
              <FieldsForm register={register} errors={errors} setValue={setValue} watch={watch} />
            )}
          </div>
        </div>

        <SidebarActions variant="form">
          {isDeclined && onDelete && (
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          )}
          {currentStep === FORM_STEPS.FILE ? (
            <>
              <Button type="button" variant="secondary" onClick={handleCancelClick}>
                Descartar
              </Button>
              <Button type="button" variant="default" onClick={handleNextStep}>
                Siguiente
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="secondary" onClick={handlePrevStep}>
                Atrás
              </Button>
              <Button type="submit" variant="default">
                {getButtonLabel(isEditing)}
              </Button>
            </>
          )}
        </SidebarActions>
      </form>
    </div>
  );
}

function StatusAlert({ isDeclined, reason }: Readonly<{ isDeclined: boolean; reason?: string }>) {
  if (isDeclined) {
    return (
      <DeclinedAlert
        message={reason}
        defaultMessage="La información registrada no es correcta. Por favor, actualiza la información y vuelve a intentarlo."
      />
    );
  }

  return (
    <div className="bg-[#f8f9fb] border border-[#d0d8e9] rounded-lg px-4 py-3 flex items-center gap-3">
      <div className="flex-shrink-0">
        <InfoCircleIcon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-[#22283a] leading-5">
          Luego de registrar tu entidad fiscal, nuestro equipo verificará la información. Te avisaremos si hay algún
          inconveniente.
        </p>
      </div>
    </div>
  );
}
