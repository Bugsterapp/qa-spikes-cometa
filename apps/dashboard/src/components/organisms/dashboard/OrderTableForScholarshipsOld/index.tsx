import { Grid, Typography } from '@mui/material';
import { getSession } from 'next-auth/react';
import ApiClient from '../../../../services/ApiClient';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEY_SCHOLARSHIPS_OLD } from '/src/utils/reactQueryKeys';
import * as Sentry from '@sentry/nextjs';
import { Table } from '/src/components/Table';
import { createColumnHelper } from '@tanstack/react-table';
import { renderMoney } from '/src/utils/datagridHeaders';
import IcArrowRight from '/public/assets/icons/ic_arrow_right.svg';
import ScholarshipAssignmentDetail from '../ScholarshipAssignmentDetail';
import { useState } from 'react';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { formatDate, formatDateShort } from '/src/utils/general';
import Sheet from '/src/components/atoms/Sheet';

interface IOrderTableForSchoarshipsOldProps {
  studentId: string;
  hideHeader?: boolean;
}

interface Result {
  id: number;
  scholarship_id: string;
  affected_concept_types: string[];
  name: string;
  type: string;
  value: string;
  assigned_at: string;
  deassigned_at: string;
  arrow?: string;
}

interface ScholarshipsOldTableResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Result[];
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

  const handlerRowClick = (row: Result) => {
    const { scholarship_id: id, name, assigned_at, deassigned_at } = row;
    const formated_assigned_at = formatDateShort(assigned_at);
    const formated_deassigned_at = formatDateShort(deassigned_at);
    setScholarshipIdName({ id, name, formated_assigned_at, formated_deassigned_at });
    sendTrackEventWithUserName('dashboard: Scolarship | Detail viewed');
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

  const scholarshipsQuery = async () => {
    const session = await getSession();
    const res = await ApiClient.getScholarshipsOldForStudent(session?.token, studentId);
    return res?.data;
  };

  const {
    data: scholarships,
    isLoading,
    isFetching,
  } = useQuery([QUERY_KEY_SCHOLARSHIPS_OLD], scholarshipsQuery, {
    onError(err) {
      Sentry.captureException(err);
    },
  });

  const columnHelper = createColumnHelper<ScholarshipsOldTableResponse['results'][number]>();

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
            ? `${parseFloat(info.row.original.value)}%`
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
    columnHelper.accessor('arrow', {
      cell: () => <IcArrowRight />,
      header: () => null,
      size: 250,
    }),
  ];

  return (
    <>
      <div id="table-for-scholarships-old">
        {hideHeader && (
          <Grid item xs={12} p={3} pl={6} display="flex" justifyContent="space-between">
            <Typography variant="h6" sx={{ mb: 2 }}>
              Becas pasadas
            </Typography>
          </Grid>
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
