import { useSelectedSchoolId } from '/src/guards/AuthGuard';
import { FormValuesStudents, StepAssingProps } from '/src/pages/concepts/[conceptId]';
import { api } from '/src/utils/api';
import CheckBox from '/src/components/atoms/CheckBox';
import { useRouter } from 'next/router';
import { Tooltip } from '/src/components/atoms/Tooltip';
import Status from '/src/components/Status';
import { useEffect, useMemo, useRef, useState } from 'react';
import IcArrow from '/public/assets/icons/ic_arrow_right.svg';
import { UseFormReturn } from 'react-hook-form';
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
import Tree, { TreeNode } from 'rc-tree';
import { GenericRowCheckBoxButton } from '../StudentAssignedTable';

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

export function Step2StudentSelection({ setData, onNext, onBack, formData }: StepAssingProps<FormValuesStudents>) {
  type FormFilterData = Record<string, { checked: boolean; name: string }>;
  const [formFilterData, setFormFilterData] = useState<FormFilterData>({});
  const [search, setSearch] = useState('');
  const [itemsCount, setItemsCount] = useState<{ watchKey: string; count: number }[]>([]);
  const searchDebounced = useDebounce(search, 1200);
  const formRef = useRef() as React.MutableRefObject<UseFormReturn<FormFilterData>>;
  const paramsFromForm = useMemo(() => formFilterDataToParams(formFilterData), [formFilterData]);
  const [errorAlert, setErrorAlert] = useState<boolean>(false);

  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [parentHalfChecked, setParentHalfChecked] = useState<string[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const flags = useFlags().flags;
  const selectedSchool = useSelectedSchoolId();

  function collectParentIds(nodes: any[], studentIds: string[]) {
    const parentIdentifiers = new Set();

    function traverse(nodes: any[], ancestors: any[] = []) {
      nodes.forEach((node: any) => {
        const identifier = node.id || node.name;
        const currentAncestors: any[] = identifier ? [...ancestors, identifier] : ancestors;

        if (node.children) {
          traverse(node.children, currentAncestors);
        } else {
          if (studentIds.includes(node.id)) {
            currentAncestors.forEach((idOrName) => parentIdentifiers.add(idOrName));
          }
        }
      });
    }

    traverse(nodes);
    return Array.from(parentIdentifiers);
  }

  useEffect(() => {
    if (formData?.students && studentsByLevels) {
      const selectedStudentIds = formData.students.map((item) => item.id);
      setSelectedStudentIds(selectedStudentIds);
      // @ts-ignore
      const parentIds = collectParentIds(studentsByLevels?.children, selectedStudentIds);
      setCheckedIds([...parentIds, ...selectedStudentIds]);
    }
  }, [formData]);

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

  function transformToTreeData(nodes: OriginalNode[]): any[] {
    return nodes.map((node) => {
      let allChildrenAssigned = true;

      const transformedChildren = node.children ? transformToTreeData(node.children) : [];
      if (transformedChildren.length > 0) {
        allChildrenAssigned = transformedChildren.every((child) => child.disableCheckbox);
      } else {
        allChildrenAssigned = node.is_assigned_concept ?? transformedChildren.length === 0;
      }

      const transformedNode: any = {
        key: node.id || node.name,
        title: node.last_name !== undefined ? node.name + ' ' + node.last_name : node.name,
        disableCheckbox: node.is_assigned_concept || allChildrenAssigned,
        children: transformedChildren,
        checked: false,
        firstParent: false,
        secondParent: false,
      };

      if (node.last_name) transformedNode.last_name = node.last_name;
      if (node.enrollment_code) transformedNode.enrollment_code = node.enrollment_code;
      if (node.section) transformedNode.section = node.section;
      if (node.is_active !== undefined) transformedNode.is_active = node.is_active;
      if (node.total_student_by_section) transformedNode.total_student_by_section = node.total_student_by_section;
      if (node.total_student_by_section) transformedNode.secondParent = true;
      if (node.total_student_by_level) transformedNode.total_student_by_level = node.total_student_by_level;
      if (node.total_student_by_level) transformedNode.firstParent = true;

      return transformedNode;
    });
  }
  // @ts-ignore
  const treeDataNodes = transformToTreeData(studentsByLevels?.children || []);
  const treeData = treeDataNodes.filter((item) => item.children.length > 0);

  const addPlural = (array?: any[], word?: string) => {
    if (array) {
      return array.length === 1 ? word : word + 's';
    }
    return '';
  };

  const getAllKeys = (data: any[]) => {
    const keys: any[] = [];
    const getKeys = (nodes: any[]) => {
      nodes.forEach((node) => {
        if (!node.disableCheckbox) {
          keys.push(node.key);
        }
        if (node.children) {
          getKeys(node.children);
        }
      });
    };
    getKeys(data);
    return keys;
  };

  const extractOnlyStudentKeys = (nodes: any[], keysArray: string[]): string[] => {
    const studentKeys: string[] = [];
    const traverse = (nodes: any[]) => {
      nodes.forEach((node: { children: string | any[]; last_name: any; key: string }) => {
        if (node.children && node.children.length > 0) {
          // @ts-ignore
          traverse(node.children);
        } else if (node.last_name && keysArray.includes(node.key)) {
          studentKeys.push(node.key);
        }
      });
    };
    traverse(nodes);
    return studentKeys;
  };

  const handleCheckAll = (e: { target: { checked: any } }) => {
    if (e.target.checked) {
      const allKeys = getAllKeys(treeData);
      const onlyStudentsKeys = extractOnlyStudentKeys(treeData, allKeys);
      setCheckedIds(allKeys);
      setSelectedStudentIds(onlyStudentsKeys);
    } else {
      setCheckedIds([]);
      setSelectedStudentIds([]);
    }
  };

  function addHalfCheckedKeys(treeData: any[], checkedKeys: string | any[]) {
    const halfCheckedKeys = new Set(parentHalfChecked);

    function traverse(nodes: any[]) {
      nodes.forEach((node: { children: any[]; disableCheckbox: any; key: string }) => {
        if (!node.children || node.children.length === 0 || node.disableCheckbox) {
          return;
        }
        traverse(node.children);
        const childrenCheckedStatuses = node.children.map((child: { key: any }) => checkedKeys.includes(child.key));
        const someChildrenChecked = childrenCheckedStatuses.some((status: any) => status);
        const allChildrenChecked = childrenCheckedStatuses.every((status: any) => status);

        if (someChildrenChecked && !allChildrenChecked) {
          halfCheckedKeys.add(node.key);
        } else {
          halfCheckedKeys.delete(node.key);
        }
      });
    }

    traverse(treeData);
    return Array.from(halfCheckedKeys);
  }

  const handleCheck = (checkedKeys: { checked: any }, info: { node: any }) => {
    const { node } = info;
    const { checked } = checkedKeys;

    let checkedKeysToSave = checked;
    let checkedStudentsToSave: string[] = [...selectedStudentIds];

    const addNodeAndChildren = (node: { key: string; disableCheckbox: any; children: any[] }) => {
      if (!checkedKeysToSave.includes(node.key) && !node.disableCheckbox) {
        checkedKeysToSave.push(node.key);
      }
      if (node.children && node.children.length > 0 && !node.disableCheckbox) {
        node.children.forEach((child: any) => addNodeAndChildren(child));
      } else {
        if (!checkedStudentsToSave.includes(node.key) && !node.disableCheckbox) {
          checkedStudentsToSave.push(node.key);
        }
      }
    };

    const removeNodeAndChildren = (node: { key: string; children: any[] }) => {
      checkedKeysToSave = checkedKeysToSave.filter((item: any) => item !== node.key);
      if (node.children && node.children.length > 0) {
        node.children.forEach((child: any) => removeNodeAndChildren(child));
      } else {
        if (checkedStudentsToSave.includes(node.key)) {
          checkedStudentsToSave = checkedStudentsToSave.filter((key) => key !== node.key);
        }
      }
    };

    const updateHalfCheckedKeys = Array.from(addHalfCheckedKeys(treeData, checked));

    if (node.checked) {
      removeNodeAndChildren(node);
    } else {
      addNodeAndChildren(node);
    }

    setCheckedIds(checkedKeysToSave);
    setSelectedStudentIds(checkedStudentsToSave);
    setParentHalfChecked(updateHalfCheckedKeys);
  };

  function findStudentsById(nestedStudents: any[], ids: string[]) {
    const foundStudents: any[] = [];

    function searchStudents(children: any) {
      for (const child of children) {
        if (child.children) {
          searchStudents(child.children); // Recursively search through children
        } else {
          if (ids.includes(child.id)) {
            foundStudents.push(child); // Add the student to the foundStudents array if the ID matches
          }
        }
      }
    }

    searchStudents(nestedStudents);
    return foundStudents;
  }

  const onSubmit = () => {
    if (selectedStudentIds.length > 0) {
      const data = {
        // @ts-ignore
        students: findStudentsById(studentsByLevels?.children, selectedStudentIds),
      };
      setErrorAlert(false);
      // @ts-ignore
      setData?.(data);
      onNext();
    } else {
      setErrorAlert(true);
    }
  };

  const renderTreeTitle = (node: {
    enrollment_code?: any;
    section?: any;
    is_active?: any;
    disableCheckbox: any;
    total_student_by_level?: any;
    total_student_by_section?: any;
    key?: any;
    title?: any;
  }) => {
    const { title, disableCheckbox } = node;

    if (node.enrollment_code) {
      return (
        <span
          className={`${
            disableCheckbox && 'cursor-not-allowed text-[#919EAB]'
          } flex justify-between ml-3 w-[320px] text-sm `}
        >
          <div className="flex flex-col gap-2">
            {title}
            <div className="flex text-xs gap-2">
              <p
                className={`${
                  disableCheckbox && 'cursor-not-allowed text-[#919EAB] border-r-[#919EAB]'
                } border border-r-[#454D64] text-[#454D64] pr-1 border-transparent`}
              >
                {node.enrollment_code}
              </p>
              <p
                className={`${disableCheckbox && 'cursor-not-allowed text-[#919EAB] border-r-[#919EAB]'}text-[#454D64]`}
              >
                {node.section}
              </p>
            </div>
          </div>
          <Status variant={node.is_active ? 'success' : 'muted'} className="self-center">
            {node.is_active ? 'Activo' : 'Inactivo'}
          </Status>
        </span>
      );
    }
    return (
      <span
        className={`${
          node.disableCheckbox && 'cursor-not-allowed text-[#919EAB]'
        } ml-3 pb-1 pr-8 w-full flex justify-between items-center`}
      >
        <p className={`${node.total_student_by_level ? 'font-semibold' : ''} `}>{title}</p>
        {node.total_student_by_level && (
          <p className="text-xs text-[#212b36]">
            {node.total_student_by_level} {addPlural(node.total_student_by_level, 'estudiante')}
          </p>
        )}
        {node.total_student_by_section && (
          <p className="text-xs text-[#212b36] customBackground">
            {node.total_student_by_section} {addPlural(node.total_student_by_section, 'estudiante')}
          </p>
        )}
      </span>
    );
  };

  const switcher = (obj: { isLeaf: any; expanded: any }) => {
    if (obj.isLeaf) {
      return;
    }
    return (
      <span>
        <IcArrow className={`${obj.expanded && 'rotate-90'} cursor-pointer`} />
      </span>
    );
  };

  const renderTreeNodes = (data: any[]) =>
    data.map((item: { key?: any; disableCheckbox?: any; firstParent: any; secondParent: any; children?: any }) => {
      const { firstParent, secondParent } = item;

      return (
        <TreeNode
          // @ts-ignore
          title={renderTreeTitle(item)}
          // @ts-ignore
          key={item.key}
          disableCheckbox={item.disableCheckbox}
          icon={(nodes) => {
            const { disableCheckbox, isStart, checked, halfChecked } = nodes;

            if (item.firstParent || item.secondParent) {
              return (
                <Tooltip
                  message={disableCheckbox ? 'Todos los alumnos de este grupo ya están asignados a este concepto' : ''}
                >
                  <GenericRowCheckBoxButton
                    className={`${disableCheckbox && 'cursor-not-allowed'} mb-2`}
                    onClick={() => void 0}
                    disabled={disableCheckbox}
                    checked={checked ? true : halfChecked ? 'indeterminate' : false}
                  />
                </Tooltip>
              );
            }
            return (
              <Tooltip
                message={
                  disableCheckbox && isStart && isStart.length === 3
                    ? 'Este alumno ya está asignado a este concepto'
                    : ''
                }
              >
                <GenericRowCheckBoxButton
                  className={`${disableCheckbox && 'cursor-not-allowed'} mb-2`}
                  disabled={disableCheckbox}
                  checked={nodes.checked}
                  onClick={() => void 0}
                />
              </Tooltip>
            );
          }}
          style={
            firstParent
              ? { backgroundColor: '#F3F6FB', display: 'flex' }
              : secondParent
              ? { backgroundColor: '#FBFCFD', display: 'flex' }
              : { backgroundColor: 'white', display: 'flex' }
          }
        >
          {item.children ? renderTreeNodes(item.children) : null}
        </TreeNode>
      );
    });

  return (
    <div className="flex flex-col h-[92%]">
      {errorAlert && (
        <CAlert
          className="mx-2"
          type="error"
          message="Debes seleccionar al menos un estudiante para poder continuar."
        />
      )}
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
      <div className="flex items-center px-2 py-8 justify-between">
        <div className="flex items-end">
          <CheckBox
            className="ml-[61px] mr-8"
            checked={checkedIds.length === 0 ? false : checkedIds.length === getAllKeys(treeData).length}
            onChange={handleCheckAll}
          />
          <span className="font-semibold text-sm text-[#637381]"> Estudiante </span>
        </div>
        <span className="font-semibold text-sm text-[#637381] border-l-[#919EAB]/24 border pr-12 pl-6 border-transparent">
          Estado actual
        </span>
      </div>
      <div className="flex flex-col h-full justify-between">
        {isLoading && (
          <div className="bottom-[52px] w-full">
            <div className="mx-auto w-full py-16 text-[#919EAB] text-center">
              <img src="/assets/loading.svg" alt="loading" data-state="show" className="mx-auto" />
            </div>
          </div>
        )}
        {!isLoading && treeData.length > 0 ? (
          // @ts-ignore
          <Tree
            checkable
            onCheck={handleCheck}
            checkedKeys={{
              checked: checkedIds,
              halfChecked: parentHalfChecked,
            }}
            checkStrictly
            selectable={false}
            switcherIcon={switcher}
            showIcon
          >
            {renderTreeNodes(treeData)}
          </Tree>
        ) : (
          <div className="h-[100px]" />
        )}
        <ConceptButton
          children={
            <>
              <p className="font-bold text-lg">{selectedStudentIds.length}</p>
              <p className="font-normal text-sm">alumnos seleccionados</p>
            </>
          }
          onBack={() => {
            onBack();
          }}
          onSubmit={() => onSubmit()}
        />
      </div>
    </div>
  );
}
