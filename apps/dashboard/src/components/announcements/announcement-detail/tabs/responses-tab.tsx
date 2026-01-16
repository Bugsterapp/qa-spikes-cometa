import React, { useMemo, useState } from 'react';
import { api } from '/src/utils/api';
import { TableVirtualized } from '/src/components/TableInfinityScroll';
import { createColumnHelper } from '@tanstack/react-table';
import { useAdjustHeight } from 'src/hooks/useFullScreenHeight';
import { Download } from 'lucide-react';
import useAlert, { defaultAlertTime } from '/src/hooks/useAlert';
import { useSendEvent } from '/src/hooks/useSendEvent';
import { TrackEvents } from '/src/constants/events';

interface ResponseRow {
  id: string;
  student: any;
  answers: any[];
}

interface ResponsesTabProps {
  announcementId: string | string[] | undefined;
  responsesSearchTerm: string;
  setResponsesSearchTerm: (term: string) => void;
  questions: any[];
}

const columnHelper = createColumnHelper<ResponseRow>();

export default function ResponsesTab({ announcementId, responsesSearchTerm, questions }: ResponsesTabProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { setAlertState } = useAlert();
  const sendEvent = useSendEvent();

  const { data: dataResponses, isPending: isLoading } = api.announcements.getAnnouncementResponses.useQuery(
    {
      announcementId: String(announcementId) || '',
      filters: { has_answer: true },
    },
    { enabled: !!announcementId }
  ) as { data: any | undefined; isPending: boolean };

  const { refetch: downloadCsv } = api.announcements.downloadResponsesCsv.useQuery(
    {
      announcementId: String(announcementId) || '',
    },
    {
      enabled: false, // Don't fetch automatically
      retry: false,
    }
  );

  const handleDownloadCsv = async () => {
    if (!announcementId) return;
    sendEvent(TrackEvents.announcements.detail.responsesReportDownloaded, {
      announcement_id: announcementId,
    });
    setIsDownloading(true);
    try {
      const result = await downloadCsv();

      if (result.data) {
        // Create a Blob from the CSV string
        const blob = new Blob([result.data.csv], { type: 'text/csv;charset=utf-8;' });

        // Create a temporary URL for the blob
        const url = window.URL.createObjectURL(blob);

        // Create a temporary anchor element and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = result.data.filename || `respuestas_${announcementId}.csv`;
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Error al descargar el archivo',
        alertTime: defaultAlertTime,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Transform and filter data based on search term
  const filteredData = useMemo(() => {
    if (!dataResponses?.items || !Array.isArray(dataResponses.items)) {
      return [];
    }

    // Transform each notification into a single ResponseRow (one row per student)
    const responseRows: ResponseRow[] = [];

    dataResponses.items.forEach((notification: any) => {
      if (notification.student) {
        responseRows.push({
          id: notification.id,
          student: notification.student,
          answers: notification.answers || [],
        });
      }
    });

    // Filter based on search term
    if (!responsesSearchTerm) return responseRows;

    return responseRows.filter((row) => {
      const studentName = `${row.student.first_name || ''} ${row.student.last_name || ''}`.trim();
      const studentGrade = row.student.grade || '';

      return (
        studentName.toLowerCase().includes(responsesSearchTerm.toLowerCase()) ||
        studentGrade.toLowerCase().includes(responsesSearchTerm.toLowerCase())
      );
    });
  }, [dataResponses, responsesSearchTerm]);

  // Create columns with dynamic question columns
  const columns = useMemo(() => {
    const baseColumns = [
      columnHelper.display({
        id: 'student_name',
        header: 'Estudiante',
        cell: (info) => {
          const student = info.row.original.student;
          const studentName = `${student.first_name || ''} ${student.last_name || ''}`.trim();
          return <span className="font-normal text-neutral-900">{studentName}</span>;
        },
        size: 290,
      }),
      columnHelper.display({
        id: 'student_grade',
        header: 'Grado',
        cell: (info) => {
          const studentGrade = info.row.original.student?.grade || 'Sin grado';
          return <span className="font-normal text-neutral-900">{studentGrade}</span>;
        },
        size: 120,
      }),
    ];

    // Add dynamic columns for each question
    const questionColumns = questions.map((question, index) =>
      columnHelper.display({
        id: `question_${question.id || index}`,
        header: question.statement, // Use the question statement as the header
        cell: (info) => {
          const answers = info.row.original.answers;
          // Find the answer that matches this question's ID
          const matchingAnswer = answers.find((answer: any) => answer.question_id === question.id);
          const answer = matchingAnswer?.response || 'Sin respuesta';
          return (
            <div
              className="max-w-[350px] max-h-[80px] overflow-y-auto overflow-x-hidden"
              style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}
            >
              <span className="font-normal text-neutral-900 whitespace-pre-wrap">{answer}</span>
            </div>
          );
        },
        size: 350,
      })
    );

    return [...baseColumns, ...questionColumns];
  }, [questions]);

  const { wrapperRef, maxHeight } = useAdjustHeight(550);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-20rem)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent border-galaxy-500" />
      </div>
    );
  }

  return (
    <div className="box-border content-stretch flex flex-col gap-2.5 items-start justify-start p-0 relative w-full pt-3">
      {/* Header with download button */}
      <div className="flex justify-between items-center mb-4 w-full">
        <div className="flex-1" />
        <button
          onClick={handleDownloadCsv}
          disabled={isDownloading || !filteredData.length}
          className="flex items-center gap-2 text-neutral-900 text-sm font-bold leading-5 align-middle hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{isDownloading ? 'Descargando...' : 'Descargar'}</span>
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="w-full h-full flex flex-col max-h-[calc(100vh-320px)] min-h-[calc(100vh-320px)]" ref={wrapperRef}>
        <TableVirtualized
          totalFetched={filteredData?.length || 0}
          hasNextPage={false}
          fetchNextPage={() => void 0}
          data={filteredData}
          columns={columns as any[]}
          totalCount={filteredData?.length || 0}
          isLoading={isLoading}
          isFetching={false}
          rowClassName="hover:bg-neutral-50"
          emptyStateText="No hay respuestas disponibles para este comunicado."
          classNameContainer="[&_tr:hover]:bg-gray-50 max-h-full"
          maxHeight={maxHeight}
        />
      </div>
    </div>
  );
}
