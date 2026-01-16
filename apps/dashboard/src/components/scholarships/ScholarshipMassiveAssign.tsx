import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SchoolCycleSelector } from '/src/components/organisms/dashboard/SchoolCycleSelector';
import { TableVirtualized } from '/src/components/TableInfinityScroll';
import type { DashboardStudentSearch } from '@cometa/trpc/src/types';
import { SchoolCycleEntity } from '@cometa/trpc/src/students/types-mapping';
import Layout from '/src/components/layouts';
import { api } from '/src/utils/api';
import { useSelectedSchool, useSelectedSchoolId } from '/src/guards/AuthGuard';
import SidebarHeader from '/src/components/molecules/dashboard/SidebarHeader';
import useAlert from '/src/hooks/useAlert';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { Events } from '/src/constants/events';
import { z } from 'zod';
import ScholarshipAssignmentButton from '/src/components/organisms/dashboard/ScholarshipAssignmentButton';
import { GenericRowCheckBoxButton } from '/src/components/organisms/dashboard/StudentAssignedTable';
import StudentStateChip from '../organisms/dashboard/student/StudentStateChip';
import { useElementSize } from '/src/hooks/useElementSize';
import { Tooltip } from '../atoms/Tooltip';
import Status from '../Status';
import { renderMoney } from '/src/utils/datagridHeaders';
import { GlobalSearch } from '../atoms/GlobalSearch';
import { createColumnHelper } from '@tanstack/react-table';
import type { StudentWithScholarship } from '/src/server/api/routers/students';
import { useAddToProcessQueue, useSetBackgroundProcessStatus } from '/src/store/backgroundProcessStore';
import BackgroundScholarshipAssign from '../BackgroundProcess/BackgroundScholarshipAssign';
import MultipleFilters, {
  type FormFilterData,
  formFilterDataToParams,
  MultipleFiltersChipsShorted,
  normalizeFilters,
} from '../MultipleFilters';
import { useStatePersist } from 'use-state-persist';
import type { UseFormReturn } from 'react-hook-form';
import { AdjustmentDTO } from '@cometa/trpc/src/concepts/types';
import { Concept } from '/src/components/organisms/dashboard/scholarship/ScholarshipDetail';
import MassiveScholarshipValidationDialog from '/src/components/students/MassiveScholarshipValidationDialog';

const StepHeader: React.FC<{ title: string; description?: string }> = ({ title, description }) => (
  <div className="mb-6">
    <h2 className="text-xl font-bold">{title}</h2>
    {description && <p className="text-[#637381]">{description}</p>}
  </div>
);

MassiveScholarshipAssignment.getLayout = function getLayout(page: JSX.Element) {
  return <Layout title="Asignación Masiva de Becas">{page}</Layout>;
};

enum Steps {
  Step1 = 'STEP_1_SCHOOL_CYCLE',
  Step2 = 'STEP_2_STUDENTS',
  Step3 = 'STEP_3_DETAIL',
}

const SelectedSchoolCycleSchema = z.object({
  schoolCycle: z.any().nullable(),
});

export type FormValuesStudents = z.infer<typeof SelectedStudentsSchema>;
const SelectedStudentsSchema = z.object({
  students: z.array(z.custom<StudentWithScholarship>()),
});

const AssignDetailSchema = SelectedSchoolCycleSchema.merge(SelectedStudentsSchema);

export type FormValuesSchoolCycle = z.infer<typeof SelectedSchoolCycleSchema>;
export type FormValuesAssignDetail = z.infer<typeof AssignDetailSchema>;
export type FormValues = FormValuesSchoolCycle & FormValuesStudents;

export type StepAssignProps<T> = {
  setData?: (data: T) => void;
  onNext: () => void;
  onBack: () => void;
  formData?: Partial<FormValues>;
  saving?: boolean;
};

interface MassiveScholarshipAssignmentProps {
  onClose: () => void;
  scholarship: AdjustmentDTO;
}

function MassiveScholarshipAssignment({ onClose, scholarship }: MassiveScholarshipAssignmentProps) {
  const { setAlertState } = useAlert();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const selectedSchool = useSelectedSchool();
  const [currentStep, setCurrentStep] = useState<Steps>(Steps.Step1);
  const [formData, setFormData] = useState<Partial<FormValues>>({});
  const [formFilterData, setFormFilterData] = useStatePersist<FormFilterData>('@ScholarshipMassiveAssignFilter');
  const [itemsCount, setItemsCount] = useStatePersist<{ watchKey: string; count: number }[]>(
    '@ScholarshipMassiveAssignFiltersItemsCount',
    []
  );

  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validationData, setValidationData] = useState<any>(null);
  const [confirmSponsoredPayment, setConfirmSponsoredPayment] = useState(false);

  const paramsFromForm = useMemo(() => formFilterDataToParams(formFilterData), [formFilterData]);
  const params = {
    ...paramsFromForm,
  };

  const { data: students, isPending: isLoadingStudents } = api.students.getStudents.useQuery(
    {
      schoolId: selectedSchool?.id ?? '',
      scholarships: [scholarship.id],
      scholarship_id: scholarship.id,
      school_cycle: formData.schoolCycle?.id,
      ...params,
    },
    {
      enabled: !!formData.schoolCycle,
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  const { data: filters } = api.students.studentFilters.useQuery(
    { school_id: selectedSchool?.id ?? '' },
    {
      staleTime: 60 * 1000 * 60,
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  const studentsDueOrdersFilter = useMemo(() => {
    if (!filters) return undefined;
    return normalizeFilters(filters);
  }, [filters]);

  const addToProcessQueue = useAddToProcessQueue();
  const setBackgroundProcessStatus = useSetBackgroundProcessStatus();
  const utils = api.useUtils();
  const createAssignMutation = api.scholarships.assignScholarship.useMutation({
    onSuccess: async (data) => {
      setShowValidationDialog(false);
      setValidationData(null);
      setConfirmSponsoredPayment(false);
      addToProcessQueue(data?.id as string);
      setBackgroundProcessStatus('working');
      sendTrackEventWithUserName(Events.bulk_scholarship_assignment_started);
      setFormData({});
      setCurrentStep(Steps.Step1);
      setAlertState({
        open: true,
        severity: 'success',
        alertTime: 3000,
        message: <>Se ha iniciado la asignación masiva de becas.</>,
      });
      onClose();
      await utils.students.invalidate();
    },
    onError: (err) => {
      const sponsoredData = err.data?.customData?.sponsoredPayment || (err.data?.cause as any);
      let errorMessage = 'No se pudo iniciar la asignación masiva de becas.';

      if (err.data?.httpStatus === 409 && sponsoredData?.error === 'sponsored_payment_risk') {
        setValidationData(sponsoredData);
        setShowValidationDialog(true);
        return;
      }

      try {
        if (typeof sponsoredData?.message === 'string') {
          const parsedError = JSON.parse(sponsoredData.message);
          if (parsedError.error) {
            errorMessage = 'Ocurrió un error inesperado, por favor intenta de nuevo.';
          }
        }
        // eslint-disable-next-line no-empty
      } catch (e) {}

      setFormData({});
      setCurrentStep(Steps.Step1);
      sendTrackEventWithUserName(Events.bulk_scholarship_assignment_failure);
      setAlertState({
        open: true,
        severity: 'error',
        message: <>{errorMessage}</>,
      });
    },
  });

  const handleData = (data: Partial<FormValues>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    const eventsNames = {
      [Steps.Step1]: 'Bulk Scholarship Assignment P1 (School Cycle Selected)',
      [Steps.Step2]: 'Bulk Scholarship Assignment P2 (Students Selected)',
      [Steps.Step3]: 'Bulk Scholarship Assignment P3 (Confirmation)',
    };
    sendTrackEventWithUserName(eventsNames[currentStep]);
    switch (currentStep) {
      case Steps.Step1:
        setCurrentStep(Steps.Step2);
        break;
      case Steps.Step2:
        setCurrentStep(Steps.Step3);
        break;
      default:
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case Steps.Step1:
        onClose();
        break;
      case Steps.Step2:
        setCurrentStep(Steps.Step1);
        break;
      case Steps.Step3:
        setCurrentStep(Steps.Step2);
        break;
      default:
        break;
    }
  };

  const handleCreate = async () => {
    try {
      const payload = {
        school_cycle: formData.schoolCycle?.id,
        students: formData.students?.map((student) => student.id) ?? [],
        scholarship_id: scholarship.id,
      };
      await createAssignMutation.mutate({
        school_id: selectedSchool?.id ?? '',
        data: payload,
        confirmSponsoredPayment,
      });
    } catch (error) {
      setAlertState({
        open: true,
        severity: 'error',
        message: <>Ocurrió un error inesperado.</>,
      });
    }
  };

  const handleConfirmValidation = () => {
    setConfirmSponsoredPayment(true);
    setShowValidationDialog(false);
    const payload = {
      school_cycle: formData.schoolCycle?.id,
      students: formData.students?.map((student) => student.id) ?? [],
      scholarship_id: scholarship.id,
    };
    createAssignMutation.mutate({
      school_id: selectedSchool?.id ?? '',
      data: payload,
      confirmSponsoredPayment: true,
    });
  };

  const handleCancelValidation = () => {
    setShowValidationDialog(false);
    setValidationData(null);
    setConfirmSponsoredPayment(false);
  };

  return (
    <>
      <div className="min-h-[calc(100vh-75px)] font-lota">
        <div className="px-8">
          <SidebarHeader title="Asignación masiva de becas" onClose={onClose} />
        </div>
        {currentStep === Steps.Step1 && (
          <Step1SchoolCycleSelection setData={handleData} onNext={handleNext} onBack={handleBack} formData={formData} />
        )}
        {currentStep === Steps.Step2 && (
          <Step2StudentSelection
            setData={handleData}
            onNext={handleNext}
            onBack={handleBack}
            formData={formData}
            isLoadingStudents={isLoadingStudents}
            students={(students as StudentWithScholarship[]) ?? []}
            formFilterData={formFilterData}
            setFormFilterData={setFormFilterData}
            itemsCount={itemsCount}
            setItemsCount={setItemsCount}
            studentsDueOrdersFilter={studentsDueOrdersFilter}
          />
        )}
        {currentStep === Steps.Step3 && (
          <Step3AssignmentDetail
            onNext={handleCreate}
            onBack={handleBack}
            formData={formData}
            saving={createAssignMutation.isPending || false}
            scholarship={scholarship}
          />
        )}
      </div>
      <BackgroundScholarshipAssign />

      <MassiveScholarshipValidationDialog
        isOpen={showValidationDialog}
        onClose={handleCancelValidation}
        onConfirm={handleConfirmValidation}
        validationData={validationData}
        isLoading={createAssignMutation.isPending}
      />
    </>
  );
}

const Step1SchoolCycleSelection: React.FC<StepAssignProps<FormValuesSchoolCycle>> = ({
  setData,
  onNext,
  onBack,
  formData,
}) => {
  const selectedSchool = useSelectedSchool();
  const { data: schoolCycles } = api.schools.schoolsCycles.useQuery({
    school_id: selectedSchool?.id ?? '',
  });

  const handleSelectSchoolCycle = (schoolCycle: SchoolCycleEntity | null) => {
    setData?.({ schoolCycle });
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-75px)]">
      <div className="flex-grow px-8 py-4">
        <StepHeader
          title="Ciclos escolares"
          description="Selecciona los ciclos escolares a los que afectará la beca a asignar."
        />
        {schoolCycles && (
          <SchoolCycleSelector
            selected={formData?.schoolCycle}
            setFn={handleSelectSchoolCycle}
            cycles={schoolCycles ?? []}
            className="w-full"
            allowReset
            hideTodos
          />
        )}
      </div>
      <ScholarshipAssignmentButton
        onBack={onBack}
        onNext={onNext}
        textBack="Cancelar"
        textNext="Siguiente"
        disabledNext={!formData?.schoolCycle}
      />
    </div>
  );
};

const Step2StudentSelection: React.FC<
  StepAssignProps<FormValuesStudents> & {
    students: StudentWithScholarship[] | undefined;
    isLoadingStudents: boolean;
    formFilterData: FormFilterData;
    setFormFilterData: (data: FormFilterData) => void;
    itemsCount: { watchKey: string; count: number }[];
    setItemsCount: (items: { watchKey: string; count: number }[]) => void;
    studentsDueOrdersFilter: any;
  }
> = ({
  setData,
  onNext,
  onBack,
  formData,
  students,
  isLoadingStudents,
  formFilterData,
  setFormFilterData,
  itemsCount,
  setItemsCount,
  studentsDueOrdersFilter,
}) => {
  const [selectedAll, setSelectedAll] = useState(false);
  const [deselectedStudents, setDeselectedStudents] = useState<StudentWithScholarship[]>([]);
  const [search, setSearch] = useState('');

  const handleSelectAll = () => {
    const newSelectedAll = !selectedAll;
    setSelectedAll(newSelectedAll);

    if (newSelectedAll && students) {
      const selectableStudents = students.filter((student) => !student.is_active_scholarships);
      setData?.({ students: selectableStudents });
      setDeselectedStudents([]);
    } else {
      setData?.({ students: [] });
      setDeselectedStudents([]);
    }
  };

  const handleSelectRow = (student: StudentWithScholarship) => {
    if (student.is_active_scholarships) return;

    if (selectedAll) {
      setDeselectedStudents((prev) => {
        const isStudentDeselected = prev.some((s) => s.id === student.id);
        if (isStudentDeselected) {
          return prev.filter((s) => s.id !== student.id);
        } else {
          return [...prev, student];
        }
      });
    } else {
      setData?.({
        students: formData?.students?.some((s) => s.id === student.id)
          ? formData.students.filter((s) => s.id !== student.id)
          : [...(formData?.students ?? []), student],
      });
    }
  };

  const selectableStudentsCount = students?.filter((student) => !student.is_active_scholarships).length ?? 0;
  const selectedStudentsCount = selectedAll
    ? selectableStudentsCount - deselectedStudents.length
    : formData?.students?.length ?? 0;

  const selectAllState = selectedAll
    ? deselectedStudents.length === 0
      ? true
      : 'indeterminate'
    : selectedStudentsCount > 0
    ? 'indeterminate'
    : false;

  const columnHelper = createColumnHelper<StudentWithScholarship>();
  const columns = [
    columnHelper.accessor('id', {
      header: () => (
        <GenericRowCheckBoxButton
          onClick={handleSelectAll}
          checked={selectAllState}
          disabled={students?.every((student) => student.is_active_scholarships)}
        />
      ),
      size: 60,
      cell: ({ row }) => {
        const isSelected = selectedAll
          ? !deselectedStudents.some((s) => s.id === row.original.id) && !row.original.is_active_scholarships
          : formData?.students?.some((s) => s.id === row.original.id);
        return (
          <Tooltip
            message="Esta beca ya se encuentra asignada a este estudiante"
            disableHover={!row.original.is_active_scholarships}
          >
            <GenericRowCheckBoxButton
              checked={isSelected}
              onClick={() => handleSelectRow(row.original)}
              disabled={row.original.is_active_scholarships}
            />
          </Tooltip>
        );
      },
    }),
    columnHelper.accessor('first_name', {
      header: () => <span className="text-sm font-semibold">Nombre</span>,
      cell: (info) => (
        <div>
          <div className="text-[#212B36] text-sm">
            {info.row.original.first_name} {info.row.original.last_name}
          </div>
          <div className="text-[#454D64] text-xs">
            {info.row.original.enrollment_code} | {info.row.original.section || '-'} | {info.row.original.level || '-'}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('state', {
      header: () => <span className="text-sm font-semibold">Estado actual</span>,
      cell: (info) => (
        <div className="flex justify-end pr-11">
          <StudentStateChip state={info.row.original.state} />
        </div>
      ),
    }),
  ];
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { height } = useElementSize(wrapperRef);

  const normalizeString = (str: string) =>
    str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const filterStudents = (students: StudentWithScholarship[] | undefined, searchTerm: string) => {
    if (!students) return [];
    const normalizedSearchTerm = normalizeString(searchTerm);
    return students.filter((student) => {
      const searchableFields = [
        student.first_name,
        student.last_name,
        student.enrollment_code,
        student.level,
        student.section,
        student.state,
        student.inscription_status,
      ];
      const combinedFields = normalizeString(searchableFields.join(' '));
      return normalizedSearchTerm.split(' ').every((term) => combinedFields.includes(term));
    });
  };
  const studentsFiltered = filterStudents(students, search);

  const filterItems = [
    {
      header: 'Estado de estudiante',
      watchKey: 'state',
      contents: studentsDueOrdersFilter?.state,
    },
    {
      header: 'Colegiaturas vencidas',
      watchKey: 'due_orders',
      contents: studentsDueOrdersFilter?.due_orders,
    },
    {
      header: 'Nivel',
      watchKey: 'levels',
      contents: studentsDueOrdersFilter?.levels,
    },
    {
      header: 'Sección',
      watchKey: 'sections',
      contents: studentsDueOrdersFilter?.sections,
    },
    {
      header: 'Concepto',
      watchKey: 'concepts',
      contents: studentsDueOrdersFilter?.concepts,
    },
    {
      header: 'Beca asignada',
      watchKey: 'scholarships',
      contents: studentsDueOrdersFilter?.scholarships,
    },
    {
      header: 'Estado de inscripción',
      watchKey: 'inscription_status',
      contents: studentsDueOrdersFilter?.inscription_status,
    },
  ];
  const formRef = useRef() as React.MutableRefObject<UseFormReturn<FormFilterData>>;
  const handleFilterChange = (newFilterData: FormFilterData, methods: UseFormReturn<FormFilterData>): void => {
    let filters = {};
    if (formFilterData && Object.values(formFilterData).filter((value) => value.checked).length > 0) {
      filters = { ...formFilterData, ...newFilterData };
    } else {
      filters = newFilterData;
    }

    formRef.current = methods;
    setFormFilterData(filters);
  };
  useEffect(
    () => () => {
      setFormFilterData({});
    },
    []
  );
  const handleChangeChipFilter = (data: FormFilterData): void => {
    setFormFilterData(data);
  };
  const hasFiltersApplied = formFilterData != null && Object.values(formFilterData).some((item) => item?.checked);
  return (
    <div className="flex flex-col min-h-[calc(100vh-75px)] justify-between" ref={wrapperRef}>
      <div>
        <div className="flex-shrink-0 px-8 py-4">
          <StepHeader
            title="Selecciona los estudiantes a asignar"
            description="Puedes buscar entre tus estudiantes activos y seleccionar los que necesites."
          />
        </div>
        <div className="px-8 py-4">
          <div className="flex gap-4 items-center">
            <MultipleFilters
              filterItems={filterItems}
              handleFilter={handleFilterChange}
              onClearFilter={() => {
                setFormFilterData({});
              }}
              itemsCount={itemsCount}
              setItemsCount={setItemsCount}
              selectedItems={formFilterData}
            />
            <GlobalSearch search={search} setSearch={setSearch} placeholder="Buscar estudiantes" />
          </div>
          {hasFiltersApplied && (
            <div className="mt-4">
              <MultipleFiltersChipsShorted
                onChange={handleChangeChipFilter}
                formFilterData={formFilterData}
                setItemsCount={setItemsCount}
                itemsCount={itemsCount}
              />
            </div>
          )}
        </div>
        <div className="overflow-hidden">
          {isLoadingStudents ? (
            <TableVirtualized
              data={[]}
              columns={columns}
              maxHeight={height ? height - 280 : 400}
              totalCount={0}
              isFetching={false}
              totalFetched={0}
              hasNextPage={false}
              fetchNextPage={() => void 0}
              isLoading
              isSmallLoading
            />
          ) : students && students.length > 0 ? (
            studentsFiltered.length > 0 ? (
              <TableVirtualized
                data={studentsFiltered}
                columns={columns}
                maxHeight={height ? height - (hasFiltersApplied ? 360 : 300) : 400}
                totalCount={students.length}
                isLoading={false}
                isFetching={false}
                totalFetched={students.length}
                hasNextPage={false}
                fetchNextPage={() => void 0}
                isSmallLoading
              />
            ) : (
              <div className="text-sm text-center py-4 min-h-[calc(100vh-380px)] flex items-center justify-center">
                No se encontraron estudiantes con los criterios de búsqueda actuales.
              </div>
            )
          ) : (
            <div className="text-sm text-center py-4 min-h-[calc(100vh-380px)] flex items-center justify-center px-8">
              No hay estudiantes en este ciclo escolar. Revise la selección o agregue estudiantes si es necesario.
            </div>
          )}
        </div>
      </div>

      <ScholarshipAssignmentButton
        counterText={
          <span className="flex gap-1 items-center w-full font-bold">
            {selectedStudentsCount || 0} <span className="font-normal">estudiantes seleccionados</span>
          </span>
        }
        onBack={onBack}
        onNext={onNext}
        textNext="Siguiente"
        disabledNext={selectedStudentsCount === 0}
      />
    </div>
  );
};

const Step3AssignmentDetail: React.FC<StepAssignProps<FormValuesAssignDetail> & { scholarship: AdjustmentDTO }> = ({
  onNext,
  onBack,
  formData,
  saving,
  scholarship,
}) => {
  const [studentSelected, setStudentSelected] = useState<DashboardStudentSearch[] | undefined>(
    formData?.students ?? []
  );
  const selectedSchoolId = useSelectedSchoolId();
  const [search, setSearch] = useState('');
  const { data: conceptTypes } = api.charge.conceptTypesList.useQuery(
    { schoolId: selectedSchoolId as string },
    { enabled: !!selectedSchoolId }
  );
  useEffect(() => {
    setStudentSelected(formData?.students ?? []);
  }, [formData?.students]);

  const calculationType = scholarship?.calculation?.type;
  const calculationValue = scholarship?.calculation?.value;

  const specificConcepts = (scholarship?.applicability?.specificConcepts as Concept[]) ?? [];
  const categories = scholarship?.applicability?.categories ?? [];

  const normalize = (value: string | undefined): string => {
    if (!value) {
      return '';
    }
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase();
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    const normalizedSearch = normalize(value);

    if (!formData?.students) {
      return;
    }

    const studentSearch = formData.students.filter((student) => {
      if (!student) {
        return false;
      }

      const fullName = `${student.first_name || ''} ${student.last_name || ''}`;
      const normalizedFullName = normalize(fullName);
      const normalizedGrade = normalize(student.grade || '');
      const normalizedEnrollmentCode = normalize(student?.enrollment_code || '');
      const normalizedLevel = normalize(student.level || '');
      const normalizedSection = normalize(student.section || '');

      return (
        normalizedFullName.includes(normalizedSearch) ||
        normalizedGrade.includes(normalizedSearch) ||
        normalizedEnrollmentCode.includes(normalizedSearch) ||
        normalizedLevel.includes(normalizedSearch) ||
        normalizedSection.includes(normalizedSearch)
      );
    });

    setStudentSelected(studentSearch);
  };

  return (
    <div className="flex flex-col justify-between min-h-[calc(100vh-75px)]">
      <div className="px-8">
        <div>
          <p className="text-xl font-bold">Resumen</p>
          <p className="font-normal text-sm text-[#637381] mt-2 mb-8">
            Revisa y verifica que la información ingresada es la correcta antes de continuar.
          </p>
        </div>
        {scholarship && (
          <div className="bg-[#F9FAFB] border border-[#DFE3E8] rounded-lg p-3">
            <div className="flex justify-between flex-col gap-2 border-b border-[#919EAB3D] pb-4">
              <p className="text-xs font-normal text-[#637381]">Beca:</p>
              <p className="text-base font-bold text-[#212B36]">{scholarship.name}</p>
            </div>
            <div className="flex gap-2 justify-start items-center pt-3">
              <p className="text-xs font-normal text-[#637381] min-w-[158px] pr-1">Descuento aplicado:</p>
              <p className="text-base font-normal">
                {calculationType === 'PERCENTAGE'
                  ? `${Math.round(Number(calculationValue))}%`
                  : `${renderMoney(Number(calculationValue))}`}
              </p>
            </div>
            <div className="flex gap-2 justify-start items-center py-3">
              <p className="text-xs font-normal text-[#637381] min-w-[158px] pr-1">Conceptos afectados:</p>
              <div className="flex flex-row min-w-[150px] gap-2">
                {categories.length === 0 ? (
                  <span>{`${specificConcepts.length} ${
                    specificConcepts.length === 1 ? 'concepto' : 'conceptos'
                  }`}</span>
                ) : (
                  <>
                    {categories.slice(0, 2).map((item) => (
                      <Status key={item}>{conceptTypes?.find((c) => c.id === item)?.name}</Status>
                    ))}
                    {categories.length && categories?.length > 2 && (
                      <Tooltip
                        message={categories
                          .slice(2)
                          .map((item) => conceptTypes?.find((c) => c.id === item)?.name)
                          .join(', ')}
                      >
                        <Status>+{categories.length - 2}</Status>
                      </Tooltip>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2 py-4">
          <p className="text-lg font-semibold">Ciclos escolares por afectar</p>
          <div className="p-4 w-full pt-4 border border-[#1890FF] rounded-md font-bold hover:bg-[#E6F7FF] transition-colors duration-200">
            {formData?.schoolCycle?.name}
          </div>
        </div>
        <div className="flex flex-col gap-2 py-4">
          <div className="flex gap-2 items-center">
            <p className="text-base font-semibold">Estudiantes seleccionados</p>
            <p className="text-sm font-normal">({formData?.students?.length} estudiantes)</p>
          </div>
          <p className="font-normal text-sm text-[#637381] mt-2 mb-2">
            Revisa y verifica que la información ingresada es la correcta antes de continuar.
          </p>
          <GlobalSearch search={search} setSearch={handleSearch} placeholder="Buscar estudiantes" />
          <div className="mt-2 border border-[#3366FF] rounded-lg">
            {studentSelected?.length === 0 ? (
              <p className="py-4 text-sm text-center">
                No se encontraron estudiantes con los criterios de búsqueda actuales.
              </p>
            ) : (
              studentSelected?.map((student, index) => (
                <div
                  key={`student_${index}`}
                  className={`flex justify-between items-center my-4 px-4 ${
                    index < studentSelected.length - 1 ? 'border-b border-[#919EAB3D] pb-4' : ''
                  }`}
                >
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold">
                      {student.first_name} {student.last_name}
                    </p>
                    <p className="text-xs font-normal text-[#454D64]">
                      {student.enrollment_code} | {student.section} | {student.level}
                    </p>
                  </div>
                  <StudentStateChip state={student.state} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="sticky bottom-0 justify-self-end shadow-cardTop">
        <ScholarshipAssignmentButton
          onBack={onBack}
          onNext={onNext}
          textBack="Volver"
          textNext={
            saving ? (
              <img src="/assets/oval.svg" alt="loading" className="mx-auto h-7" />
            ) : (
              `Asignar ${formData?.students?.length ?? 0} estudiantes`
            )
          }
          disabledNext={saving}
        />
      </div>
    </div>
  );
};

export default MassiveScholarshipAssignment;
