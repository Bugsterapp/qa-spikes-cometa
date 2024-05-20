import { useEffect, useState } from 'react';
import ApiClient from '../../../services/ApiClient';
import { useSession } from 'next-auth/react';
import * as Sentry from '@sentry/nextjs';
import useAlert from '/src/hooks/useAlert';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEY_ASSIGNMENTS, QUERY_KEY_CONCEPTS, QUERY_KEY_DUE_ORDERS_STUDENT } from '/src/utils/reactQueryKeys';
import { ConceptAssignment } from '/types/paid-orders';
import SidebarHeader from '../../molecules/dashboard/SidebarHeader';
import { Tooltip } from '/src/components/atoms/Tooltip';
import SidebarActions from '../../atoms/SidebarActions';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { useGetPermissions } from '/src/guards/AuthGuard';
import dayjs from 'dayjs';
import ConceptInfo from '../../molecules/dashboard/ConceptInfo';
import { Divider, Stack } from '@mui/material';
import ConceptScholarshipsAccordion from '../../molecules/dashboard/ConceptScholarshipsAccordion';
import ConceptSelectOrdersAccordion from '../../molecules/dashboard/ConceptSelectOrdersAccordion';
import ConceptInfoSkeleton from '../../molecules/dashboard/ConceptInfo/ConceptInfoSkeleton';
import Delete from 'public/assets/images/delete.svg';
import Dialog from '/src/components/atoms/Dialog';
import Button from './Button';
import { AxiosError } from 'axios';

interface IOrderModalForAssignmentsProps {
  onClose: () => void;
  student: any;
  studentId: string;
  assignment: { conceptId: string; assimentId: string } | null;
}

export default function ConceptAssignmentOptional(props: IOrderModalForAssignmentsProps) {
  const { onClose, student, assignment, studentId } = props;
  const { data: session } = useSession();
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<any[]>([]);
  const { setAlertState } = useAlert();
  const router = useRouter();
  const queryClient = useQueryClient();
  const permissions = useGetPermissions();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const [openDialog, setOpenDialog] = useState(false);

  const deleteAssignment = async () =>
    concept?.orders.every((order) => order.dueDate === null)
      ? await ApiClient.deleteConceptAssignment(session?.token, studentId, assignment?.assimentId, true)
      : await ApiClient.deleteConceptAssignment(session?.token, studentId, assignment?.assimentId);

  const updateAssignment = async () => {
    let startDate;
    let endDate;
    let selectedOrdersId;
    // Check if is optional (does not have a due date)
    const isOptional = selectedOrders.some((order) => !order.dueDate);
    if (!isOptional) {
      selectedOrdersId = selectedOrders
        .filter(({ checked }) => checked)
        .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    }

    // If the assignment is not optional, calculate start and end dates
    if (!isOptional) {
      startDate = dayjs(selectedOrdersId?.at(0)?.dueDate).format('YYYY-MM-01');
      endDate = dayjs(selectedOrdersId?.at(-1)?.dueDate).endOf('month').format('YYYY-MM-DD');
    }

    if (isOptional) {
      selectedOrdersId = selectedOrders.filter(({ checked }) => checked).map(({ id }) => id);
    }

    // Call the API client passing all necessary parameters
    return await ApiClient.patchConceptAssignment(
      session?.token,
      studentId,
      assignment?.assimentId,
      assignment?.conceptId,
      selectedOrdersId,
      startDate,
      endDate,
      isOptional
    );
  };

  const conceptQuery = async () => {
    const res = await ApiClient.getConceptAssignmentDetail(session?.token, studentId, assignment?.conceptId);
    return res?.data;
  };

  const handlerSuccessMutation = async (message: string) => {
    await queryClient.invalidateQueries({ queryKey: [QUERY_KEY_CONCEPTS, studentId] });
    await queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ASSIGNMENTS], exact: true });
    await queryClient.invalidateQueries({ queryKey: [QUERY_KEY_DUE_ORDERS_STUDENT], exact: true });
    onClose();
    setAlertState({ open: true, severity: 'success', message });
    router.push('#table-for-assignments');
  };

  const onError = (error: AxiosError | Error | any) => {
    setAlertState({
      open: true,
      severity: 'error',
      message:
        error.response?.data?.detail === 'You do not have permission to perform this action.'
          ? 'No tienes permisos para realizar esta acción. Si necesitas activarlo, escríbenos por el chat de soporte.'
          : 'Ocurrió un error inesperado, por favor intenta de nuevo.',
    });

    Sentry.captureException(error, (scope) => {
      scope.setContext('state', {
        student,
        assignment,
        studentId,
        session,
        hasChanges,
        selectedOrders,
        permissions,
      });
      return scope;
    });
  };

  const {
    data: concept,
    isLoading,
    refetch,
  } = useQuery<ConceptAssignment>([QUERY_KEY_CONCEPTS, assignment?.conceptId], conceptQuery);

  useEffect(() => {
    if (concept?.orders) {
      const ordersIdNoDue = concept.orders.map(({ id, has_fulfillment, is_skipped }) => ({
        id,
        checked: !is_skipped,
        has_fulfillment,
        is_skipped,
      }));
      setSelectedOrders(ordersIdNoDue);
    }
  }, [concept?.orders]);

  const mutationUpdate = useMutation({
    mutationFn: updateAssignment,
    async onSuccess() {
      await handlerSuccessMutation('¡Se guardaron los cambios de manera exitosa!');
      sendTrackEventWithUserName('dashboard: Concept | Edited');
    },
    onError,
  });

  const mutationDelete = useMutation({
    mutationFn: deleteAssignment,
    async onSuccess() {
      await handlerSuccessMutation(
        `Se desasignó el Concepto ${concept?.name} para el estudiante ${student.first_name} ${student.last_name}.`
      );
      sendTrackEventWithUserName('dashboard: Concept | Unassigned');
    },
    onError,
  });

  const onClickUpdateAssign = async () => {
    mutationUpdate.mutate();
  };

  const onClickDeleteAssign = async () => {
    mutationDelete.mutate();
  };

  const haveSelectedOrders = selectedOrders.some((order) => order.checked);

  return (
    <>
      <div className="flex flex-col flex-auto px-8 mb-9">
        <SidebarHeader
          title="Detalle de asignación de concepto"
          disabled={mutationUpdate.isLoading || mutationDelete.isLoading}
          onClose={onClose}
        />
        <div className="flex flex-row justify-between mt-5 mb-4">
          <div className="flex flex-col w-full mb-2">
            <label className="text-[#637381] text-sm">Concepto asignado:</label>
            <div className="flex flex-row justify-between w-full items-center">
              <h2 className="text-xl font-semibold">{concept?.name}</h2>
              {permissions?.can_delete_concept_assignment && (
                <button
                  className="flex flex-row items-center pr-2 text-center bg-transparent"
                  onClick={() => {
                    setOpenDialog(true);
                    sendTrackEventWithUserName('dashboard: Concept | Click Unassign');
                  }}
                >
                  <div className="m-2">
                    <Delete />
                  </div>
                  <span className="font-bold text-sm text-[#FF4842]">Desasignar</span>
                </button>
              )}
            </div>
          </div>
        </div>
        {isLoading || (!concept && <ConceptInfoSkeleton />)}
        {assignment && concept && !isLoading && (
          <div>
            <ConceptInfo conceptData={concept as ConceptAssignment} isOptional />
            <Stack divider={<Divider />} spacing={4.5} className="mt-9">
              {concept?.scholarships && !!concept?.scholarships.length && (
                <div>
                  <ConceptScholarshipsAccordion scholarships={concept?.scholarships} price={concept.price} />
                </div>
              )}
              {concept?.orders.length && selectedOrders?.length && (
                <div id="concept-select-orders">
                  <ConceptSelectOrdersAccordion
                    orders={concept.orders}
                    selectedOrders={selectedOrders}
                    setSelectedOrders={setSelectedOrders}
                    onEditState={false}
                    isOptional
                    changeOrders={() => {
                      setHasChanges(true);
                    }}
                  />
                </div>
              )}
            </Stack>
          </div>
        )}
      </div>
      {hasChanges && (
        <SidebarActions className="grid grid-cols-2">
          <button
            className="bg-white px-4 py-3 text-[#00AB55] text-base font-bold disabled:text-[#919EABCC] rounded-lg flex-1 hover:bg-[#00AB5514]/8"
            onClick={() => {
              refetch();
              setHasChanges(false);
            }}
            disabled={mutationUpdate.isLoading}
          >
            Descartar
          </button>
          <Tooltip message="Tiene que haber al menos una orden seleccionada." disableHover={haveSelectedOrders}>
            <div className="flex-1">
              <button
                className="text-white text-base font-bold px-12 py-3 rounded-lg bg-[#00AB55] hover:bg-green-500 disabled:bg-[#919EAB3D] disabled:text-[#919EABCC] whitespace-nowrap w-full"
                onClick={onClickUpdateAssign}
                disabled={!assignment || mutationUpdate.isLoading || !haveSelectedOrders}
              >
                {mutationUpdate.isLoading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </Tooltip>
        </SidebarActions>
      )}
      <Dialog.Root open={!!openDialog} position="right" classNames="right-16">
        <Dialog.Title>¿Estás seguro que deseas desasignar el concepto?</Dialog.Title>
        <Dialog.Description>Se desasignarán todas las órdenes asociadas a este concepto.</Dialog.Description>
        <div className="flex justify-center gap-x-10">
          <Button id="dialog-in-drawer-cancel" variant="ghost" size="tooltip" onClick={() => setOpenDialog(false)}>
            Atrás
          </Button>
          <Button
            variant="cancel"
            size="tooltip"
            onClick={() => {
              onClickDeleteAssign();
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
}
