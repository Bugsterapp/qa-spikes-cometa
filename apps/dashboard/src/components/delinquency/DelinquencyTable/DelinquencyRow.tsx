import { AccordionItem, AccordionTrigger } from '../../atoms/DelinquencyAccordion';
import { HighlightMatch } from '../../atoms/HighlightMatch';
import Grid from '../../atoms/Grid';
import * as React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { StudentRow } from './StudentRow';
import { ExpandedState, Row } from '@tanstack/react-table';
import { DashboardStudentDelinquencySummary } from '@cometa/trpc';
import { DelinquentStudentExtended } from '/src/types';
import { formatPrice } from '/src/utils/general';

export const DelinquencyRow = function DelinquencyRow({
  row,
  searchDebounced,
  sendTrackEventWithUserName,
  setStudentDetailId,
  setStudentDetailTotalDebt,
  setSelectedOrder,
  grouping,
  setExpanded,
}: {
  row: Row<DelinquentStudentExtended | DashboardStudentDelinquencySummary>;
  searchDebounced: string;
  sendTrackEventWithUserName: (event: string, data?: object) => void;
  setStudentDetailId: (id: string | null) => void;
  setStudentDetailTotalDebt: (debt: string | null) => void;
  setSelectedOrder: (order: { order: string; student: string } | null) => void;
  grouping: string;
  setExpanded: (updater: React.SetStateAction<ExpandedState>) => void;
}) {
  const isGrouped = row.getIsGrouped();

  if (isGrouped) {
    const totalDebt = row.subRows.reduce((acc, subRow) => acc + parseFloat(subRow.original.total_debt), 0);
    const totalDelinquentFulfillments = row.subRows.reduce(
      (acc, subRow) => acc + (Number.parseFloat(subRow.original.number_of_past_due_orders) || 0),
      0
    );
    return (
      <div className="px-3 my-3 col-span-full">
        <Accordion.Root
          type="single"
          collapsible
          value={row.getIsExpanded() ? row.id : ''}
          onValueChange={row.getToggleExpandedHandler()}
        >
          <AccordionItem value={row.id} className="bg-white border border-neutral-100 rounded-lg">
            <AccordionTrigger>
              <Grid columns={['grid-cols-2']} className="items-center w-full">
                <div className="flex items-center gap-4 select-none justify-self-start">
                  <div className="flex flex-col">
                    <strong className="text-base text-left text-[#212B36] flex items-center gap-1">
                      <HighlightMatch query={searchDebounced}>{row.getValue(grouping)}</HighlightMatch>
                      {totalDelinquentFulfillments > 0 && (
                        <div className="text-sm px-2 py-1 font-bold font-lota text-[#FF4842] bg-[#FF4842]/[0.12] rounded-full max-h-6 max-w-[24px] flex items-center justify-center text-center">
                          {totalDelinquentFulfillments}
                        </div>
                      )}
                    </strong>
                  </div>
                </div>
                <div className="flex items-center gap-5 justify-self-end">
                  <div className="flex flex-col select-none">
                    <span className="text-xs text-[#637381] text-left">Deuda del grupo</span>
                    <strong className="text-base text-right text-[#212B36] ">
                      {formatPrice(totalDebt.toString())}
                    </strong>
                  </div>
                </div>
              </Grid>
            </AccordionTrigger>
            <Accordion.Content>
              {row.subRows.map((subRow) => (
                <StudentRow
                  key={subRow.id}
                  row={subRow as unknown as Row<DashboardStudentDelinquencySummary>}
                  searchDebounced={searchDebounced}
                  sendTrackEventWithUserName={sendTrackEventWithUserName}
                  setStudentDetailId={setStudentDetailId}
                  setStudentDetailTotalDebt={setStudentDetailTotalDebt}
                  setSelectedOrder={setSelectedOrder}
                  isSubRow
                />
              ))}
            </Accordion.Content>
          </AccordionItem>
        </Accordion.Root>
      </div>
    );
  }

  return (
    <StudentRow
      row={row}
      searchDebounced={searchDebounced}
      sendTrackEventWithUserName={sendTrackEventWithUserName}
      setStudentDetailId={setStudentDetailId}
      setStudentDetailTotalDebt={setStudentDetailTotalDebt}
      setSelectedOrder={setSelectedOrder}
      setExpanded={setExpanded}
    />
  );
};
