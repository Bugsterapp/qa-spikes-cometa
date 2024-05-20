import { Grid, Typography } from '@mui/material';
import { useState } from 'react';
import useToggle from '/src/hooks/useToggle';
import { sendTrackEvent } from '/src/utils/events';
import { formatDateMonthYear } from '/src/utils/datagridHeaders';
import AddIcon from '/public/assets/icons/ic_plus.svg';
import { Events } from '/src/constants/events';
import { Table } from '/src/components/Table';
import { createColumnHelper } from '@tanstack/react-table';
import ConceptAssignment from '../ConceptAssignment';
import ConceptAssignmentEdit from '../ConceptAssignmentEdit';
import IcArrowRight from '/public/assets/icons/ic_arrow_right.svg';
import useSendTrackEventWithUserName from '../../../../hooks/useSendTrackEventWithUserName';
import { useGetPermissions, useSelectedSchool } from '/src/guards/AuthGuard';
import Button from '../Button';
import Sheet from '/src/components/atoms/Sheet';
import { TabsWrapper as Tabs } from '/src/components/atoms/Tabs';
import { api } from '/src/utils/api';
import ConceptAssignmentOptional from '../ConceptAssignmentOptional';
import { useFlags } from '/flags/client';
import { useSession } from 'next-auth/react';

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
  const { data: session } = useSession();
  const flags = useFlags({ traits: { email: session?.user.email } }).flags;
  const isConceptActive = flags?.concepts ?? false;
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
    sendTrackEventWithUserName('dashboard: Concept | Clicked assignment');
  };
  const ended = tab === 'inactive';

  const {
    data: assignments,
    isLoading,
    isFetching,
  } = api.students.studentsAssignments.useQuery({
    studentId,
    ended: tab === 'optionals' ? Boolean(undefined) : ended,
    optional: tab === 'optionals',
  });

  const handleOpen = (row: any) => {
    sendTrackEvent(Events.concept_detail, { source: document.title.split(' | ')[0] });
    setAssignment({ conceptId: row.concept.id, assigmentId: row.id });
    onOpenConceptAssignmentEdit();
    sendTrackEventWithUserName('dashboard: Concept | Detail viewed', { conceptName: row.concept.name });
  };

  const { data: conceptsData } = api.charge.conceptTypesList.useQuery(
    {
      schoolId: selectedSchool?.id as string,
    },
    {
      enabled: Boolean(selectedSchool),
    }
  ) as any;

  const createObjectFromArray = (array: any) =>
    array?.reduce((acc: any, [key, value]: any) => {
      acc[key] = value;
      return acc;
    }, {});

  const renderCategory = (type: string) => createObjectFromArray(conceptsData && conceptsData.concepts_types)[type];

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
          {conceptsData ? renderCategory(info.row.original.concept.type) : null}
        </span>
      ),
      size: 380,
      header: () => <span>Categoría</span>,
    }),
    columnHelper.accessor('concept.payday', {
      cell: (info) => <div className="text-center">{info.row.original.concept.payday}</div>,
      size: 180,
      header: () => <span>Día de vcto</span>,
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
      <Grid item xs={12} p={3} pl={6} display="flex" justifyContent="space-between">
        <Typography variant="h6">Conceptos asignados</Typography>
        {permissions?.can_add_concept_assignment && (
          <Button
            onClick={handlerOpenAssignment}
            leftIcon={<AddIcon fill="currentColor" data-testid="assignConcepts-button" />}
          >
            Asignar concepto
          </Button>
        )}
      </Grid>
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
