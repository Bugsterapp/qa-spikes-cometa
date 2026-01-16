import { useMemo, useState } from 'react';
import ApiClient from '../../../services/ApiClient';
import { useSession } from 'next-auth/react';
import * as Sentry from '@sentry/nextjs';
import useAlert from '/src/hooks/useAlert';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEY_CONCEPTS } from '/src/utils/reactQueryKeys';
import { ConceptAssignment } from '/types/paid-orders';
import SidebarHeader from '../../molecules/dashboard/SidebarHeader';
import SidebarActions from '../../atoms/SidebarActions';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { Events } from '/src/constants/events';
import { useGetPermissions } from '/src/guards/AuthGuard';
import dayjs from 'dayjs';
import ConceptInfo from '../../molecules/dashboard/ConceptInfo';
import ConceptScholarshipsAccordion from '../../molecules/dashboard/ConceptScholarshipsAccordion';
import ConceptSelectOrdersAccordion from '../../molecules/dashboard/ConceptSelectOrdersAccordion';
import ConceptInfoSkeleton from '../../molecules/dashboard/ConceptInfo/ConceptInfoSkeleton';
import Delete from 'public/assets/images/delete.svg';
import Dialog from '/src/components/atoms/Dialog';
import Button from './Button';
import { AxiosError } from 'axios';
import { api } from '/src/utils/api';

interface IOrderModalForAssignmentsProps {
  onClose: () => void;
  student: any;
  studentId: string;
  assignment: { conceptId: string; assigmentId: string } | null;
  onSuccessDesassign?: () => void;
}

export default function ConceptAssignmentOptional({
  onClose,
  student,
  assignment,
  studentId,
  onSuccessDesassign,
}: IOrderModalForAssignmentsProps) {
  const { data: session } = useSession();
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<any[]>([]);
  const { setAlertState } = useAlert();
  const router = useRouter();
  const queryClient = useQueryClient();
  const permissions = useGetPermissions();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const [openDialog, setOpenDialog] = useState(false);
  const utils = api.useUtils();

  const deleteAssignment = async () =>
    concept?.orders.every((order) => order.due === null)
      ? await ApiClient.deleteConceptAssignment(studentId, assignment?.assigmentId, true)
      : await ApiClient.deleteConceptAssignment(studentId, assignment?.assigmentId);

  const updateAssignment = async () => {
    let startDate;
    let endDate;
    let selectedOrdersId;
    const isOptional = concept?.orders?.some((order) => order.optional) || false;
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
      studentId,
      assignment?.assigmentId,
      assignment?.conceptId,
      selectedOrdersId,
      startDate,
      endDate,
      isOptional
    );
  };

  const handlerSuccessMutation = async (message: string) => {
    await queryClient.invalidateQueries({ queryKey: [QUERY_KEY_CONCEPTS, studentId] });
    await utils.students.studentsAssignmentsList.invalidate();
    await utils.students.studentConceptRetrieve.invalidate();
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
    isPending: isLoading,
    isFetching,
    refetch,
  } = api.students.studentConceptRetrieve.useQuery({ conceptId: assignment?.conceptId || '', studentId: studentId });

  useMemo(() => {
    if (!concept?.orders) {
      setSelectedOrders([]); // Reset if there are no orders
      return [];
    }

    const newOrders = concept.orders.map(({ id, has_fulfillment, is_skipped }) => ({
      id,
      checked: !is_skipped,
      has_fulfillment,
      is_skipped,
    }));

    setSelectedOrders(newOrders);
    return newOrders;
  }, [concept?.orders]);

  const mutationUpdate = useMutation({
    mutationFn: updateAssignment,
    async onSuccess() {
      await handlerSuccessMutation('¡Se guardaron los cambios de manera exitosa!');
      sendTrackEventWithUserName(Events.concept_edited);
    },
    onError,
  });

  const deassignMessage = student
    ? `Se desasignó el Concepto ${concept?.name} para el estudiante ${student.first_name} ${student.last_name}.`
    : `Se desasignó el Concepto ${concept?.name} para el prospecto.`;

  const mutationDelete = useMutation({
    mutationFn: deleteAssignment,
    async onSuccess() {
      setAlertState({
        open: true,
        severity: 'success',
        message: deassignMessage,
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
      onSuccessDesassign && onSuccessDesassign();
    },
    onError,
  });

  const onClickUpdateAssign = async () => {
    mutationUpdate.mutate();
  };

  const onClickDeleteAssign = async () => {
    mutationDelete.mutate();
  };

  return (
    <>
      <div className="flex flex-col flex-auto px-8 mb-9 min-h-[calc(100vh-135px)]">
        <SidebarHeader
          title="Detalle de asignación de concepto"
          disabled={mutationUpdate.isPending || mutationDelete.isPending}
          onClose={onClose}
          boxClassName="px-0"
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
                    sendTrackEventWithUserName(Events.concept_click_unassign);
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
        {isLoading || isFetching || (!concept && <ConceptInfoSkeleton />)}
        {assignment && concept && !isLoading && (
          <div>
            <ConceptInfo conceptData={concept as ConceptAssignment} isOptional />
            <div className="mt-9 space-y-[18px]">
              {concept?.scholarships && !!concept?.scholarships.length && (
                <div>
                  <ConceptScholarshipsAccordion scholarships={concept?.scholarships} price={concept.price} />
                </div>
              )}
              {concept?.scholarships &&
                !!concept?.scholarships.length &&
                concept?.orders.length &&
                selectedOrders?.length && <hr className="border-t border-gray-300" />}
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
            </div>
          </div>
        )}
        {hasChanges && (
          <SidebarActions className="grid grid-cols-2 bottom-0">
            <button
              className="bg-white px-4 py-3 text-[#00AB55] text-base font-bold disabled:text-[#919EABCC] rounded-lg flex-1 hover:bg-[#00AB5514]/8"
              onClick={() => {
                refetch();
                setHasChanges(false);
              }}
              disabled={mutationUpdate.isPending}
            >
              Descartar
            </button>
            <div className="flex-1">
              <button
                className="text-white text-base font-bold px-12 py-3 rounded-lg bg-[#00AB55] hover:bg-green-500 disabled:bg-[#919EAB3D] disabled:text-[#919EABCC] whitespace-nowrap w-full"
                onClick={onClickUpdateAssign}
                disabled={!assignment || mutationUpdate.isPending}
              >
                {mutationUpdate.isPending ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </SidebarActions>
        )}
      </div>
      <Dialog.Root open={!!openDialog} position="right" classNames="right-16">
        <Dialog.Title>¿Estás seguro que deseas desasignar el concepto?</Dialog.Title>
        <Dialog.Description>
          Se desasignarán todas las órdenes asociadas y los tutores ya no podrán realizar pagos de este concepto.
        </Dialog.Description>
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
