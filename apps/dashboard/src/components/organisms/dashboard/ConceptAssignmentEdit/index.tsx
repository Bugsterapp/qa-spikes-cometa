import { useCallback, useEffect, useState } from 'react';
import ApiClient from '../../../../services/ApiClient';
import { useSession } from 'next-auth/react';
import * as Sentry from '@sentry/nextjs';
import ConceptData from '/src/components/molecules/dashboard/ConceptData';
import useAlert from '/src/hooks/useAlert';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEY_ASSIGNMENTS, QUERY_KEY_CONCEPTS, QUERY_KEY_DUE_ORDERS_STUDENT } from '/src/utils/reactQueryKeys';
import SidebarHeader from '../../../molecules/dashboard/SidebarHeader';
import Delete from 'public/assets/images/delete.svg';
import { Tooltip } from '/src/components/atoms/Tooltip';
import SidebarActions from '../../../atoms/SidebarActions';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { useGetPermissions } from '/src/guards/AuthGuard';
import Dialog from '/src/components/atoms/Dialog';
import dayjs from 'dayjs';
import Button from '../Button';
import { api } from '/src/utils/api';
import { VirtualOrder } from '@cometa/trpc/src/types';
import ConceptInfoSkeleton from '/src/components/molecules/dashboard/ConceptInfo/ConceptInfoSkeleton';

interface IOrderModalForAssignmentsProps {
  onClose: () => void;
  student: any;
  studentId: string;
  assignment: { conceptId: string; assigmentId: string } | null;
}

export default function ConceptAssignmentEdit(props: IOrderModalForAssignmentsProps) {
  const { onClose, student, assignment, studentId } = props;
  const { data: session } = useSession();
  const [openDialog, setOpenDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<any[]>([]);
  const { setAlertState } = useAlert();
  const router = useRouter();
  const queryClient = useQueryClient();
  const permissions = useGetPermissions();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const utils = api.useUtils();

  const deleteAssignment = async () =>
    concept?.orders.every((order: VirtualOrder) => order.due === null)
      ? await ApiClient.deleteConceptAssignment(session?.token, studentId, assignment?.assigmentId, true)
      : await ApiClient.deleteConceptAssignment(session?.token, studentId, assignment?.assigmentId);

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
    } else {
      selectedOrdersId = selectedOrders.filter(({ checked }) => !checked).map(({ id }) => id);
    }

    // Call the API client passing all necessary parameters
    return await ApiClient.patchConceptAssignment(
      session?.token,
      studentId,
      assignment?.assigmentId,
      assignment?.conceptId,
      selectedOrdersId,
      startDate,
      endDate,
      isOptional
    );
  };

  const addDueDate = (data: any) => {
    const newOrders = data.orders.map((order: any) => {
      const dueDate = new Date(`${order.due}T00:00`);
      return { ...order, dueDate };
    });
    data.orders = newOrders;
    return data;
  };

  const handlerSuccessMutation = async (message: string) => {
    await queryClient.invalidateQueries({ queryKey: [QUERY_KEY_CONCEPTS, studentId] });
    await queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ASSIGNMENTS], exact: true });
    await utils.students.studentConceptRetrive.invalidate();
    await utils.students.dashboardSchoolDueOrdersStudents.invalidate();
    await utils.schools.schoolsConceptsStudentsAssignedList.invalidate();
    await queryClient.invalidateQueries({ queryKey: [QUERY_KEY_DUE_ORDERS_STUDENT], exact: true });
    onClose();
    setAlertState({ open: true, severity: 'success', message });
    router.push('#table-for-assignments');
  };

  const onError = (err: any) => {
    setAlertState({
      open: true,
      severity: 'error',
      message: 'Ocurrió un error inesperado, por favor intenta de nuevo.',
    });
    Sentry.captureException(err, (scope) => {
      scope.setContext('state', {
        student,
        assignment,
        studentId,
        session,
        openDialog,
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
  } = api.students.studentConceptRetrive.useQuery(
    {
      studentId,
      conceptId: assignment?.conceptId || '',
    },
    {
      select: useCallback(addDueDate, []),
      staleTime: 1000 * 60 * 5,
    }
  );

  useEffect(() => {
    if (concept) {
      const ordersIdNoDue = concept.orders.map(
        ({
          id,
          dueDate,
          has_fulfillment,
          is_skipped,
        }: {
          id: string;
          dueDate: Date;
          has_fulfillment: boolean;
          is_skipped: boolean;
        }) => ({
          id,
          dueDate,
          checked: !is_skipped,
          has_fulfillment,
          is_skipped,
        })
      );
      setSelectedOrders(ordersIdNoDue);
    }
  }, [concept]);

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

  const haveFullfitment = selectedOrders.some((order) => order.has_fulfillment) === true;
  const haveSelectedOrders = selectedOrders.some((order) => order.checked);

  return (
    <>
      <div className="flex flex-col flex-auto px-8 mb-9 min-h-[calc(100vh-135px)]">
        <SidebarHeader
          title="Detalle de asignación de concepto"
          disabled={mutationUpdate.isLoading || mutationDelete.isLoading}
          onClose={onClose}
          boxClassName="px-0"
        />

        <div className="flex flex-row justify-between mt-5 mb-4">
          <div className="w-full">
            <label className="text-[#637381] text-sm mb-2">Concepto asignado:</label>
            <div className="flex flex-row items-center justify-between w-full">
              <h2 className="text-xl font-semibold text-gray-700">{concept?.name}</h2>
              {permissions?.can_delete_concept_assignment && !haveFullfitment && (
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
        {isLoading && <ConceptInfoSkeleton />}
        {!isLoading && !!assignment && (
          <ConceptData
            concept={concept}
            selectedOrders={selectedOrders}
            setSelectedOrders={setSelectedOrders}
            isLoading={isLoading}
            changeOrders={() => {
              setHasChanges(true);
            }}
            isEdit
          />
        )}
      </div>
      {hasChanges && (
        <SidebarActions className="grid grid-cols-2">
          <Button
            id="dialog-variant-discard"
            size="medium"
            className="bg-white px-4 text-[#00AB55] text-base font-bold disabled:text-[#919EABCC] rounded-lg flex-1 hover:bg-[#00AB5514]/8"
            onClick={() => {
              refetch();
              setHasChanges(false);
            }}
            disabled={mutationUpdate.isLoading}
            variant="outline"
          >
            Descartar
          </Button>
          <Tooltip message="Tiene que haber al menos una orden seleccionada." disableHover={haveSelectedOrders}>
            <div className="flex-1 h-full flex items-center">
              <Button
                id="dialog-variant-save"
                size="medium"
                className="w-full px-[60px] flex-1 whitespace-nowrap min-w-[250px]"
                onClick={onClickUpdateAssign}
                disabled={!assignment || mutationUpdate.isLoading || !haveSelectedOrders}
              >
                {mutationUpdate.isLoading ? (
                  <img src="/assets/oval.svg" alt="loading" className="mx-auto h-5" />
                ) : (
                  'Guardar cambios'
                )}
              </Button>
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
