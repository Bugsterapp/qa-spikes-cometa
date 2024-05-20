import { useCallback, useEffect, useState } from 'react';
import ApiClient from '../../../../services/ApiClient';
import { useSession } from 'next-auth/react';
import * as Sentry from '@sentry/nextjs';
import ConceptData from '/src/components/molecules/dashboard/ConceptData';
import useAlert from '/src/hooks/useAlert';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEY_ASSIGNMENTS, QUERY_KEY_CONCEPTS, QUERY_KEY_DUE_ORDERS_STUDENT } from '/src/utils/reactQueryKeys';
import CAutocomplete from '/src/components/molecules/dashboard/NCometaSingleSelect';
import { ConceptAssignment as ConceptAssignmentType } from '/types/paid-orders';
import SidebarHeader from '../../../molecules/dashboard/SidebarHeader';
import { Tooltip } from '/src/components/atoms/Tooltip';
import SidebarActions from '../../../atoms/SidebarActions';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { AxiosError } from 'axios';
import { useSelectedSchoolId } from '/src/guards/AuthGuard';
import Dialog from '/src/components/atoms/Dialog';
import dayjs from 'dayjs';
import Button from '../Button';
import { api } from 'src/utils/api';
import { StudentConcept } from '@cometa/trpc/src/types';

interface IOrderModalForAssignmentsProps {
  onClose: () => void;
  studentId: string;
}

export default function ConceptAssignment(props: IOrderModalForAssignmentsProps) {
  const { onClose, studentId } = props;
  const { data: session } = useSession();
  const [openDialog, setOpenDialog] = useState(false);
  const [currentConcept, setCurrentConcept] = useState<any>(null);
  const [selectedCycle, setSelectedCycle] = useState<any>(null);
  const [selectedOrders, setSelectedOrders] = useState<any[]>([]);
  const selectedSchool = useSelectedSchoolId();
  const { setAlertState } = useAlert();
  const router = useRouter();
  const queryClient = useQueryClient();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const utils = api.useUtils();

  const sortByIsAssigned = (data: StudentConcept[] | undefined) =>
    data?.sort((a, b) => (a.is_assigned as any) - (b.is_assigned as any));

  const assignConcept = async () => {
    // IDs of orders that are not selected
    const noSelectedOrdersId = selectedOrders.filter(({ checked }) => !checked).map(({ id }) => id);
    const selectedOrdersId = selectedOrders.filter(({ checked }) => checked).map(({ id }) => id);
    // Determine if any selected orders are optional (missing dueDate)
    const isOptional = selectedOrders.some((order) => !order.dueDate);

    // Filter and sort selected orders based on the optional status
    const selectedOrdersDue = selectedOrders.filter(({ checked }) => checked);
    if (!isOptional) {
      selectedOrdersDue.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    }

    // Set startDate and endDate based on the optional status
    const startDate = isOptional ? undefined : dayjs(selectedOrdersDue[0]?.dueDate).format('YYYY-MM-01');
    const endDate = isOptional
      ? undefined
      : dayjs(selectedOrdersDue[selectedOrdersDue.length - 1]?.dueDate)
          .endOf('month')
          .format('YYYY-MM-DD');

    // Call the API client passing all necessary parameters
    return await ApiClient.postConceptAssignment(
      session?.token,
      studentId,
      currentConcept?.id,
      isOptional ? selectedOrdersId : noSelectedOrdersId,
      isOptional,
      startDate,
      endDate
    );
  };

  const conceptQuery = async () => {
    const res = await ApiClient.getConceptAssignmentDetail(session?.token, studentId, currentConcept.id);
    return res?.data;
  };

  const addDueDate = (data: any) => {
    const newOrders = data.orders.map((order: any) => {
      const dueDate = order.due ? new Date(`${order.due}T00:00`) : null;
      return { ...order, dueDate };
    });
    data.orders = newOrders;
    return data;
  };

  const { data: concept, isLoading } = useQuery<ConceptAssignmentType>(
    [QUERY_KEY_CONCEPTS, currentConcept?.id],
    conceptQuery,
    {
      enabled: !!currentConcept,
      select: useCallback(addDueDate, []),
    }
  );

  useEffect(
    () => {
      if (concept) {
        const selectedOrders = concept.orders.map((order) => ({
          ...order,
          checked: order.is_assigned,
          has_fulfillment: order.has_fulfillment,
        }));
        setSelectedOrders(selectedOrders);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [concept]
  );

  const { data: schoolarCycles } = api.schools.schoolsCycles.useQuery(
    { school_id: selectedSchool || '' },
    { enabled: !!selectedSchool }
  );

  const { data: concepts } = api.students.studentConcepts.useQuery(
    { studentId, cycle_id: [selectedCycle?.id] },
    {
      enabled: !!selectedSchool && !!selectedCycle,
      onError(err) {
        Sentry.captureException(err);
      },
      select: useCallback(sortByIsAssigned, []),
    }
  );

  const mutation = useMutation({
    mutationFn: assignConcept,
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY_CONCEPTS, studentId] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ASSIGNMENTS], exact: true });
      await utils.students.dashboardSchoolDueOrdersStudents.invalidate();
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY_DUE_ORDERS_STUDENT], exact: true });
      onClose();
      setAlertState({ open: true, severity: 'success', message: '¡Se asignó el concepto de manera exitosa!' });
      sendTrackEventWithUserName('dashboard: Concept | Assigned');
      router.push('#table-for-assignments');
    },
    onError(err: AxiosError | Error) {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Ocurrió un error inesperado, por favor intenta de nuevo.',
      });
      sendTrackEventWithUserName('dashboard: Concept | Error when assigning', { error: err.message });
      Sentry.captureException(err, (scope) => {
        scope.setContext('state', {
          studentId,
          session,
          openDialog,
          currentConcept,
          selectedOrders,
          selectedSchool,
          concepts,
        });
        return scope;
      });
    },
  });

  const onClickAssign = async () => {
    sendTrackEventWithUserName('dashboard: Concept | Clicked assign');
    mutation.mutate();
  };

  const noSelectedOrders = selectedOrders.filter((order) => !order.has_fulfillment).every((order) => !order.checked);

  return (
    <>
      <div className="flex flex-col flex-auto px-8 mb-9">
        <SidebarHeader
          title="Detalle de asignación de concepto"
          disabled={mutation.isLoading}
          onClose={() => {
            if (currentConcept) {
              setOpenDialog(true);
            } else {
              onClose();
            }
          }}
        />
        <div className="mt-5 mb-2">
          <div className="mb-2">
            <label className="text-[#637381] text-sm">Busca y selecciona el concepto que deseas asignar.</label>
          </div>
          <CAutocomplete
            setSelected={setSelectedCycle}
            data={schoolarCycles || []}
            placeholder="Ciclo escolar"
            currentValue={selectedCycle}
            disabled={mutation.isLoading}
          />
          {selectedCycle && (
            <CAutocomplete
              setSelected={setCurrentConcept}
              data={concepts || []}
              placeholder="Selecciona un concepto"
              currentValue={currentConcept}
              disabled={mutation.isLoading}
            />
          )}
        </div>
        {currentConcept && selectedCycle && (
          <ConceptData
            concept={concept}
            selectedOrders={selectedOrders}
            setSelectedOrders={setSelectedOrders}
            isLoading={isLoading}
          />
        )}
      </div>
      <SidebarActions>
        <button
          className="bg-white px-20 py-3 ml-12 text-[#00AB55] hover:text-green-500 text-base font-bold disabled:text-[#919EABCC] rounded-lg"
          onClick={() => {
            sendTrackEventWithUserName('dashboard: Concept | Clicked cancel');
            setOpenDialog(true);
          }}
          disabled={mutation.isLoading}
        >
          Cancelar
        </button>
        <Tooltip message="Tiene que haber al menos una orden seleccionada." disableHover={!noSelectedOrders}>
          <span>
            <button
              className="text-white text-base font-bold px-20 mr-12 py-3 rounded-lg bg-[#00AB55] hover:bg-green-500 disabled:bg-[#919EAB3D] disabled:text-[#919EABCC] whitespace-nowrap"
              onClick={onClickAssign}
              disabled={!currentConcept || mutation.isLoading || noSelectedOrders}
            >
              {mutation.isLoading ? 'Asignando...' : 'Asignar'}
            </button>
          </span>
        </Tooltip>
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
              sendTrackEventWithUserName('dashboard: Concept | Assignment cancelled');
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
    </>
  );
}
