import type { StudentConceptDetailSerializerV2, VirtualOrderSerializerV2 } from '@cometa/trpc/src/types';
import * as Sentry from '@sentry/nextjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Delete from 'public/assets/images/delete.svg';
import { useEffect, useMemo, useState } from 'react';
import ApiClient from '../../../../services/ApiClient';
import SidebarActions from '../../../atoms/SidebarActions';
import SidebarHeader from '../../../molecules/dashboard/SidebarHeader';
import Button from '../Button';
import Dialog from '/src/components/atoms/Dialog';
import { Tooltip } from '/src/components/atoms/Tooltip';
import ConceptData from '/src/components/molecules/dashboard/ConceptData';
import ConceptInfoSkeleton from '/src/components/molecules/dashboard/ConceptInfo/ConceptInfoSkeleton';
import { useGetPermissions } from '/src/guards/AuthGuard';
import useAlert from '/src/hooks/useAlert';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { Events } from '/src/constants/events';
import { api } from '/src/utils/api';
import { QUERY_KEY_CONCEPTS, QUERY_KEY_DUE_ORDERS_STUDENT } from '/src/utils/reactQueryKeys';

interface VirtualOrderWithDueDate extends VirtualOrderSerializerV2 {
  dueDate: Date;
}

interface StudentConceptDetailSerializerV2WithDueDate extends StudentConceptDetailSerializerV2 {
  orders: VirtualOrderWithDueDate[];
}

export interface ISelectedOrders
  extends Pick<VirtualOrderWithDueDate, 'id' | 'dueDate' | 'has_fulfillment' | 'is_skipped'> {
  checked: boolean;
  optional: boolean;
}
interface IOrderModalForAssignmentsProps {
  onClose: () => void;
  student: any;
  studentId: string;
  assignment: { conceptId: string; assigmentId: string } | null;
}

const addDueDate = (data: StudentConceptDetailSerializerV2): StudentConceptDetailSerializerV2WithDueDate => {
  const newOrders = data.orders.map((order) => {
    const dueDate = new Date(`${order.due}T00:00`);
    return { ...order, dueDate };
  });
  return {
    ...data,
    orders: newOrders,
  };
};

export default function ConceptAssignmentEdit(props: IOrderModalForAssignmentsProps) {
  const { onClose, student, assignment, studentId } = props;
  const { data: session } = useSession();
  const [openDialog, setOpenDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<ISelectedOrders[]>([]);
  const { setAlertState } = useAlert();
  const router = useRouter();
  const queryClient = useQueryClient();
  const permissions = useGetPermissions();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const utils = api.useUtils();

  const deleteAssignment = async () =>
    selectedOrders.some((order) => order.optional)
      ? await ApiClient.deleteConceptAssignment(studentId, assignment?.assigmentId, true)
      : await ApiClient.deleteConceptAssignment(studentId, assignment?.assigmentId);

  const updateAssignment = async () => {
    let startDate: string | undefined;
    let endDate: string | undefined;
    let selectedOrdersId: ISelectedOrders[] = [];
    // Check if is optional (does not have a due date)
    const isOptional = selectedOrders.some((order) => order.optional);
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
      selectedOrdersId = selectedOrders.filter(({ checked }) => checked);
    } else {
      selectedOrdersId = selectedOrders.filter(({ checked }) => !checked);
    }

    // Call the API client passing all necessary parameters
    return await ApiClient.patchConceptAssignment(
      studentId,
      assignment?.assigmentId,
      assignment?.conceptId,
      selectedOrdersId.map(({ id }) => id),
      startDate,
      endDate,
      isOptional
    );
  };

  const handlerSuccessMutation = async (message: string) => {
    await queryClient.invalidateQueries({ queryKey: [QUERY_KEY_CONCEPTS, studentId] });
    await utils.students.studentConceptRetrieve.invalidate();
    await utils.students.studentsAssignmentsList.invalidate();
    await utils.students.dashboardSchoolDueOrdersStudents.invalidate();
    await utils.schools.schoolsConceptsStudentsAssignedList.invalidate();
    await queryClient.invalidateQueries({ queryKey: [QUERY_KEY_DUE_ORDERS_STUDENT], exact: true });
    setAlertState({ open: true, severity: 'success', message });
    router.push('#table-for-assignments');
  };

  const onError = (err: unknown) => {
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
    data: originalConcept,
    isPending: isLoading,
    refetch,
  } = api.students.studentConceptRetrieve.useQuery(
    {
      studentId,
      conceptId: assignment?.conceptId || '',
    },
    {
      staleTime: 1000 * 60 * 5,
    }
  );

  const concept = useMemo(() => (originalConcept ? addDueDate(originalConcept) : undefined), [originalConcept]);

  useEffect(() => {
    if (concept) {
      const ordersIdNoDue = concept.orders.map(({ id, dueDate, has_fulfillment, is_skipped, optional }) => ({
        id,
        dueDate,
        checked: !is_skipped,
        has_fulfillment,
        is_skipped,
        optional,
      }));
      setSelectedOrders(ordersIdNoDue);
    }
  }, [concept]);

  const mutationUpdate = useMutation({
    mutationFn: updateAssignment,
    async onSuccess() {
      await handlerSuccessMutation('¡Se guardaron los cambios de manera exitosa!');
      sendTrackEventWithUserName(Events.concept_edited);
      setHasChanges(false);
      onClose();
    },
    onError,
  });

  const mutationDelete = useMutation({
    mutationFn: deleteAssignment,
    async onSuccess() {
      setAlertState({
        open: true,
        severity: 'success',
        message: `Se desasignó el Concepto ${concept?.name} para el estudiante ${student.first_name} ${student.last_name}.`,
      });

      sendTrackEventWithUserName(Events.concept_unassigned);

      const currentActiveData = utils.students.studentsAssignments.getData({
        studentId,
        ended: false,
        optional: false,
      });

      if (currentActiveData && assignment) {
        const updatedActiveData = currentActiveData.filter((item) => item.id !== assignment.assigmentId);
        utils.students.studentsAssignments.setData({ studentId, ended: false, optional: false }, updatedActiveData);
      }

      const currentInactiveData = utils.students.studentsAssignments.getData({
        studentId,
        ended: true,
        optional: false,
      });

      if (currentInactiveData && assignment) {
        const updatedInactiveData = currentInactiveData.filter((item) => item.id !== assignment.assigmentId);
        utils.students.studentsAssignments.setData({ studentId, ended: true, optional: false }, updatedInactiveData);
      }

      const currentOptionalData = utils.students.studentsAssignments.getData({
        studentId,
        ended: undefined,
        optional: true,
      });

      if (currentOptionalData && assignment) {
        const updatedOptionalData = currentOptionalData.filter((item) => item.id !== assignment.assigmentId);
        utils.students.studentsAssignments.setData(
          { studentId, ended: undefined, optional: true },
          updatedOptionalData
        );
      }

      await utils.students.studentsAssignments.invalidate();

      setOpenDialog(false);

      onClose();
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
          disabled={mutationUpdate.isPending || mutationDelete.isPending}
          onClose={onClose}
          boxClassName="px-0"
        />

        <div className="flex flex-row justify-between pb-4 mt-5 mb-4">
          <div className="w-full">
            <label className="text-[#637381] text-sm mb-2">Concepto asignado:</label>
            <div className="flex flex-row items-center justify-between w-full">
              <h2 className="text-xl font-semibold text-gray-700">{concept?.name}</h2>
              {permissions?.can_delete_concept_assignment && !haveFullfitment && (
                <button
                  className="flex flex-row items-center pr-2 text-center bg-transparent"
                  onClick={() => {
                    setOpenDialog(true);
                    sendTrackEventWithUserName(Events.concept_click_unassign);
                  }}
                  type="button"
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
        {hasChanges && (
          <SidebarActions className="bottom-0 grid grid-cols-2 px-0">
            <Button
              id="dialog-variant-discard"
              size="medium"
              className="bg-white px-4 text-[#00AB55] text-base font-bold disabled:text-[#919EABCC] rounded-lg flex-1 hover:bg-[#00AB5514]/8"
              onClick={() => {
                refetch();
                setHasChanges(false);
              }}
              disabled={mutationUpdate.isPending}
              variant="outline"
            >
              Descartar
            </Button>
            <Tooltip message="Tiene que haber al menos una orden seleccionada." disableHover={haveSelectedOrders}>
              <div className="flex items-center flex-1 h-full">
                <Button
                  id="dialog-variant-save"
                  size="medium"
                  className="w-full px-[60px] flex-1 whitespace-nowrap"
                  onClick={onClickUpdateAssign}
                  disabled={!assignment || mutationUpdate.isPending || !haveSelectedOrders}
                >
                  {mutationUpdate.isPending ? (
                    <img src="/assets/oval.svg" alt="loading" className="h-5 mx-auto" />
                  ) : (
                    'Guardar cambios'
                  )}
                </Button>
              </div>
            </Tooltip>
          </SidebarActions>
        )}
      </div>
      <Dialog.Root open={!!openDialog} position="right" classNames="right-16">
        <Dialog.Title>¿Estás seguro que deseas desasignar el concepto?</Dialog.Title>
        <Dialog.Description>Se desasignarán todas las órdenes asociadas a este concepto.</Dialog.Description>
        <div className="flex justify-center gap-x-10">
          <Button
            id="dialog-in-drawer-cancel"
            variant="ghost"
            size="tooltip"
            onClick={() => setOpenDialog(false)}
            disabled={mutationDelete.isPending}
          >
            Atrás
          </Button>
          <Button variant="cancel" size="tooltip" onClick={onClickDeleteAssign} disabled={mutationDelete.isPending}>
            {mutationDelete.isPending ? (
              <img src="/assets/oval.svg" alt="loading" className="h-5 mx-auto" />
            ) : (
              'Si, desasignar'
            )}
          </Button>
        </div>
      </Dialog.Root>
    </>
  );
}
