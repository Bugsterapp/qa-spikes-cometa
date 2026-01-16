import { useUTMRouter as useRouter } from '~/components/UtmNavigation';
import React, { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import useSendPageViewedEvent from '~/hooks/useSendPageViewedEvent';
import LinearProgress from '~/components/atoms/LinearProgress';
import { Session } from 'next-auth/core/types';
import useSendTrackEvent from '~/hooks/useSendEvent';
import { GetServerSidePropsContext } from 'next';
import { create } from 'zustand';
import {
  OnboardingBillingInfo,
  OnboardingGuardianInfo,
  OnboardingStudentInfo,
  OnboardingSummary,
} from '~/components/OnboardingSteps';
import { AnimatePresence, motion } from 'framer-motion';
import Arrow from '~/public/icons/ic_arrow_right.svg';
import { OnboardingStageEnum, TaxingTypeEnum } from '@cometa/trpc/src/types';
import { devtools } from 'zustand/middleware';

import { api } from '~/utils/api';
import taxRegimeValues from '~/utils/static_data/taxRegimeValues';
import { personTypeDefault } from '~/utils/static_data/personTypesTaxRegimen';
import { taxingTypeValues } from '~/server/api/routers/guardian';
import { useGetSchools } from '~/stores/globalStore';
import { appendUtmParameters } from '~/lib/destinationWithUTM';

interface OnboardingProps {
  session: Session;
  guardianHash: string;
}

const formSteps = ['PROFILE', 'STUDENTS', 'BILLING', 'COMPLETED', 'SUMMARY'];

type OnboardingStep = keyof typeof OnboardingStageEnum | 'SUMMARY';
interface PollingType {
  maxValue: number;
  currentValue: number;
}
type OnboardingStateType = {
  step: OnboardingStep | null;
  setOnboardingStep: (step: OnboardingStep) => void;
  editStudent: boolean;
  setEditStudent: (edit: boolean) => void;
  selectedStudent: string | null;
  setSelectedStudent: (selected: string | null) => void;
  summaryEdit: boolean;
  setSummaryEdit: (edit: boolean) => void;
  openFormStudent: boolean;
  setOpenFormStudent: (open: boolean) => void;
  polling: PollingType;
  isPolling: boolean;
  setIsPolling: (isPolling: boolean) => void;
  setPolling: ({ maxValue, currentValue }: PollingType) => void;
  isRecentAdded: boolean;
  setIsRecentAdded: (isRecentAdded: boolean) => void;
};

const useOnboardingState = create<OnboardingStateType>()(
  devtools((set) => ({
    step: 'PROFILE',
    setOnboardingStep: (step) => set({ step }),
    editStudent: false,
    setEditStudent: (edit) => set({ editStudent: edit }),
    selectedStudent: null,
    setSelectedStudent: (selected) => set({ selectedStudent: selected }),
    summaryEdit: false,
    setSummaryEdit: (edit) => set({ summaryEdit: edit }),
    openFormStudent: false,
    setOpenFormStudent: (open) => set({ openFormStudent: open }),
    polling: {
      maxValue: 0,
      currentValue: 0,
    },
    setPolling: ({ maxValue, currentValue }) => set({ polling: { maxValue, currentValue } }),
    isPolling: false,
    setIsPolling: (isPolling) => set({ isPolling }),
    isRecentAdded: false,
    setIsRecentAdded: (isRecentAdded) => set({ isRecentAdded }),
  }))
);

const useCurrentStepValue = (formSteps: OnboardingStep[]) =>
  useOnboardingState((state) => {
    if (!state.step) return 0;
    const currentStepIndex = formSteps.indexOf(state.step);
    const totalSteps = formSteps.length;
    const increment = 90 / (totalSteps - 1);

    return currentStepIndex === 0 ? 10 : 10 + increment * currentStepIndex;
  });

const useSetStep = () => useOnboardingState((state) => state.setOnboardingStep);
const useStep = () => useOnboardingState((state) => state.step);
export const useEditStudent = () => useOnboardingState((state) => [state.editStudent, state.setEditStudent] as const);
export const useSelectedStudent = () =>
  useOnboardingState((state) => [state.selectedStudent, state.setSelectedStudent] as const);
export const useSummaryEdit = () => useOnboardingState((state) => [state.summaryEdit, state.setSummaryEdit] as const);
export const useOpenFormStudent = () =>
  useOnboardingState((state) => [state.openFormStudent, state.setOpenFormStudent] as const);
export const usePolling = () => useOnboardingState((state) => [state.polling, state.setPolling] as const);
export const useSetPolling = () => useOnboardingState((state) => state.setPolling);
export const useIsPolling = () => useOnboardingState((state) => [state.isPolling, state.setIsPolling] as const);
export const useIsRecentAdded = () =>
  useOnboardingState(({ isRecentAdded, setIsRecentAdded }) => ({ isRecentAdded, setIsRecentAdded }));

function Onboarding({ session, guardianHash }: OnboardingProps) {
  const _router = useRouter();
  const schoolsOfGuardian = useGetSchools();
  const [showAlert, setShowAlert] = useState(false);
  const sendTrackEvent = useSendTrackEvent();

  const onboardingStage = session?.user.onboarding_stage as OnboardingStageEnum;

  const setStep = useSetStep();

  const step = useStep();
  const [summaryEdit, setSummaryEdit] = useSummaryEdit();
  const [edit, setEdit] = useEditStudent();
  const [selected, setSelected] = useSelectedStudent();
  const [openFormStudent, setOpenFormStudent] = useOpenFormStudent();

  const {
    data: guardianData,
    refetch: refetchGuardian,
    isLoading: isLoadingInfo,
  } = api.guardian.get.useQuery({ id: session?.user.id || '' });
  const {
    data: guardianStudents,
    isFetching: isLoadingStudents,
    refetch,
  } = api.guardian.studentList.useQuery(undefined);
  const guardianMutation = api.guardian.update.useMutation();
  const studentMutation = api.student.update.useMutation();
  const createStudentMutation = api.schools.createStudent.useMutation();

  React.useEffect(() => {
    if (onboardingStage !== step) {
      setStep(onboardingStage);
    }
  }, [onboardingStage, setStep]);

  useSendPageViewedEvent('Onboarding');

  useEffect(() => {
    if (session?.user?.onboarding_stage === 'COMPLETED') {
      _router.push(`/guardians/${guardianHash}`);
    } else {
      sendTrackEvent('portal: Onboarding Started', {
        origin: _router.asPath,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guardianHash]);

  const value = useCurrentStepValue(formSteps as OnboardingStep[]);
  const allowStudentEdit = Boolean(guardianData?.schools[0]?.config_dashboard?.student_edit_onboarding);

  const invoiceDisabled = schoolsOfGuardian.every((school) => !school.does_invoice);

  const back = () => {
    if ((edit || summaryEdit || !selected) && step === 'STUDENTS' && openFormStudent) {
      setShowAlert(true);
      return;
    }

    if (summaryEdit) {
      setSummaryEdit(false);
      setStep('SUMMARY');
      return;
    }

    if (edit && step === 'BILLING') {
      setEdit(false);
      return;
    }
    if (selected && !edit && openFormStudent) {
      setSelected(null);
      setOpenFormStudent(false);
      return;
    }

    if (step === 'SUMMARY') {
      if (invoiceDisabled) {
        setStep('PROFILE');
        return;
      }
      setStep('BILLING');
      return;
    }

    if (!allowStudentEdit && step === 'BILLING') {
      setStep('PROFILE');
      return;
    }

    const currentStepIndex = formSteps.indexOf(step as string);
    setStep(formSteps[currentStepIndex - 1] as OnboardingStep);
  };

  return (
    <>
      {((!allowStudentEdit && step !== 'SUMMARY') || allowStudentEdit) && (
        <div className="flex items-center gap-7">
          <AnimatePresence>
            {((step && formSteps.indexOf(step) > 0) || _router.query.step?.includes('student-edit') || summaryEdit) && (
              <motion.button
                className="flex items-center justify-center flex-shrink-0 p-2 bg-white rounded-full w-9 h-9"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={() => back()}
              >
                <Arrow className="text-[#4A5CFF] w-3 rotate-180" />
              </motion.button>
            )}
          </AnimatePresence>
          <LinearProgress value={summaryEdit ? 100 : value} />
        </div>
      )}
      <div className="py-10">
        {step === 'PROFILE' && (
          <OnboardingGuardianInfo
            school={session.user.schools[0]}
            key={`${guardianData?.first_name}_${guardianData?.last_name}_${guardianData?.email}_${guardianData?.phone}`}
            isLoading={guardianMutation.isPending}
            disabled={!allowStudentEdit}
            onSubmit={async (values) => {
              try {
                const res = await guardianMutation.mutateAsync({
                  id: session.user.id,
                  data: {
                    email: values.email,
                    last_name: values.last_name,
                    first_name: values.name,
                    phone: values.phone,
                    terms_acceptance: {
                      amount: 0,
                      signed_site: _router.pathname,
                    },
                    ...(!summaryEdit ? { onboarding_stage: allowStudentEdit ? 'STUDENTS' : 'BILLING' } : undefined),
                  },
                  query: { force: true },
                });

                if (res.error) {
                  return { data: res.data, status: res.status };
                }
                refetchGuardian();
                if (!summaryEdit) {
                  sendTrackEvent('portal: Onboarding Step 1 Complete', {
                    schoolName: session.user.schools[0].name,
                    schoolId: session.user.schools[0].id,
                    guardianId: session.user.id,
                  });
                  if (invoiceDisabled) {
                    setStep('SUMMARY');
                    return;
                  }
                  if (allowStudentEdit) {
                    setStep('STUDENTS');
                  } else {
                    setStep('BILLING');
                  }
                } else {
                  setSummaryEdit(false);
                  setStep('SUMMARY');
                }
              } catch {
                throw new Error('Failed to update guardian');
              }
            }}
            initialData={{
              phone: guardianData?.phone ?? undefined,
              email: guardianData?.email ?? undefined,
              last_name: guardianData?.last_name ?? undefined,
              name: guardianData?.first_name ?? undefined,
            }}
            isLoadingInfo={isLoadingInfo}
          />
        )}
        {step === 'STUDENTS' && (
          <OnboardingStudentInfo
            isOnboarding
            allowEdit={allowStudentEdit}
            allowAdd={guardianData?.schools.length === 1 && Boolean(guardianData.schools[0].is_provider)}
            schoolId={guardianData?.schools[0].id ?? ''}
            isLoading={studentMutation.isPending || isLoadingStudents}
            onSubmit={async ({ id, birthdate, ...values }) => {
              const manageResponse = (res: Record<string, any>) => {
                if (res.error) {
                  return { data: res.data, status: res.status };
                }

                refetch();
                if (summaryEdit) {
                  setSummaryEdit(false);
                  setStep('SUMMARY');
                  setSelected(null);
                }
              };

              const student_birthdate = `${birthdate.year}-${birthdate.month
                .toString()
                .padStart(2, '0')}-${birthdate.day.toString().padStart(2, '0')}`;
              if (!id) {
                return createStudentMutation
                  .mutateAsync({
                    data: [
                      {
                        ...values,
                        birthdate: student_birthdate,
                        school: guardianData?.schools[0].id ?? '',
                      },
                    ],
                  })
                  .then((res) => manageResponse(res));
              }
              return studentMutation
                .mutateAsync({ id: id, data: { ...values, birthdate: student_birthdate } })
                .then((res) => manageResponse(res));
            }}
            students={guardianStudents ?? []}
            onContinue={() => {
              guardianMutation.mutate({ id: session.user.id, data: { onboarding_stage: 'BILLING' } });
              sendTrackEvent('portal: Onboarding Student Complete', {
                schoolName: session.user.schools[0].name,
                schoolId: session.user.schools[0].id,
                guardianId: session.user.id,
              });
              if (invoiceDisabled) {
                setStep('SUMMARY');
              } else {
                setStep('BILLING');
              }
            }}
            showAlert={showAlert}
            hideAlert={() => {
              setShowAlert(false);
            }}
            confirmAlert={() => {
              setShowAlert(false);
              setEdit(false);
              if (summaryEdit) {
                setSummaryEdit(false);
                setStep('SUMMARY');
              }
            }}
          />
        )}
        {step === 'BILLING' && (
          <OnboardingBillingInfo
            isLoading={guardianMutation.isPending || isLoadingStudents}
            onSubmit={(values) =>
              guardianMutation
                .mutateAsync({
                  id: session.user.id,
                  data: {
                    tax_id: values.rfc,
                    billing_name: values.billingName,
                    postal_code: values.postalCode,
                    taxing_system: values.taxRegime.value,
                    taxing_type: values.personType as taxingTypeValues,
                  },
                })
                .then((res) => {
                  if (res.error) {
                    return { data: res.data, status: res.status };
                  }
                  sendTrackEvent('portal: Onboarding Invoice Opt-In Complete', {
                    schoolName: session.user.schools[0].name,
                    schoolId: session.user.schools[0].id,
                    guardianId: session.user.id,
                  });
                  refetchGuardian();
                  setStep('SUMMARY');
                  if (summaryEdit) {
                    setSummaryEdit(false);
                    setEdit(false);
                  }
                })
            }
            onCancel={() => {
              setStep('SUMMARY');
            }}
            studentList={guardianStudents ?? []}
            initialData={{
              billingName: guardianData?.billing_name ?? undefined,
              rfc: guardianData?.tax_id ?? undefined,
              taxRegime: taxRegimeValues.find((tax) => tax.value === guardianData?.taxing_system) ?? undefined,
              personType: (guardianData?.taxing_type ?? personTypeDefault) as TaxingTypeEnum | undefined,
              postalCode: guardianData?.postal_code ?? undefined,
            }}
          />
        )}

        {step === 'SUMMARY' && (
          <OnboardingSummary
            invoiceDisabled={invoiceDisabled}
            disabled={!allowStudentEdit}
            user={guardianData}
            students={guardianStudents ?? []}
            onConfirm={() => {
              guardianMutation
                .mutateAsync({ id: session.user.id, data: { onboarding_stage: 'COMPLETED' } })
                .then(() => {
                  sendTrackEvent('portal: Onboarding Complete');
                  _router.push(`/guardians/${guardianHash}`);
                });
            }}
            onUserEdit={() => {
              setSummaryEdit(true);
              setStep('PROFILE');
            }}
            onStudentEdit={(id) => {
              setEdit(true);
              setSelected(id);
              setSummaryEdit(true);
              setOpenFormStudent(true);
              setStep('STUDENTS');
            }}
            onBillingEdit={() => {
              setEdit(true);
              setSummaryEdit(true);
              setStep('BILLING');
            }}
          />
        )}
      </div>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);
  const { guardianHash } = context?.query || { guardianHash: '' };

  const hasProviderSchool = Boolean(session?.user.schools.some((s) => s.is_provider));

  if (session && session.user?.onboarding_stage === 'COMPLETED') {
    return {
      redirect: {
        permanent: false,
        destination: appendUtmParameters(`/guardians/${guardianHash}/`, context.query),
      },
    };
  }

  if (!hasProviderSchool) {
    return {
      redirect: {
        permanent: false,
        destination: appendUtmParameters(`/onboarding`, context.query),
      },
    };
  }
  return {
    props: {
      session,
      guardianHash,
    },
  };
}

Onboarding.auth = true;

Onboarding.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Onboarding</title>
      </Head>
      <div className="bg-gradient-to-t from-[#BEBDFF66]/40 to-[#D3EFFF66]/40 pt-6 px-5 min-h-screen">
        <div className="flex flex-col max-w-sm mx-auto">{page}</div>
      </div>
    </>
  );
};

export default Onboarding;
