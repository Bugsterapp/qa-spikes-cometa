import { Dispatch, useCallback, useEffect, useMemo, useState, SetStateAction } from 'react';
import ApiClient from '../../../../services/ApiClient';
import { useSession } from 'next-auth/react';
import * as Sentry from '@sentry/nextjs';
import ConceptData from '/src/components/molecules/dashboard/ConceptData';
import useAlert from '/src/hooks/useAlert';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEY_CONCEPTS } from '/src/utils/reactQueryKeys';
import CAutocomplete from '/src/components/molecules/dashboard/NCometaSingleSelect';
import SidebarHeader from '../../../molecules/dashboard/SidebarHeader';
import { Tooltip } from '/src/components/atoms/Tooltip';
import SidebarActions from '../../../atoms/SidebarActions';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { Events } from '/src/constants/events';
import { AxiosError } from 'axios';
import { useSelectedSchoolId } from '/src/guards/AuthGuard';
import Dialog from '/src/components/atoms/Dialog';
import dayjs from 'dayjs';
import Button from '../Button';
import { api } from 'src/utils/api';
import { StudentConcept, ConceptSlimTypeEnum } from '@cometa/trpc/src/types';
import * as Combobox from '../../../ui/Combobox';
import SelectChip from '/src/components/atoms/SelectChip';

interface IOrderModalForAssignmentsProps {
  onClose: () => void;
  studentId: string;
  source?: 'student' | 'lead';
  defaultSchoolCycle?: { id: string; name: string } | null;
}

export default function ConceptAssignment({
  onClose,
  studentId,
  source = 'student',
  defaultSchoolCycle = null,
}: IOrderModalForAssignmentsProps) {
  const { data: session } = useSession();
  const [openDialog, setOpenDialog] = useState(false);
  const [currentConcept, setCurrentConcept] = useState<any>(null);
  const [currentConceptType, setCurrentConceptType] = useState<any>(null);
  const [selectedCycle, setSelectedCycle] = useState<any>(defaultSchoolCycle);
  const [selectedOrders, setSelectedOrders] = useState<any[]>([]);
  const selectedSchool = useSelectedSchoolId();
  const { setAlertState } = useAlert();
  const router = useRouter();
  const queryClient = useQueryClient();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const utils = api.useUtils();

  const sortByIsAssigned = (data: StudentConcept[] | undefined) =>
    data?.sort((a, b) => (a.is_assigned as any) - (b.is_assigned as any));

  const conceptQueryParams = useMemo(() => {
    const params: {
      studentId: string;
      cycle_id: string[];
      type?: string;
    } = {
      studentId,
      cycle_id: [selectedCycle?.id],
    };

    if (currentConceptType) {
      params.type = currentConceptType.id;
    }

    return params;
  }, [studentId, selectedCycle?.id, currentConceptType]);

  const { data: concept, isPending: isLoadingConcept } = api.students.studentConceptRetrieve.useQuery(
    { conceptId: currentConcept?.id, studentId: studentId },
    {
      enabled: !!currentConcept,
    }
  );
  const isOptional = concept?.orders?.some((order) => order.optional) || false;

  useEffect(() => {
    if (!concept?.orders) {
      setSelectedOrders([]); // Reset if there are no orders
      return;
    }

    const newOrders = !isOptional
      ? concept.orders.map(({ id, due, would_be_due }) => ({
          id,
          dueDate: new Date(`${due}T00:00`),
          checked: !would_be_due,
        }))
      : concept.orders.map(({ id, has_fulfillment, is_skipped }) => ({
          id,
          checked: !is_skipped,
          has_fulfillment,
        }));

    setSelectedOrders(newOrders);
  }, [concept?.orders, isOptional]);

  const { data: schoolarCycles, isPending: isLoadingSchoolCycles } = api.schools.schoolsCycles.useQuery(
    { school_id: selectedSchool || '' },
    { enabled: !!selectedSchool }
  );

  const { data: schoolCollectionsConceptTypes, isPending: isLoadingSchoolCollectionsConceptTypes } =
    api.schools.schoolsCollectionsConceptTypes.useQuery(
      { school_id: selectedSchool || '', school_cycle: [selectedCycle?.id] },
      { enabled: !!selectedSchool && !!selectedCycle }
    );
  const normalizedSchoolCollectionsConceptTypes = useMemo(
    () =>
      schoolCollectionsConceptTypes?.map((conceptType) => ({
        id: conceptType.type,
        name: conceptType.name,
        is_assigned: false,
        is_optional: false,
      })),
    [schoolCollectionsConceptTypes]
  );

  const { data: concepts, isPending: isLoadingConcepts } = api.students.studentConcepts.useQuery(conceptQueryParams, {
    enabled: !!selectedSchool && !!selectedCycle,
    select: useCallback(sortByIsAssigned, []),
    meta: { logErrorToSentry: true },
  });

  const assignConcept = async () => {
    // IDs of orders that are not selected
    const noSelectedOrdersId = selectedOrders.filter(({ checked }) => !checked).map(({ id }) => id);
    const selectedOrdersId = selectedOrders.filter(({ checked }) => checked).map(({ id }) => id);

    const selectedOrdersDue = selectedOrders
      .filter(({ checked }) => checked)
      .sort((a, b) => a.dueDate?.getTime() - b.dueDate?.getTime());
    // Set startDate and endDate based on the optional status
    const startDate = isOptional ? undefined : dayjs(selectedOrdersDue?.[0]?.dueDate).format('YYYY-MM-01');
    const endDate = isOptional
      ? undefined
      : dayjs(selectedOrdersDue?.[selectedOrdersDue?.length - 1]?.dueDate)
          .endOf('month')
          .format('YYYY-MM-DD');

    // Call the API client passing all necessary parameters
    return await ApiClient.postConceptAssignment(
      studentId,
      currentConcept?.id,
      isOptional ? selectedOrdersId : noSelectedOrdersId,
      isOptional,
      startDate,
      endDate
    );
  };

  const onClickAssign = () => {
    sendTrackEventWithUserName(Events.concept_click_assign);
    mutation.mutate();
  };

  const mutation = useMutation({
    mutationFn: assignConcept,
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY_CONCEPTS, studentId] });
      await utils.students.dashboardSchoolDueOrdersStudents.invalidate();
      await utils.manualPayments.fulfillments.invalidate();
      await utils.manualPayments.guardianOptionalOrders.invalidate();
      await utils.students.studentsAssignments.invalidate();
      await utils.students.dashboardSchoolDueOrdersStudentDetail.invalidate();
      await utils.students.studentConceptRetrieve.invalidate();

      onClose();
      setAlertState({ open: true, severity: 'success', message: '¡Se asignó el concepto de manera exitosa!' });
      sendTrackEventWithUserName(Events.concept_assigned);

      router.push('#table-for-assignments');
    },
    onError(err: AxiosError | Error) {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Ocurrió un error inesperado, por favor intenta de nuevo.',
      });
      sendTrackEventWithUserName(Events.concept_error_assigning, { error: err.message });
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

  const noSelectedOrders = selectedOrders.filter((order) => !order.has_fulfillment).every((order) => !order.checked);

  return (
    <>
      <div className="flex flex-col flex-auto px-8 min-h-[calc(100vh-135px)] justify-between">
        <div>
          <SidebarHeader
            title="Detalle de asignación de concepto"
            disabled={mutation.isPending}
            boxClassName="px-0"
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
              data={schoolarCycles?.sort((a: any, b: any) => b.name.localeCompare(a.name)) || []}
              placeholder="Ciclo escolar"
              currentValue={selectedCycle}
              disabled={mutation.isPending || isLoadingSchoolCycles}
            />
            {selectedCycle ? (
              source === 'student' ? (
                <>
                  <CAutocomplete
                    setSelected={setCurrentConceptType}
                    data={normalizedSchoolCollectionsConceptTypes || []}
                    placeholder="Selecciona el tipo de concepto"
                    currentValue={currentConceptType}
                    isLoading={isLoadingSchoolCollectionsConceptTypes}
                    disabled={mutation.isPending || isLoadingSchoolCollectionsConceptTypes}
                  />

                  <CAutocomplete
                    setSelected={setCurrentConcept}
                    data={concepts || []}
                    placeholder="Selecciona un concepto"
                    currentValue={currentConcept}
                    isLoading={isLoadingConcepts}
                    disabled={mutation.isPending || isLoadingConcepts}
                  />
                </>
              ) : (
                <Combobox.Root
                  key={concepts?.length}
                  selectedOption={currentConcept}
                  setSelectedOption={setCurrentConcept}
                  data={concepts || []}
                  placeholder="Selecciona un concepto"
                  isLoading={isLoadingConcepts}
                  disabled={mutation.isPending || isLoadingConcepts}
                >
                  {(options: StudentConcept[]) =>
                    options
                      .sort((a, b) => +b.is_optional - +a.is_optional)
                      .map((option) => (
                        <ComboboxOption key={option.id} option={option} setSelectedOption={setCurrentConcept} />
                      ))
                  }
                </Combobox.Root>
              )
            ) : null}
          </div>
          {currentConcept && selectedCycle && (
            <ConceptData
              concept={concept}
              selectedOrders={selectedOrders}
              setSelectedOrders={setSelectedOrders}
              isLoading={isLoadingConcept}
            />
          )}
        </div>
        <SidebarActions className="grid grid-cols-2 px-0">
          <Button
            className="bg-white px-4 text-[#00AB55] text-base font-bold disabled:text-[#919EABCC] rounded-lg flex-1 hover:bg-[#00AB5514]/8"
            onClick={() => {
              sendTrackEventWithUserName(Events.concept_click_cancel);
              setOpenDialog(true);
            }}
            disabled={mutation.isPending}
            variant="outline"
          >
            Cancelar
          </Button>
          <Tooltip
            message="Tiene que haber al menos una orden seleccionada."
            disableHover={!noSelectedOrders}
            className="w-full"
          >
            <button
              className="text-white text-base font-bold px-2 py-3 rounded-lg bg-[#00AB55] hover:bg-green-500 disabled:bg-[#919EAB3D] disabled:text-[#919EABCC] whitespace-nowrap w-full flex-1"
              onClick={onClickAssign}
              disabled={!currentConcept || mutation.isPending || noSelectedOrders}
            >
              {mutation.isPending ? 'Asignando...' : 'Asignar'}
            </button>
          </Tooltip>
        </SidebarActions>
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
              sendTrackEventWithUserName(Events.concept_assignment_cancelled);
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

function ComboboxOption({
  option,
  setSelectedOption,
}: {
  option: StudentConcept;
  setSelectedOption: Dispatch<SetStateAction<StudentConcept | null>>;
}) {
  const isDisabled = !option.is_optional && option.type !== ConceptSlimTypeEnum.INSCRIPTION;

  if (isDisabled) {
    return (
      <Combobox.Option option={option} setSelectedOption={setSelectedOption} disabled={isDisabled}>
        <Tooltip
          message="No puedes asignar conceptos obligatorios hasta que el prospecto sea admitido"
          side="bottom"
          disableClick={isDisabled}
        >
          <span className="text-base opacity-50">{option.name}</span>
        </Tooltip>
      </Combobox.Option>
    );
  }

  const isAssigned = !!option.is_assigned;
  return (
    <Combobox.Option option={option} setSelectedOption={setSelectedOption} disabled={isAssigned}>
      <span className={`text-base ${isAssigned ? 'opacity-50' : ''}`}>{option.name}</span>
      {option.is_assigned ? <SelectChip theme="blue">Ya asignado</SelectChip> : null}
    </Combobox.Option>
  );
}
