import { AvailableScholarship, DashboardStudent } from '@cometa/trpc/src/types';
import * as Sentry from '@sentry/nextjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';

import Dialog from '/src/components/atoms/Dialog';
import ScholarshipData from '/src/components/molecules/dashboard/ScholarshipData';
import SidebarHeader from '/src/components/molecules/dashboard/SidebarHeader';
import Button from '/src/components/organisms/dashboard/Button';
import { FormValuesScholarship } from '/src/components/organisms/dashboard/TabsTablesScholarships';
import { StudentScholarshipAssignDetail } from '/src/components/students/StudentScholarshipAssignDetail';
import { StudentScholarshipAssignForm } from '/src/components/students/StudentScholarshipAssignForm';
import ScholarshipValidationDialog from '/src/components/students/ScholarshipValidationDialog';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import useAlert from '/src/hooks/useAlert';
import { useFlagWithVariableMatching } from '/src/components/flags/FlagsProvider';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { Events } from '/src/constants/events';
import ApiClient from '/src/services/ApiClient';
import { api } from '/src/utils/api';
import { QUERY_KEY_DUE_ORDERS_STUDENT, QUERY_KEY_SCHOLARSHIPS } from '/src/utils/reactQueryKeys';

const StudentScholarshipAssign = ({ onClose, student }: { onClose: () => void; student?: DashboardStudent }) => {
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [currentScholarship, setCurrentScholarship] = useState<any>(null);
  const selectedSchool = useSelectedSchool();
  const { setAlertState } = useAlert();
  const router = useRouter();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const [step, setStep] = useState(1);
  const [assignData, setAssignData] = useState<FormValuesScholarship>();
  const utils = api.useUtils();
  const { isEnabled: scholarshipsFlag } = useFlagWithVariableMatching('hk_scholarships');

  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validationData, setValidationData] = useState<any>(null);
  const [confirmSponsoredPayment, setConfirmSponsoredPayment] = useState(false);

  const sortByIsAssigned = (data: AvailableScholarship[] | undefined) =>
    data?.sort((a, b) => (a.is_already_assigned as any) - (b.is_already_assigned as any));

  const { data: scholarshipDetail, isFetching } = api.scholarships.scholarshipDetails.useQuery(
    { scholarshipId: currentScholarship?.id, studentId: student?.id || '' },
    {
      enabled: !!currentScholarship?.id && !!selectedSchool?.id && !!student?.id,
      meta: { logErrorToSentry: true },
    }
  );

  const orders_to_skip = scholarshipDetail?.affected_concepts?.flatMap((fultillment) => fultillment.fulfillments);

  const { data: scholarships } = api.scholarships.availableScholarships.useQuery(
    {
      studentId: student?.id || '',
      schoolId: selectedSchool?.id as string,
    },
    {
      enabled: !!selectedSchool?.id && !!student?.id,
      select: useCallback(sortByIsAssigned, []),
      meta: { logErrorToSentry: true },
    }
  );

  const assignScholarship = async () =>
    await ApiClient.postScholarshipAssignment(
      student?.id,
      currentScholarship?.id,
      orders_to_skip?.map((order) => order.order)
    );

  const oldMutation = useMutation({
    mutationFn: assignScholarship,
    async onSuccess() {
      utils.students.studentsScholarshipList.invalidate();
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_SCHOLARSHIPS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_DUE_ORDERS_STUDENT] });

      onClose();
      setAlertState({ open: true, severity: 'success', message: '¡Se asignó la beca correctamente!' });
      sendTrackEventWithUserName(Events.scholarship_assigned);
      router.push('#table-for-scholarships');
    },
  });

  const mutation = api.students.studentScholarshipAssignV2.useMutation({
    onSuccess() {
      setShowValidationDialog(false);
      setValidationData(null);
      setConfirmSponsoredPayment(false);
      onClose();
      utils.students.studentsScholarshipList.invalidate();
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_SCHOLARSHIPS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_DUE_ORDERS_STUDENT] });

      setAlertState({ open: true, severity: 'success', message: '¡Se asignó la beca correctamente!' });
      sendTrackEventWithUserName(Events.scholarship_assigned);
      router.push('#table-for-scholarships');
    },
    onError(err) {
      const sponsoredData = err.data?.customData?.sponsoredPayment || (err.data?.cause as any);
      let errorMessage = 'Ocurrió un error inesperado, por favor intenta de nuevo.';

      if (err.data?.httpStatus === 409 && sponsoredData?.error === 'sponsored_payment_risk') {
        setValidationData(sponsoredData);
        setShowValidationDialog(true);
        return;
      }

      const errorData = sponsoredData;

      try {
        if (typeof errorData?.message === 'string') {
          const parsedError = JSON.parse(errorData.message);
          if (parsedError.error && parsedError.error.includes('Scholarship already assigned')) {
            errorMessage = 'Este estudiante ya tiene esta beca asignada.';
          }
        }
      } catch (e) {
        if (errorData?.message && errorData.message.includes('Scholarship already assigned')) {
          errorMessage = 'Este estudiante ya tiene esta beca asignada.';
        }
      }

      setAlertState({
        open: true,
        severity: 'error',
        message: errorMessage,
      });
      Sentry.captureException(err);
      sendTrackEventWithUserName(Events.scholarship_error_assigning, { error: err.message });
    },
  });

  const parsePayload = () => {
    const payload = assignData?.cycles?.map((cycle) => ({
      scholarship_id: currentScholarship?.id || '',
      orders_to_skip: orders_to_skip?.map((order) => order.order) || [],
      school_cycle_id: cycle.school_cycle,
      student_id: student?.id || '',
      school_id: selectedSchool?.id as string,
      date_ranges: cycle.dates.map((date) => ({
        start_date: date.date_start.toISOString(),
        end_date: date.date_end.toISOString(),
      })),
    }));

    return payload;
  };

  const onClickAssign = async () => {
    if (mutation.isPending) return;
    sendTrackEventWithUserName(Events.scholarship_click_assign);
    if (scholarshipsFlag) {
      const payload = parsePayload();
      mutation.mutate({
        data: payload || [],
        studentId: student?.id || '',
        confirmSponsoredPayment,
      });
    } else {
      oldMutation.mutate();
    }
  };

  const handleConfirmValidation = () => {
    setConfirmSponsoredPayment(true);
    setShowValidationDialog(false);
    const payload = parsePayload();
    mutation.mutate({
      data: payload || [],
      studentId: student?.id || '',
      confirmSponsoredPayment: true,
    });
  };

  const handleCancelValidation = () => {
    setShowValidationDialog(false);
    setValidationData(null);
    setConfirmSponsoredPayment(false);
  };

  const onNext = () => {
    setStep((prev) => prev + 1);
  };

  const onHandleAddData = (data: FormValuesScholarship) => {
    setAssignData(data);
    onNext();
  };

  return (
    <>
      <div className="flex flex-col flex-auto h-full px-9">
        <SidebarHeader
          title="Asignar beca o descuento"
          disabled={mutation.isPending}
          onClose={() => {
            if (currentScholarship) {
              setOpenDialog(true);
            } else {
              onClose();
            }
          }}
        />
        <div className="h-full mt-5">
          {!scholarshipsFlag && (
            <ScholarshipData
              scholarshipDetail={scholarshipDetail}
              isLoading={isFetching}
              isAssign
              setCurrentScholarship={setCurrentScholarship}
              currentScholarship={currentScholarship}
              scholarships={scholarships}
              isMutating={mutation.isPending}
              onSave={onClickAssign}
              onClose={() => {
                if (currentScholarship) {
                  setOpenDialog(true);
                } else {
                  onClose();
                }
              }}
            />
          )}
          {scholarshipsFlag && (
            <>
              {step === 1 && (
                <StudentScholarshipAssignForm
                  scholarship={scholarshipDetail}
                  unselectScholarship={() => setCurrentScholarship(null)}
                  student={student}
                  setData={onHandleAddData}
                  setCurrentScholarship={setCurrentScholarship}
                  currentScholarship={currentScholarship}
                  scholarships={scholarships}
                  formData={assignData}
                  onClose={() => {
                    if (currentScholarship) {
                      setOpenDialog(true);
                    } else {
                      onClose();
                    }
                  }}
                />
              )}
              {currentScholarship && step === 2 && (
                <StudentScholarshipAssignDetail
                  scholarship={scholarshipDetail}
                  student={student}
                  onAssign={onClickAssign}
                  onClose={() => setCurrentScholarship(null)}
                  data={assignData}
                  onBack={() => setStep(1)}
                  isLoading={mutation.isPending}
                />
              )}
            </>
          )}
        </div>
      </div>
      <Dialog.Root open={!!openDialog} position="right" classNames="right-16">
        <Dialog.Title>¿Estás seguro que deseas cancelar la asignación?</Dialog.Title>
        <div className="flex justify-center gap-x-10">
          <Button id="dialog-in-drawer-cancel" variant="ghost" size="tooltip" onClick={() => setOpenDialog(false)}>
            Atrás
          </Button>
          <Button
            variant="cancel"
            size="tooltip"
            onClick={() => {
              sendTrackEventWithUserName(Events.scholarship_cancelled);
              setOpenDialog(false);
              setTimeout(() => {
                onClose();
              }, 200);
            }}
          >
            Si, cancelar
          </Button>
        </div>
      </Dialog.Root>

      <ScholarshipValidationDialog
        isOpen={showValidationDialog}
        onClose={handleCancelValidation}
        onConfirm={handleConfirmValidation}
        sponsoredOrders={validationData?.sample_details || []}
        validationData={validationData}
        isLoading={mutation.isPending}
      />
    </>
  );
};
export default StudentScholarshipAssign;
