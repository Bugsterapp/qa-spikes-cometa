import { useSelectedSchoolId } from '/src/guards/AuthGuard';
import { FormValuesStudents, SelectedStudentsSchema, StepAssingProps } from '/src/pages/concepts/[conceptId]';
import { api } from '/src/utils/api';
import CheckBox from '/src/components/atoms/CheckBox';
import TreeView, { ITreeViewOnNodeSelectProps } from 'react-accessible-treeview';
import { cn } from '/src/utils/cn';
import { useRouter } from 'next/router';
import { Tooltip } from '/src/components/atoms/Tooltip';
import Status from '/src/components/Status';
import { useEffect, useMemo, useRef, useState } from 'react';
import IcArrow from '/public/assets/icons/ic_arrow_right.svg';
import { Controller, UseFormReturn, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CAlert from '/src/components/atoms/CAlert';
import MultipleFilters, {
  formFilterDataToParams,
  normalizeFilters,
  MultipleFiltersChipsShorted,
} from '/src/components/MultipleFilters';
import { GlobalSearch } from '/src/components/atoms/GlobalSearch';
import useDebounce from '/src/hooks/useDebounce';
import ConceptButton from '../ConceptButton';
import { useFlags } from '/flags/client';

interface OriginalNode {
  id: string;
  name: string;
  children?: OriginalNode[];
  last_name?: string;
  enrollment_code?: string;
  section?: string;
  is_assigned_concept?: boolean;
  is_active?: boolean;
  total_student_by_section?: number;
  total_student_by_level?: number;
}

export interface FormattedNode {
  id: string | number;
  name: string;
  children: Array<string | number>;
  parent: string | number | null;
  last_name?: string;
  enrollment_code?: string;
  section?: string;
  is_assigned_concept?: boolean;
  is_active?: boolean;
  total_student_by_section?: number;
  total_student_by_level?: number;
}

export function Step2StudentSelection({ setData, formData, onNext, onBack }: StepAssingProps<FormValuesStudents>) {
  type FormFilterData = Record<string, { checked: boolean; name: string }>;
  const formSelectedStudents = useForm<FormValuesStudents>({
    defaultValues: {
      students: formData?.students || [],
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: zodResolver(SelectedStudentsSchema),
  });
  const [formFilterData, setFormFilterData] = useState<FormFilterData>({});
  const [search, setSearch] = useState('');
  const [itemsCount, setItemsCount] = useState<{ watchKey: string; count: number }[]>([]);
  const searchDebounced = useDebounce(search, 1200);
  const formRef = useRef() as React.MutableRefObject<UseFormReturn<FormFilterData>>;
  const paramsFromForm = useMemo(() => formFilterDataToParams(formFilterData), [formFilterData]);
  const students = formSelectedStudents.watch('students');
  const { errors } = formSelectedStudents.formState;
  const containerRef = useRef<HTMLDivElement>(null);
  const flags = useFlags().flags;
  const selectedSchool = useSelectedSchoolId();

  const params = {
    search: searchDebounced,
    ...paramsFromForm,
  };

  const router = useRouter();
  const conceptId = router.query.conceptId as string;
  const { data: studentsByLevels, isLoading } = api.schools.schoolsStudentsByLevelList.useQuery(
    {
      school_id: selectedSchool || '',
      concept_id: conceptId,
      query: {
        ...params,
      },
    },
    {
      enabled: !!selectedSchool && !!conceptId,
    }
  );

  const { data: filters } = api.schools.schoolsStudentsByLevelFilters.useQuery({
    concept_id: conceptId,
    school_id: selectedSchool || '',
  });

  const schoolsStudentsFilter = useMemo(() => {
    if (!filters) return undefined;
    return normalizeFilters(filters);
  }, [filters]);

  const filterItems = [
    { header: 'Concepto', watchKey: 'concepts', contents: schoolsStudentsFilter?.concepts },
    {
      header: 'Beca',
      watchKey: 'scholarships',
      contents: schoolsStudentsFilter?.scholarships,
    },
    {
      header: 'Colegiaturas vencidas',
      watchKey: 'delinquency',
      contents: schoolsStudentsFilter?.due_orders,
    },
    {
      header: 'Deuda',
      watchKey: 'has_debt',
      contents: schoolsStudentsFilter?.has_debt,
    },
  ];

  const handleFilter = (data: FormFilterData, methods: UseFormReturn<FormFilterData>) => {
    formRef.current = methods;
    setFormFilterData(data);
  };

  const handleChangeChipFilter = (data: FormFilterData) => {
    setFormFilterData(data);
    formRef.current.reset(data);
    setItemsCount(itemsCount.map((item) => ({ ...item, count: 0 })));
  };

  const onSubmit = (data: FormValuesStudents) => {
    setData?.(data);
    onNext();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="pt-6 px-8">
        <p className="text-xl font-bold">Seleccione los estudiantes a asignar</p>
        <p className="font-normal text-sm text-[#637381] mt-2 mb-6">
          Puedes buscar entre tus estudiantes activos y seleccionar los que necesites.
        </p>
        {flags?.mass_assign_concept_filters && (
          <div ref={containerRef}>
            <div>
              <div className="flex items-center gap-2">
                <MultipleFilters
                  filterItems={filterItems}
                  handleFilter={handleFilter}
                  onClearFilter={() => {
                    setFormFilterData({});
                  }}
                  itemsCount={itemsCount}
                  setItemsCount={setItemsCount}
                />
                <GlobalSearch
                  search={search}
                  setSearch={setSearch}
                  placeholder="Buscar estudiantes"
                  typeButton="button"
                  className="min-w-[400px]"
                />
              </div>
            </div>
            <MultipleFiltersChipsShorted
              onChange={handleChangeChipFilter}
              formFilterData={formFilterData}
              itemsCount={itemsCount}
              setItemsCount={setItemsCount}
            />
          </div>
        )}
      </div>
      <form onSubmit={formSelectedStudents.handleSubmit(onSubmit)} className="flex flex-col h-full">
        <div className="flex-grow">
          <Controller
            control={formSelectedStudents.control}
            name="students"
            render={({ field: { onChange } }) => (
              <StudentTreeView
                items={studentsByLevels as OriginalNode}
                onChange={onChange}
                error={errors?.students?.message}
                selectedStudents={formData?.students}
                isLoading={isLoading}
              />
            )}
          />
        </div>
        <ConceptButton
          textBack="Volver"
          children={
            <>
              <p className="font-bold text-lg">
                {
                  students?.filter(
                    (student) =>
                      !student?.total_student_by_section && !student?.total_student_by_level && student?.parent !== null
                  )?.length
                }
              </p>
              <p className="font-normal text-sm">alumnos seleccionadas</p>
            </>
          }
          onBack={() => {
            onBack();
          }}
        />
      </form>
    </div>
  );
}

type StudentTreeViewProps = {
  items: OriginalNode;
  onChange?: (items: FormattedNode[]) => void;
  error?: string;
  selectedStudents?: FormattedNode[];
  isLoading?: boolean;
};

function StudentTreeView({ items, onChange, error, selectedStudents, isLoading }: StudentTreeViewProps) {
  const [selectedItems, setSelectedItems] = useState<FormattedNode[]>(selectedStudents || []);
  const [disableData, setDisableData] = useState<(number | string)[]>([]);
  const [newData, setNewData] = useState<FormattedNode[]>([]);

  let idCounter = 0;

  function transformData(originalData: OriginalNode, parent: string | number | null = null): FormattedNode[] {
    let formattedData: FormattedNode[] = [];
    const currentId = originalData?.id ? originalData.id : originalData?.children ? idCounter++ : idCounter;

    const formattedNode: FormattedNode = {
      id: currentId,
      name: originalData?.name,
      children: [],
      parent,
      last_name: originalData?.last_name,
      enrollment_code: originalData?.enrollment_code,
      section: originalData?.section,
      is_assigned_concept: originalData?.is_assigned_concept,
      is_active: originalData?.is_active,
      total_student_by_section: originalData?.total_student_by_section,
      total_student_by_level: originalData?.total_student_by_level,
    };

    if (originalData?.children || originalData?.section) {
      formattedData.push(formattedNode);
    }

    if (originalData && originalData.children) {
      for (const child of originalData.children) {
        if (child.total_student_by_level === undefined || child.total_student_by_level > 0) {
          formattedNode.children.push(child.id || idCounter);
          formattedData = formattedData.concat(transformData(child, currentId));
        }
      }
    }

    return formattedData;
  }

  useEffect(() => {
    const newData = transformData(items);
    const disableStudents = newData?.filter((item) => item.is_assigned_concept === true).map((item) => item.id);
    const disabledSections = newData
      ?.filter(
        (item) =>
          item?.children.length > 0 &&
          item?.parent !== 0 &&
          item?.children.every((child) => disableStudents.includes(child))
      )
      .map((item) => item.id);
    const disabledLevels = newData
      ?.filter(
        (item) =>
          item?.children.length > 0 &&
          item?.parent === 0 &&
          item?.children.every((child) => disabledSections.includes(child))
      )
      .map((item) => item.id);
    setNewData(newData);
    setDisableData([...disableStudents, ...disabledSections, ...disabledLevels]);
  }, [items]);

  const isAllSelected = newData.length > 1 && selectedItems.length === newData.length - disableData.length - 1;

  const handleSelectItem = (data: ITreeViewOnNodeSelectProps) => {
    const newState = newData.filter((item) => data?.treeState?.selectedIds?.has(item.id));
    setSelectedItems(newState);
    onChange?.(newState);
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItems([]);
      onChange?.([]);
    } else {
      const newState = newData.filter((item) => !disableData.includes(item.id) && item?.parent !== null);
      setSelectedItems(newState);
      onChange?.(newState);
    }
  };

  return (
    <div>
      {error && (
        <div className="absolute top-[50px] px-2">
          <CAlert
            className="mb-4"
            type="error"
            message="Debes seleccionar al menos un estudiante para poder continuar."
          />
        </div>
      )}
      <div className="grid grid-cols-5 px-2 py-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSelectAll();
          }}
          className="col-span-1"
          type="button"
          disabled={newData.length === 1}
        >
          <CheckBox checked={isAllSelected} readOnly disabled={newData.length === 1} />
        </button>
        <div className="col-span-3 border-r mr-4">
          <span className="font-semibold text-sm text-[#637381]"> Estudiante </span>
        </div>
        <span className="col-span-1 font-semibold text-sm text-[#637381]"> Estado actual </span>
      </div>
      {newData.length === 1 && (
        <div className="px-20 py-16 text-[#637381] italic font-normal text-base text-center">
          No hemos encontrado estudiantes con esos criterios de búsqueda
        </div>
      )}
      {isLoading && (
        <div className=" bottom-[52px] w-full">
          <div className="mx-auto w-full py-16 text-[#919EAB] text-center">
            {' '}
            <img src="/assets/loading.svg" alt="loading" data-state="show" className="mx-auto" />
          </div>
        </div>
      )}
      {!isLoading && newData.length > 1 && (
        <TreeView
          data={newData}
          aria-label="Checkbox tree"
          multiSelect
          propagateSelect
          propagateSelectUpwards
          togglableSelect
          defaultDisabledIds={disableData}
          selectedIds={
            isAllSelected || selectedStudents?.length === selectedItems.length || selectedItems.length === 0
              ? selectedItems.map((item) => item.id)
              : undefined
          }
          onNodeSelect={(selectedNodes) => {
            handleSelectItem(selectedNodes);
          }}
          nodeRenderer={({
            element,
            isBranch,
            isExpanded,
            isSelected,
            getNodeProps,
            level,
            handleSelect,
            handleExpand,
            isDisabled,
            isHalfSelected,
          }) => {
            const group = element as FormattedNode;
            const isNodeDisabled = isBranch && isDisabled;
            return (
              <div
                {...getNodeProps({ onClick: handleExpand })}
                style={{
                  paddingLeft: 12 + 40 * (level - 1),
                  borderBottom: '1px solid #E4EBF6',
                  backgroundColor: level === 1 ? '#F3F6FB' : level === 2 ? '#FBFCFD' : 'white',
                  width: '100%',
                }}
              >
                <div className="flex gap-2 p-5">
                  <div className="flex items-center gap-4 w-full">
                    {isBranch && (
                      <div>
                        <IcArrow className={`${isExpanded && 'rotate-90'}`} />
                      </div>
                    )}
                    <Tooltip
                      message={
                        isBranch && isNodeDisabled
                          ? 'Todos los alumnos de este grupo ya están asignados a este concepto'
                          : 'Este alumno ya está asignado a este concepto'
                      }
                      disableHover={isBranch ? !isNodeDisabled : !group?.is_assigned_concept}
                      disableClick={isBranch ? !isNodeDisabled : !group?.is_assigned_concept}
                    >
                      <CheckBox
                        checked={isSelected && !isNodeDisabled}
                        readOnly
                        disabled={isDisabled || isNodeDisabled}
                        indeterminate={isHalfSelected}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(e);
                        }}
                      />
                    </Tooltip>
                    <div
                      className={cn('grid grid-cols-5 items-center w-full', {
                        'text-[#919EAB] cursor-not-allowed': isDisabled,
                      })}
                    >
                      <div className="flex flex-col col-span-3">
                        <span
                          className={cn({
                            'text-base font-semibold': level === 1,
                            'text-base font-normal': level === 2,
                            'text-[#919EAB] cursor-not-allowed': isNodeDisabled && isBranch,
                          })}
                        >
                          {group?.name} {!isBranch && group?.last_name}
                        </span>
                        {!isBranch && (
                          <span className="text-xs font-normal text-[#454D64]">
                            {group?.enrollment_code} {' | '} {group?.section}
                          </span>
                        )}
                      </div>
                      {isBranch && (
                        <span
                          className={cn('text-end text-xs font-normal col-span-2', {
                            'text-[#919EAB] cursor-not-allowed': isNodeDisabled,
                          })}
                        >
                          {group?.total_student_by_section || group?.total_student_by_level} alumnos
                        </span>
                      )}
                      {!isBranch && (
                        <div className="text-end text-xs font-normal col-span-1">
                          <Status variant={group?.is_active ? 'success' : 'muted'}>
                            {group?.is_active ? 'Activo' : 'Inactivo'}
                          </Status>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          }}
        />
      )}
    </div>
  );
}
