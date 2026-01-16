import * as Sentry from '@sentry/nextjs';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import OrderTableForCharge from '../OrderTableForCharge';
import OrderTableForDueOrders from '../OrderTableForDueOrders';
import {
  useSetIsWorking,
  useAddToQueue,
  useSetToError,
  useSetToIdle,
  ETypeFile,
  DownloadMenu,
  DownloadButton,
} from '/src/components/BackgroundDownload/BackgroundDownload';
import File from '/public/assets/icons/download/file.svg';
import Table from '/public/assets/icons/download/table.svg';
import XML from '/public/assets/icons/download/xml.svg';
import { TabsWrapper } from '/src/components/ui/Tabs';
import ApiClient from '/src/services/ApiClient';
import { api } from '/src/utils/api';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { Select } from '@cometa/recreo';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { Events } from '/src/constants/events';

export function AccountSection({ studentId }: { studentId: string }) {
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const setIsWorking = useSetIsWorking();
  const addToQueue = useAddToQueue();
  const setIsError = useSetToError();
  const setToIdle = useSetToIdle();

  const tabs = [
    {
      value: 'due',
      label: 'Órdenes por pagar',
    },
    {
      value: 'complete',
      label: 'Órdenes pagadas',
    },
  ];
  const [tab, setTab] = useState('due');
  const [selectedConcept, setSelectedConcept] = useState<string | null>('all');
  const [selectedSchoolCycle, setSelectedSchoolCycle] = useState<string | null>('all');
  const selectedSchool = useSelectedSchool();

  function handleChangeTab(newValue: string) {
    setSelectedConcept(null);
    setTab(newValue);
  }

  async function getStatementsAccountReport() {
    return ApiClient.generateStudentStatementsReport(selectedSchool?.id, {
      student: studentId,
      school_cycle: selectedSchoolCycle,
    });
  }

  const mutation = useMutation({
    mutationFn: getStatementsAccountReport,
    async onSuccess(data) {
      addToQueue(data.id);
    },
    onError(err) {
      setIsError();
      Sentry.captureException(err);
      setTimeout(() => setToIdle(), 3000);
    },
  });

  async function handleAdd() {
    sendTrackEventWithUserName(tab === 'due' ? Events.paid_orders_downloaded : Events.outstanding_orders_downloaded, {
      Type: 'Tabla',
      Source: 'Detalle de Estudiante',
    });
    await mutation.mutate();
    setIsWorking();
  }

  async function downloadInvoices(extension: string) {
    setIsWorking();
    sendTrackEventWithUserName(tab === 'due' ? Events.paid_orders_downloaded : Events.outstanding_orders_downloaded, {
      Type: `Facturas ${extension.toUpperCase()}`,
      Source: 'Detalle de Estudiante',
    });

    return ApiClient.getInvoicesByStudent(studentId, extension)
      .then((data: Record<string, string>) => {
        addToQueue(data.id, ETypeFile.ZIP);
      })
      .catch(() => {
        setIsError();
        setTimeout(() => setToIdle(), 3000);
      });
  }

  const downloadMenuItems = [
    {
      key: 'invoices-zip',
      children: (
        <>
          <File className="w-4" />
          <span>Descargar facturas PDF</span>
        </>
      ),
      onClick: () => downloadInvoices('pdf'),
    },
    {
      key: 'invoices-xml',
      children: (
        <>
          <XML className="w-4" />
          <span>Descargar facturas XML</span>
        </>
      ),
      onClick: () => downloadInvoices('xml'),
    },
    {
      key: 'table-report',
      children: (
        <>
          <Table className="w-5" />
          <span>Descargar Estado de Cuentas</span>
        </>
      ),
      onClick: () => handleAdd(),
      disabled: selectedSchoolCycle == 'all',
    },
  ];

  function handleChangeConcept(value: string) {
    setSelectedConcept(value);
  }

  function handleChangeSchoolCycle(value: string) {
    setSelectedSchoolCycle(value);
  }

  const { data: assignmentsData, isPending: isLoading } = api.students.studentsAssignmentsList.useQuery(
    { studentId },
    {
      enabled: !!studentId,
      meta: { logErrorToSentry: true },
    }
  );

  const concepts = assignmentsData?.map((assignment) => assignment.concept);

  const { data: schoolCycles } = api.schools.schoolsCycles.useQuery(
    {
      school_id: selectedSchool?.id as string,
    },
    {
      enabled: Boolean(selectedSchool?.id),
      staleTime: 60 * 1000 * 60,
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  return (
    <div className="bg-white rounded-2xl border border-[#E4EBF6] pt-2">
      <TabsWrapper
        tabs={tabs}
        tab={tab}
        handleChangeTab={handleChangeTab}
        defaultValue="due"
        tabsListClassName="rounded-t-2xl"
      >
        <DownloadMenu items={downloadMenuItems}>
          <DownloadButton theme="blue" />
        </DownloadMenu>
      </TabsWrapper>

      <div className="flex items-center px-6 py-5">
        <Select
          containerClassName="w-full max-w-[25%]"
          className="w-full"
          placeholder="Conceptos"
          disabled={isLoading}
          onValueChange={handleChangeConcept}
          value={selectedConcept ?? 'all'}
        >
          <Select.Content>
            <Select.Item value="all" key="concepts-all">
              <em>Todos</em>
            </Select.Item>
            {concepts?.map((option) => (
              <Select.Item key={option.id} value={option.id}>
                {option.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>

        <Select
          containerClassName="w-full max-w-[25%] ml-4"
          className="w-full"
          placeholder="Ciclo"
          disabled={isLoading}
          onValueChange={handleChangeSchoolCycle}
          value={selectedSchoolCycle ?? 'all'}
        >
          <Select.Content>
            <Select.Item value="all" key="school-cycles-all">
              <em>Todos</em>
            </Select.Item>
            {schoolCycles?.map((option) => (
              <Select.Item key={option.id} value={option.id as string}>
                {option.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>

      {tab === 'due' ? (
        <OrderTableForDueOrders
          studentId={studentId}
          concept={selectedConcept === 'all' ? '' : selectedConcept ?? undefined}
          schoolCycle={selectedSchoolCycle === 'all' ? '' : selectedSchoolCycle ?? undefined}
        />
      ) : null}
      {tab === 'complete' ? (
        <OrderTableForCharge
          hideHeader
          hideSum
          studentId={studentId}
          conceptId={selectedConcept === 'all' ? '' : selectedConcept ?? undefined}
          schoolCycleId={selectedSchoolCycle === 'all' ? '' : selectedSchoolCycle ?? undefined}
        />
      ) : null}
    </div>
  );
}
