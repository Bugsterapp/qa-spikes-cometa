import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import ScholarshipData from '/src/components/molecules/dashboard/ScholarshipData';
import ApiClient from '/src/services/ApiClient';
import { QUERY_KEY_DUE_ORDERS_STUDENT, QUERY_KEY_SCHOLARSHIPS } from '/src/utils/reactQueryKeys';
import * as Sentry from '@sentry/nextjs';
import useAlert from '/src/hooks/useAlert';
import { useRouter } from 'next/router';
import Delete from 'public/assets/images/delete.svg';
import SidebarHeader from '/src/components/molecules/dashboard/SidebarHeader';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { useGetPermissions } from '/src/guards/AuthGuard';
import Dialog from '/src/components/atoms/Dialog';
import Button from '../Button';
import CAlert from '/src/components/atoms/CAlert';
import { api } from 'src/utils/api';

interface ScholarshipAssignmentDetailProps {
  onClose: () => void;
  studentId: string;
  scholarshipId: string;
  scholarshipName: string;
  isOld?: boolean;
  assignedAt?: string;
  deassignedAt?: string;
}

const ScholarshipAssignmentDetail = ({
  onClose,
  studentId,
  scholarshipId,
  scholarshipName,
  isOld = false,
  assignedAt = '',
  deassignedAt = '',
}: ScholarshipAssignmentDetailProps) => {
  const permissions = useGetPermissions();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [openDialog, setOpenDialog] = useState(false);
  const { setAlertState } = useAlert();
  const router = useRouter();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();

  const unassignConcept = async () =>
    await ApiClient.deleteScholarshipAssignment(session?.token, studentId, scholarshipId);

  const { data: scholarshipDetail, isLoading } = api.scholarships.scholarshipDetails.useQuery(
    { scholarshipId, studentId },
    {
      enabled: !!scholarshipId,
      onError(err) {
        Sentry.captureException(err);
      },
    }
  );

  const partialPaidConcepts = scholarshipDetail?.affected_concepts?.flatMap((obj) =>
    obj.fulfillments.filter((fulfillment) => fulfillment.status === 'PARTIAL_PAID')
  );

  const mutation = useMutation({
    mutationFn: unassignConcept,
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY_SCHOLARSHIPS] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY_DUE_ORDERS_STUDENT] });
      onClose();
      setAlertState({ open: true, severity: 'success', message: `Se desasignó la Beca ${scholarshipName}.` });
      sendTrackEventWithUserName('dashboard: Scolarship | Unassigned');
      router.push('#table-for-scholarships');
    },
    onError(err) {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Ocurrió un error inesperado, por favor intenta de nuevo.',
      });
      Sentry.captureException(err);
    },
  });

  const onClickUnassign = async () => {
    mutation.mutate();
  };

  return (
    <>
      <div className="flex flex-col flex-auto  px-9 mb-9">
        <SidebarHeader
          title={isOld ? 'Detalle de beca pasada' : 'Detalle de asignación de Beca'}
          disabled={mutation.isLoading}
          onClose={onClose}
        />
        <div className="flex flex-row justify-between mt-5 mb-4">
          <div>
            {!isOld && <label className="text-sm text-gray-600">Beca asignada:</label>}
            <h2 className="text-xl font-semibold text-gray-700">{scholarshipName}</h2>
          </div>
          {!isOld && permissions?.can_deassign_scholarship && (
            <button
              className="flex flex-row items-center pr-2 text-center bg-transparent"
              onClick={() => {
                sendTrackEventWithUserName('dashboard: Scolarship | Click Unassign');
                setOpenDialog(true);
              }}
            >
              <div className="m-2">
                <Delete />
              </div>
              <span className="text-sm font-bold text-error">Desasignar</span>
            </button>
          )}
        </div>
        {deassignedAt && assignedAt && (
          <div className="flex flex-row justify-between">
            <div className="px-3 py-1 text-sm rounded-full bg-blue-secondary-200/8 text-blue-secondary-200">
              {`${assignedAt} - ${deassignedAt}`}
            </div>
            <div className="px-3 py-1 text-sm font-semibold rounded-full bg-error/8 text-error">Beca inactiva</div>
          </div>
        )}
        <div className={`${isOld ? '' : 'mt-5'} mb-2`}>
          {scholarshipId && (
            <ScholarshipData scholarshipDetail={scholarshipDetail} isLoading={isLoading} disabled={isOld} />
          )}
        </div>
      </div>
      <Dialog.Root open={!!openDialog} position="right" classNames="right-16">
        <Dialog.Title>¿Estás seguro que deseas desasignar esta beca?</Dialog.Title>
        <Dialog.Description>Se desasignará la beca para todos los conceptos asociados.</Dialog.Description>
        {!!partialPaidConcepts?.length && (
          <CAlert
            className="my-4"
            type="info"
            action={
              <div className="-ml-3">
                {partialPaidConcepts?.length > 1 ? 'Las órdenes ' : 'La orden '}
                <span className="font-semibold">{partialPaidConcepts.map((concept) => concept.name).join(', ')} </span>
                se
                <br /> encuentran pagadas parcialmente, si desasignas la <br /> beca tambien se desasignará para esa
                orden.
              </div>
            }
          />
        )}

        <div className="flex justify-center gap-x-10">
          <Button id="dialog-in-drawer-cancel" variant="ghost" size="tooltip" onClick={() => setOpenDialog(false)}>
            Cancelar
          </Button>
          <Button
            variant="cancel"
            size="tooltip"
            onClick={() => {
              onClickUnassign();
              setOpenDialog(false);
              setTimeout(() => {
                onClose();
              }, 200);
            }}
          >
            Si, desasignar
          </Button>
        </div>
      </Dialog.Root>
    </>
  );
};
export default ScholarshipAssignmentDetail;
