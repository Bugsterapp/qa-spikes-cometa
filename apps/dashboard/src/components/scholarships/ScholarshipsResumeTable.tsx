import { ScholarshipList } from '@cometa/trpc/src/types';
import { SchoolCycleEntity } from '@cometa/trpc/src/students/types-mapping';
import { cn } from '@cometa/utils';
import * as Accordion from '@radix-ui/react-accordion';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Virtuoso } from 'react-virtuoso';
import { SortingState } from '@tanstack/react-table';
import { SortingIcon } from '../atoms/SortingIcon';
import { convertToOrdering } from '../Table';

import { useSelectedSchool } from '/src/guards/AuthGuard';
import { api } from '/src/utils/api';
import { extractPageFromURL } from '/src/utils/object-util';

import { GlobalSearch } from '../atoms/GlobalSearch';
import { HighlightMatch } from '../atoms/HighlightMatch';
import Sheet from '../atoms/Sheet';
import { Tooltip } from '../atoms/Tooltip';
import {
  DownloadButton,
  useAddToQueue,
  useSetIsWorking,
  useSetToError,
  useSetToIdle,
} from '../BackgroundDownload/BackgroundDownload';
import MultipleFilters, { MultipleFiltersChips, formFilterDataToParams, normalizeFilters } from '../MultipleFilters';
import ScholarshipAssignmentDetailV2 from '../organisms/dashboard/scholarship/ScholarshipAssigmentDetailV2';
import StudentStateChip from '../organisms/dashboard/student/StudentStateChip';
import { SchoolCycleSelector } from '../organisms/dashboard/SchoolCycleSelector';

export function ScholarshipsResumeTable({
  setHeaderVisible,
  headerVisible,
  selectedSchoolCycle,
  setSelectedSchoolCycle,
  schoolCycles,
}: {
  setHeaderVisible: (value: boolean) => void;
  headerVisible: boolean;
  selectedSchoolCycle: SchoolCycleEntity | null;
  setSelectedSchoolCycle: (value: SchoolCycleEntity | null) => void;
  schoolCycles: SchoolCycleEntity[];
}) {
  const selectedSchool = useSelectedSchool();
  const [search, setSearch] = useState('');
  const [scholarship, setScholarship] = useState<ScholarshipList | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const { data: filters } = api.schools.schoolsScholarshipsFilters.useQuery({
    school_id: selectedSchool?.id as string,
  });
  const [formFilterData, setFormFilterData] = useState<FormFilterData>({});
  const [itemsCount, setItemsCount] = useState<{ watchKey: string; count: number }[]>([]);
  type FormFilterData = Record<string, { checked: boolean; name: string }>;
  const formRef = useRef() as React.MutableRefObject<UseFormReturn<FormFilterData>>;
  const paramsFromForm = useMemo(() => formFilterDataToParams(formFilterData), [formFilterData]);

  const schoolsScholarShipsFilter = useMemo(() => {
    if (!filters) return undefined;
    return normalizeFilters(filters);
  }, [filters]);

  const filterItems = [
    {
      header: 'Beca o descuento',
      watchKey: 'scholarships',
      contents: schoolsScholarShipsFilter?.scholarships,
    },
    {
      header: 'Nivel',
      watchKey: 'levels',
      contents: schoolsScholarShipsFilter?.levels,
    },
    {
      header: 'Sección',
      watchKey: 'sections',
      contents: schoolsScholarShipsFilter?.sections,
    },
  ];
  const handleFilter = (data: FormFilterData, methods: UseFormReturn<FormFilterData>) => {
    formRef.current = methods;
    setFormFilterData(data);
  };

  const handleChangeChipFilter = (data: FormFilterData) => {
    setFormFilterData(data);
    if (formRef.current && typeof formRef.current.reset === 'function') {
      formRef.current.reset(data);
    }
    setItemsCount(itemsCount.map((item) => ({ ...item, count: 0 })));
  };
  const handleClearFilter = () => {
    setFormFilterData({});
    setSearch('');
    if (formRef.current && typeof formRef.current.reset === 'function') {
      formRef.current.reset({});
    }
    setItemsCount(itemsCount.map((item) => ({ ...item, count: 0 })));
  };
  const setIsWorking = useSetIsWorking();
  const setIsError = useSetToError();
  const setToIdle = useSetToIdle();
  const addToQueue = useAddToQueue();

  const mutation = api.scholarships.generateStudentsScholarshipsReport.useMutation({
    async onSuccess(data) {
      if (data?.id) {
        addToQueue(data?.id);
      }
    },
    onError() {
      setIsError();
      setTimeout(() => setToIdle(), 3000);
    },
  });

  const sortingArray = useMemo(() => {
    const sortingString = convertToOrdering(sorting);
    return sortingString ? [sortingString] : undefined;
  }, [sorting]);

  const {
    data: scholarshipsTable,
    isPending: isLoading,
    isFetching,
  } = api.schools.schoolsScholarshipsList.useInfiniteQuery(
    {
      school_id: selectedSchool?.id as string,
      school_cycle: selectedSchoolCycle?.id || null,
      levels: (paramsFromForm?.levels || []) as string[],
      sections: (paramsFromForm?.sections || []) as string[],
      scholarships: (paramsFromForm?.scholarships || []) as string[],
      resume: true,
      search,
      ordering: sortingArray,
    },
    {
      enabled: !!selectedSchool?.id,
      refetchOnWindowFocus: false,
      staleTime: 60,
      getNextPageParam: (currentPage) => extractPageFromURL(currentPage?.next as string) ?? undefined,
      getPreviousPageParam: (firstPage) => extractPageFromURL((firstPage as any)?.previous as string) ?? undefined,
      retry: false,
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );
  const handleDownload = async () => {
    await mutation.mutate({
      schoolId: selectedSchool?.id as string,
      levels: (paramsFromForm?.levels as string[]) || [],
      sections: (paramsFromForm?.sections as string[]) || [],
      scholarships: (paramsFromForm?.scholarships as string[]) || [],
      school_cycle: selectedSchoolCycle?.id || '',
    });
    setIsWorking();
  };
  const flatData = useMemo(() => scholarshipsTable?.pages.flatMap((page) => page?.results ?? []), [scholarshipsTable]);

  const totalCount = useMemo(() => scholarshipsTable?.pages[0]?.count || 0, [scholarshipsTable]);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // @ts-ignore we need to fix types to make them conditionally
  const hasStudents = flatData?.some((scholarship) => scholarship.students.length > 0);

  const [openAccordions, setOpenAccordions] = useState<string[]>(
    () => flatData?.map((scholarship) => scholarship.id) || []
  );

  useEffect(() => {
    if (flatData && flatData.length > 0) {
      setOpenAccordions(flatData.map((scholarship) => scholarship.id));
    } else {
      setOpenAccordions([]);
    }
  }, [flatData, selectedSchoolCycle]);
  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleAllAccordions = () => {
    if (openAccordions.length === flatData?.length) {
      setOpenAccordions([]);
    } else {
      setOpenAccordions(flatData?.map((scholarship) => scholarship.id) || []);
    }
  };
  const [prevScrollPosition, setPrevScrollPosition] = useState(0);

  const checkScroll = useCallback(() => {
    if (flatData?.length === 0) return;
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    const scrollDirection = scrollPosition > prevScrollPosition ? 'down' : 'up';
    const scrollSpeed = Math.abs(scrollPosition - prevScrollPosition);

    if (scrollPosition > 400 && scrollDirection === 'down') {
      setHeaderVisible(true);
    } else if (scrollDirection === 'up' && scrollSpeed > 50) {
      setHeaderVisible(false);
    }

    setPrevScrollPosition(scrollPosition);
  }, [flatData?.length, prevScrollPosition, setHeaderVisible]);

  useEffect(() => {
    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, [checkScroll]);

  const onRowClick = (scholarship: ScholarshipList, studentId: string) => {
    setScholarship(scholarship);
    setStudentId(studentId);
  };

  const closeScholarshipAssignmentDetail = () => {
    setScholarship(null);
    setStudentId(null);
  };

  return (
    <div className="flex flex-col h-full font-lota">
      <div
        className={cn(
          'h-[68px] bg-white flex items-center justify-between sticky top-[114px] z-20 opacity-100 transition-all duration-300 px-8 gap-2',
          {
            'top-[-1000px]': headerVisible,
          }
        )}
      >
        <div className="flex items-center gap-3">
          <MultipleFilters
            filterItems={filterItems}
            handleFilter={handleFilter}
            onClearFilter={handleClearFilter}
            itemsCount={itemsCount}
            setItemsCount={setItemsCount}
          />{' '}
          <GlobalSearch placeholder="Buscar estudiante" search={search} setSearch={setSearch} />
          {schoolCycles && schoolCycles.length > 0 ? (
            <SchoolCycleSelector
              selected={selectedSchoolCycle}
              setFn={setSelectedSchoolCycle}
              cycles={schoolCycles}
              hideTodos
            />
          ) : null}
        </div>
        <div>
          <DownloadButton
            handleAdd={handleDownload}
            theme="blue"
            disabled={!hasStudents}
            id="download-button-scholarships"
          />
        </div>
      </div>
      <div>
        <MultipleFiltersChips
          onChange={handleChangeChipFilter}
          formFilterData={formFilterData}
          itemsCount={itemsCount}
          setItemsCount={setItemsCount}
          className="px-8 py-0 pb-2"
        />
      </div>
      {flatData?.length === 0 && !isLoading && !isFetching && !search ? (
        <div className="w-full h-full flex items-center justify-center min-h-[calc(100vh-300px)] flex-col">
          <span>No hemos encontrado resultados</span>
        </div>
      ) : flatData?.length === 0 && (search || Object.keys(formFilterData).length > 0) ? (
        <div className="w-full h-full flex items-center justify-center min-h-[calc(100vh-300px)] flex-col">
          <div className="w-[350px] flex flex-col gap-2">
            <span className="font-bold text-xl">No hemos encontrado resultados</span>
            <span>Prueba cambiando los filtros que has ingresado para hacer una nueva búsqueda</span>
            <button className="flex text-green items-center gap-2" onClick={handleClearFilter}>
              <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M13.7379 4.76274C12.5154 3.54024 10.7829 2.83524 8.87794 3.03024C6.12544 3.30774 3.86044 5.54274 3.55294 8.29524C3.14044 11.9327 5.95294 15.0002 9.50044 15.0002C11.8929 15.0002 13.9479 13.5977 14.9079 11.5802C15.1479 11.0777 14.7879 10.5002 14.2329 10.5002C13.9554 10.5002 13.6929 10.6502 13.5729 10.8977C12.7254 12.7202 10.6929 13.8752 8.47294 13.3802C6.80794 13.0127 5.46544 11.6552 5.11294 9.99024C4.48294 7.08024 6.69544 4.50024 9.50044 4.50024C10.7454 4.50024 11.8554 5.01774 12.6654 5.83524L11.5329 6.96774C11.0604 7.44024 11.3904 8.25024 12.0579 8.25024H14.7504C15.1629 8.25024 15.5004 7.91274 15.5004 7.50024V4.80774C15.5004 4.14024 14.6904 3.80274 14.2179 4.27524L13.7379 4.76274Z"
                  fill="#00AB55"
                />
              </svg>
              <span className="font-bold">Limpiar filtros</span>
            </button>
          </div>
        </div>
      ) : isFetching ? (
        <div className="flex justify-center items-center px-4 py-2 bg-white border-t border-gray-200 w-[calc(100vw-255px) h-[80vh]">
          <img src="/assets/loading.svg" alt="loading" className="mx-auto" />
        </div>
      ) : (
        <div className={cn('h-full w-full', 'transition-opacity duration-300')}>
          <div
            className={cn(
              'sticky top-[182px] z-10 bg-[#FBFCFD] shadow-[0px_12px_24px_-4px_rgba(145,158,171,0.12),0px_0px_2px_0px_rgba(145,158,171,0.2)] transition-all duration-500',
              {
                'top-0': headerVisible,
              }
            )}
          >
            <div className="flex shrink-0 px-9 py-4">
              <div className="w-[40px] flex items-center">
                <Tooltip message={openAccordions.length === flatData?.length ? 'Colapsar todo' : 'Expandir todo'}>
                  <button data-testid="collapsable-icon" className="flex items-center" onClick={toggleAllAccordions}>
                    <svg viewBox="0 0 16 20" fill="none" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M1.00006 12.9998C0.999598 12.7662 1.08097 12.5397 1.23005 12.3598C1.3996 12.1553 1.64356 12.0267 1.90808 12.0023C2.17261 11.9779 2.43597 12.0598 2.64006 12.2298L8.00006 16.7098L13.3701 12.3898C13.5766 12.222 13.8416 12.1435 14.1062 12.1717C14.3709 12.1998 14.6134 12.3323 14.7801 12.5398C14.9641 12.749 15.0525 13.0254 15.0241 13.3026C14.9956 13.5797 14.8528 13.8324 14.6301 13.9998L8.63006 18.8298C8.26105 19.1331 7.72906 19.1331 7.36006 18.8298L1.36005 13.8298C1.11461 13.6263 0.980887 13.318 1.00006 12.9998Z"
                        fill="#3366FF"
                        className={cn('transition-transform origin-center', {
                          'rotate-0 -translate-y-2.5': openAccordions.length === flatData?.length,
                          'rotate-180': openAccordions.length !== flatData?.length,
                        })}
                      />
                      <path
                        d="M1.00006 7.05585C0.999598 7.28951 1.08097 7.51594 1.23005 7.69585C1.3996 7.90036 1.64356 8.029 1.90808 8.05339C2.17261 8.07778 2.43597 7.99591 2.64006 7.82585L8.00006 3.34585L13.3701 7.66585C13.5766 7.83362 13.8416 7.91212 14.1062 7.88397C14.3709 7.85582 14.6134 7.72333 14.7801 7.51585C14.9641 7.30669 15.0525 7.03023 15.0241 6.75308C14.9956 6.47593 14.8528 6.22323 14.6301 6.05585L8.63006 1.22585C8.26105 0.922537 7.72906 0.922537 7.36006 1.22585L1.36005 6.22585C1.11461 6.42932 0.980887 6.73762 1.00006 7.05585Z"
                        fill="#3366FF"
                        className={cn('transition-transform origin-center', {
                          'rotate-0 translate-y-2.5': openAccordions.length === flatData?.length,
                          'rotate-180': openAccordions?.length !== flatData?.length,
                        })}
                      />
                    </svg>
                  </button>{' '}
                </Tooltip>
              </div>
              <div className="flex-1 font-semibold max-w-[410px] w-[410px]  text-[#637381] text-sm flex items-center justify-between pr-4">
                <span className="flex justify-between">
                  <button
                    className="cursor-pointer select-none flex gap-3 items-center"
                    onClick={() => {
                      const currentSort = sorting.find((s) => s.id === 'students_count');
                      let newSorting: SortingState;

                      if (!currentSort) {
                        newSorting = [{ id: 'students_count', desc: false }];
                      } else if (currentSort.desc === false) {
                        newSorting = [{ id: 'students_count', desc: true }];
                      } else {
                        newSorting = [];
                      }

                      setSorting(newSorting);
                    }}
                  >
                    <span>Estudiante</span>
                    <SortingIcon
                      sorting={
                        sorting.find((s) => s.id === 'students_count')?.desc === true
                          ? 'desc'
                          : sorting.find((s) => s.id === 'students_count')?.desc === false
                          ? 'asc'
                          : false
                      }
                    />
                  </button>
                </span>
                <span className="text-[#637381] text-xs font-light">
                  <svg width="1" height="24" viewBox="0 0 1 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="1" height="24" fill="#919EAB" fill-opacity="0.24" />
                  </svg>
                </span>
              </div>
              <div className="flex-1 font-semibold max-w-[180px] w-[180px] text-[#637381] text-sm flex justify-between pr-4 ">
                <span className="flex items-center pl-1">
                  <span>Sección</span>
                </span>
                <span className="text-[#637381] text-xs font-light">
                  <svg width="1" height="24" viewBox="0 0 1 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="1" height="24" fill="#919EAB" fill-opacity="0.24" />
                  </svg>
                </span>
              </div>
              <div className="flex-1 font-semibold max-w-[180px] w-[180px] text-[#637381] text-sm">
                <span className="flex items-center pl-1">
                  <span>Estado de estudiante</span>
                </span>
              </div>
            </div>
          </div>
          <div ref={wrapperRef} className={cn('w-full', 'transition-opacity duration-300')}>
            <Virtuoso
              overscan={100}
              className="mb-4 h-full"
              useWindowScroll
              data={flatData || []}
              totalCount={totalCount}
              itemContent={(index, scholarship) => (
                <div
                  className={cn('px-4 pt-2', {
                    'pt-4': index === 0,
                  })}
                >
                  <Accordion.Root
                    type="multiple"
                    value={openAccordions}
                    onValueChange={(value) => setOpenAccordions(value)}
                    className="bg-[#FBFCFD] rounded-lg shadow-xs border-[#E4EBF6] border"
                  >
                    <Accordion.Item value={scholarship.id}>
                      <Accordion.Header>
                        <Accordion.Trigger
                          className="w-full text-left py-2 hover:bg-[#fdfeff] flex justify-between items-center rounded-lg"
                          onClick={() => toggleAccordion(scholarship.id)}
                        >
                          <div className="flex justify-between w-full">
                            <span className="flex font-bold text-sm items-center">
                              <span className="w-[36px] pl-5">
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className={cn('transition-transform duration-200 origin-center', {
                                    'rotate-90': !openAccordions.includes(scholarship.id),
                                    'rotate-0': openAccordions.includes(scholarship.id),
                                  })}
                                >
                                  <path
                                    d="M8.33334 15.8336C8.13863 15.834 7.94993 15.7662 7.8 15.6419C7.62958 15.5007 7.52238 15.2974 7.50206 15.0769C7.48173 14.8565 7.54996 14.637 7.69167 14.4669L11.425 10.0003L7.825 5.52528C7.6852 5.35312 7.61978 5.13233 7.64324 4.91179C7.6667 4.69126 7.7771 4.48917 7.95 4.35028C8.12431 4.19691 8.35469 4.12322 8.58565 4.14695C8.81661 4.17067 9.02719 4.28968 9.16667 4.47528L13.1917 9.47528C13.4444 9.78278 13.4444 10.2261 13.1917 10.5336L9.025 15.5336C8.85545 15.7382 8.59853 15.8496 8.33334 15.8336Z"
                                    fill="#3366FF"
                                  />
                                </svg>
                              </span>
                              <span className="pr-4 h-[40px] flex items-center pl-2">{scholarship.name} </span>
                              <span className="text-[#637381] text-xs font-light">
                                {/* @ts-ignore we need to fix types to make them conditionally */}
                                {scholarship.students?.length} estudiantes
                              </span>
                            </span>
                            <span className="pr-4 flex items-center">
                              <Tooltip message="Ver detalle">
                                <Link href={`/scholarships/${scholarship.id}`}>
                                  <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      className="group-hover/expand:[transform:translate(2px,-2px)] transition-all duration-100 ease-in-out"
                                      d="M16.6663 4.16683C16.6663 3.70659 16.2932 3.3335 15.833 3.3335H11.6663C11.2061 3.3335 10.833 3.70659 10.833 4.16683C10.833 4.62707 11.2061 5.00016 11.6663 5.00016H13.808L11.0746 7.74183C10.9169 7.8983 10.8281 8.1113 10.8281 8.3335C10.8281 8.55569 10.9169 8.76869 11.0746 8.92516C11.2311 9.08292 11.4441 9.17166 11.6663 9.17166C11.8885 9.17166 12.1015 9.08292 12.258 8.92516L14.9996 6.1835V8.3335C14.9996 8.79373 15.3727 9.16683 15.833 9.16683C16.2932 9.16683 16.6663 8.79373 16.6663 8.3335V4.16683Z"
                                      fill="#3366FF"
                                    />
                                    <path
                                      className="group-hover/expand:[transform:translate(-2px,2px)] transition-all duration-100 ease-in-out"
                                      d="M8.92467 11.0751C8.7682 10.9174 8.55521 10.8286 8.33301 10.8286C8.11081 10.8286 7.89781 10.9174 7.74134 11.0751L4.99967 13.8084V11.6668C4.99967 11.2065 4.62658 10.8334 4.16634 10.8334C3.7061 10.8334 3.33301 11.2065 3.33301 11.6668V15.8334C3.33301 16.2937 3.7061 16.6668 4.16634 16.6668H8.33301C8.79324 16.6668 9.16634 16.2937 9.16634 15.8334C9.16634 15.3732 8.79324 15.0001 8.33301 15.0001H6.18301L8.92467 12.2584C9.08243 12.102 9.17117 11.889 9.17117 11.6668C9.17117 11.4446 9.08243 11.2316 8.92467 11.0751V11.0751Z"
                                      fill="#3366FF"
                                    />
                                  </svg>
                                </Link>
                              </Tooltip>
                            </span>
                          </div>
                        </Accordion.Trigger>
                      </Accordion.Header>
                      <Accordion.Content>
                        <div className="pb-4 px-4 pt-1">
                          <div className="w-full bg-white rounded-lg overflow-hidden ">
                            <div className="bg-white divide-y divide-[#F3F6FB] border-[#E4EBF6] border rounded-lg">
                              {/* @ts-ignore we need to fix types to make them conditionally */}
                              {scholarship.students?.map((student, index) => (
                                <div
                                  key={student.id}
                                  className={cn(
                                    'hover:bg-gray-50 flex cursor-pointer',
                                    index === 0 && 'rounded-t-lg',
                                    // @ts-ignore we need to fix types to make them conditionally
                                    index === scholarship.students.length - 1 && 'rounded-b-lg'
                                  )}
                                  onClick={() => onRowClick(scholarship, student.id)}
                                >
                                  <div className="px-[42px] py-4 whitespace-nowrap text-sm min-w-[442px] max-w-[442px]">
                                    <div className="flex flex-col gap-1.5">
                                      <HighlightMatch
                                        query={search}
                                        className="text-[#1C1C1D] truncate"
                                        title={`${student.first_name} ${student.last_name}`}
                                      >
                                        <span className="flex gap-3">
                                          <span>{`${student.first_name} ${student.last_name}`}</span>{' '}
                                          {student.is_scholarship_active ? null : (
                                            <span className="flex flex-row items-start p-[1px] px-2 w-24 h-[22px] bg-[rgba(139,147,160,0.08)] rounded-md">
                                              <span className="w-20 h-5 font-['Lota_Grotesque'] font-semibold text-sm leading-5 text-center text-[#8B93A0]">
                                                Desactivada
                                              </span>
                                            </span>
                                          )}
                                        </span>
                                      </HighlightMatch>
                                      <span className="text-[#454D64] text-xs font-light">
                                        {student.enrollment_code}
                                      </span>
                                    </div>
                                  </div>
                                  <div
                                    className="px-[16px] py-4 whitespace-nowrap text-sm text-[#1C1C1D] min-w-[180px] truncate max-w-[180px] flex flex-col gap-2"
                                    title={student.section}
                                  >
                                    <span>{student.section}</span>
                                    <span className="text-xs text-[#454D64]">{student.level}</span>
                                  </div>
                                  <div className="px-[16px] py-4 whitespace-nowrap text-sm text-gray-500 w-[148px] flex items-center">
                                    <StudentStateChip state={student.state} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Accordion.Content>
                    </Accordion.Item>
                  </Accordion.Root>
                </div>
              )}
            />
          </div>
        </div>
      )}
      {scholarship && studentId && (
        <Sheet
          open={!!scholarship}
          onOpenChange={(open) => {
            if (!open) closeScholarshipAssignmentDetail();
          }}
        >
          <Sheet.Content>
            <ScholarshipAssignmentDetailV2
              onClose={closeScholarshipAssignmentDetail}
              studentId={studentId}
              scholarshipId={scholarship?.id}
            />
          </Sheet.Content>
        </Sheet>
      )}
    </div>
  );
}
