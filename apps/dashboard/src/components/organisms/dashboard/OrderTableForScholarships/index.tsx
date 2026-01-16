import { Table } from '/src/components/Table';
import { createColumnHelper } from '@tanstack/react-table';
import { renderMoney } from '/src/utils/datagridHeaders';
import IcArrowRight from '/public/assets/icons/ic_arrow_right.svg';
import ScholarshipAssignmentDetail from '../ScholarshipAssignmentDetail';
import { useState } from 'react';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { Events } from '/src/constants/events';
import { formatDate } from '/src/utils/general';
import Sheet from '/src/components/atoms/Sheet';
import { api } from '/src/utils/api';
import { Scholarship } from '@cometa/trpc/src/types';

interface IOrderTableForSchoarshipsProps {
  studentId: string;
  hideHeader?: boolean;
}

export default function OrderTableForScholarships({ studentId, hideHeader = false }: IOrderTableForSchoarshipsProps) {
  const [scholarshipIdName, setScholarshipIdName] = useState<{ id: string; name: string } | null>(null);
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const statusPercent = ['BRILLAMONT', 'PERCENT'];

  const closeScholarshipAssignmentDetail = () => {
    setScholarshipIdName(null);
  };

  const handlerRowClick = (row: Scholarship) => {
    const { id, name } = row;
    setScholarshipIdName({ id, name });
    sendTrackEventWithUserName(Events.scholarship_detail_viewed, { source: document.title.split(' | ')[0] });
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
    isFetching,
    isPending: isLoading,
  } = api.students.studentsScholarshipList.useQuery(
    {
      studentId: studentId,
    },
    {
      enabled: Boolean(studentId),
    }
  );

  const columnHelper = createColumnHelper<Scholarship>();

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
            ? `${parseFloat(info.row.original.value || '')}%`
            : renderMoney(info.row.original.value) || '0'}
        </div>
      ),
      header: () => <span className="whitespace-nowrap">Monto</span>,
      size: 250,
    }),
    columnHelper.accessor('assigned_at', {
      cell: (info) => (
        <div className="flex text-left capitalize">
          {info.getValue() ? formatDate(info.getValue() as string, 'MMM YYYY') : '-'}
        </div>
      ),
      header: () => <span className="whitespace-nowrap">Desde</span>,
      size: 250,
    }),
    columnHelper.accessor('created', {
      cell: () => <div className="text-left">-</div>,
      header: () => <span className="whitespace-nowrap">Hasta</span>,
      size: 250,
    }),
    columnHelper.accessor('id', {
      cell: () => <IcArrowRight />,
      header: () => null,
      size: 250,
    }),
  ];

  return (
    <>
      <div id="table-for-scholarships">
        {hideHeader && (
          <div className="flex justify-between py-6 pl-12">
            <h6 className="mb-4 text-lg font-bold">Becas asignadas</h6>
          </div>
        )}
        <Table
          isFetching={isFetching}
          data={scholarships?.results || []}
          columns={columns}
          onRowClick={handlerRowClick}
          totalCount={scholarships?.count || 0}
          hideFooter
          hideSum
          isLoading={isLoading}
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
              onClose={closeScholarshipAssignmentDetail}
              studentId={studentId}
              scholarshipId={scholarshipIdName?.id}
              scholarshipName={scholarshipIdName?.name}
            />
          </Sheet.Content>
        </Sheet>
      ) : null}
    </>
  );
}
