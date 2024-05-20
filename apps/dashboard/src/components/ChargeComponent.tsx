import { typesOfConcepts } from '/src/server/api/routers/schools';
import { z } from 'zod';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useContext } from 'react';
import * as Sentry from '@sentry/nextjs';
import Heading from '/src/components/atoms/Heading';
import useSendPageViewedEvent from '/src/hooks/useSendPageViewedEvent';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import Select from '/src/components/Select';
import { api } from '/src/utils/api';
import Link from 'next/link';
import ComplianceSelector from '/src/components/organisms/dashboard/ComplianceCard/ComplianceSelector';
import Link_To from '/public/assets/icons/ic_link_to.svg';
import { useRouter } from 'next/router';
import { DownloadButton, useAddToQueue, useSetIsWorking } from '/src/components/BackgroundDownload/BackgroundDownload';
import MultipleSelection, { Item } from '/src/components/atoms/MultipleSelection';
import SelectChip from '/src/components/atoms/SelectChip';
import { cn } from '/src/utils/cn';
import Skeleton from '/src/components/molecules/dashboard/Skeleton';
import { useMutation, useQuery } from '@tanstack/react-query';
import ApiClient from '/src/services/ApiClient';
import { SchoolSwitcherContext } from '/src/contexts/SchoolSwitcherProvider';
import { CollectionsGraphic, CollectionsTable } from '@cometa/trpc/src/types';
import DelinquentsChart from './organisms/dashboard/BarChart';
import { capitalize } from 'lodash';

export type ConceptsType = z.infer<typeof typesOfConcepts>;

function NewChargePage() {
  const { data: session } = useSession();
  const selectedSchool = useSelectedSchool();
  const [selectedMonth, setSelectedMonth] = useState({ label: '', value: '' });
  const [selectedConceptType, setSelectedConceptType] = useState<ConceptsType>('MONTHLY_FEE');
  const setIsWorking = useSetIsWorking();
  const { selectedCounter } = useContext(SchoolSwitcherContext);
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
  const [selectedSchoolCycle, setSelectedSchoolCycle] = useState(
    schoolCycles?.find((cycle) => cycle?.is_active)?.id || schoolCycles?.[0]?.id
  );

  useEffect(() => {
    if (selectedCounter > 0) {
      window.location.reload();
    }
  }, [selectedCounter]);

  useEffect(() => {
    if (schoolCycles && !selectedSchoolCycle) {
      setSelectedSchoolCycle(schoolCycles?.find((cycle) => cycle?.is_active)?.id || schoolCycles?.[0]?.id);
    }
  }, [schoolCycles, selectedSchoolCycle]);

  const {
    data: conceptTypesData,
    isLoading: isLoadingConceptTypes,
    isFetching: isFetchingConceptTypes,
  } = api.concepts.conceptTypes.useQuery(
    {
      schoolId: selectedSchool?.id || '',
      school_cycle: selectedSchoolCycle ? [selectedSchoolCycle] : [],
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
      school_cycles: selectedSchoolCycle ? [selectedSchoolCycle] : [],
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
  }, [concepts, setSelectedConcepts]);

  // const { data: graphic } = api.collections.chargeGraphic.useQuery(
  //   {
  //     schoolId: selectedSchool?.id || '',
  //     school_cycle: selectedSchoolCycle || '',
  //     concepts: selectedConcepts?.length > 0 ? selectedConcepts : [],
  //   },
  //   { enabled: Boolean(selectedSchool?.id) && Boolean(selectedSchoolCycle) && Boolean(selectedConcepts.length > 0) }
  // );
  // const { data: table, isLoading: isLoadingStudents } = api.collections.studentsTable.useQuery(
  //   {
  //     schoolId: selectedSchool?.id || '',
  //     school_cycle: selectedSchoolCycle || '',
  //     concepts: selectedConcepts.length > 0 ? selectedConcepts : [],
  //     ...(selectedMonth && {
  //       month: Number(selectedMonth.value.split('-')[0]),
  //       year: Number(selectedMonth.value.split('-')[1]),
  //     }),
  //   },
  //   {
  //     enabled:
  //       Boolean(selectedSchool?.id) &&
  //       Boolean(selectedSchoolCycle) &&
  //       Boolean(selectedMonth?.value !== '') &&
  //       Boolean(selectedConcepts?.length > 0) &&
  //       graphic &&
  //       graphic?.length > 0,
  //     staleTime: 60 * 1000 * 60,
  //     refetchOnWindowFocus: false,
  //   }
  // );

  const getCollectionGraphicMethod = async () =>
    ApiClient.getCollectionGraphic(session?.token, selectedSchool?.id, {
      schoolCycle: selectedSchoolCycle || '',
      concepts: selectedConcepts.length > 0 ? selectedConcepts : [],
    });

  const getCollectionsTableMethod = async () =>
    ApiClient.getCollectionTable(session?.token, selectedSchool?.id, {
      schoolCycle: selectedSchoolCycle || '',
      concepts: selectedConcepts.length > 0 ? selectedConcepts : [],
      cycleInfo:
        (selectedMonth && {
          month: Number(selectedMonth.value.split('-')[0]),
          year: Number(selectedMonth.value.split('-')[1]),
        }) ||
        {},
    });
  const {
    data: graphic,
    isLoading: isLoadingGraphic,
    isFetching: isFetchingGraphic,
  } = useQuery<CollectionsGraphic[]>(
    ['chargeGraphic', selectedSchool?.id, selectedSchoolCycle, selectedConcepts],
    () => getCollectionGraphicMethod(),
    {
      enabled: Boolean(selectedSchool?.id) && Boolean(selectedSchoolCycle) && Boolean(selectedConcepts.length > 0),
    }
  );
  const {
    data: table,
    isLoading: isLoadingStudents,
    isFetching: isFetchingStudents,
  } = useQuery<CollectionsTable>(
    ['chargeTable', selectedSchool?.id, selectedSchoolCycle, selectedConcepts, selectedMonth],
    () => getCollectionsTableMethod(),
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

  const loadingStudents = isLoadingStudents && isFetchingStudents;

  const router = useRouter();
  const handleStudenDetail = (id: string) => {
    router.push(`/student/detail/${id}`);
  };

  useSendPageViewedEvent('Cobranzas', selectedSchool);
  const handleValueChange = (value: string) => {
    if (
      [
        'BOOKS_AND_MATERIALS',
        'CAFETERIA',
        'EXAMS_AND_CERTIFICATES',
        'EXTRACURRICULAR',
        'INSCRIPTION',
        'MONTHLY_FEE',
        'OTHER',
        'PRE_DEBT',
        'REINSCRIPTION',
        'SPORTS',
        'TRANSPORT',
        'UNIFORMS_AND_MERCH',
      ].includes(value)
    ) {
      setSelectedConceptType(value as ConceptsType);
    }
  };
  const addToQueue = useAddToQueue();

  const getPayinsReport = async () =>
    ApiClient.generateCollectionsReport(session?.token, selectedSchool?.id, {
      schoolCycle: selectedSchoolCycle || '',
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
  };
  // // TODO: New Method
  // const mutation = api.charge.chargeReport.useMutation({});
  // const handleDownload = async () => {
  //   const payload = {};
  //   // sendTrackEvent('dashboard: Delinquent List Downloaded ', {});
  //   await mutation.mutate(
  //     {
  //       schoolId: selectedSchool?.id || '',
  //       school_cycle: selectedSchoolCycle || '',
  //       concepts: selectedConcepts.length > 0 ? selectedConcepts : [],
  //     },
  //     {
  //       async onSuccess(data) {
  //         // @ts-ignore
  //         addToQueue(data.id);
  //       },
  //     }
  //   );
  //   setIsWorking();
  //   return payload;
  // };

  const loadingGraph = isLoadingGraphic && isFetchingGraphic;
  const findClosestMonth = (graphic: any) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    let closestMonth = graphic?.[0];
    let smallestDifference = Number.MAX_VALUE;

    graphic?.forEach((g: any) => {
      const month = g.period.month;
      const year = g.period.year;
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
  const isSelected = (id: string) => selectedSchoolCycle?.includes(id);

  const sortedSchoolCycles = schoolCycles?.sort((a: any, b: any) => b.name.localeCompare(a.name));

  const handleConceptsChanges = (items: Item<string>[]) => {
    if (items.length === 0) {
      setSelectedConcepts([]);
    } else {
      setSelectedConcepts(items.map((item: Item<string>) => item.value));
    }
  };
  const handleSchoolCycleChange = (value: string) => {
    setSelectedSchoolCycle(value);
  };

  const showSkeletonDependingOfTable = () => {
    if (loadingStudents) {
      return <Skeleton className="w-[166px] h-[20px] mt-2 mr-5" />;
    } else {
      return (
        <div className="flex justify-between min-w-[200px] border-b-2 font-bold border-white text-xl text-white relative bg-transparent whitespace-nowrap outline-none text-ellipsis max-w-[240px] overflow-hidden">
          Enero
        </div>
      );
    }
  };

  const parseSchoolCycle = (cycle: any) => {
    const yearStart = cycle?.year_start;
    const yearEnd = String(cycle?.year_end).slice(2, 4);
    return `${yearStart}-${yearEnd}`;
  };

  return (
    <Sentry.ErrorBoundary
      beforeCapture={(scope) => {
        scope.setContext('state', {
          session,
          selectedSchool,
        });
      }}
    >
      <Heading children="Cobranzas y morosidad" className="text-4xl font-bold 2xl:text-5xl" />
      <div className="flex flex-row px-4 xl:px-8 2xl:px-10 items-center pb-20 rounded-lg mt-8 shadow-card">
        <div className="pt-7 inline-block w-fit flex-1">
          <div className="flex flex-row gap-4 2xl:gap-20">
            <div className="flex flex-col gap-8 mt-8 w-full">
              <h5 className="text-2xl font-bold text-secondary mb-4">Eficiencia de cobranza</h5>
              <div className="flex gap-4 w-full">
                {(schoolCycles && (
                  <Select
                    placeholder="Ciclo Escolar"
                    className="outline-none 2xl:min-w-[162px]"
                    defaultValue={schoolCycles?.find((cycle) => cycle?.is_active)?.id || schoolCycles?.[0]?.id}
                    onValueChange={(val) => {
                      handleSchoolCycleChange(val);
                      setSelectedConcepts([]);
                    }}
                    disabled={isLoadingSchoolCycles || schoolCycles?.length === 0}
                  >
                    <Select.Content className="min-w-[162px] outline-none">
                      {sortedSchoolCycles?.map((cycle) => (
                        <>
                          <Select.Item
                            className={cn('w-full outline-none', {
                              'bg-gray-200': isSelected(cycle.id),
                            })}
                            value={cycle.id}
                            key={cycle.id}
                            extraContent={
                              schoolCycles.find((c) => c.is_active)?.id === cycle.id ? (
                                <SelectChip theme="blue">Actual</SelectChip>
                              ) : null
                            }
                          >
                            <span className="flex items-center gap-2 justify-between">{parseSchoolCycle(cycle)}</span>
                          </Select.Item>
                        </>
                      ))}
                    </Select.Content>
                  </Select>
                )) || <Skeleton className="2xl:min-w-[162px] h-[58px]" />}
                {(conceptTypesData && (
                  <Select
                    placeholder="Tipo de concepto"
                    className="outline-none min-w-[168px] lg:max-w-[168px] 2xl:min-w-[320px] 2xl:max-w-[368px]"
                    onValueChange={(val) => {
                      handleValueChange(val);
                      setSelectedConcepts([]);
                    }}
                    value={selectedConceptType}
                    disabled={
                      isLoadingConceptTypes || isFetchingConceptTypes || Object.keys(conceptTypesData).length === 0
                    }
                  >
                    <Select.Content className="w-full outline-none">
                      {/* @ts-ignore TODO: fix types */}
                      {conceptTypesData?.map((concept, i) => (
                        <Select.Item className="w-full outline-none" value={concept.type} key={`${concept.type}-${i}`}>
                          {concept.name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                )) || (
                  <Skeleton className="min-w-[168px] lg:max-w-[168px] 2xl:min-w-[320px] 2xl:max-w-[368px h-[58px]" />
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
              />
            </div>
            <div className="h-full w-full max-w-[370px] 2xl:max-w-[450px]">
              <div className="px-3 py-4 rounded-t-lg bg-blue-secondary-200 xl:px-8 2xl:px-12 h-[70px]">
                <div className="flex items-center justify-between w-full">
                  <div className="max-w-[180px] w-full p-1">
                    {!loadingStudents ? (
                      <ComplianceSelector
                        options={
                          graphic?.map((item) => ({
                            label: `${capitalize(item.period.month_name)} ${item.period.year}`,
                            value: `${item.period.month}-${item.period.year}`,
                          })) || []
                        }
                        onChange={setSelectedMonth}
                        value={selectedMonth}
                      />
                    ) : (
                      showSkeletonDependingOfTable()
                    )}
                  </div>
                  {/* @ts-ignore TODO: fix types */}
                  {loadingStudents ? (
                    <Skeleton className="w-20 h-5 mt-2" />
                  ) : (
                    <DownloadButton
                      handleAdd={handleDownload}
                      data-testid="delinquentTableDownload-button"
                      theme="white"
                      disabled={table?.results.length === 0 || !selectedConcepts.length}
                    />
                  )}
                </div>
              </div>
              <div className="bg-[#FAFBFF] h-full max-h-[470px] rounded-xl">
                <div className="px-4 xl:px-4 2xl:px-14">
                  <div className="rounded-xl">
                    <div className="flex items-center py-4 gap-2 2xl:gap-4 divide-x-2 divide-gray-400 space-x-2">
                      {loadingStudents ? (
                        <div className="flex items-center flex-col gap-2">
                          <Skeleton className="w-[166px] h-4" />
                          <Skeleton className="w-[166px] h-4" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 py-1">
                          <p className="font-bold text-xs 2xl:text-sm whitespace-nowrap">Alumnos sin pagar</p>
                          <div className="bg-[#FFE7D9] rounded-md px-2 py-1 text-sm font-bold text-[#B72136]">
                            <span>{table?.delinquent_students || 0}</span>
                          </div>
                        </div>
                      )}

                      <div className={cn('flex items-center gap-2 pl-4', { 'pl-16': loadingStudents })}>
                        {loadingStudents ? (
                          <Skeleton className="w-20 h-4" />
                        ) : (
                          <p className="font-light text-sm text-[#8994BC] whitespace-nowrap">
                            {table?.payment_compliance_percentage || 0}% de cumplimiento
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <span className="border-b border-[#919EAB3D] w-full block px-2" />
                <div className="overflow-y-scroll scrollbar min-h-[380px] pt-2 -mr-1 h-full max-h-[380px] px-4 relative">
                  {loadingStudents &&
                    Array.from({ length: 5 }, (_, i) => (
                      <div
                        className={cn(
                          'flex flex-col cursor-pointer py-4 px-4 xl:px-6 2xl:px-10 rounded-sm gap-2 hover:bg-[#1890FF0A] border-b border-[#919EAB3D]'
                        )}
                        key={`${i}`}
                      >
                        <div className="flex justify-between">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-secondary">
                              <Skeleton className="w-[230px] h-4" />
                            </span>
                            <hr />
                            <p className="text-xs font-light mt-2">
                              <Skeleton className="w-[100px] h-4" />
                            </p>
                          </div>
                          <div>
                            <Skeleton className="w-12 h-4" />
                          </div>
                        </div>
                      </div>
                    ))}
                  {table?.results?.length === 0 || table?.results === undefined ? (
                    <div
                      className="flex justify-center items-center min-h-[250px] flex-col gap-4"
                      data-testid="tableEmptyState-copy"
                    >
                      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M0 18C0 8.05887 8.05887 0 18 0C22.7739 0 27.3523 1.89642 30.7279 5.27208C34.1036 8.64773 36 13.2261 36 18C36 27.9411 27.9411 36 18 36C8.05887 36 0 27.9411 0 18ZM17.5145 24.4978L25.7405 13.6978V13.6438C26.1328 13.1293 26.2208 12.4446 25.9714 11.8477C25.722 11.2507 25.1731 10.8322 24.5314 10.7497C23.8898 10.6672 23.2528 10.9333 22.8605 11.4478L16.0565 20.4478L13.1225 16.7038C12.7271 16.1957 12.0906 15.9373 11.4529 16.0258C10.8151 16.1143 10.2731 16.5362 10.0309 17.1328C9.78863 17.7293 9.88305 18.4097 10.2785 18.9178L14.6705 24.5158C15.014 24.9504 15.5385 25.2027 16.0925 25.1998C16.6496 25.1984 17.1747 24.9392 17.5145 24.4978Z"
                          fill="#54D62C"
                        />
                      </svg>
                      <p className="text-sm text-gray-800 max-w-[250px] text-center">
                        No hay alumnos por pagar para los <strong>conceptos selccionados</strong> en el mes de{' '}
                        <strong>{selectedMonth.label}</strong>
                      </p>
                    </div>
                  ) : (
                    <></>
                  )}
                  {table?.results?.map((item, i) => (
                    <>
                      <div
                        onClick={() => handleStudenDetail(item.id)}
                        data-testid={`${item.first_name}-${item.last_name}-delinquentStudent-card`}
                        className={cn(
                          'flex flex-col cursor-pointer py-4 px-4 xl:px-6 2xl:px-10 rounded-sm gap-2 hover:bg-[#1890FF0A]',
                          {
                            'border-b border-[#919EAB3D]': i !== table?.results?.length - 1,
                          }
                        )}
                        key={`${item.id}-${i}`}
                      >
                        <div className="flex justify-between">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-secondary">
                              {item.first_name} {item.last_name}
                            </span>
                            <p className="text-xs font-light">
                              {item.section} - {item.level}
                            </p>
                          </div>
                          <div>
                            <Link_To />
                          </div>
                        </div>
                      </div>
                    </>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 rounded-md bg-[#D0F2FF] h-16 flex justify-between mt-8">
        <div className="flex items-center gap-2.5">
          <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2.5C6.47715 2.5 2 6.97715 2 12.5C2 18.0228 6.47715 22.5 12 22.5C17.5228 22.5 22 18.0228 22 12.5C22 9.84784 20.9464 7.3043 19.0711 5.42893C17.1957 3.55357 14.6522 2.5 12 2.5ZM13 16.5C13 17.0523 12.5523 17.5 12 17.5C11.4477 17.5 11 17.0523 11 16.5V11.5C11 10.9477 11.4477 10.5 12 10.5C12.5523 10.5 13 10.9477 13 11.5V16.5ZM11 8.5C11 9.05228 11.4477 9.5 12 9.5C12.5523 9.5 13 9.05228 13 8.5C13 7.94772 12.5523 7.5 12 7.5C11.4477 7.5 11 7.94772 11 8.5Z"
              fill="#1890FF"
            />
          </svg>

          <p className="text-[#04297A] text-sm">
            Ahora podrás encontrar todos los pagos realizados en la nueva sección “Pagos recibidos”
          </p>
        </div>
        <Link
          href="/payments"
          className="text-[#04297A] border border-[#04297A] font-bold rounded-lg px-3 flex items-center"
        >
          Ver pagos
        </Link>
      </div>
    </Sentry.ErrorBoundary>
  );
}
export default NewChargePage;
