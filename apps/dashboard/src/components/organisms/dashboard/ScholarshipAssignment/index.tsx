import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useCallback, useState } from 'react';
import ScholarshipData from '/src/components/molecules/dashboard/ScholarshipData';
import ApiClient from '/src/services/ApiClient';
import { QUERY_KEY_DUE_ORDERS_STUDENT, QUERY_KEY_SCHOLARSHIPS } from '/src/utils/reactQueryKeys';
import * as Sentry from '@sentry/nextjs';
import useAlert from '/src/hooks/useAlert';
import { useRouter } from 'next/router';
import CAutocomplete from '/src/components/molecules/dashboard/NCometaSingleSelect';
import SidebarActions from '../../../atoms/SidebarActions';
import SidebarHeader from '/src/components/molecules/dashboard/SidebarHeader';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { AxiosError } from 'axios';
import { useSelectedSchoolId } from '/src/guards/AuthGuard';
import Dialog from '/src/components/atoms/Dialog';
import Button from '../Button';
import { api } from 'src/utils/api';
import { AvailableScholarship } from '@cometa/trpc/src/types';

interface ScholarshipAssignmentProps {
  onClose: () => void;
  studentId: string;
}

const ScholarshipAssignment = ({ onClose, studentId }: ScholarshipAssignmentProps) => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openNotAfectedDialog, setOpenNotAfectedDialog] = useState<boolean>(false);
  const [currentScholarship, setCurrentScholarship] = useState<any>(null);
  const selectedSchool = useSelectedSchoolId();
  const { setAlertState } = useAlert();
  const router = useRouter();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();

  const sortByIsAssigned = (data: AvailableScholarship[] | undefined) =>
    data?.sort((a, b) => (a.is_already_assigned as any) - (b.is_already_assigned as any));

  const { data: scholarshipDetail, isLoading } = api.scholarships.scholarshipDetails.useQuery(
    { scholarshipId: currentScholarship?.id, studentId },
    {
      enabled: !!currentScholarship?.id && !!selectedSchool,
      onError(err) {
        Sentry.captureException(err);
      },
    }
  );

  const hasNotPaidConcepts = scholarshipDetail?.affected_concepts?.some((obj) =>
    obj.fulfillments.some((fulfillment) => fulfillment.status === 'NOT_PAID')
  );

  const hasPartialPaidConcepts = scholarshipDetail?.affected_concepts?.some((obj) =>
    obj.fulfillments.some((fulfillment) => fulfillment.status === 'PARTIAL_PAID')
  );

  const orders_to_skip = scholarshipDetail?.affected_concepts?.flatMap((fultillment) => fultillment.fulfillments);

  const { data: scholarships } = api.scholarships.scholarships.useQuery(
    { studentId },
    {
      enabled: !!selectedSchool,
      onError(err) {
        Sentry.captureException(err);
      },
      select: useCallback(sortByIsAssigned, []),
    }
  );

  const assignConcept = async () =>
    await ApiClient.postScholarshipAssignment(
      session?.token,
      studentId,
      currentScholarship?.id,
      orders_to_skip?.map((order) => order.order)
    );

  const mutation = useMutation({
    mutationFn: assignConcept,
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY_SCHOLARSHIPS] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY_DUE_ORDERS_STUDENT] });

      onClose();
      setAlertState({ open: true, severity: 'success', message: '¡Se asignó la beca correctamente!' });
      sendTrackEventWithUserName('dashboard: Scolarship | Assigned');
      router.push('#table-for-scholarships');
    },
    onError(err: AxiosError | Error) {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Ocurrió un error inesperado, por favor intenta de nuevo.',
      });
      Sentry.captureException(err);
      sendTrackEventWithUserName('dashboard: Scolarship | Error when assigning', { error: err.message });
    },
  });

  const onClickAssign = async () => {
    if (!hasNotPaidConcepts && !hasPartialPaidConcepts) {
      sendTrackEventWithUserName('dashboard: Scolarship | Clicked assign');
      mutation.mutate();
    } else {
      setOpenNotAfectedDialog(true);
    }
  };

  const closeNotAfectedDialog = () => {
    setOpenNotAfectedDialog(false);
    sendTrackEventWithUserName('dashboard: Scolarship | Clicked assign');
    mutation.mutate();
  };

  return (
    <>
      <div className="flex flex-col flex-auto px-9 mb-9">
        <SidebarHeader
          title="Asignar Beca"
          disabled={mutation.isLoading}
          onClose={() => {
            if (currentScholarship) {
              setOpenDialog(true);
            } else {
              onClose();
            }
          }}
        />
        <div className="mt-5 mb-2">
          <div className="mb-2">
            <label className="text-[#637381] text-sm">Busca y selecciona la beca que deseas asignar.</label>
          </div>
          <CAutocomplete
            setSelected={setCurrentScholarship}
            data={scholarships || []}
            placeholder="Selecciona una beca"
            currentValue={currentScholarship}
            disabled={mutation.isLoading}
          />

          {currentScholarship && (
            <ScholarshipData scholarshipDetail={scholarshipDetail} isLoading={isLoading} isAssign />
          )}
        </div>
      </div>
      <SidebarActions>
        <button
          className="bg-[#FAFBFF] px-20 py-3 text-green-400 hover:text-green-500 text-base font-bold disabled:bg-[#919EAB3D] disabled:text-[#919EABCC] rounded-lg"
          onClick={() => {
            sendTrackEventWithUserName('dashboard: Scolarship | Clicked cancel');
            setOpenDialog(true);
          }}
          disabled={mutation.isLoading}
        >
          Cancelar
        </button>
        <button
          className="text-white text-base font-bold px-20 py-3 rounded-lg bg-[#00AB55] hover:bg-green-500 disabled:bg-[#919EAB3D] disabled:text-[#919EABCC] whitespace-nowrap"
          onClick={onClickAssign}
          disabled={!currentScholarship || mutation.isLoading || currentScholarship.is_already_assigned}
        >
          {mutation.isLoading ? 'Asignando...' : 'Asignar'}
        </button>
      </SidebarActions>
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
              sendTrackEventWithUserName('dashboard: Scolarship | Cancelled');
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
      <Dialog.Root open={!!openNotAfectedDialog} position="right" classNames="right-16">
        <Dialog.Title>
          La beca no aplicará para estas órdenes por estar{' '}
          {hasNotPaidConcepts && hasPartialPaidConcepts
            ? 'vencidas o pagadas parcialmente'
            : hasNotPaidConcepts && !hasPartialPaidConcepts
            ? 'vencidas'
            : 'pagadas parcialmente'}
          :
        </Dialog.Title>
        <div className="my-5 text-sm font-semibold">
          <ol type="A" className="list-disc">
            {orders_to_skip?.map((concept) => (
              <li key={concept.name} className="flex flex-col gap-y-2">
                <span className="text-[#212B36] text-sm">&bull; {concept.name}</span>
              </li>
            ))}
          </ol>
        </div>
        <Dialog.Description>
          <div className="flex flex-col gap-y-2">
            Si deseas luego puedes agregarles un descueto especial ingresando al detalle de la orden.
          </div>
        </Dialog.Description>
        <div className="flex justify-center gap-x-10">
          <Button variant="primary" size="tooltip" onClick={closeNotAfectedDialog}>
            Entendido
          </Button>
        </div>
      </Dialog.Root>
    </>
  );
};
export default ScholarshipAssignment;
