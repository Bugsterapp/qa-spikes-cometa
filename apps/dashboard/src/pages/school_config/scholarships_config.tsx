import { PartialPaymentInterestTypeEnum, ScholarshipLostConfigEnum } from '@cometa/trpc';
import { OnboardingTaskId, OnboardingTaskStatus } from '@cometa/trpc/src/bot/types';
import * as Sentry from '@sentry/nextjs';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import CAlert from '../../components/atoms/CAlert';
import { useFlagWithVariableMatching } from '../../components/flags/FlagsProvider';
import Layout from '../../components/layouts';
import {
  FormActions,
  FormRadioGroup,
  PageStateHandler,
  type RadioOption,
  AdjustmentRulesDetailView,
} from '../../components/school_config';
import { TrackEvents } from '../../constants/events';
import { useGetMembership, useSelectedSchool } from '../../guards/AuthGuard';
import { useOnboardingState } from '../../hooks/onboarding/useOnboardingState';
import { useOnboardingTaskPreLoad } from '../../hooks/onboarding/useOnboardingTaskPreLoad';
import useAlert from '../../hooks/useAlert';
import { useSendEvent } from '../../hooks/useSendEvent';
import useSendPageViewedEvent from '../../hooks/useSendPageViewedEvent';
import { api } from '../../utils/api';
import Chevron from '/public/assets/icons/chevron.svg';

type ScholarshipConfigFormData = {
  multipleScholarships?: 'add_up' | 'accumulate';
  latePaymentCase?: ScholarshipLostConfigEnum;
  canApplyInterest?: 'yes' | 'no';
  canApplyEarlyDiscount?: 'yes' | 'no';
  partialPaymentIncrease?: 'yes' | 'no';
  partialPaymentCalculation?: PartialPaymentInterestTypeEnum;
};

const multipleScholarshipsOptions: RadioOption[] = [
  { id: 'add_up', value: 'add_up', label: 'Se suman las becas' },
  { id: 'accumulate', value: 'accumulate', label: 'Se acumulan las becas' },
];

const latePaymentOptions: RadioOption[] = [
  { id: 'maintains', value: ScholarshipLostConfigEnum.NotLost, label: 'Mantiene la beca' },
  { id: 'loses_month', value: ScholarshipLostConfigEnum.ByOrder, label: 'Pierde la beca solo para ese mes' },
  {
    id: 'loses_remaining',
    value: ScholarshipLostConfigEnum.ByStudent,
    label: 'Pierde la beca para todos los meses restantes',
  },
];

const yesNoOptions: RadioOption[] = [
  { id: 'yes', value: 'yes', label: 'Sí' },
  { id: 'no', value: 'no', label: 'No' },
];

const partialPaymentCalculationOptions: RadioOption[] = [
  { id: 'original_amount', value: PartialPaymentInterestTypeEnum.Total, label: 'Aplica sobre el monto original' },
  {
    id: 'remaining_amount',
    value: PartialPaymentInterestTypeEnum.Partial,
    label: 'Aplica sobre el monto restante por pagar',
  },
  { id: 'does_not_apply', value: PartialPaymentInterestTypeEnum.NoAply, label: 'No aplica' },
];

const ScholarshipInfoAlert = ({ title, message }: { title: string; message: string }) => (
  <div className="w-full mt-2">
    <CAlert
      type="info"
      title={title}
      message={message}
      className="items-start bg-[#E8F4FF] [&>div]:min-w-0 [&>div]:!flex-col [&>div>p]:whitespace-normal [&>span:first-child]:flex-shrink-0"
    />
  </div>
);

const MultipleScholarshipsInfoBoxes = ({ selectedValue }: { selectedValue: string }) => {
  if (selectedValue === 'add_up') {
    return (
      <ScholarshipInfoAlert
        title="Se suman las becas"
        message="Si un estudiante tiene primero una beca del 20%, y luego se aplica otra beca del 10%, se calcula la suma de las becas sobre el monto original. Por lo que el descuento total en su colegiatura será del 30%."
      />
    );
  }

  if (selectedValue === 'accumulate') {
    return (
      <ScholarshipInfoAlert
        title="Se acumulan las becas"
        message="Si un estudiante tiene primero una beca del 20%, y luego se le aplica una beca del 10% adicional, la segunda se calcula sobre el monto ya descontando la primera beca. Por lo que el descuento total en su colegiatura será del 28%."
      />
    );
  }

  return null;
};

const LatePaymentInfoBoxes = ({ selectedValue }: { selectedValue: string }) => {
  if (selectedValue === ScholarshipLostConfigEnum.NotLost) {
    return <ScholarshipInfoAlert title="Mantiene la beca" message="Sin efecto, el descuento de la beca se mantiene." />;
  }

  if (selectedValue === ScholarshipLostConfigEnum.ByOrder) {
    return (
      <ScholarshipInfoAlert
        title="Pierde la beca solo para ese mes"
        message="Ejemplo: Si el estudiante no paga la colegiatura de Marzo, pierde el descuento de la beca solo para la colegiatura de Marzo."
      />
    );
  }

  if (selectedValue === ScholarshipLostConfigEnum.ByStudent) {
    return (
      <ScholarshipInfoAlert
        title="Pierde la beca para todos los meses restantes"
        message="Ejemplo: Si el estudiante no paga la colegiatura de Marzo, pierde el descuento de la beca para la colegiatura de Marzo en adelante (también de Abril, Mayo, etc.)"
      />
    );
  }

  return null;
};

export default function ScholarshipsConfigPage() {
  const selectedSchool = useSelectedSchool();
  const membership = useGetMembership();
  const { setAlertState } = useAlert();
  const sendEvent = useSendEvent();
  const { isEnabled: enableAdjustmentRulesOrderFlag } = useFlagWithVariableMatching(
    'enable_discount_surcharge_order_config'
  );

  useSendPageViewedEvent('Configuración de becas y recargos', selectedSchool);

  const { shouldPreLoadSettings, isFirstTimeOnboarding } = useOnboardingTaskPreLoad({
    taskId: OnboardingTaskId.DiscountsSurcharges,
    selectedSchool,
  });
  const { updateTaskStatus } = useOnboardingState();

  const [showAdjustmentRulesConfig, setShowAdjustmentRulesConfig] = useState(false);

  const allowedMemberships = ['OWNER', 'GENERAL_DIRECTOR', 'ADMINISTRATIVE_DIRECTOR'];
  const canViewPage = allowedMemberships.includes(membership ?? '');

  const {
    data: schoolData,
    isPending: isLoading,
    refetch,
  } = api.schools.schoolDetail.useQuery({ id: selectedSchool?.id ?? '' }, { enabled: !!selectedSchool?.id });

  const getMultipleScholarshipsValue = (
    isAccumulative: boolean | undefined
  ): ScholarshipConfigFormData['multipleScholarships'] => (isAccumulative === false ? 'add_up' : 'accumulate');

  const getCanApplyInterestValue = (
    applyInterest: boolean | undefined
  ): ScholarshipConfigFormData['canApplyInterest'] => (applyInterest === true ? 'yes' : 'no');

  const getCanApplyEarlyDiscountValue = (
    applyEarlyBird: boolean | undefined
  ): ScholarshipConfigFormData['canApplyEarlyDiscount'] => (applyEarlyBird === true ? 'yes' : 'no');

  const getPartialPaymentIncreaseValue = (
    interestFreeze: boolean | undefined
  ): ScholarshipConfigFormData['partialPaymentIncrease'] => (interestFreeze === false ? 'yes' : 'no');

  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<ScholarshipConfigFormData>({
    mode: 'onChange',
  });

  const multipleScholarshipsValue = watch('multipleScholarships');
  const latePaymentCaseValue = watch('latePaymentCase');

  const updateSchoolMutation = api.schools.partialUpdateSchool.useMutation({
    onSuccess: async () => {
      refetch();
      setAlertState({
        open: true,
        severity: 'success',
        message: 'Configuración de becas y recargos actualizada correctamente',
      });
      sendEvent(TrackEvents.scholarships.configurationUpdated);

      if (isFirstTimeOnboarding) {
        try {
          await updateTaskStatus(OnboardingTaskId.DiscountsSurcharges, OnboardingTaskStatus.Completed);
        } catch (error) {
          Sentry.captureException(error, {
            tags: { feature: 'update_onboarding_task_status' },
            extra: { schoolId: selectedSchool?.id },
          });
        }
      }
    },
    onError: (error) => {
      setAlertState({
        open: true,
        severity: 'error',
        message: error.message ?? 'Error al actualizar la configuración',
      });
      sendEvent(TrackEvents.scholarships.configurationUpdateFailed, {
        error: error.message ?? 'Unknown error',
      });
    },
  });

  useEffect(() => {
    if (schoolData && shouldPreLoadSettings) {
      reset({
        multipleScholarships: getMultipleScholarshipsValue(schoolData?.scholarship_is_accumulative),
        latePaymentCase: schoolData?.scholarship_lost_config,
        canApplyInterest: getCanApplyInterestValue(schoolData?.scholarship_config?.apply_interest),
        canApplyEarlyDiscount: getCanApplyEarlyDiscountValue(schoolData?.scholarship_config?.apply_early_bird),
        partialPaymentIncrease: getPartialPaymentIncreaseValue(schoolData?.partial_payment_interest_freeze),
        partialPaymentCalculation: schoolData?.partial_payment_interest_type,
      });
    }
  }, [schoolData, reset, shouldPreLoadSettings]);

  const onSubmit = (formData: ScholarshipConfigFormData) => {
    if (!selectedSchool?.id) {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'No se pudo identificar el colegio',
      });
      return;
    }

    const apiData = {
      scholarship_is_accumulative: formData.multipleScholarships === 'accumulate',
      scholarship_lost_config: formData.latePaymentCase,
      scholarship_config: {
        apply_interest: formData.canApplyInterest === 'yes',
        apply_early_bird: formData.canApplyEarlyDiscount === 'yes',
      },
      partial_payment_interest_freeze: formData.partialPaymentIncrease === 'no',
      partial_payment_interest_type: formData.partialPaymentCalculation,
    };

    updateSchoolMutation.mutate({
      school_id: selectedSchool.id,
      data: apiData,
    });
  };

  if (showAdjustmentRulesConfig && enableAdjustmentRulesOrderFlag) {
    return (
      <PageStateHandler canViewPage={canViewPage} isLoading={isLoading} selectedSchool={selectedSchool}>
        <AdjustmentRulesDetailView
          selectedSchool={selectedSchool}
          onBack={() => setShowAdjustmentRulesConfig(false)}
          hasExistingConfiguration={!isFirstTimeOnboarding}
        />
      </PageStateHandler>
    );
  }

  return (
    <PageStateHandler canViewPage={canViewPage} isLoading={isLoading} selectedSchool={selectedSchool}>
      <div className="w-full h-full">
        <div className="w-full top-0 sticky z-10 bg-white">
          <div className="w-full max-w-[540px] mx-auto pt-[24px] pb-[8px] px-8 sm:px-0">
            <div className="flex items-center justify-between h-[72px] gap-[24px]">
              <h1 className="text-[#212B36] text-2xl font-bold font-lota">Configuración de becas y recargos</h1>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start px-8 sm:px-0 pt-0 pb-28 flex-1 w-full bg-white rounded-xl shadow-none">
          <div className="w-full max-w-[540px] mx-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-start gap-10 w-full">
              <div className="flex flex-col items-start gap-4 w-full">
                <FormRadioGroup
                  title="¿Cuando un estudiante tiene múltiples becas, cómo se calculan?"
                  name="multipleScholarships"
                  control={control}
                  options={multipleScholarshipsOptions}
                  errors={errors}
                >
                  <MultipleScholarshipsInfoBoxes selectedValue={multipleScholarshipsValue ?? ''} />
                </FormRadioGroup>

                <FormRadioGroup
                  title="Si un estudiante becado no paga a tiempo un mes de colegiatura, ¿Qué pasa con la beca del estudiante?"
                  name="latePaymentCase"
                  control={control}
                  options={latePaymentOptions}
                  errors={errors}
                >
                  <LatePaymentInfoBoxes selectedValue={latePaymentCaseValue ?? ''} />
                </FormRadioGroup>

                <FormRadioGroup
                  title="¿Si un estudiante tiene una beca, se le puede aplicar un recargo?"
                  name="canApplyInterest"
                  control={control}
                  options={yesNoOptions}
                  errors={errors}
                />

                <FormRadioGroup
                  title="¿Si el estudiante tiene una beca, se le puede aplicar un descuento por pronto pago?"
                  name="canApplyEarlyDiscount"
                  control={control}
                  options={yesNoOptions}
                  errors={errors}
                />

                <FormRadioGroup
                  title="Si un estudiante realiza un pago parcial, ¿Los recargos dejan de aumentar?"
                  name="partialPaymentIncrease"
                  control={control}
                  options={yesNoOptions}
                  errors={errors}
                />

                <FormRadioGroup
                  title="Si un estudiante realiza un pago parcial, ¿Sobre qué monto se calculan los recargos?"
                  name="partialPaymentCalculation"
                  control={control}
                  options={partialPaymentCalculationOptions}
                  errors={errors}
                />

                {enableAdjustmentRulesOrderFlag && (
                  <>
                    <div className="w-full h-px bg-[#e5e7eb]" />

                    <div className="w-full">
                      <button
                        onClick={() => {
                          setShowAdjustmentRulesConfig(true);
                          window.scrollTo({ top: 0, behavior: 'instant' });
                        }}
                        className="w-full border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50 transition-colors text-left"
                        type="button"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-base font-semibold text-neutral-800 mb-1">
                              Órden de aplicación de becas y recargos
                            </h3>
                            <p className="text-sm text-neutral-500">
                              Define el orden en que se aplican los diferentes tipos de descuentos y recargos, y su
                              método de cálculo.
                            </p>
                          </div>
                          <Chevron className="w-5 h-5 text-neutral-400 flex-shrink-0 rotate-[-90deg]" />
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>

              <FormActions
                isLoading={updateSchoolMutation.isPending}
                onCancel={() => reset()}
                showCancel={!isFirstTimeOnboarding}
              />
            </form>
          </div>
        </div>
      </div>
    </PageStateHandler>
  );
}

ScholarshipsConfigPage.getLayout = function getLayout(page: JSX.Element) {
  return (
    <Layout title="Configuración de becas y recargos" dashboardVariant="stretch">
      {page}
    </Layout>
  );
};

ScholarshipsConfigPage.auth = true;
