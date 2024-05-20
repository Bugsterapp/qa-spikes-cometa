import ChipMorosidadStatus from '../../../molecules/dashboard/ChipMorosidadStatus';
import NoDelinquency from './NoDelinquency';
import { useInView } from 'react-intersection-observer';
import * as Sentry from '@sentry/nextjs';
import Link_To from '/public/assets/icons/ic_link_to.svg';
import IconDividerSmall from 'dashboard/public/assets/icons/ic_divider_small.svg';
import { api } from '../../../../utils/api';
import React from 'react';
import ArrowDown from 'public/assets/images/arrow_down.svg';
import Loading from 'public/assets/images/loading.svg';
import {
  useSetIsWorking,
  useAddToQueue,
  DownloadButton,
  useSetToError,
  useSetToIdle,
} from '../../../BackgroundDownload/BackgroundDownload';
import { sendTrackEvent } from '/src/utils/events';
import ComplianceSelector from './ComplianceSelector';
import Skeleton from '/src/components/molecules/dashboard/Skeleton';

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  section: string;
  level: string;
  enrollment_code: string;
  due_orders?: number;
}
import { IDependent } from '/types/due-orders';
import { cn } from '/src/utils/cn';
import { useRouter } from 'next/router';

export interface ComplianceCardReturn {
  count: number;
  next: string;
  previous?: any;
  results: IDependent[];
  fetchNextPage: () => Promise<ComplianceCardReturn>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  loading: boolean;
  isFetching: boolean;
  handleSelectDate: (date: string) => void;
  delinquents: number;
}
const DelinquentStudentsCount = ({ loading, studentsDelinquency }: { loading: boolean; studentsDelinquency: any }) =>
  loading ? (
    <Skeleton className="w-40 h-4 mt-3 rounded-lg" />
  ) : (
    <div className="flex items-center gap-2">
      <p className="inline text-xs 2xl:text-sm font-semibold text-secondary whitespace-nowrap">Alumnos sin pagar</p>
      <div className="flex justify-center text-[#B72136] max-h-[24px] bg-[#FFE7D9] text-sm rounded-full min-w-[24px] items-center p-1">
        {studentsDelinquency}
      </div>
    </div>
  );

const EmptyStates = ({
  loading,
  isFetching,
  isFetchingNextPage,
  conceptName,
  studentsDelinquency,
  selectedMonth,
}: {
  loading: boolean;
  isFetching: boolean;
  isFetchingNextPage: boolean;
  conceptName: string;
  studentsDelinquency: any;
  selectedMonth: any;
}) => {
  if (loading && isFetching && !isFetchingNextPage && !studentsDelinquency?.pages?.[0]?.results?.length) {
    return (
      <>
        {Array.from(Array(5)).map((_, index) => (
          <div className="flex flex-row items-center justify-between gap-8 mb-6" key={`ss-${index}`}>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 mt-2 rounded-lg w-60" />
              <Skeleton className="w-40 h-4 mt-2 rounded-lg" />
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <Skeleton className="w-20 h-4 mt-2 rounded-lg" />
            </div>
          </div>
        ))}
      </>
    );
  } else if (!loading && !isFetching && !isFetchingNextPage && !studentsDelinquency?.pages?.[0]?.results?.length) {
    if (conceptName) {
      return (
        <div className="px-1 py-12">
          <NoDelinquency conceptName={conceptName} selectedMonth={selectedMonth} />
        </div>
      );
    } else {
      return (
        <div className="px-1 py-12 flex items-center justify-center">
          <span className="text-gray-500 text-sm">No hay ningún concepto seleccionado.</span>
        </div>
      );
    }
  }
  return null;
};

const CompliancePercentage = ({
  loading,
  calculatedPercentage,
  conceptName,
}: {
  loading: boolean;
  calculatedPercentage: number;
  conceptName: string;
}) =>
  loading ? (
    <Skeleton className="w-32 h-4 mt-2 rounded-lg" />
  ) : (
    <span className="inline text-center text-[#7986B2] text-xs 2xl:text-sm font-normal">
      {conceptName ? `${calculatedPercentage}% de cumplimiento` : '0% de cumplimiento'}
    </span>
  );

export default function ComplianceCard({
  compliancePercentage,
  selectedMonth,
  selectedSchool,
  studentsDelinquency,
  conceptId,
  periods,
  conceptName,
  setSelectedMonth,
  setCurrentIndexSelected,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  loading,
  isFetching,
  delinquents,
}: any) {
  const { ref, inView } = useInView({
    threshold: 0,
  });
  const setIsWorking = useSetIsWorking();
  const setIsError = useSetToError();
  const setToIdle = useSetToIdle();

  const addToQueue = useAddToQueue();
  const router = useRouter();

  const selectedMonthLabel = selectedMonth.label;
  const startMonth = selectedMonth.value;
  const startYear = selectedMonthLabel.substring(selectedMonthLabel.length - 4);
  const startDate = (selectedMonth.value !== 'Todos' && startYear + '-' + startMonth + '-' + '1') || '';
  const endDay = new Date(startYear, startMonth, 0).getDate();
  const endDate = (selectedMonth.value !== 'Todos' && startYear + '-' + startMonth + '-' + endDay) || '';
  const calculatedPercentage = !isNaN(compliancePercentage) ? compliancePercentage : 0;

  const mutation = api.charge.generateExcelReport.useMutation({
    async onSuccess(data) {
      addToQueue(data.id);
    },
    onError(err) {
      setIsError();
      Sentry.captureException(err);
      setTimeout(() => setToIdle(), 3000);
    },
  });

  const handleDownload = async () => {
    const payload = {
      start_date: startDate,
      end_date: endDate,
      concepts: conceptId,
    };
    sendTrackEvent('dashboard: Delinquent List Downloaded ', {});
    await mutation.mutate({ schoolId: selectedSchool.id, ...payload });
    setIsWorking();
  };
  React.useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  const handleChangeMonthSelected = (monthInfo: { label: string; value: number | string }) => {
    const index = periods.findIndex((element: { value: number }) => monthInfo.value === element?.value);
    if (monthInfo.value === 'Todos') {
      setSelectedMonth({ label: 'Todos los meses', value: 'Todos' });
      setCurrentIndexSelected(null);
    } else {
      setSelectedMonth(monthInfo);
      setCurrentIndexSelected(index - 1);
    }
  };

  const handleStudenDetail = (id: string) => router.push(`/student/detail/${id}`);

  return (
    <div className="h-full">
      <div className="px-6 py-4 rounded-t-lg bg-blue-secondary-200 xl:px-8 2xl:px-12">
        <div className="flex items-center justify-between w-full">
          <div className="max-w-[180px] w-full p-1">
            <ComplianceSelector options={periods} value={selectedMonth} onChange={handleChangeMonthSelected} />
          </div>
          <DownloadButton handleAdd={handleDownload} theme="white" />
        </div>
      </div>
      <div className="bg-[#FAFBFF] h-full max-h-[470px] rounded-xl">
        <div className="px-6 xl:px-10 2xl:px-14">
          <div className="rounded-xl">
            <div className="flex items-center justify-between py-4">
              <DelinquentStudentsCount loading={loading} studentsDelinquency={delinquents} />
              <IconDividerSmall className="mx-2" />
              <CompliancePercentage
                loading={loading}
                calculatedPercentage={calculatedPercentage}
                conceptName={conceptName}
              />
            </div>
          </div>
        </div>
        <span className="border-b border-[#919EAB3D] w-full block px-2" />

        <div className="overflow-y-scroll scrollbar min-h-[380px] pt-2 -mr-1 h-full max-h-[380px] px-4">
          {studentsDelinquency?.pages.map((page: { results: any[] }, i: string) => (
            <React.Fragment key={i + 'pages'}>
              {page?.results?.map(
                (
                  item: {
                    id: string;
                    first_name: string;
                    last_name: string;
                    section: string;
                    level: string;
                    enrollment_code: string | null;
                    due_orders: number;
                  },
                  index: number
                ) => (
                  <div
                    onClick={() => handleStudenDetail(item.id)}
                    className={cn(
                      'flex flex-col cursor-pointer py-4 px-4 xl:px-6 2xl:px-10 rounded-sm gap-2 hover:bg-[#1890FF0A]',
                      {
                        'border-b border-[#919EAB3D]': index !== page.results.length - 1,
                      }
                    )}
                    key={`${item.id}-${index}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-row items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">Colegiaturas vencidas:</span>
                          <ChipMorosidadStatus dueOrders={item.due_orders} />
                        </div>
                      </div>
                      <Link_To />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-secondary">
                        {item.first_name} {item.last_name}
                      </span>
                      <span className="flex flex-row items-center gap-2 text-xs text-secondary">
                        {item.enrollment_code ? (
                          <span className="font-normal text-gray-500 text-ellipsis">{item.enrollment_code}</span>
                        ) : (
                          ''
                        )}
                        {item.enrollment_code && <IconDividerSmall />}
                        {item.section} - {item.level}{' '}
                      </span>
                    </div>
                  </div>
                )
              )}
            </React.Fragment>
          ))}
          <div className="flex justify-center">
            <button
              ref={ref}
              onClick={() => fetchNextPage()}
              disabled={!hasNextPage || isFetchingNextPage}
              className="bg-[#FAFBFF] px-3 py-1 text-green-400"
            >
              {isFetchingNextPage ? <Loading /> : hasNextPage ? <ArrowDown /> : ''}
            </button>
          </div>
          <EmptyStates
            loading={loading}
            isFetching={isFetching}
            isFetchingNextPage={isFetchingNextPage}
            conceptName={conceptName}
            studentsDelinquency={studentsDelinquency}
            selectedMonth={selectedMonth}
          />
        </div>
      </div>
    </div>
  );
}
