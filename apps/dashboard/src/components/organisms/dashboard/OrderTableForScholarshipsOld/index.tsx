import { ScholarshipExpired } from '@cometa/trpc/src/types';
import { createColumnHelper } from '@tanstack/react-table';
import { useState } from 'react';

import IcArrowRight from '/public/assets/icons/ic_arrow_right.svg';
import Sheet from '/src/components/atoms/Sheet';
import { Table } from '/src/components/Table';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { Events } from '/src/constants/events';
import { api } from '/src/utils/api';
import { renderMoney } from '/src/utils/datagridHeaders';
import { formatDate, formatDateShort } from '/src/utils/general';

import ScholarshipAssignmentDetail from '../ScholarshipAssignmentDetail';

interface IOrderTableForSchoarshipsOldProps {
  studentId: string;
  hideHeader?: boolean;
}

export default function OrderTableForScholarshipsOld({
  studentId,
  hideHeader = false,
}: IOrderTableForSchoarshipsOldProps) {
  const [scholarshipIdName, setScholarshipIdName] = useState<{
    id: string;
    name: string;
    formated_assigned_at: string;
    formated_deassigned_at: string;
  } | null>(null);
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();

  const closeScholarshipAssignmentDetail = () => {
    setScholarshipIdName(null);
  };

  const statusPercent = ['BRILLAMONT', 'PERCENT'];

  const handlerRowClick = (row: ScholarshipExpired) => {
    const { scholarship_id: id, name, assigned_at, deassigned_at } = row;
    const formated_assigned_at = formatDateShort(assigned_at);
    const formated_deassigned_at = formatDateShort(deassigned_at);
    setScholarshipIdName({ id, name, formated_assigned_at, formated_deassigned_at });
    sendTrackEventWithUserName(Events.scholarship_detail_viewed);
  };

  const typeValue = (type: string) => {
    switch (type) {
      case 'PERCENT':
        return 'Porcentual';
      case 'AMOUNT':
        return 'Monto';
      case 'FIXED':
        return 'Fijo';
      default:
        return;
    }
  };

  const {
    data: scholarships,
    isPending: isLoading,
    isFetching,
  } = api.students.expiredScholarships.useQuery({ studentId: studentId });

  const columnHelper = createColumnHelper<ScholarshipExpired>();

  const columns = [
    columnHelper.accessor('name', {
      cell: (info) => <span className="font-semibold">{info.row.original.name}</span>,
      size: 380,
      header: () => <span>Beca</span>,
    }),
    columnHelper.accessor('type', {
      cell: (info) => <span className="whitespace-nowrap">{typeValue(info.row.original.type)}</span>,
      size: 380,
      header: () => <span>Tipo</span>,
    }),
    columnHelper.accessor('value', {
      cell: (info) => (
        <div className="flex text-left">
          {statusPercent.includes(info.row.original.type)
            ? `${info.row.original.value}%`
            : renderMoney(info.row.original.value) || '0'}
        </div>
      ),
      header: () => <span className="whitespace-nowrap">Monto</span>,
      size: 250,
    }),
    columnHelper.accessor('assigned_at', {
      cell: (info) => <div className="flex text-left capitalize">{formatDate(info.getValue(), 'MMM YYYY')}</div>,
      header: () => <span className="whitespace-nowrap">Desde</span>,
      size: 250,
    }),
    columnHelper.accessor('deassigned_at', {
      cell: (info) => <div className="flex text-left capitalize">{formatDate(info.getValue(), 'MMM YYYY')}</div>,
      header: () => <span className="whitespace-nowrap">Hasta</span>,
      size: 250,
    }),
    columnHelper.display({
      id: 'arrow',
      cell: () => <IcArrowRight />,
      size: 250,
    }),
  ];

  return (
    <>
      <div id="table-for-scholarships-old">
        {hideHeader && (
          <div className="p-3 pl-6 flex justify-between">
            <h6 className="text-lg font-semibold mb-2">Becas pasadas</h6>
          </div>
        )}
        <Table
          data={scholarships?.results || []}
          columns={columns}
          onRowClick={handlerRowClick}
          totalCount={scholarships?.count || 0}
          hideFooter
          hideSum
          isLoading={isLoading}
          isFetching={isFetching}
        />
      </div>
      {scholarshipIdName?.id && scholarshipIdName.name ? (
        <Sheet
          open={!!scholarshipIdName}
          onOpenChange={(open) => {
            if (!open) closeScholarshipAssignmentDetail();
          }}
        >
          <Sheet.Content>
            <ScholarshipAssignmentDetail
              isOld
              onClose={closeScholarshipAssignmentDetail}
              studentId={studentId}
              scholarshipId={scholarshipIdName?.id}
              scholarshipName={scholarshipIdName?.name}
              assignedAt={scholarshipIdName?.formated_assigned_at}
              deassignedAt={scholarshipIdName?.formated_deassigned_at}
            />
          </Sheet.Content>
        </Sheet>
      ) : null}
    </>
  );
}
