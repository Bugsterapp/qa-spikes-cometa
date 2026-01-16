import { SchoolCycleEntity } from '@cometa/trpc/src/students/types-mapping';
import { CollectionsGraphicResponse, ConceptTypesEnum } from '@cometa/trpc/src/types';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@getcometa/recreo/v2';
import * as Sentry from '@sentry/nextjs';
import { useMutation } from '@tanstack/react-query';
import { capitalize } from 'lodash';
import { Download, ExternalLink } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import DelinquentsChart from '../../components/charge/DelinquentsChart';
import { useAddToQueue, useSetIsWorking } from '/src/components/BackgroundDownload/BackgroundDownload';
import SelectOld from '/src/components/Select';
import MultipleSelection, { Item } from '/src/components/atoms/MultipleSelection';
import Layout from '/src/components/layouts';
import Header from '/src/components/molecules/dashboard/Header';
import Skeleton from '/src/components/molecules/dashboard/Skeleton';
import { SchoolCycleSelector } from '/src/components/organisms/dashboard/SchoolCycleSelector';
import { Events } from '/src/constants/events';
import { SchoolSwitcherContext } from '/src/contexts/SchoolSwitcherProvider';
import { useGetPermissions, useSelectedSchool } from '/src/guards/AuthGuard';
import useSendPageViewedEvent from '/src/hooks/useSendPageViewedEvent';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import ApiClient from '/src/services/ApiClient';
import { api } from '/src/utils/api';

ChargePage.getLayout = function getLayout(page: JSX.Element) {
  return <Layout title="Cobranzas">{page}</Layout>;
};

function ChargePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const selectedSchool = useSelectedSchool();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const [selectedMonth, setSelectedMonth] = useState({ label: '', value: '' });
  const [selectedConceptType, setSelectedConceptType] = useState<ConceptTypesEnum>(ConceptTypesEnum.MONTHLY_FEE);
  const setIsWorking = useSetIsWorking();
  const { selectedCounter } = useContext(SchoolSwitcherContext);
  const permissions = useGetPermissions();

  useEffect(() => {
    if (permissions && !permissions.can_view_collections_page) {
      router.push('/student');
    }
  }, [permissions, router]);

  const { data: schoolCycles, isLoading: isLoadingSchoolCycles } = api.charge.schoolCycleList.useQuery(
    {
      schoolId: selectedSchool?.id as string,
    },
    {
      enabled: Boolean(selectedSchool?.id) && Boolean(session?.token),
      staleTime: 60 * 1000 * 60,
      refetchOnWindowFocus: false,
    }
  );
  const [selectedSchoolCycle, setSelectedSchoolCycle] = useState<SchoolCycleEntity | null>(
    schoolCycles?.find((cycle) => cycle?.is_active) || schoolCycles?.[0] || null
  );

  useEffect(() => {
    if (selectedCounter > 0) {
      window.location.reload();
    }
  }, [selectedCounter]);

  useEffect(() => {
    if (schoolCycles && !selectedSchoolCycle) {
      setSelectedSchoolCycle(schoolCycles?.find((cycle) => cycle?.is_active) || schoolCycles?.[0]);
    }
  }, [schoolCycles, selectedSchoolCycle]);

  const { data: conceptTypesData, isLoading: isLoadingConceptTypes } = api.charge.conceptTypesList.useQuery(
    {
      schoolId: selectedSchool?.id || '',
    },
    {
      enabled: Boolean(selectedSchool?.id) && Boolean(selectedSchoolCycle),
      staleTime: 60 * 1000 * 60,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  const [selectedConcepts, setSelectedConcepts] = useState<string[]>([]);

  const { data: concepts, isLoading: isLoadingConcepts } = api.schools.schoolsConceptsList.useQuery(
    {
      school_id: selectedSchool?.id || '',
      school_cycles: selectedSchoolCycle?.id ? [selectedSchoolCycle.id] : [],
      type: selectedConceptType ? [selectedConceptType] : [],
    },
    {
      enabled: Boolean(selectedSchool?.id) && Boolean(selectedSchoolCycle),
      staleTime: 60 * 1000 * 60,
      refetchOnWindowFocus: false,
    }
  );
  useEffect(() => {
    if (selectedConcepts.length === 0 && concepts && concepts?.length > 0) {
      setSelectedConcepts(concepts.map((concept) => concept.id) as string[]);
    }
  }, [concepts, setSelectedConcepts, selectedConcepts.length]);

  const { data: graphic, isLoading: isLoadingGraphic } = api.collections.chargeGraphic.useQuery(
    {
      schoolId: selectedSchool?.id || '',
      concepts: selectedConcepts.length > 0 ? selectedConcepts.join(',') : '',
    },
    {
      enabled: Boolean(selectedSchool?.id) && Boolean(selectedSchoolCycle) && Boolean(selectedConcepts.length > 0),
    }
  );

  const { data: table, isLoading: isLoadingStudents } = api.collections.studentsTable.useQuery(
    {
      schoolId: selectedSchool?.id || '',
      school_cycle: selectedSchoolCycle?.id || '',
      concepts: selectedConcepts.length > 0 ? selectedConcepts.join(',') : '',
      ...(selectedMonth && {
        month: Number(selectedMonth.value.split('-')[0]),
        year: Number(selectedMonth.value.split('-')[1]),
      }),
    },
    {
      enabled:
        Boolean(selectedSchool?.id) &&
        Boolean(selectedSchoolCycle) &&
        Boolean(selectedMonth?.value !== '') &&
        Boolean(selectedConcepts?.length > 0) &&
        Boolean(concepts && concepts.length > 0),
      staleTime: 60 * 1000 * 60,
      refetchOnWindowFocus: false,
    }
  );

  const loadingStudents = isLoadingStudents || isLoadingSchoolCycles || isLoadingConceptTypes || isLoadingConcepts;

  const handleStudentDetail = (id: string) => {
    router.push(`/students/${id}`);
  };

  useSendPageViewedEvent('Cobranzas', selectedSchool);
  const handleValueChange = (value: string) => {
    if (Object.values(ConceptTypesEnum).includes(value as ConceptTypesEnum)) {
      setSelectedConceptType(value as ConceptTypesEnum);
    }
  };
  const addToQueue = useAddToQueue();

  const getPayinsReport = async () =>
    ApiClient.generateCollectionsReport(selectedSchool?.id, {
      schoolCycle: selectedSchoolCycle?.id || '',
      concepts: selectedConcepts.length > 0 ? selectedConcepts : [],
    });

  const mutation = useMutation({
    mutationFn: getPayinsReport,
    async onSuccess(data) {
      addToQueue(data.id);
    },
  });

  const handleDownload = async () => {
    await mutation.mutate();
    setIsWorking();
    sendTrackEventWithUserName(Events.eficiencia_cobranzas_downloaded, { Type: 'Tabla', Source: 'Cobranzas' });
  };

  const loadingGraph = isLoadingGraphic || isLoadingSchoolCycles || isLoadingConceptTypes || isLoadingConcepts;
  const findClosestMonth = (graphic: CollectionsGraphicResponse[]) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    let closestMonth = graphic?.[0];
    let smallestDifference = Number.MAX_VALUE;

    graphic?.forEach((g: CollectionsGraphicResponse) => {
      const month = parseInt(g.period.month);
      const year = parseInt(g.period.year);
      const monthIndexGraphic = year * 12 + month;
      const monthIndexCurrent = currentYear * 12 + currentMonth;
      const difference = Math.abs(monthIndexGraphic - monthIndexCurrent);

      if (difference < smallestDifference) {
        smallestDifference = difference;
        closestMonth = g;
      }
    });

    return closestMonth;
  };

  useEffect(() => {
    if (selectedConcepts && !!graphic?.length) {
      const closestMonth = findClosestMonth(graphic);
      setSelectedMonth({
        label: `${capitalize(closestMonth?.period.month_name) || ''} ${closestMonth?.period.year || ''}`,
        value: `${closestMonth?.period.month}-${closestMonth?.period.year}`,
      });
    }
  }, [selectedConcepts, graphic]);

  const sortedSchoolCycles = schoolCycles?.sort((a: SchoolCycleEntity, b: SchoolCycleEntity) =>
    b.name.localeCompare(a.name)
  );

  const handleConceptsChanges = (items: Item<string>[]) => {
    if (items.length === 0) {
      setSelectedConcepts([]);
    } else {
      setSelectedConcepts(items.map((item: Item<string>) => item.value));
    }
  };

  if (permissions && !permissions.can_view_collections_page) {
    return null;
  }

  return (
    <Sentry.ErrorBoundary
      beforeCapture={(scope) => {
        scope.setContext('state', {
          session,
          selectedSchool,
        });
      }}
    >
      <Header title="Cobranzas y morosidad" />
      <div className="flex flex-row items-center px-4 pb-20 rounded-lg xl:px-8 2xl:px-10 shadow-card">
        <div className="inline-block flex-1 pt-7 w-fit">
          <div className="flex flex-row gap-4 2xl:gap-20">
            <div className="flex flex-col gap-6 mt-8 w-full">
              <h5 className="text-2xl font-bold text-foreground">Eficiencia de cobranza</h5>
              <div className="flex gap-4 w-full">
                {(schoolCycles && (
                  <SchoolCycleSelector
                    cycles={sortedSchoolCycles || []}
                    selected={selectedSchoolCycle}
                    setFn={(val) => {
                      setSelectedSchoolCycle(val);
                      setSelectedConcepts([]);
                    }}
                    hideTodos
                    className="h-14"
                    labelClassNames='group-[:not(:has(button[data-placeholder]))]:group-[:has(button[data-state="closed"])]:translate-y-[-24px] group-[:has(button[data-state="open"])]:translate-y-[-24px]'
                  />
                )) || <Skeleton className="2xl:min-w-[162px] h-[58px]" />}
                {(conceptTypesData && (
                  <SelectOld
                    placeholder="Tipo de concepto"
                    className="outline-none min-w-[168px] lg:max-w-[168px] 2xl:min-w-[320px] 2xl:max-w-[368px]"
                    onValueChange={(val) => {
                      handleValueChange(val);
                      setSelectedConcepts([]);
                    }}
                    value={selectedConceptType}
                    disabled={isLoadingConceptTypes || Object.keys(conceptTypesData).length === 0}
                  >
                    <SelectOld.Content className="min-w-max outline-none">
                      {conceptTypesData?.map((concept, i) => (
                        <SelectOld.Item className="w-full outline-none" value={concept.id} key={`${concept.id}-${i}`}>
                          {concept.name}
                        </SelectOld.Item>
                      ))}
                    </SelectOld.Content>
                  </SelectOld>
                )) || (
                  <Skeleton className="min-w-[168px] lg:max-w-[168px] 2xl:min-w-[320px] 2xl:max-w-[368px] h-[58px]" />
                )}
                {(concepts && (
                  <MultipleSelection
                    items={
                      concepts?.map((concept) => ({
                        value: concept.id,
                        label: concept.name,
                      })) || []
                    }
                    key={concepts?.map((concept) => concept.id).join('')}
                    onChange={(value) => {
                      handleConceptsChanges(value);
                    }}
                    label="Conceptos"
                    allSelectedLabel="Todos los conceptos"
                    labelName="conceptos"
                    fullWidth
                    disableAll={isLoadingConcepts || concepts?.length === 0}
                    className="outline-none flex items-center max-w-[220px] 2xl:max-w-[368px]"
                    classNames="min-h-[54px] truncate"
                  />
                )) || <Skeleton className="max-w-[220px] 2xl:max-w-[368px] h-[58px]" />}
              </div>
              <DelinquentsChart
                data={graphic || []}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                isLoading={loadingGraph}
                selectedSchoolCycle={selectedSchoolCycle}
              />
            </div>
            <div className="h-full w-full max-w-[370px] 2xl:max-w-[450px] mt-8">
              <div className="bg-[#f8f9fb] border border-[#d0d8e9] border-solid px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col gap-2">
                    {!loadingStudents ? (
                      <Select
                        value={selectedMonth.value}
                        onValueChange={(value) => {
                          const option = graphic?.find((item) => `${item.period.month}-${item.period.year}` === value);
                          if (option) {
                            setSelectedMonth({
                              label: `${capitalize(option.period.month_name)} ${option.period.year}`,
                              value: `${option.period.month}-${option.period.year}`,
                            });
                          }
                        }}
                      >
                        <SelectTrigger className="bg-white border border-[#d0d8e9] h-9 px-4 py-2 rounded-full shadow-sm w-auto min-w-[166px]">
                          <SelectValue placeholder="Seleccionar mes" className="text-sm text-[#697086]">
                            {selectedMonth.label || 'Seleccionar mes'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {graphic?.map((item) => (
                            <SelectItem
                              key={`${item.period.month}-${item.period.year}`}
                              value={`${item.period.month}-${item.period.year}`}
                            >
                              {capitalize(item.period.month_name)} {item.period.year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Skeleton className="w-[166px] h-9" />
                    )}
                  </div>
                  {loadingStudents ? (
                    <Skeleton className="w-24 h-8" />
                  ) : (
                    <Button
                      variant="light"
                      size="sm"
                      onClick={handleDownload}
                      disabled={table?.results?.length === 0 || !selectedConcepts.length}
                      data-testid="delinquentTableDownload-button"
                    >
                      <Download className="w-4 h-4" />
                      Descargar
                    </Button>
                  )}
                </div>
              </div>

              <div className="bg-white border-x border-b border-[#d0d8e9] border-solid flex flex-col gap-2 min-h-[437px] max-h-[437px] px-6 pb-6 pt-4 rounded-b-2xl">
                <div className="flex items-center justify-between w-full">
                  {loadingStudents ? (
                    <>
                      <Skeleton className="w-40 h-6" />
                      <Skeleton className="w-32 h-5" />
                    </>
                  ) : (
                    <>
                      <div
                        className={`border border-transparent rounded-md px-2 py-0.5 flex gap-1 items-center justify-center ${
                          table?.delinquent_students === 0 ? 'bg-[#edffeb]' : 'bg-[#ffefef]'
                        }`}
                      >
                        <p
                          className={`text-xs font-semibold whitespace-nowrap ${
                            table?.delinquent_students === 0 ? 'text-[#1e8e30]' : 'text-[#8b3636]'
                          }`}
                        >
                          {table?.delinquent_students || 0} estudiantes sin pagar
                        </p>
                      </div>
                      <p className="text-sm text-[#697086] whitespace-nowrap text-right">
                        {table?.payment_compliance_percentage || 0}% de cumplimiento
                      </p>
                    </>
                  )}
                </div>

                <div className="border-b border-[#d0d8e9] w-full" />

                <div className="flex flex-col gap-4 overflow-y-auto scrollbar flex-1 -mx-6 px-6">
                  {loadingStudents &&
                    Array.from({ length: 5 }, (_, i) => (
                      <div key={i} className="flex flex-col gap-1">
                        <Skeleton className="w-full h-5" />
                        <Skeleton className="w-32 h-4" />
                      </div>
                    ))}

                  {!loadingStudents && (table?.results?.length === 0 || table?.results === undefined) ? (
                    <div
                      className="flex justify-center items-center flex-1 flex-col gap-6 py-4"
                      data-testid="tableEmptyState-copy"
                    >
                      <Image src="/assets/images/check.png" alt="Success" width={96} height={96} />
                      <p className="text-sm text-[#22283a] max-w-[280px] text-center leading-relaxed">
                        No hay estudiantes con pagos pendientes para los <strong>conceptos seleccionados</strong> en el
                        mes de <strong>{selectedMonth.label}</strong>
                      </p>
                    </div>
                  ) : (
                    !loadingStudents &&
                    table?.results?.map((item, i) => (
                      <div key={`${item.id}-${i}`} className="flex flex-col gap-4">
                        {i > 0 && <div className="border-b border-[#d0d8e9] w-full" />}

                        <div className="flex items-center justify-between w-full pr-2">
                          <div className="flex flex-col gap-1 flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#22283a] truncate">
                              {item.first_name} {item.last_name}
                            </p>
                            <p className="text-sm text-[#697086]">
                              {item.section} - {item.level}
                            </p>
                          </div>
                          <Button
                            variant="light"
                            size="icon"
                            onClick={() => handleStudentDetail(item.id)}
                            data-testid={`${item.first_name}-${item.last_name}-delinquentStudent-card`}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Sentry.ErrorBoundary>
  );
}

ChargePage.auth = true;

export default ChargePage;
