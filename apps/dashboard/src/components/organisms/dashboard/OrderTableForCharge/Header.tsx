import Header from '../../../molecules/dashboard/Header';
import GuardianSelector from '../GuardianSelector';
import MultipleFilters, { FilterItems, FormFilterData, Params } from '../../../MultipleFilters';
import { FulfillmentFiltersFromApi } from '/types/paid-orders';
import {
  DownloadButton,
  DownloadMenu,
  ETypeFile,
  useAddToQueue,
  useSetIsWorking,
  useSetToError,
  useSetToIdle,
} from '/src/components/BackgroundDownload/BackgroundDownload';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import ApiClient from '/src/services/ApiClient';
import * as Sentry from '@sentry/nextjs';
import File from '/public/assets/icons/download/file.svg';
import XML from '/public/assets/icons/download/xml.svg';
import Table from '/public/assets/icons/download/table.svg';
import { sendTrackEvent } from '/src/utils/events';
import { useGetPermissions, useSelectedSchoolId } from '/src/guards/AuthGuard';
import { useMemo, useState } from 'react';
import useSearchStudents from '/src/hooks/useSearchStudents';
import { UseFormReturn } from 'react-hook-form';
import DateRange from '/src/components/DateRange';
import PersonIcon from 'public/assets/images/person.svg';
import useDebounce from '/src/hooks/useDebounce';
import { Combobox } from '/src/components/atoms/Combobox';
import { GlobalSearch } from '/src/components/atoms/GlobalSearch';

interface HeaderTableProps {
  filterParams: Params;
  filters: any;
  title: string;
  clickOnButton: () => void;
  selectedGuardian: any;
  setSelectedGuardian: (selectedGuardian: any) => void;
  selectedStudent: any;
  setSelectedStudent: (selectedStudent: any) => void;
  handleFilter: (formFilterData: FormFilterData, methods: UseFormReturn<FormFilterData>) => void;
  handleClearFilter: () => void;
  selectedDates: Date[];
  onDatesChange(dates: Date[]): void;
  setSearch: (search: string) => void;
  search: string;
}

export default function HeaderTable({
  title,
  clickOnButton,
  selectedGuardian,
  setSelectedGuardian,
  selectedStudent,
  setSelectedStudent,
  selectedDates,
  onDatesChange,
  handleFilter,
  handleClearFilter,
  filterParams,
  filters,
  setSearch,
  search,
}: HeaderTableProps) {
  const permissions = useGetPermissions();
  const { data: session } = useSession();
  const selectedSchool = useSelectedSchoolId();
  const setIsWorking = useSetIsWorking();
  const addToQueue = useAddToQueue();
  const setIsError = useSetToError();
  const setToIdle = useSetToIdle();
  const [searchStudent, setSearchStudent] = useState('');
  const debouncedQuery = String(useDebounce(searchStudent, 300));
  const [itemsCount, setItemsCount] = useState<{ watchKey: string; count: number }[]>([]);
  const { data: studentsOnSchool, isFetching } = useSearchStudents(
    session?.token,
    selectedSchool || '',
    debouncedQuery
  );
  const getDelicuencyReport = async () =>
    ApiClient.generateFulfillmentsReport(session?.token || '', selectedSchool || '', {
      ...filters,
      ...filterParams,
      students: selectedStudent?.id,
      guardians: selectedGuardian?.id,
    });

  const downloadInvoices = async (extension: string) => {
    sendTrackEvent('dashboard: Paid Orders Downloaded', {
      Type: `Facturas ${extension.toUpperCase()}`,
      Source: 'Cobranzas',
    });
    setIsWorking();

    return ApiClient.getSchoolPayedOrdersInvoices(session?.token || '', selectedSchool, extension, {
      ...filters,
      ...filterParams,
      students: selectedStudent?.id,
      guardians: selectedGuardian?.id,
    })
      .then((data: any) => {
        addToQueue(data.id, ETypeFile.ZIP);
      })
      .catch(() => {
        setIsError();
        setTimeout(() => setToIdle(), 3000);
      });
  };

  const mutation = useMutation({
    mutationFn: getDelicuencyReport,
    async onSuccess(data) {
      addToQueue(data.id);
    },
    onError(err) {
      setIsError();
      Sentry.captureException(err);
      setTimeout(() => setToIdle(), 3000);
    },
  });
  const handleAdd = async () => {
    sendTrackEvent('dashboard: Paid Orders Downloaded', { Type: 'Tabla', Source: 'Cobranzas' });
    await mutation.mutate();
    setIsWorking();
  };

  const DownloadMenuItems = [
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
          <span>Descargar tabla</span>
        </>
      ),
      onClick: () => handleAdd(),
    },
  ];

  const getFilter = async () => {
    const data = (await ApiClient.getSchoolFullfilmentFilters(
      session?.token,
      selectedSchool
    )) as FulfillmentFiltersFromApi;

    const transform = data?.payment_methods?.map((item) => ({
      id: item[0],
      name: item[1],
    }));

    const transformPaymentPlaces = data?.collected_at?.map((item) => ({
      id: item[0],
      name: item[1],
    }));

    return {
      ...data,
      payment_methods: transform,
      collected_at: transformPaymentPlaces,
    };
  };

  const { data: schoolFulfillmentsFilters } = useQuery(['schoolFulfillmentsFilters'], getFilter, {
    enabled: !!selectedSchool,
    staleTime: 1000 * 60,
  });

  const filterItems: FilterItems[] = [
    {
      header: 'Concepto',
      watchKey: 'concepts',
      contents: schoolFulfillmentsFilters?.concepts,
    },
    {
      header: 'Orden',
      watchKey: 'orders',
      contents: schoolFulfillmentsFilters?.orders,
    },
    {
      header: 'Medio de pago',
      watchKey: 'payment_methods',
      contents: schoolFulfillmentsFilters?.payment_methods,
    },
    {
      header: 'Nivel',
      watchKey: 'levels',
      contents: schoolFulfillmentsFilters?.levels,
    },
    {
      header: 'Sección',
      watchKey: 'sections',
      contents: schoolFulfillmentsFilters?.sections,
    },
    {
      header: 'Lugar de pago',
      watchKey: 'collected_at',
      contents: schoolFulfillmentsFilters?.collected_at,
    },
  ];
  const studentsSearch = useMemo(
    () =>
      studentsOnSchool?.map((student: any) => ({
        id: student.id,
        name: `${student.first_name} ${student.last_name}`,
        enrollment_code: student.enrollment_code,
      })),
    [studentsOnSchool]
  );
  return (
    <div className="px-10">
      {permissions?.can_add_payment ? (
        <Header title={title} button="Registrar pago" clickOnButton={clickOnButton} />
      ) : (
        <Header title={title} />
      )}

      <div className="flex items-center justify-between w-full">
        <div className="flex gap-4 md:gap-4 flex-col w-full">
          <div className="flex gap-4 items-center">
            <MultipleFilters
              filterItems={filterItems}
              handleFilter={handleFilter}
              onClearFilter={handleClearFilter}
              itemsCount={itemsCount}
              setItemsCount={setItemsCount}
            />
            <GlobalSearch
              search={search}
              setSearch={setSearch}
              placeholder="Buscar por ID de orden, pagos, depósitos o facturas"
            />
          </div>
          <div className="flex gap-4 justify-between w-full">
            <div className="flex gap-4">
              {studentsSearch && (
                <Combobox
                  value={searchStudent}
                  onChange={setSearchStudent}
                  items={studentsSearch}
                  setSearch={setSearchStudent}
                  keyLabel="name"
                  handleSelection={(selectedStudent) => {
                    setSelectedStudent(selectedStudent);
                  }}
                >
                  <Combobox.Input icon={<PersonIcon />} placeholder="Buscar por alumno" />
                  <Combobox.Options>
                    {studentsSearch?.map((person: any, index: any) => (
                      <Combobox.Option key={person.id} value={person} index={index}>
                        <div className="flex flex-col items-start font-normal">
                          <span className="text-base overflow-hidden text-ellipsis max-w-[220px] font-semibold">
                            {person.name}
                          </span>
                          <p className="text-xs font-light"> Matrícula: {person.enrollment_code}</p>
                        </div>
                      </Combobox.Option>
                    ))}
                    {studentsSearch?.length === 0 && !isFetching && (
                      <div className="flex flex-col items-start gap-1 p-1 font-normal text-gray-600">
                        <span className="text-base">No se encontraron resultados</span>
                      </div>
                    )}
                  </Combobox.Options>
                </Combobox>
              )}
              <GuardianSelector
                selectedGuardian={selectedGuardian}
                setSelectedGuardian={setSelectedGuardian}
                guardianFilterText="Seleccionar el pagador"
              />
              <DateRange selectedDates={selectedDates} onDatesChange={onDatesChange} />
            </div>
            <DownloadMenu items={DownloadMenuItems}>
              <DownloadButton theme="blue" />
            </DownloadMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
