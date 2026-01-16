import { AccordionItem, AccordionTrigger } from '../../atoms/DelinquencyAccordion';
import { LazyFulfillmentRows } from './LazyFulfillmentRows';
import { HighlightMatch } from '../../atoms/HighlightMatch';
import { Tooltip } from '../../atoms/Tooltip';
import Chip from '../../atoms/Chip';
import Button from '../../organisms/dashboard/Button';
import Grid from '../../atoms/Grid';
import * as React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { useCallback, useState } from 'react';
import { ExpandedState, Row } from '@tanstack/react-table';
import { DashboardStudentDelinquencySummary } from '@cometa/trpc';
import ExpandIcon from '../../../assets/ExpandIcon.svg';
import { DelinquentStudentExtended } from '/src/types';
import { TrackEvents } from '/src/constants/events';
import { formatPrice } from '/src/utils/general';

export const StudentRow = function StudentRow({
  row,
  searchDebounced,
  sendTrackEventWithUserName,
  setStudentDetailId,
  setStudentDetailTotalDebt,
  setSelectedOrder,
  isSubRow,
  setExpanded,
}: {
  row: Row<DelinquentStudentExtended | DashboardStudentDelinquencySummary>;
  searchDebounced: string;
  sendTrackEventWithUserName: (event: string, data?: object) => void;
  setStudentDetailId: (id: string | null) => void;
  setStudentDetailTotalDebt: (debt: string | null) => void;
  setSelectedOrder: (order: { order: string; student: string } | null) => void;
  isSubRow?: boolean;
  setExpanded?: (updater: React.SetStateAction<ExpandedState>) => void;
}) {
  const [isStudentExpanded, setIsStudentExpanded] = useState(false);
  const studentData = row.original;
  const isExpanded = isSubRow ? isStudentExpanded : row.getIsExpanded();
  const handleAccordionChange = (value: string[]) => {
    if (isSubRow) {
      setIsStudentExpanded(value.length > 0);
    } else {
      setExpanded?.((old) => {
        const newExpanded = typeof old === 'object' ? { ...old } : {};
        newExpanded[row.id] = value.length > 0;
        return newExpanded;
      });
    }
  };

  const handleViewDetailsClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      sendTrackEventWithUserName(TrackEvents.delinquency.delinquency_student_detail_open, {});
      setStudentDetailId(studentData.id);
      setStudentDetailTotalDebt(studentData?.total_debt ?? null);
    },
    [sendTrackEventWithUserName, setStudentDetailId, setStudentDetailTotalDebt, studentData.id, studentData?.total_debt]
  );

  const handleOrderClick = useCallback(
    (orderId: string) => {
      sendTrackEventWithUserName(TrackEvents.delinquency.delinquency_order_open, { origin: 'row' });
      setSelectedOrder({
        order: orderId,
        student: studentData.id,
      });
    },
    [sendTrackEventWithUserName, setSelectedOrder, studentData.id]
  );

  return (
    <div className="my-3 px-3 col-span-full" key={studentData.id}>
      <Accordion.Root type="multiple" value={isExpanded ? [studentData.id] : []} onValueChange={handleAccordionChange}>
        <AccordionItem value={studentData.id}>
          <AccordionTrigger>
            <Grid columns={['grid-cols-2']} className="items-center w-full">
              <div className="flex items-center gap-4 select-none justify-self-start">
                <div className="flex flex-col">
                  <strong className="text-base text-left text-[#212B36]">
                    <HighlightMatch query={searchDebounced}>
                      {studentData?.first_name} {studentData?.last_name}
                    </HighlightMatch>
                  </strong>
                  <span className="text-xs text-[#637381] text-left">
                    <HighlightMatch query={searchDebounced}>{studentData?.enrollment_code}</HighlightMatch> |{' '}
                    {studentData?.section} - {studentData?.level}
                  </span>
                </div>
                <Tooltip message="Órdenes vencidas">
                  <Chip intent="error" rounded="full">
                    {studentData?.number_of_past_due_orders}
                  </Chip>
                </Tooltip>
              </div>
              <div className="flex items-center gap-5 justify-self-end">
                <div className="flex flex-col select-none">
                  <span className="text-xs text-[#637381] text-left">Deuda del estudiante</span>
                  <strong className="text-base text-right text-[#212B36] ">
                    {formatPrice(studentData?.total_debt || '0')}
                  </strong>
                </div>
                <Tooltip message="Ver más detalle">
                  <Button
                    id="details-expand"
                    variant="icon"
                    data-testid="student-details-expand-button"
                    onClick={handleViewDetailsClick}
                    className="w-8 h-8 p-1 group/expand"
                  >
                    <ExpandIcon />
                  </Button>
                </Tooltip>
              </div>
            </Grid>
          </AccordionTrigger>
          <LazyFulfillmentRows studentId={studentData.id} isExpanded={isExpanded} onClickOrder={handleOrderClick} />
        </AccordionItem>
      </Accordion.Root>
    </div>
  );
};
