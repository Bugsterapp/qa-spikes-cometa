import { Button } from '@cometa/recreo/v2';
import * as Sentry from '@sentry/nextjs';
import { useEffect, useRef } from 'react';
import useAlert from '../../hooks/useAlert';
import { useWelcomeFlowStore } from '../../stores/welcomeFlowStore';
import { useSelectedSchool } from '../../guards/AuthGuard';
import { InstitutionForm, InstitutionFormRef, InstitutionFormValues } from '../InstitutionForm';
import { serializableFormatToFile } from '../../utils/file-utils';

type InstitutionSetupStepProps = {
  onNext: () => void;
  progress: number;
};

export function InstitutionSetupStep({ onNext, progress }: Readonly<InstitutionSetupStepProps>) {
  const { setAlertState } = useAlert();
  const store = useWelcomeFlowStore();
  const setInstitution = store((state) => state.setInstitution);
  const setProgress = store((state) => state.setProgress);
  const existingData = store((state) => state.institution);
  const serializedLogo = store((state) => state.logoFile);
  const currentSchool = useSelectedSchool();
  const formRef = useRef<InstitutionFormRef>(null);

  const cachedLogoFile = serializedLogo
    ? (() => {
        try {
          return serializableFormatToFile(serializedLogo);
        } catch (error) {
          Sentry.captureException(error);
          return null;
        }
      })()
    : null;

  async function onSubmit(form: InstitutionFormValues, logoFile?: File) {
    if (!logoFile && !cachedLogoFile && !currentSchool?.logo) {
      setAlertState({
        severity: 'error',
        open: true,
        message: 'Por favor, sube un logo de la institución para continuar.',
      });
      return;
    }

    await setInstitution(form, logoFile);

    setAlertState({
      severity: 'success',
      open: true,
      message: '¡Configuración guardada con éxito!',
    });

    onNext();
  }

  function handleNext() {
    if (formRef.current) {
      formRef.current.submitForm();
    }
  }

  const initialValues = {
    name: existingData?.name || currentSchool?.name || '',
    phone: existingData?.phone || '',
    email: existingData?.email || '',
  };

  useEffect(() => {
    setProgress(progress);
  }, [progress, setProgress]);

  return (
    <div className="w-full h-full relative">
      <div className="absolute left-1/2 top-[129px] translate-x-[-50%] w-[600px] pb-[65px]">
        <div className="flex flex-col gap-8 items-end">
          <div className="flex flex-col gap-8 w-full">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-[28px] leading-[34px] font-semibold text-[#22283a] font-lota">
                  Datos de la institución
                </h1>
                <div className="flex flex-col gap-6">
                  <p className="text-[16px] leading-[24px] text-[#697086] font-lota">
                    Completa la información básica de tu institución para comenzar a usar la plataforma.
                  </p>
                </div>
              </div>
              <div className="w-full h-0 relative">
                <div className="absolute bottom-0 left-0 right-0 top-[-1px] h-px bg-[#edf2fc]" />
              </div>
            </div>

            <Sentry.ErrorBoundary>
              <InstitutionForm
                key={currentSchool?.id}
                onSubmit={onSubmit}
                showNameField
                showActions={false}
                initialValues={initialValues}
                existingLogo={currentSchool?.logo || undefined}
                cachedLogoFile={cachedLogoFile}
                ref={formRef}
              />
            </Sentry.ErrorBoundary>
          </div>

          <div className="flex items-center gap-4">
            <Button
              size="lg"
              onClick={handleNext}
              className="bg-[#22283a] text-white hover:bg-[#22283a]/90 h-10 px-6 py-2 rounded-full shadow-[0px_1px_2px_0px_rgba(34,40,58,0.05)] text-[14px] leading-[20px] font-semibold font-lota"
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
