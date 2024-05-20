import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import Heading from '/src/components/atoms/Heading';
import useSendPageViewedEvent from '/src/hooks/useSendPageViewedEvent';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import Grid from '/src/components/atoms/Grid';
import Select from '/src/components/Select';
import { GetServerSideProps } from 'next';
import { api } from '/src/utils/api';
import MultipleSelectionComponent, { Item } from '/src/components/organisms/dashboard/MultiSelect';
import Link from 'next/link';
import SelectChip from '/src/components/atoms/SelectChip';
import { cn } from '/src/utils/cn';
import ApiClient from '../services/ApiClient';
import { getMonthByNumber } from '../utils/formatTime';
import { sendTrackEvent } from '../utils/events';
import ComplianceCard from './organisms/dashboard/ComplianceCard';
import DelinquentsChartOld from './DelinquentsChartOld';

type ConceptType = {
  id: string;
  name: string;
  type: string;
};

enum ConceptTypes {
  INSCRIPTION = 'INSCRIPTION',
  MONTHLY_FEE = 'MONTHLY_FEE',
  OTHER = 'OTHER',
  PRE_DEBT = 'PRE_DEBT',
  TRANSPORT = 'TRANSPORT',
}

function ChargePageOld() {
  const { data: session } = useSession();
  const selectedSchool = useSelectedSchool();
  const [currentIndexSelected, setCurrentIndexSelected] = useState<number | null>(null);
  const [selectedData, setSelectedData] = useState<{
    percentage: number;
    delinquents: number;
  } | null>(null);
  const [allMonthsPercentage, setAllMonthsPercentage] = useState<number>(0);
  const [selectedConcept, setSelectedConcept] = useState<Array<string>>([]);
  const defaultMonth = { value: 'Todos', label: 'Todos los meses' };
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [selectedConcepType, setSelectedConceptType] = useState<ConceptTypes>(ConceptTypes['MONTHLY_FEE']);
  const [compliancePeriodOptions, setCompliancePeriodOptions] = useState<
    {
      value: string;
      label: string;
    }[]
  >([]);
  const { data: schoolCycles } = api.charge.schoolCycleList.useQuery(
    {
      schoolId: selectedSchool?.id as string,
    },
    {
      enabled: Boolean(selectedSchool?.id),
    }
  );

  // the defaultSchoolCycle is hardcode meanwhile the endpoint of conceptsType is ready
  const defaultSchoolCycle = schoolCycles?.find((cycle) => cycle.year_end === 2023 && cycle.year_start === 2022);
  const selectedMonthLabel = selectedMonth.label;
  const startMonth = selectedMonth.value;
  const startYear = selectedMonthLabel.substring(selectedMonthLabel?.length - 4);
  const startDate = (selectedMonth.value !== 'Todos' && startYear + '-' + startMonth + '-' + '1') || null;
  const endDay = new Date(Number(startYear), Number(startMonth), 0).getDate();
  const endDate = (selectedMonth.value !== 'Todos' && startYear + '-' + startMonth + '-' + endDay) || null;

  const [selectedSchoolCycle, setSelectedSchoolCycle] = useState<Array<string>>(
    defaultSchoolCycle?.id ? [defaultSchoolCycle?.id] : []
  );
  const { data: concepts, isLoading: isLoadingConcepts } = api.charge.conceptsList.useQuery(
    {
      schoolId: selectedSchool?.id as string,
      school_cycles: selectedSchoolCycle,
      type: [selectedConcepType],
    },
    {
      enabled: Boolean(selectedSchool) && Boolean(selectedSchoolCycle.length) && Boolean(selectedConcepType),
    }
  );

  const transaltedConceptType = (concept: string) =>
    ({
      INSCRIPTION: 'Inscripción',
      MONTHLY_FEE: 'Colegiatura/Mensualidad',
      OTHER: 'Otros',
      PRE_DEBT: 'Deuda Previa',
      TRANSPORT: 'Transporte',
    }[concept]);

  // this use effect would be removed when the endpoint of concepts types is ready
  useEffect(() => {
    if (schoolCycles) {
      const defaultSchoolCycle = schoolCycles.find((cycle) => cycle.year_end === 2023 && cycle.year_start === 2022);
      setSelectedSchoolCycle([defaultSchoolCycle?.id as string]);
    }
  }, [schoolCycles]);

  const { data: delinquencyHistoric } = useQuery({
    queryKey: ['delinquencyHistoric', selectedSchool?.id, selectedConcept],
    queryFn: () => {
      if (selectedConcept?.length) {
        return ApiClient.getDelinquencyHistoric(session?.token, selectedSchool?.id, selectedConcept).then(
          (res: any) => res.data
        );
      } else {
        return;
      }
    },
    enabled: !!selectedSchool?.id && !!selectedConcept,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      const labels = [defaultMonth];
      data?.forEach((element: any) => {
        const month = getMonthByNumber(element.month);
        const label = { value: element.month, label: month + ' ' + element.year };
        labels.push(label);
      });
      const totalPercentage =
        data?.reduce((a: number, b: Record<string, string>) => a + parseFloat(b.paid_percentage), 0) / data?.length;
      setAllMonthsPercentage(+totalPercentage.toFixed(2));
      setCompliancePeriodOptions(labels);
    },
  });

  const studentsDelinquencyQuery = async (page: number, conceptIds: Array<string>) =>
    ApiClient.getStudentsDelinquency(
      session?.token,
      selectedSchool?.id,
      conceptIds,
      startDate ? startDate : null,
      endDate ? endDate : null,
      page
    );
  const {
    data: studentsDelinquency,
    isLoading: loading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    ['studentsDelinquency', selectedSchool?.id, selectedConcept, startDate, endDate],
    ({ pageParam = 1 }) => {
      if (!selectedConcept || selectedConcept.length === 0) {
        return { pages: [] }; // Return empty data when no concepts are selected
      }

      return studentsDelinquencyQuery(pageParam, selectedConcept || []);
    },
    {
      enabled: !!selectedSchool?.id,
      getPreviousPageParam: (firstPage) => firstPage?.previous?.split('page=')[1] ?? undefined,
      getNextPageParam: (lastPage) => lastPage?.next?.split('page=')[1] ?? undefined,
    }
  ) as any;
  const handleSelectDate = (e: any) => {
    if (delinquencyHistoric?.length) {
      const total_students = delinquencyHistoric[e]?.paid_students;
      const delinquents = delinquencyHistoric[e]?.delinquency_students;
      const percentage = delinquencyHistoric[e]?.paid_percentage || 0;
      const newSelectedData = {
        percentage: selectedMonth.value !== 'Todos' ? percentage : allMonthsPercentage.toFixed(2),
        delinquents: delinquents,
        total_students: total_students,
      };
      const monthNumber = delinquencyHistoric[e]?.month;

      const month = compliancePeriodOptions.find((element) => element.value === monthNumber);
      if (month) {
        setSelectedMonth(month);
      } else {
        setSelectedMonth(defaultMonth);
      }
      setSelectedData(newSelectedData);
      sendTrackEvent('dashboard: Delinquency Month Selected', {});
    }
  };
  useSendPageViewedEvent('Cobranzas', selectedSchool);

  useEffect(() => {
    if (currentIndexSelected !== undefined) {
      handleSelectDate(currentIndexSelected);
    } else {
      setSelectedMonth(defaultMonth);
    }
  }, [currentIndexSelected]);

  const conceptsFromResume = api.charge.conceptTypesList.useQuery(
    {
      schoolId: selectedSchool?.id as string,
    },
    {
      enabled: Boolean(selectedSchool),
    }
  ) as any;

  const conceptTypes = [
    ...new Set(conceptsFromResume?.data?.concepts.map((concept: ConceptType) => concept.type)),
  ] as ConceptTypes[];

  const transformedConcepts =
    concepts?.map((concept) => ({
      label: concept.name,
      value: concept.id,
    })) || [];

  const onSelectConceptType = (conceptType: keyof typeof ConceptTypes) => {
    setSelectedConceptType(ConceptTypes[conceptType]);
    setCurrentIndexSelected(null);
    setSelectedMonth(defaultMonth);
    setSelectedConcept([]);
  };

  const onSelectConcept = (selectedConcepts: Item<string>[]) => {
    setSelectedConcept(selectedConcepts.map((concept) => concept.value));
    setCurrentIndexSelected(null);
    setSelectedMonth(defaultMonth);
  };

  const onSelectSchoolCycle = (schoolCycleId: string) => {
    setSelectedSchoolCycle([schoolCycleId]);
    setCurrentIndexSelected(null);
    setSelectedMonth(defaultMonth);
    setSelectedConcept([]);
  };

  const onSelectSingleConcept = (conceptId: string) => {
    setSelectedConcept([conceptId]);
    setCurrentIndexSelected(null);
    setSelectedMonth(defaultMonth);
  };

  useEffect(() => {
    if (
      selectedConcepType !== ConceptTypes['MONTHLY_FEE'] &&
      selectedConcepType !== ConceptTypes['INSCRIPTION'] &&
      concepts?.length
    ) {
      setSelectedConcept([concepts[0].id]);
    } else {
      setSelectedConcept(transformedConcepts.map((concept) => concept.value));
    }
  }, [concepts, selectedConcepType]);

  const isSelected = (id: string) => selectedSchoolCycle.includes(id);

  const sortedSchoolCycles = schoolCycles?.sort((a: any, b: any) => b.name.localeCompare(a.name));
  return (
    <Sentry.ErrorBoundary
      beforeCapture={(scope) => {
        scope.setContext('state', {
          session,
          selectedSchool,
          currentIndexSelected,
          selectedData,
          concepts,
          selectedConcept,
          selectedMonth,
          delinquencyHistoric,
          compliancePeriodOptions,
        });
      }}
    >
      <Heading children="Cobranzas y morosidad" className="text-4xl font-bold 2xl:text-5xl" />
      <div className="flex flex-col items-center py-8 pr-2 mt-8 shadow-card rounded-xl xl:pr-8 lg:flex-row">
        <div className="max-w-[50%] lg:max-w-[60%] w-full xl:max-w-[65%]">
          <div className="px-6 mr-6">
            <h5 className="mb-6 text-2xl font-bold text-secondary">Detalle de cobranza</h5>
            <Grid as="section" columns={['grid-cols-3']} className="gap-4 mb-4">
              {schoolCycles?.length ? (
                <Select
                  placeholder="Ciclo Escolar"
                  className="min-w-[164px] w-full outline-none"
                  onValueChange={onSelectSchoolCycle}
                  defaultValue={defaultSchoolCycle?.id}
                >
                  <Select.Content className="w-full max-w-[164px] outline-none" asChild>
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
                          <span className="flex items-center gap-2 justify-between">{cycle.name}</span>
                        </Select.Item>
                      </>
                    ))}
                  </Select.Content>
                </Select>
              ) : null}
              {conceptTypes?.length ? (
                <Select
                  placeholder="Tipo de concepto"
                  className="min-w-[164px] w-full outline-none"
                  onValueChange={onSelectConceptType}
                  defaultValue={conceptTypes?.find((conceptType) => conceptType === 'MONTHLY_FEE')}
                >
                  <Select.Content className="w-full min-w-[164px] outline-none">
                    {conceptTypes?.map((type) => (
                      <>
                        {type === selectedConcepType ? (
                          <Select.Item className="w-full bg-gray-200 outline-none" value={type} key={type}>
                            {transaltedConceptType(type)}
                          </Select.Item>
                        ) : (
                          <Select.Item className="w-full outline-none" value={type} key={type}>
                            {transaltedConceptType(type)}
                          </Select.Item>
                        )}
                      </>
                    ))}
                  </Select.Content>
                </Select>
              ) : null}
              {selectedConcepType !== ConceptTypes['MONTHLY_FEE'] &&
              selectedConcepType !== ConceptTypes['INSCRIPTION'] &&
              selectedConcept ? (
                <Select
                  placeholder="Conceptos"
                  className="min-w-[164px] w-full outline-none h-full"
                  onValueChange={onSelectSingleConcept}
                  disabled={isLoadingConcepts}
                  defaultValue={concepts && concepts?.length >= 1 ? concepts[0].id : ''}
                >
                  <Select.Content className="w-full min-w-[164px] outline-none">
                    {concepts && concepts?.length >= 1 ? (
                      concepts.map((concept) =>
                        selectedConcept.includes(concept.id) ? (
                          <Select.Item className="w-full bg-gray-200 outline-none" value={concept.id} key={concept.id}>
                            {concept.name}
                          </Select.Item>
                        ) : (
                          <Select.Item className="w-full outline-none" value={concept.id} key={concept.id}>
                            {concept.name}
                          </Select.Item>
                        )
                      )
                    ) : (
                      <Select.Item className="w-full text-sm outline-none" value="no_data" disabled>
                        No hay conceptos registrados para las opciones seleccionadas
                      </Select.Item>
                    )}
                  </Select.Content>
                </Select>
              ) : concepts?.length ? (
                <MultipleSelectionComponent
                  items={transformedConcepts}
                  onChange={onSelectConcept}
                  labelName="Conceptos"
                />
              ) : (
                <Select placeholder="Conceptos" className="min-w-[164px] w-full outline-none h-full">
                  <Select.Content className="w-full min-w-[164px] outline-none">
                    <Select.Item className="w-full text-sm outline-none" value="no_data" disabled>
                      No hay conceptos registrados para las opciones seleccionadas
                    </Select.Item>
                  </Select.Content>
                </Select>
              )}
            </Grid>
            <DelinquentsChartOld
              data={delinquencyHistoric}
              selectedMonth={currentIndexSelected}
              setSelectedMonth={setCurrentIndexSelected}
            />
          </div>
        </div>
        <div className="w-full max-w-[50%] lg:max-w-[40%] xl:max-w-[35%]">
          <ComplianceCard
            selectedMonth={selectedMonth}
            selectedSchool={selectedSchool}
            periods={compliancePeriodOptions}
            conceptName={selectedConcept ? concepts?.find((concept) => concept.id === selectedConcept[0])?.name : ''}
            setCurrentIndexSelected={setCurrentIndexSelected}
            currentIndexSelected={currentIndexSelected}
            setSelectedMonth={setSelectedMonth}
            delinquents={studentsDelinquency?.pages[0]?.count}
            conceptId={selectedConcept}
            compliancePercentage={
              selectedMonth.value !== 'Todos'
                ? delinquencyHistoric?.[currentIndexSelected ?? 0]?.paid_percentage
                : allMonthsPercentage
            }
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            isFetching={isFetching}
            loading={loading}
            studentsDelinquency={studentsDelinquency}
          />
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const UA = context.req.headers['user-agent'];
  const isMobile = Boolean(UA?.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i));
  try {
    if (isMobile) {
      return {
        redirect: {
          permanent: false,
          destination: '/only-desktop',
        },
      };
    }
    return {
      props: {},
    };
  } catch (e: any) {
    Sentry.captureException(e);
    throw new Error(e);
  }
};

export default ChargePageOld;
