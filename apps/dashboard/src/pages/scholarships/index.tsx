import { Button, Dialog, Input, Label, Radio } from '@cometa/recreo';
import { AdjustmentDTO, ConceptCategory } from '@cometa/trpc/src/concepts/types';
import { type BaseConcept, type ScholarshipList, Status2B3Enum, TypeF30Enum } from '@cometa/trpc/src/types';
import { type SchoolCycleEntity } from '@cometa/trpc/src/students/types-mapping';
import { DevTool } from '@hookform/devtools';
import { zodResolver } from '@hookform/resolvers/zod';
import { keepPreviousData } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMediaQuery } from 'usehooks-ts';
import { z } from 'zod';
import IcCloseX from '/public/assets/icons/ic_close_x.svg';
import IcPlus from '/public/assets/icons/ic_plus.svg';
import SearchIcon from '/public/assets/icons/ic_search.svg';
import Status from '/src/components/Status';
import { convertToOrdering } from '/src/components/Table';
import { TableVirtualized } from '/src/components/TableInfinityScroll';
import { Combobox, type ComboboxProps } from '/src/components/atoms/Combobox';
import { GlobalSearch } from '/src/components/atoms/GlobalSearch';
import Sheet from '/src/components/atoms/Sheet';
import SidebarActions from '/src/components/atoms/SidebarActions';
import { Tooltip } from '/src/components/atoms/Tooltip';
import { sortOrder } from '/src/components/concepts/create-concepts/steps/Step1Form';
import Layout from '/src/components/layouts';
import SidebarHeader from '/src/components/molecules/dashboard/SidebarHeader';
import Skeleton from '/src/components/molecules/dashboard/Skeleton';
import { ScholarshipsResumeTable } from '/src/components/scholarships/ScholarshipsResumeTable';
import { SelectTextInput } from '/src/components/ui/SelectTextInput';
import { TabsWrapper as Tabs } from '/src/components/ui/Tabs';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import useAlert from '/src/hooks/useAlert';
import useDebounce from '/src/hooks/useDebounce';
import { useFlagWithVariableMatching } from '/src/components/flags/FlagsProvider';
import { api } from '/src/utils/api';
import { cn } from '/src/utils/cn';
import { renderMoney } from '/src/utils/datagridHeaders';
import { extractPageFromURL } from '/src/utils/object-util';
import {
  scopeAdjustmentSchema,
  type TypeCalculationAdjustment,
  typeCalculationAdjustmentSchema,
} from '/src/utils/static_data/zEnums';
import { Concept } from '/src/components/organisms/dashboard/scholarship/ScholarshipDetail';
import { formatPercentage } from '/src/utils/number-utils';
import { ScholarshipsEmptyState } from '../../components/scholarships/ScholarshipsEmptyState';
import { useOnboardingVideosStore, ONBOARDING_VIDEO_IDS } from '../../stores/onboardingVideosStore';
import { OnboardingVideoRenderer } from '../../components/onboarding/OnboardingVideoRenderer';
import { useScholarshipsVideoState } from '../../hooks/onboarding/useScholarshipsVideoState';
import { useScholarshipNavigation } from '../../hooks/scholarships/useScholarshipNavigation';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { TrackEvents } from '/src/constants/events';

ScholarshipsPage.getLayout = function getLayout(page: JSX.Element) {
  return (
    <Layout dashboardVariant="stretch" title="Becas y descuentos">
      {page}
    </Layout>
  );
};
ScholarshipsPage.auth = true;

export const getServerSideProps: GetServerSideProps = async (ctx) => ({
  props: {
    tab: ctx.query.tab ?? 'table',
  },
});

function ScholarshipsPage({ tab }: { tab: string }) {
  const [headerVisible, setHeaderVisible] = useState(false);
  const router = useRouter();
  const selectedSchool = useSelectedSchool();
  const { isEnabled: scholarshipsFlag } = useFlagWithVariableMatching('hk_scholarships');
  const { isEnabled: welcomePageFlag } = useFlagWithVariableMatching('enable_welcome_page');

  const isOnboardingSchool = selectedSchool?.status === Status2B3Enum.Onboarding;
  const showVideoFeature = isOnboardingSchool && welcomePageFlag;

  const { hasWatchedVideo } = useOnboardingVideosStore();
  const hasWatchedScholarshipsVideo = hasWatchedVideo(ONBOARDING_VIDEO_IDS.SCHOLARSHIPS);

  const shouldShowVideoOnLoad = showVideoFeature && !hasWatchedScholarshipsVideo;
  const [showOnboarding, setShowOnboarding] = useState(shouldShowVideoOnLoad);
  const [isShowingTableVideo, setIsShowingTableVideo] = useState(false);

  // HACK: Solo utilizado para una prueba particular, por favor eliminar el uso
  // de onlyShowResume y el flag show_scholarships_resumes_only
  const [onlyShowResume, setOnlyShowResume] = useState(false);

  useEffect(() => {
    setOnlyShowResume(false);
  }, [scholarshipsFlag]);

  let tabsData = [
    {
      value: 'table',
      label: 'Listado completo',
    },
    {
      value: 'resume',
      label: 'Resumen de asignaciones',
    },
  ];

  if (onlyShowResume) {
    tabsData = tabsData.filter((a) => a.value === 'resume');
  }

  if (!scholarshipsFlag) {
    tabsData = tabsData.filter((a) => a.value !== 'resume');
  }

  const handleChangeTabs = (tab: string) => router.replace({ query: { ...router.query, tab: tab } });
  const {
    data: schoolCycles,
    isPending: isLoading,
    isFetching,
  } = api.charge.schoolCycleList.useQuery(
    {
      schoolId: selectedSchool?.id as string,
    },
    {
      enabled: Boolean(selectedSchool),
      refetchOnWindowFocus: false,
      retry: false,
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );
  const [selectedSchoolCycle, setSelectedSchoolCycle] = useState<SchoolCycleEntity | null>(null);
  const [createScholarshipOpen, setCreateScholarshipOpen] = useState(false);

  useEffect(() => {
    setShowOnboarding(shouldShowVideoOnLoad);
  }, [shouldShowVideoOnLoad]);

  useEffect(() => {
    if (router.query.createScholarship === 'true') {
      setCreateScholarshipOpen(true);
      router.replace('/scholarships', undefined, { shallow: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.createScholarship]);

  if (showOnboarding) {
    return (
      <OnboardingVideoRenderer
        videoType="onboarding"
        onComplete={() => setShowOnboarding(false)}
        contextData={{ selectedSchool }}
      />
    );
  }

  const shouldHidePageHeader = showOnboarding || isShowingTableVideo;

  return (
    <div className="relative w-full h-full">
      {!shouldHidePageHeader && (
        <div
          className={cn('w-full z-10 transition-all', {
            'top-0 sticky': tab === 'table' ? headerVisible : !headerVisible,
          })}
        >
          <div className={cn('px-8 z-10 bg-white transition-all transform-gpu flex justify-between items-center', {})}>
            <div className="h-[64px] flex items-center self-start">
              <h1 className="text-[#212B36] text-2xl font-bold">Becas y descuentos</h1>
            </div>
            <Button
              onClick={() => {
                setCreateScholarshipOpen(true);
              }}
              className="justify-center leading-none "
              variant="solid"
              color="legacy"
              data-testid="createScholarship-button"
            >
              <IcPlus fill="currentColor" />
              Crear beca
            </Button>
          </div>
          <Tabs
            tabs={tabsData}
            tab={onlyShowResume ? 'resume' : tab}
            handleChangeTab={handleChangeTabs}
            defaultValue="table"
            tabsListClassName="px-8"
          />
        </div>
      )}
      <div className="relative bg-white">
        {!onlyShowResume && tab === 'table' && (
          <ScholarshipsTable
            setHeaderVisible={setHeaderVisible}
            headerVisible={headerVisible}
            setIsShowingTableVideo={setIsShowingTableVideo}
          />
        )}
        {(onlyShowResume || tab === 'resume') && schoolCycles?.length && !isLoading && !isFetching && (
          <ScholarshipsResumeTable
            setHeaderVisible={setHeaderVisible}
            headerVisible={headerVisible}
            selectedSchoolCycle={selectedSchoolCycle || schoolCycles.find((cycle) => cycle.is_active) || null}
            setSelectedSchoolCycle={setSelectedSchoolCycle}
            schoolCycles={schoolCycles || []}
          />
        )}
      </div>
      <Sheet open={createScholarshipOpen} onOpenChange={setCreateScholarshipOpen}>
        <Sheet.Content>
          <SideFormScholarshipsCreate onClose={() => setCreateScholarshipOpen(false)} />
        </Sheet.Content>
      </Sheet>
    </div>
  );
}

export default ScholarshipsPage;

function ScholarshipsTable({
  setHeaderVisible,
  headerVisible,
  setIsShowingTableVideo,
}: Readonly<{
  setHeaderVisible: (value: boolean) => void;
  headerVisible: boolean;
  setIsShowingTableVideo: (value: boolean) => void;
}>) {
  const selectedSchool = useSelectedSchool();
  const router = useRouter();
  const [sorting, setSorting] = useState<string>();
  const { isEnabled: scholarshipsFlag } = useFlagWithVariableMatching('hk_scholarships');
  const { isEnabled: welcomePageFlag } = useFlagWithVariableMatching('enable_welcome_page');
  const [search, setSearch] = useState<string>('');

  const isOnboardingSchool = selectedSchool?.status === Status2B3Enum.Onboarding;
  const showOnboardingEmptyState = isOnboardingSchool && welcomePageFlag;

  const { hasWatchedVideo } = useOnboardingVideosStore();
  const hasWatchedAssignmentVideo = hasWatchedVideo(ONBOARDING_VIDEO_IDS.SCHOLARSHIP_ASSIGNMENT);

  const { activeVideo, showOnboardingVideo, showAssignmentVideo, hideVideos } = useScholarshipsVideoState();

  const { handleScholarshipOpen, handleAssignmentVideoComplete } = useScholarshipNavigation({
    scholarshipsFlag,
    showOnboardingEmptyState,
    hasWatchedAssignmentVideo,
    onShowAssignmentVideo: showAssignmentVideo,
  });

  const {
    data: scholarshipsTable,
    isPending: isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = api.scholarships.listScholarships.useInfiniteQuery(
    {
      school_id: selectedSchool?.id as string,
      ordering: sorting ? [sorting] : undefined,
      search: search,
      page_size: 20,
    },
    {
      enabled: !!selectedSchool?.id,
      getNextPageParam: (lastPage) => extractPageFromURL(lastPage?.next as string) ?? undefined,
      getPreviousPageParam: (firstPage) => extractPageFromURL((firstPage as any)?.previous as string) ?? undefined,
      refetchOnMount: 'always',
      staleTime: 0,
    }
  );

  const { data: conceptTypes } = api.charge.conceptTypesList.useQuery(
    {
      schoolId: selectedSchool?.id as string,
    },
    { enabled: Boolean(selectedSchool) }
  );

  const flatData = useMemo(() => scholarshipsTable?.pages.flatMap((page) => page?.results ?? []), [scholarshipsTable]);
  const totalCount = useMemo(() => scholarshipsTable?.pages[0]?.count || 0, [scholarshipsTable]);
  const columnHelper = createColumnHelper<ScholarshipList>();
  const matches = useMediaQuery('(min-width: 1200px)');

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
  };

  const handleSortingChange = (newSorting: any) => {
    const text = convertToOrdering(newSorting);

    if (text === 'value') {
      setSorting('calculation_type,calculation_value');
    } else if (text === '-value') {
      setSorting('calculation_type,-calculation_value');
    } else {
      setSorting(text);
    }
  };

  const columns = [
    columnHelper.accessor('name', {
      cell: (info) => (
        <div className="flex flex-row min-w-[150px]">
          <span className="text-sm font-normal truncate max-w-[800px]" title={info.getValue()}>
            {info.getValue()}
          </span>
        </div>
      ),
      header: () => <span className="whitespace-nowrap">Nombre</span>,
      minSize: 400,
      maxSize: 800,
      enableSorting: true,
    }),
    columnHelper.accessor('value', {
      cell: (info) => (
        <div className="flex flex-row justify-end">
          <span className="text-sm font-normal truncate whitespace-break-spaces">
            {info.row.original.type === TypeF30Enum.PERCENT
              ? formatPercentage(info.getValue() as string)
              : `${renderMoney(Number(info.getValue()))}`}
          </span>
        </div>
      ),
      header: () => (
        <div className="flex justify-end w-full">
          <span className="text-right whitespace-nowrap">Valor dscto</span>
        </div>
      ),
      minSize: 156,
      maxSize: 156,
      enableSorting: true,
      meta: {
        numeric: true,
      },
    }),

    columnHelper.accessor('affected_concept_types', {
      cell: ({ row }) => {
        const affectedConcepts = row.original.affected_concept_types || [];
        if (affectedConcepts.length === 0) {
          return (
            <div className="flex flex-row min-w-[150px] gap-2">
              <span>{`${row.original.concepts?.length} ${
                row.original.concepts?.length === 1 ? 'concepto' : 'conceptos'
              }`}</span>
            </div>
          );
        }

        const visibleConcepts = affectedConcepts.slice(0, matches === true ? 3 : 2);
        const hiddenConcepts = affectedConcepts.slice(matches === true ? 3 : 2);
        const hiddenConceptsCount = hiddenConcepts.length;

        return (
          <div className="flex flex-row min-w-[150px] gap-2">
            {visibleConcepts.map((item) => (
              <Status key={item}>{conceptTypes?.find((category) => category.id === item)?.name}</Status>
            ))}
            {hiddenConceptsCount > 0 && (
              <Tooltip
                message={hiddenConcepts
                  .map((item) => conceptTypes?.find((category) => category.id === item)?.name)
                  .join(', ')}
              >
                <Status>+{hiddenConceptsCount}</Status>
              </Tooltip>
            )}
          </div>
        );
      },
      header: () => <span className="whitespace-nowrap">Conceptos afectados</span>,
      minSize: 400,
      maxSize: 1200,
    }),
  ];
  const wrapperRef = useRef<HTMLDivElement>(null);

  const isEmpty = !isLoading && totalCount === 0;
  const shouldShowOnboardingEmptyState = showOnboardingEmptyState && isEmpty && !search;
  const shouldShowRegularEmptyState = flatData?.length === 0 && !isLoading && !isFetching;

  useEffect(() => {
    setIsShowingTableVideo(activeVideo !== 'none');
  }, [activeVideo, setIsShowingTableVideo]);

  const handleViewTutorial = () => {
    showOnboardingVideo();
  };

  const handleCreateScholarship = () => {
    router.push('/scholarships?createScholarship=true', undefined, { shallow: true });
  };

  const handleVideoComplete = () => {
    if (activeVideo === 'assignment') {
      handleAssignmentVideoComplete();
    }
    hideVideos();
  };

  if (activeVideo !== 'none') {
    return (
      <OnboardingVideoRenderer
        videoType={activeVideo}
        onComplete={handleVideoComplete}
        contextData={{ selectedSchool }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {!shouldShowOnboardingEmptyState && (
        <div className="flex items-center h-16 px-8">
          <GlobalSearch setSearch={handleSearchChange} search={search} placeholder="Buscar beca" />
        </div>
      )}
      <div
        ref={wrapperRef}
        className={cn(
          'h-[calc(100vh-190px)]',
          { 'cursor-wait ': isLoading || isFetching },
          'transition-opacity duration-300'
        )}
      >
        {shouldShowOnboardingEmptyState && (
          <div className="flex items-center justify-center h-full">
            <ScholarshipsEmptyState onCreateScholarship={handleCreateScholarship} onViewTutorial={handleViewTutorial} />
          </div>
        )}
        {!shouldShowOnboardingEmptyState && shouldShowRegularEmptyState && (
          <div className="w-full h-full flex items-center justify-center min-h-[calc(100vh-300px)] flex-col">
            <div className="max-w-[344px] flex flex-col gap-2">
              <span className="text-[18px] font-bold leading-[20px] text-left">
                ¡Aún no tienes becas o descuentos creados!
              </span>
              <span className="font-lota text-[14px] font-normal leading-[20px] text-left">
                Ponte en contacto con nuestro equipo de soporte para crear tu primera beca.
              </span>
            </div>
          </div>
        )}
        {!shouldShowOnboardingEmptyState && !shouldShowRegularEmptyState && (
          <TableVirtualized
            data={flatData || []}
            columns={columns}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage || false}
            fetchNextPage={fetchNextPage}
            useWindowScroll
            onSortingChange={handleSortingChange}
            maxHeight={wrapperRef?.current?.offsetHeight || 500}
            setHeaderVisible={setHeaderVisible}
            headerVisible={headerVisible}
            onRowClick={handleScholarshipOpen}
            totalCount={totalCount || 0}
            totalFetched={flatData?.length || 0}
            isLoading={isLoading}
            isFetching={isFetching}
            hideSum
            addMorePaddingFirstRow
            showEmptyStateImage
            emptyEndText="No hay más becas para mostrar"
            emptyStateText="No hay más becas para mostrar"
          />
        )}
      </div>
    </div>
  );
}

interface SideFormScholarshipsCreateProps {
  onClose: () => void;
  isEdit?: boolean;
  scholarship?: AdjustmentDTO;
}

const createScholarshipFormSchema = z
  .object({
    name: z
      .string()
      .min(1, 'El nombre de la beca es requerido')
      .max(64, 'El nombre no puede superar los 64 caracteres'),
    scope: scopeAdjustmentSchema,
    categories: z.array(z.nativeEnum(ConceptCategory)).optional(),
    specificConcepts: z.array(z.string()).optional(),
    calculation_type: typeCalculationAdjustmentSchema
      .optional()
      .refine((val) => !!val, 'El tipo de monto es requerido'),
    calculation_value: z.number().positive('El monto es requerido').or(z.string().min(1, 'El monto es requerido')),
  })
  .superRefine((val, ctx) => {
    if (val.scope === scopeAdjustmentSchema.enum.BY_CATEGORY && !val.categories?.length) {
      ctx.addIssue({
        path: ['categories'],
        message: 'Falta seleccionar una categoría',
        code: z.ZodIssueCode.custom,
      });
    }

    if (val.scope === scopeAdjustmentSchema.enum.SPECIFIC_CONCEPTS && !val.specificConcepts?.length) {
      ctx.addIssue({
        path: ['specificConcepts'],
        message: 'Falta seleccionar un concepto',
        code: z.ZodIssueCode.custom,
      });
    }

    if (
      val.calculation_type === typeCalculationAdjustmentSchema.enum.PERCENTAGE &&
      Number(val.calculation_value) > 100
    ) {
      ctx.addIssue({
        path: ['calculation_value'],
        message: 'El porcentaje no puede ser mayor a 100',
        code: z.ZodIssueCode.custom,
      });
    }
  });

type CreateScholarshipValues = z.infer<typeof createScholarshipFormSchema>;

export const SideFormScholarshipsCreate = ({ onClose, isEdit, scholarship }: SideFormScholarshipsCreateProps) => {
  const selectedSchool = useSelectedSchool();
  const [searchConcept, setSearchConcept] = useState('');
  const searchConceptDebounced = String(useDebounce(searchConcept, 300));

  const [searchCategory, setSearchCategory] = useState('');
  const searchCategoryDebounced = String(useDebounce(searchCategory, 300));
  const { setAlertState } = useAlert();
  const utils = api.useUtils();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();

  const [alertToCloseSheet, setAlertToCloseSheet] = useState(false);

  const defaultScope = scholarship?.applicability?.categories?.length
    ? scopeAdjustmentSchema.enum.BY_CATEGORY
    : scopeAdjustmentSchema.enum.SPECIFIC_CONCEPTS;

  const getTextAlert = (error: any): string | null => {
    if (error.data?.cause?.message === 'AdjustmentNameAlreadyExistsException') {
      return 'Ya existe una beca con este nombre';
    }

    if (error.data?.cause?.message === 'AdjustmentCannotBeUpdatedException') {
      if (error.message?.includes('is assigned to a student')) {
        return 'No se puede actualizar la beca porque está asignada a un estudiante';
      }

      if (error.message?.includes('has been applied to one payment or more payments')) {
        return 'No se puede actualizar la beca porque ha sido aplicada a uno o más pagos';
      }
    }
    return null;
  };

  const mutationCreate = api.scholarships.create.useMutation({
    onError(error) {
      const textAlert = getTextAlert(error);
      setAlertState({
        open: true,
        severity: 'error',
        message: textAlert || 'No hemos podido crear la beca, por favor intenta de nuevo.',
      });
      sendTrackEventWithUserName(TrackEvents.scholarships.createFailed, {
        error_message: textAlert || error?.message,
      });
    },
    async onSuccess(data) {
      setAlertState({
        open: true,
        message: '¡Beca creada con éxito!',
        severity: 'success',
      });
      sendTrackEventWithUserName(TrackEvents.scholarships.createSuccess, {
        scholarship_id: data?.id,
        scholarship_name: data?.name,
      });
      await utils.scholarships.listScholarships.invalidate();
      onClose();
    },
  });

  const mutationUpdate = api.scholarships.update.useMutation({
    onError(error) {
      const textAlert = getTextAlert(error);
      setAlertState({
        open: true,
        severity: 'error',
        message: textAlert || 'La beca no puede ser editada.',
      });
    },
    async onSuccess() {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setAlertState({
        open: true,
        message: '¡Beca editada con éxito!',
        severity: 'success',
      });
      await utils.scholarships.listScholarships.invalidate();
      await utils.scholarships.getScholarshipById.invalidate({
        scholarshipId: scholarship?.id as string,
      });
      onClose();
    },
  });
  const defaultCalculationType =
    scholarship?.calculation?.type === 'PERCENTAGE'
      ? typeCalculationAdjustmentSchema.enum.PERCENTAGE
      : typeCalculationAdjustmentSchema.enum.FIXED_AMOUNT;

  const specificConcepts = (scholarship?.applicability?.specificConcepts as Concept[]) || [];

  const {
    control,
    handleSubmit,
    register,
    watch,
    setValue,
    formState: { errors, isValid, dirtyFields, defaultValues },
  } = useForm<CreateScholarshipValues>({
    resolver: zodResolver(createScholarshipFormSchema),
    mode: 'all',
    defaultValues: {
      name: scholarship?.name || '',
      categories: (scholarship?.applicability?.categories ?? []) as unknown as ConceptCategory[],
      specificConcepts: specificConcepts.map((concept) => concept.id) || [],
      calculation_value: scholarship?.calculation?.value || undefined,
      scope: scholarship ? defaultScope : undefined,
      calculation_type: scholarship ? defaultCalculationType : undefined,
    },
  });

  const scope = watch('scope');

  const calculation_type = watch('calculation_type');
  const watchCategories = watch('categories');
  const watchSpecificConcepts = watch('specificConcepts');

  const onSubmitForm = (data: CreateScholarshipValues) => {
    if (isEdit) {
      mutationUpdate.mutate({
        ...data,
        id: scholarship?.id as string,
        calculation_type: data.calculation_type as TypeCalculationAdjustment,
        institutional_id: selectedSchool?.id as string,
      });
    } else {
      sendTrackEventWithUserName(TrackEvents.scholarships.createStarted, {
        scholarship_name: data.name,
        calculation_type: data.calculation_type,
        calculation_value: data.calculation_value,
      });
      mutationCreate.mutate({
        ...data,
        calculation_type: data.calculation_type as TypeCalculationAdjustment,
        institutional_id: selectedSchool?.id as string,
      });
    }
  };

  const { data: concepts = [], isFetching: isFetchingConcepts } = api.schools.schoolsConceptsList.useQuery(
    {
      school_id: selectedSchool?.id as string,
    },
    {
      enabled: Boolean(selectedSchool) && scope === scopeAdjustmentSchema.enum.SPECIFIC_CONCEPTS,
      retry: false,
      refetchOnWindowFocus: false,
      placeholderData: keepPreviousData,
      staleTime: 5000,
    }
  );

  const { data: categories = [], isFetching: isFetchingCategories } = api.schools.schoolsConceptsFilters.useQuery(
    { school_id: selectedSchool?.id as string },
    {
      enabled: Boolean(selectedSchool) && scope === scopeAdjustmentSchema.enum.BY_CATEGORY,
      retry: false,
      refetchOnWindowFocus: false,
      placeholderData: keepPreviousData,
      staleTime: 5000,
      select: (data) => [...(data?.type || [])],
    }
  );

  categories.sort((a, b) => {
    let indexA = sortOrder.indexOf(a.name.toLowerCase());
    let indexB = sortOrder.indexOf(b.name.toLowerCase());

    if (indexA === -1) indexA = sortOrder.length;
    if (indexB === -1) indexB = sortOrder.length;

    return indexA - indexB;
  });

  const filterCategoriesBySearch = categories.filter((category) => {
    if (!searchCategoryDebounced) return true;
    return category.name.toLowerCase().includes(searchCategoryDebounced.toLowerCase());
  });

  const filterConceptsBySearch = concepts.filter((concept) => {
    if (!searchConceptDebounced) return true;
    return concept.name.toLowerCase().includes(searchConceptDebounced.toLowerCase());
  });

  const isDisabled = mutationUpdate.isPending || mutationCreate.isPending;

  return (
    <>
      <DevTool control={control} placement="top-left" />
      <form className="font-lota flex flex-col h-[100%]" onSubmit={handleSubmit(onSubmitForm)}>
        <SidebarHeader
          title={`${isEdit ? 'Editar' : 'Creación de'} beca`}
          onClose={() => setAlertToCloseSheet(true)}
          boxClassName="px-8 border-b border-neutral-200 pb-3 pt-4"
          titleClassName="text-2xl font-bold font-lota leading-7 text-neutral-950"
        />
        <div className="flex flex-col mt-6 mb-auto mx-7">
          <div className="text-lg font-bold border-t border-x border-[#E9EEF7] py-4 px-6 rounded-t-xl text-[#1B181F]">
            Ingresa la siguiente información
          </div>
          <div className="flex flex-col gap-4 border border-[#E9EEF7] p-6 rounded-b-xl">
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label>Nombre de la beca</Label>
                  <span
                    className={cn('text-xs', {
                      'text-neutral-500': (watch('name')?.length || 0) <= 64,
                      'text-red-500': (watch('name')?.length || 0) > 64,
                    })}
                  >
                    {watch('name')?.length || 0}/64
                  </span>
                </div>
                <Input
                  type="text"
                  className={cn(
                    'h-10 px-4 py-2 border rounded-lg border-neutral-300 focus-within:border-green focus:outline-none focus:ring-0',
                    { 'border-red-400': errors.name }
                  )}
                  isLegacy={false}
                  {...register('name')}
                  error={errors.name?.message}
                  disabled={isDisabled}
                />
              </div>
              <div>
                <Controller
                  control={control}
                  name="calculation_value"
                  render={({ field }) => (
                    <SelectTextInput
                      options={[
                        { value: '%', extraContent: ')', prefixContent: 'Porcentaje (' },
                        { value: '$', extraContent: ')', prefixContent: 'Pesos mexicanos (' },
                      ]}
                      selectValue={
                        calculation_type
                          ? calculation_type === typeCalculationAdjustmentSchema.enum.PERCENTAGE
                            ? '%'
                            : '$'
                          : ''
                      }
                      onChangeSelect={(value) => {
                        field.onChange('');
                        setValue(
                          'calculation_type',
                          value === '$'
                            ? typeCalculationAdjustmentSchema.enum.FIXED_AMOUNT
                            : typeCalculationAdjustmentSchema.enum.PERCENTAGE,
                          {
                            shouldDirty: true,
                            shouldValidate: true,
                          }
                        );
                      }}
                      disabled={isDisabled}
                      value={field.value}
                      isAllowed={(values) => {
                        const { floatValue = 0 } = values;
                        if (calculation_type === typeCalculationAdjustmentSchema.enum.PERCENTAGE)
                          return floatValue <= 100;
                        return true;
                      }}
                      onValueChange={(value) => field.onChange(value.floatValue)}
                      placeholder="0.00"
                      autoComplete="off"
                      decimalScale={2}
                      allowNegative={false}
                      thousandSeparator=","
                      decimalSeparator="."
                      error={
                        errors.calculation_value?.message ||
                        (dirtyFields.calculation_value
                          ? calculation_type
                            ? undefined
                            : 'El tipo de monto es requerido'
                          : undefined)
                      }
                    />
                  )}
                />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <span>Esta beca aplicará a</span>
              <Controller
                control={control}
                name="scope"
                render={({ field: { value, onChange } }) => (
                  <Radio.Group
                    name="action"
                    className="flex flex-col gap-4"
                    value={value}
                    onValueChange={(value) => {
                      if (value === scopeAdjustmentSchema.enum.BY_CATEGORY) {
                        setValue('categories', defaultValues?.categories as ConceptCategory[]);
                        setValue('specificConcepts', []);
                      } else if (value === scopeAdjustmentSchema.enum.SPECIFIC_CONCEPTS) {
                        setValue('specificConcepts', defaultValues?.specificConcepts as string[]);
                        setValue('categories', []);
                      }
                      onChange(value);
                    }}
                    disabled={isDisabled}
                  >
                    <div
                      className={cn('relative px-6 py-4 border rounded-lg cursor-pointer border-neutral-300', {
                        'border-green': scope === scopeAdjustmentSchema.enum.BY_CATEGORY,
                      })}
                    >
                      <Label htmlFor="category-type" className="text-base cursor-pointer">
                        <h2 className="text-sm font-semibold text-neutral-800 ">Toda una categoría de concepto</h2>
                        <p className="text-xs text-neutral-600  mt-0.5">
                          Se incluirán todos los conceptos asociados a categorías como colegiaturas, inscripciones,
                          reinscripciones, transporte entre otros.
                        </p>
                      </Label>
                      <Radio.Item
                        id="category-type"
                        value={scopeAdjustmentSchema.enum.BY_CATEGORY}
                        className="absolute top-0 right-0 m-3 cursor-pointer min-w-4 min-h-4"
                        disabled={isDisabled}
                      />
                    </div>
                    <div
                      className={cn('relative px-6 py-4 border rounded-lg cursor-pointer border-neutral-300', {
                        'border-green': scope === scopeAdjustmentSchema.enum.SPECIFIC_CONCEPTS,
                      })}
                    >
                      <Label htmlFor="concept-type" className="text-base cursor-pointer">
                        <h2 className="text-sm font-semibold text-neutral-800 ">Un concepto específico</h2>
                        <p className="text-xs text-neutral-600  mt-0.5">
                          Son aquellos creados específicamente para un concepto en especial. Pueden ser compra de
                          uniformes, pago de viajes escolares, pago por almuerzos entre otros.
                        </p>
                      </Label>
                      <Radio.Item
                        id="concept-type"
                        value={scopeAdjustmentSchema.enum.SPECIFIC_CONCEPTS}
                        className="absolute top-0 right-0 m-3 cursor-pointer min-w-4 min-h-4"
                        disabled={isDisabled}
                      />
                    </div>
                  </Radio.Group>
                )}
              />
            </div>
            {scope &&
              scope !== scopeAdjustmentSchema.enum.ALL_CATEGORIES &&
              (scope === scopeAdjustmentSchema.enum.SPECIFIC_CONCEPTS ? (
                <div className="flex flex-col gap-4">
                  <h4 className="font-semibold text-neutral-800">Concepto</h4>
                  <Controller
                    control={control}
                    name="specificConcepts"
                    render={({ field: { onChange } }) => (
                      <>
                        <ListComboboxItems<BaseConcept['id']>
                          items={concepts}
                          filteredItems={filterConceptsBySearch}
                          selectedItems={watchSpecificConcepts ?? []}
                          setSelectedItems={(items) => {
                            onChange(items);
                          }}
                          search={searchConcept}
                          setSearch={setSearchConcept}
                          isLoading={isFetchingConcepts}
                          isItemDisabled={(item) =>
                            watchSpecificConcepts?.some((selectedItem) => selectedItem === item.id) ?? false
                          }
                          textButton="Añadir concepto"
                          placeholder="Buscar concepto"
                          disabled={isDisabled}
                        >
                          {filterConceptsBySearch.map((concept, index) => (
                            <Combobox.Option
                              key={concept.id}
                              value={concept}
                              index={index}
                              className="hover:text-galaxy-500 hover:bg-galaxy-500/8 aria-disabled:bg-galaxy-500/8 aria-disabled:text-galaxy-500"
                              allowHighlight={false}
                            >
                              <div className="flex flex-col items-start font-normal">
                                <span className="overflow-hidden text-base font-semibold truncate text-ellipsis">
                                  {concept.name}
                                </span>
                                <span className="text-xs max-w-[220px] font-light truncate">
                                  {concept.school_cycle.name}
                                </span>
                              </div>
                            </Combobox.Option>
                          ))}
                        </ListComboboxItems>
                        {errors.specificConcepts && (
                          <span className="text-sm text-red-500">{errors.specificConcepts.message}</span>
                        )}
                      </>
                    )}
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <h4 className="font-semibold text-neutral-800">Categoría</h4>
                  <Controller
                    control={control}
                    name="categories"
                    render={({ field: { onChange } }) => (
                      <>
                        <ListComboboxItems
                          items={categories}
                          filteredItems={filterCategoriesBySearch}
                          selectedItems={watchCategories ?? []}
                          setSelectedItems={(items) => {
                            onChange(items);
                          }}
                          search={searchCategory}
                          setSearch={setSearchCategory}
                          isLoading={isFetchingCategories}
                          isItemDisabled={(item) =>
                            watchCategories?.some((selectedItem) => selectedItem === item.id) ?? false
                          }
                          textButton="Añadir categoría"
                          placeholder="Buscar categoría"
                          disabled={isDisabled}
                        >
                          {filterCategoriesBySearch.map((category, index) => (
                            <Combobox.Option
                              key={category.id}
                              value={category}
                              index={index}
                              className="hover:text-galaxy-500 hover:bg-galaxy-500/8 aria-disabled:bg-galaxy-500/8 aria-disabled:text-galaxy-500"
                              allowHighlight={false}
                            >
                              <div className="flex flex-col items-start font-normal">
                                <span className="overflow-hidden text-base font-semibold truncate text-ellipsis">
                                  {category.name}
                                </span>
                              </div>
                            </Combobox.Option>
                          ))}
                        </ListComboboxItems>
                        {errors.categories && <span className="text-sm text-red-500">{errors.categories.message}</span>}
                      </>
                    )}
                  />
                </div>
              ))}
          </div>
        </div>
        <SidebarActions className="z-10 justify-start gap-1 mt-4 shadow-none">
          <Button
            variant="text"
            type="button"
            className="px-5 py-2.5 rounded-[100px]"
            color="legacy"
            onClick={() => setAlertToCloseSheet(true)}
            disabled={isDisabled}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="solid"
            color="legacy"
            className="px-5 py-2.5 rounded-[100px]"
            disabled={!isValid || isDisabled}
          >
            {mutationUpdate.isPending || mutationCreate.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </SidebarActions>
      </form>
      <Dialog.Root open={alertToCloseSheet} position="right" className="right-12">
        <Dialog.Title>{`¿Estás seguro que deseas cancelar la ${
          isEdit ? 'edición' : 'creación'
        } de la beca?`}</Dialog.Title>
        <Dialog.Description>
          Los datos no se guardarán y deberás iniciar el proceso nuevamente en caso que desees continuarlo
        </Dialog.Description>
        <div className="flex justify-center gap-x-10">
          <Button
            id="dialog-in-drawer-cancel"
            className="!text-gray-600 rounded-lg"
            variant="text"
            color="black"
            onClick={() => setAlertToCloseSheet(false)}
          >
            Atrás
          </Button>
          <Button
            variant="solid"
            className="text-white rounded-lg bg-error hover:bg-opacity-80"
            onClick={() => {
              setAlertToCloseSheet(false);
              onClose();
            }}
          >
            Si, cancelar
          </Button>
        </div>
      </Dialog.Root>
    </>
  );
};

interface Item<TId extends string = string> {
  name: string;
  id: TId;
}

interface ListComboboxItemsProps<TSelectedItems extends string = string> {
  items: Item<TSelectedItems>[];
  filteredItems: Item<TSelectedItems>[];
  selectedItems: TSelectedItems[];
  setSelectedItems: (items: TSelectedItems[]) => void;
  search: ComboboxProps<Item<TSelectedItems>>['value'];
  setSearch: ComboboxProps<Item<TSelectedItems>>['setSearch'];
  isLoading: boolean;
  isItemDisabled?: ComboboxProps<Item<TSelectedItems>>['isItemDisabled'];
  textButton: string;
  placeholder?: string;
  disabled?: boolean;
}

function ListComboboxItems<TSelectedItems extends string = string>({
  items,
  filteredItems,
  selectedItems,
  setSelectedItems,
  children,
  search,
  setSearch,
  isLoading,
  isItemDisabled,
  textButton,
  placeholder,
  disabled,
}: React.PropsWithChildren<ListComboboxItemsProps<TSelectedItems>>) {
  const [showCombobox, setShowCombobox] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col gap-4">
        {selectedItems.map((item, index) => {
          if (isLoading && selectedItems.length) return <Skeleton className="h-10" />;
          const selectedData = items.find((data) => data.id === item);
          if (!selectedData) return null;
          return (
            <div
              key={`${selectedData.id}-${index}`}
              className="flex items-center justify-between gap-2 p-2 px-4 border rounded-lg border-neutral-300"
            >
              <span className="text-neutral-950">{selectedData.name}</span>
              <Button
                variant="text"
                color="black"
                className="h-auto p-0.5"
                onClick={() => setSelectedItems(selectedItems.filter((selectedItem) => selectedItem !== item))}
              >
                <IcCloseX className="text-neutral-500" />
              </Button>
            </div>
          );
        })}
      </div>
      <div className="relative">
        <Button
          color="legacy"
          variant="text"
          className={cn('w-fit', {
            '!bg-[#D6F2E4]': showCombobox,
          })}
          onClick={() => setShowCombobox((prev) => !prev)}
        >
          <IcPlus fill="currentColor" />
          {textButton}
        </Button>
        {showCombobox && (
          <div className="absolute right-0 z-20 w-full bg-white top-10 p-2.5 rounded-md shadow-[4px_4px_20px_0px_rgba(113,121,147,0.19)] border border-[#e4ebf6]">
            <Combobox<Item<TSelectedItems>>
              defaultIsOpen
              value={search}
              onChange={setSearch}
              className="w-full space-y-1"
              items={filteredItems}
              setSearch={setSearch}
              keyLabel="name"
              handleSelection={(item) => {
                if (item) {
                  setSelectedItems([...selectedItems, item.id]);
                  setShowCombobox(false);
                  setSearch('');
                }
              }}
              isItemDisabled={isItemDisabled}
            >
              <Combobox.Input
                icon={<SearchIcon />}
                placeholder={placeholder}
                onReset={() => {
                  setShowCombobox(false);
                }}
                disabled={isLoading || disabled}
              />
              <Combobox.Options className="static z-0 flex flex-col w-full gap-2 p-0 mt-0">{children}</Combobox.Options>
              {items?.length === 0 && !isLoading && (
                <div className="flex flex-col items-start gap-1 p-1 font-normal text-gray-600">
                  <span className="text-base">No se encontraron resultados</span>
                </div>
              )}
              {items?.length === 0 && isLoading && <Skeleton className="h-8 " />}
            </Combobox>
          </div>
        )}
      </div>
    </div>
  );
}
