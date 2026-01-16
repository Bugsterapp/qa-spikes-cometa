import { createColumnHelper } from '@tanstack/react-table';
import { useState } from 'react';

import IcArrowRight from '/public/assets/icons/ic_arrow_right.svg';
import AddIcon from '/public/assets/icons/ic_plus.svg';
import Sheet from '/src/components/atoms/Sheet';
import { Table } from '/src/components/Table';
import { TabsWrapper as Tabs } from '/src/components/ui/Tabs';
import { Events } from '/src/constants/events';
import { useGetPermissions, useSelectedSchool } from '/src/guards/AuthGuard';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { useFlagWithVariableMatching } from '/src/components/flags/FlagsProvider';
import useToggle from '/src/hooks/useToggle';
import { api } from '/src/utils/api';
import { formatDateMonthYear } from '/src/utils/datagridHeaders';

import Button from '../Button';
import ConceptAssignment from '../ConceptAssignment';
import ConceptAssignmentEdit from '../ConceptAssignmentEdit';
import ConceptAssignmentOptional from '../ConceptAssignmentOptional';

interface Concept {
  id: string;
  name: string;
  payday: number;
  price: string;
  type: string;
}

interface Result {
  concept: Concept;
  end_date: string;
  id: string;
  start_date: string;
}

interface AssignmentsTableResponse {
  data: Result[];
}

interface OrderTableForAssignmentsProps {
  student: any;
  studentId: string;
}

export default function OrderTableForAssignments(props: OrderTableForAssignmentsProps) {
  const { student, studentId } = props;
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const [tab, setTab] = useState('active');
  const { isEnabled: isConceptActive } = useFlagWithVariableMatching('hk_concepts');
  const [assignment, setAssignment] = useState<{ conceptId: string; assigmentId: string } | null>(null);
  const selectedSchool = useSelectedSchool();
  const {
    toggle: openConceptAssignment,
    onClose: onCloseConceptAssignment,
    onOpen: onOpenConceptAssignment,
  } = useToggle();
  const {
    toggle: openConceptAssignmentEdit,
    onClose: onCloseConceptAssignmentEdit,
    onOpen: onOpenConceptAssignmentEdit,
  } = useToggle();
  const permissions = useGetPermissions();

  const handlerOpenAssignment = () => {
    onOpenConceptAssignment();
    sendTrackEventWithUserName(Events.concept_click_assignment);
  };
  const ended = tab === 'inactive';

  const {
    data: assignments,
    isPending: isLoading,
    isFetching,
  } = api.students.studentsAssignments.useQuery({
    studentId,
    ended: tab === 'optionals' ? Boolean(undefined) : ended,
    optional: tab === 'optionals',
  });

  const handleOpen = (row: any) => {
    sendTrackEventWithUserName(Events.concept_detail, { source: document.title.split(' | ')[0] });
    setAssignment({ conceptId: row.concept.id, assigmentId: row.id });
    onOpenConceptAssignmentEdit();
    sendTrackEventWithUserName(Events.concept_detail_viewed, { conceptName: row.concept.name });
  };

  const { data: conceptsData } = api.charge.conceptTypesList.useQuery(
    {
      schoolId: selectedSchool?.id as string,
    },
    {
      enabled: Boolean(selectedSchool),
    }
  );

  const columnHelper = createColumnHelper<AssignmentsTableResponse['data'][number]>();
  const columns = [
    columnHelper.accessor('concept.name', {
      cell: (info) => <span className="font-semibold">{info.row.original.concept.name}</span>,
      size: 380,
      header: () => <span>Concepto</span>,
    }),
    columnHelper.accessor('concept.type', {
      cell: (info) => (
        <span className="whitespace-nowrap">
          {conceptsData?.find((concept) => concept.id === info.row.original.concept.type)?.name || ''}
        </span>
      ),
      size: 380,
      header: () => <span>Categoría</span>,
    }),
    columnHelper.accessor('start_date', {
      cell: (info) => (
        <span className="capitalize">{info.getValue() ? formatDateMonthYear(info.row.original.start_date) : '-'}</span>
      ),
      header: () => <span className="whitespace-nowrap">Desde</span>,
      size: 250,
    }),
    columnHelper.accessor('end_date', {
      cell: (info) => (
        <span className="capitalize">{info.getValue() ? formatDateMonthYear(info.row.original.end_date) : '-'}</span>
      ),
      header: () => <span className="whitespace-nowrap">Hasta</span>,
      size: 250,
    }),
    columnHelper.accessor('concept', {
      cell: () => <IcArrowRight />,
      header: () => null,
      size: 250,
    }),
  ];
  const tabsConceptsData = [
    {
      value: 'active',
      label: 'Vigentes',
    },
    {
      value: 'inactive',
      label: 'Pasados',
    },
    ...(isConceptActive ? [{ value: 'optionals', label: 'Opcionales' }] : []),
  ];
  const handleChangeConceptsTab = (newValue: string) => {
    setTab(newValue);
  };
  return (
    <div id="table-for-assignments">
      <div className="p-3 pl-6 flex justify-between items-center">
        <h6 className="text-lg font-medium">Conceptos asignados</h6>
        {permissions?.can_add_concept_assignment && (
          <Button
            onClick={handlerOpenAssignment}
            leftIcon={<AddIcon fill="currentColor" data-testid="assignConcepts-button" />}
          >
            Asignar concepto
          </Button>
        )}
      </div>
      <Tabs tabs={tabsConceptsData} tab={tab} handleChangeTab={handleChangeConceptsTab} defaultValue="active" />
      <Table
        data={assignments || []}
        totalCount={assignments?.length || 0}
        columns={columns}
        onRowClick={handleOpen}
        hideSum
        isLoading={isLoading}
        isFetching={isFetching}
        emptyStateText="No hay ningún concepto asignado"
        hideColumns={tab === 'optionals' ? ['concept_payday', 'start_date', 'end_date'] : undefined}
      />
      <Sheet
        open={openConceptAssignmentEdit}
        onOpenChange={(open) => {
          if (!open) onCloseConceptAssignmentEdit();
        }}
      >
        <Sheet.Content>
          {tab === 'optionals' ? (
            <ConceptAssignmentOptional
              onClose={onCloseConceptAssignmentEdit}
              student={student}
              assignment={assignment}
              studentId={studentId}
            />
          ) : (
            <ConceptAssignmentEdit
              onClose={onCloseConceptAssignmentEdit}
              student={student}
              assignment={assignment}
              studentId={studentId}
            />
          )}
        </Sheet.Content>
      </Sheet>
      <Sheet
        open={openConceptAssignment}
        onOpenChange={(open) => {
          if (!open) onCloseConceptAssignment();
        }}
      >
        <Sheet.Content>
          <ConceptAssignment onClose={onCloseConceptAssignment} studentId={studentId} />
        </Sheet.Content>
      </Sheet>
    </div>
  );
}
