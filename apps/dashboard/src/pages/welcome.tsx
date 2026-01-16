import { useRouter } from 'next/router';
import { useState } from 'react';
import { signOut } from 'next-auth/react';
import {
  VideoStep,
  InstitutionSetupStep,
  TeamSetupStep,
  LoadingWorkspace,
  WelcomeSchoolSelector,
} from '../components/welcome';
import { PATH_AUTH, PATH_PORTAL } from '../routes/paths';
import * as Sentry from '@sentry/nextjs';
import { ConfigurationHeader } from '../components/admissions/setup/shared/configuration';
import { useFlagWithVariableMatching } from '../components/flags/FlagsProvider';
import { api } from '../utils/api';
import { useWelcomeFlowStore, WelcomeStep } from '../stores/welcomeFlowStore';
import useAlert from '../hooks/useAlert';
import { useSendEvent } from '../hooks/useSendEvent';
import { useSelectedSchool } from '../guards/AuthGuard';
import { useOnboardingState } from '../hooks/onboarding/useOnboardingState';
import { Status2B3Enum } from '@cometa/trpc/src/types';

const STEP_PROGRESS: Record<WelcomeStep, number> = {
  [WelcomeStep.VIDEO]: 25,
  [WelcomeStep.INSTITUTION_SETUP]: 50,
  [WelcomeStep.TEAM_SETUP]: 75,
  [WelcomeStep.LOADING_WORKSPACE]: 100,
};

const FLAG_KEY = 'enable_welcome_page';

function WelcomePage() {
  const router = useRouter();
  const [videoProgress, setVideoProgress] = useState(0);
  const [operationsComplete, setOperationsComplete] = useState(false);
  const [failedStep, setFailedStep] = useState<WelcomeStep | undefined>(undefined);
  const selectedSchool = useSelectedSchool();
  const { isEnabled: welcomePageFlag } = useFlagWithVariableMatching(FLAG_KEY);

  const store = useWelcomeFlowStore();
  const currentStep = store((state) => state.currentStep);
  const setCurrentStep = store((state) => state.setCurrentStep);
  const setSchoolCreated = store((state) => state.setSchoolCreated);

  const institutionData = store((state) => state.institution);
  const logoFile = store((state) => state.logoFile);
  const teamMembers = store((state) => state.teamMembers);
  const { setAlertState } = useAlert();
  const sendEvent = useSendEvent();
  const { updateOnboardingState } = useOnboardingState();

  const createUser = api.auth.createUser.useMutation();
  const updateSchool = api.schools.partialUpdateSchool.useMutation();

  const selectedSchoolId = selectedSchool?.id;
  const isSchoolInOnboarding = selectedSchool?.status === Status2B3Enum.Onboarding;

  if (!welcomePageFlag || !selectedSchoolId || !isSchoolInOnboarding) {
    if (globalThis.window !== undefined) {
      router.replace(PATH_PORTAL.charge.root);
    }
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2 font-lota">Acceso No Disponible</h2>
          <p className="text-gray-600 font-lota">No se puede acceder a esta página en este momento.</p>
        </div>
      </div>
    );
  }

  async function patchSchool(): Promise<boolean> {
    if (!institutionData || !selectedSchoolId) return false;

    try {
      const updateData: {
        name: string;
        phone: string;
        email: string;
        logo?: { name: string; type: string; data: string };
      } = {
        name: institutionData.name.trim(),
        phone: institutionData.phone.replaceAll(' ', ''),
        email: institutionData.email.trim(),
      };

      if (logoFile) {
        updateData.logo = logoFile;
      }

      await updateSchool.mutateAsync({
        school_id: selectedSchoolId,
        data: updateData,
      });

      return true;
    } catch (error: any) {
      Sentry.captureException(error);

      const isBadRequest = error?.data?.code === 'BAD_REQUEST';

      const errorMessage = isBadRequest
        ? 'Por favor verifica que los datos ingresados sean correctos. Asegúrate de que el teléfono, ' +
          'correo electrónico y nombre estén en el formato adecuado.'
        : 'Error al actualizar la información del colegio. Por favor intenta nuevamente.';

      setAlertState({
        severity: 'error',
        open: true,
        message: errorMessage,
      });
      return false;
    }
  }

  async function createTeamMembers(): Promise<boolean> {
    if (!selectedSchoolId) return false;
    if (!teamMembers || teamMembers.length === 0) return true;

    const createUserPromises = teamMembers.map(async (member) => {
      try {
        const response = await createUser.mutateAsync({
          first_name: member.first_name,
          last_name: member.last_name,
          email: member.email,
          mobile: member.mobile || undefined,
          membership: member.membership,
          school_id: selectedSchoolId,
        });
        return { success: true, member, response };
      } catch (error: any) {
        Sentry.captureException(error, {
          extra: {
            memberEmail: member.email,
            schoolId: selectedSchoolId,
            errorCode: error?.data?.code,
          },
        });
        return { success: false, member, error };
      }
    });

    const results = await Promise.allSettled(createUserPromises);

    const failures = results
      .filter((result) => result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success))
      .map((result) => (result.status === 'fulfilled' ? result.value : result.reason));

    if (failures.length > 0) {
      sendEvent('dashboard: Team Setup Failed', {
        schoolId: selectedSchoolId,
        failures: failures.map((failure) => failure.member.email),
      });

      const hasBadRequestError = failures.some((f) => f.error?.data?.code === 'BAD_REQUEST');
      const isSingleFailure = failures.length === 1;

      const badRequestMessage = isSingleFailure
        ? '**No se pudo crear el usuario.**\n\nVerifica que los datos ingresados sean correctos' +
          ' (correo electrónico único y formato de teléfono válido) y vuelve a intentar.'
        : `**No se pudieron crear ${failures.length} usuarios.**\n\nVerifica que los datos ingresados
           sean correctos (correo electrónico único y formato de teléfono válido) y vuelve a intentar.`;

      const unexpectedErrorMessage = isSingleFailure
        ? '**¡Ocurrió un error inesperado, el usuario no se creó correctamente!**\n\nPor favor' +
          'vuelve a intentar o comunícate con el equipo de soporte.'
        : `**¡Ocurrió un error inesperado, ${failures.length} usuarios no se crearon
         correctamente!**\n\nPor favor vuelve a intentar o comunícate con el equipo de soporte.`;

      const errorMessage = hasBadRequestError ? badRequestMessage : unexpectedErrorMessage;

      setAlertState({
        severity: 'warning',
        open: true,
        message: errorMessage,
        variant: 'onboarding',
      });

      return false;
    }

    return true;
  }

  async function createSchoolAndUsers() {
    if (!institutionData || !selectedSchoolId) return;

    setOperationsComplete(false);
    setFailedStep(undefined);

    const institutionEventPayload = {
      institutionName: institutionData.name,
      hasLogo: !!logoFile,
    };

    sendEvent('dashboard: Institution Creation Flow Started', institutionEventPayload);

    try {
      const schoolPatchSuccess = await patchSchool();
      const teamCreationSuccess = await createTeamMembers();

      sendEvent('dashboard: Institution Creation Flow Completed', {
        ...institutionEventPayload,
        schoolId: selectedSchoolId,
      });

      if (!schoolPatchSuccess) {
        setFailedStep(WelcomeStep.INSTITUTION_SETUP);
        return;
      }

      if (!teamCreationSuccess) {
        setFailedStep(WelcomeStep.TEAM_SETUP);
        return;
      }

      try {
        await updateOnboardingState({ welcome_incomplete: false, show_onboarding_in_nav: true });
      } catch (onboardingError) {
        Sentry.captureException(onboardingError, {
          extra: { operation: 'updateOnboardingState', schoolId: selectedSchoolId },
        });
      }

      setSchoolCreated(true);
      setOperationsComplete(true);
    } catch (error) {
      sendEvent('dashboard: Institution Creation Flow Failed', {
        ...institutionEventPayload,
        error,
      });
      Sentry.captureException(error);
      setFailedStep(WelcomeStep.TEAM_SETUP);
    }
  }

  async function handleTeamSetupNext() {
    setCurrentStep(WelcomeStep.LOADING_WORKSPACE);
    await createSchoolAndUsers();
  }

  const handleClose = () => {
    signOut({ redirect: true, callbackUrl: PATH_AUTH.login });
  };

  const currentProgress = currentStep === WelcomeStep.VIDEO ? videoProgress : STEP_PROGRESS[currentStep];

  function onLoadingWorkspaceComplete() {
    const handleRouteChange = (url: string) => {
      if (url === '/onboarding') {
        setCurrentStep(WelcomeStep.VIDEO);
        router.events.off('routeChangeComplete', handleRouteChange);
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    router.push('/onboarding');
  }

  const stepComponents = {
    [WelcomeStep.VIDEO]: (
      <VideoStep
        onNext={() => setCurrentStep(WelcomeStep.INSTITUTION_SETUP)}
        onProgressChange={(progress) => setVideoProgress(progress)}
      />
    ),

    [WelcomeStep.INSTITUTION_SETUP]: (
      <InstitutionSetupStep onNext={() => setCurrentStep(WelcomeStep.TEAM_SETUP)} progress={currentProgress} />
    ),

    [WelcomeStep.TEAM_SETUP]: <TeamSetupStep onNext={handleTeamSetupNext} />,

    [WelcomeStep.LOADING_WORKSPACE]: (
      <LoadingWorkspace
        onComplete={onLoadingWorkspaceComplete}
        operationsComplete={operationsComplete}
        failedStep={failedStep}
      />
    ),
  };

  const shouldShowHeader = currentStep !== WelcomeStep.LOADING_WORKSPACE;

  const backHandlers: Partial<Record<WelcomeStep, () => void>> = {
    [WelcomeStep.INSTITUTION_SETUP]: () => setCurrentStep(WelcomeStep.VIDEO),
    [WelcomeStep.TEAM_SETUP]: () => setCurrentStep(WelcomeStep.INSTITUTION_SETUP),
  };

  return (
    <Sentry.ErrorBoundary
      beforeCapture={(scope) => {
        scope.setTag('page', 'welcome');
        scope.setContext('welcomeFlow', {
          currentStep,
          currentProgress,
        });
      }}
    >
      <div className="bg-white w-full h-screen relative">
        {shouldShowHeader && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200">
            <ConfigurationHeader
              title={currentStep === WelcomeStep.VIDEO ? '¡Bienvenido a Cometa!' : 'Configuración inicial'}
              progress={currentProgress}
              onBack={backHandlers[currentStep]}
              onClose={currentStep === WelcomeStep.VIDEO ? undefined : handleClose}
              variant="fixed-height"
              leftContent={
                currentStep === WelcomeStep.VIDEO ? (
                  <>
                    <WelcomeSchoolSelector />
                    <div className="w-[1px] h-6 bg-neutral-300" />
                  </>
                ) : undefined
              }
            />
          </div>
        )}
        <div>{stepComponents[currentStep] || stepComponents[WelcomeStep.VIDEO]}</div>
      </div>
    </Sentry.ErrorBoundary>
  );
}

WelcomePage.auth = false;

export default WelcomePage;
