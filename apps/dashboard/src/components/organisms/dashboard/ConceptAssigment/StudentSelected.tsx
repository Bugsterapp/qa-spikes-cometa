import { useRouter } from 'next/router';
import Tree, { TreeNode } from 'rc-tree';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

import IcArrow from '/public/assets/icons/ic_arrow_right.svg';
import CAlert from '/src/components/atoms/CAlert';
import CheckBox from '/src/components/atoms/CheckBox';
import { GlobalSearch } from '/src/components/atoms/GlobalSearch';
import { Tooltip } from '/src/components/atoms/Tooltip';
import MultipleFilters, {
  formFilterDataToParams,
  MultipleFiltersChipsShorted,
  normalizeFilters,
} from '/src/components/MultipleFilters';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import useDebounce from '/src/hooks/useDebounce';
import { FormValuesStudents, StepAssingProps } from '/src/pages/concepts/[conceptId]';
import { api } from '/src/utils/api';

import { InscriptionStatusEnum } from '@cometa/trpc/src/types';
import { SchoolCycleEntity } from '@cometa/trpc/src/students/types-mapping';
import { cn } from '@cometa/utils';
import ConceptButton from '../ConceptButton';
import { SchoolCycleSelector } from '../SchoolCycleSelector';
import StudentInscriptionStatusChip from '../student/StudentInscriptionStatusChip';
import StudentStateCard from '../student/StudentStateChip';
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
  state?: string;
  total_student_by_section?: number;
  total_student_by_level?: number;
  disableCheckbox?: boolean;
  key?: string;
}

export interface FormattedNode {
  id: string;
  name: string;
  children: FormattedNode[];
  parent: string | number | null;
  last_name?: string;
  enrollment_code?: string;
  section?: string;
  is_assigned_concept?: boolean;
  is_active?: boolean;
  checked?: boolean;
  inscription_status?: string;
  state: string;
  total_student_by_section?: number;
  total_student_by_level?: number;
  disableCheckbox?: boolean;
  key?: string;
  firstParent?: boolean;
  title?: string;
  secondParent?: boolean;
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
  const selectedSchool = useSelectedSchool();
  const [allStudents, setAllStudents] = useState<Record<string, any>>({});
  const [hierarchicalKeyToStudentId, setHierarchicalKeyToStudentId] = useState<Record<string, string>>({});
  const [studentIdToHierarchicalKey, setStudentIdToHierarchicalKey] = useState<Record<string, string>>({});

  const params = {
    search: searchDebounced,
    ...paramsFromForm,
  };

  const router = useRouter();
  const conceptId = router.query.conceptId as string;
  const [schoolCycle, setSchoolCycle] = useState<SchoolCycleEntity | null>(null);

  const { data: schoolCycles, isPending: isLoadingSchoolCycles } = api.schools.schoolsCycles.useQuery({
    school_id: selectedSchool?.id || '',
  });

  const { data: studentsByLevels, isPending: isLoading } = api.schools.schoolsStudentsByLevelList.useQuery(
    {
      school_id: selectedSchool?.id || '',
      concept_id: conceptId,
      query: {
        school_cycle: schoolCycle?.id || schoolCycles?.find((item) => item.is_active)?.id,
        ...params,
      },
    },
    {
      enabled: !!selectedSchool && !!conceptId && !isLoadingSchoolCycles,
    }
  );

  useEffect(() => {
    // @ts-ignore
    if (!studentsByLevels?.children) return;

    const extractStudents = (nodes: any[]) => {
      if (!nodes || !Array.isArray(nodes)) return;

      nodes.forEach((node) => {
        if (node.children && Array.isArray(node.children)) {
          extractStudents(node.children);
        } else if (node.id && node.last_name) {
          setAllStudents((prev) => ({ ...prev, [node.id]: node }));
        }
      });
    };

    // @ts-ignore
    extractStudents(studentsByLevels.children);
  }, [studentsByLevels]);

  const { data: filters } = api.schools.schoolsStudentsByLevelFilters.useQuery({
    concept_id: conceptId,
    school_id: selectedSchool?.id || '',
  });
  useEffect(() => {
    if (schoolCycle) return;
    setSchoolCycle(schoolCycles?.find((item) => item.is_active) || null);
  }, [schoolCycles, schoolCycle]);

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

  function transformToTreeData(nodes: FormattedNode[], parentKey = ''): FormattedNode[] {
    return nodes.map((node, index) => {
      let allChildrenAssigned = true;

      const nodeIdentifier = node.id || node.name || `node_${index}`;
      const hierarchicalKey = parentKey ? `${parentKey}_${nodeIdentifier}_${index}` : `${nodeIdentifier}_${index}`;

      const transformedChildren = node.children ? transformToTreeData(node.children, hierarchicalKey) : [];
      if (transformedChildren.length > 0) {
        allChildrenAssigned = transformedChildren.every((child) => child.disableCheckbox);
      } else {
        allChildrenAssigned = node.is_assigned_concept ?? transformedChildren.length === 0;
      }

      const transformedNode: FormattedNode = {
        id: node.id || '',
        name: node.name || '',
        key: hierarchicalKey,
        title: node.last_name !== undefined ? node.name + ' ' + node.last_name : node.name,
        disableCheckbox: node.is_assigned_concept || allChildrenAssigned,
        children: transformedChildren,
        checked: false,
        firstParent: false,
        secondParent: false,
        parent: node.parent || null,
        state: node.state || '',
      };

      if (node.last_name) transformedNode.last_name = node.last_name;
      if (node.enrollment_code) transformedNode.enrollment_code = node.enrollment_code;
      if (node.section) transformedNode.section = node.section;
      if (node.state) transformedNode.state = node.state;
      if (node.is_active !== undefined) transformedNode.is_active = node.is_active;
      if (node.total_student_by_section) transformedNode.total_student_by_section = node.total_student_by_section;
      if (node.total_student_by_section) transformedNode.secondParent = true;
      if (node.total_student_by_level) transformedNode.total_student_by_level = node.total_student_by_level;
      if (node.total_student_by_level) transformedNode.firstParent = true;
      if (node.inscription_status) transformedNode.inscription_status = node.inscription_status;

      return transformedNode;
    });
  }

  // @ts-ignore
  const treeDataNodes = transformToTreeData(studentsByLevels?.children || []);
  const treeData = treeDataNodes.filter((item: any) => item.children.length > 0);

  useEffect(() => {
    if (!treeData.length) return;

    const buildKeyMappings = (
      nodes: FormattedNode[]
    ): {
      keyToId: Record<string, string>;
      idToKey: Record<string, string>;
    } => {
      const keyToId: Record<string, string> = {};
      const idToKey: Record<string, string> = {};

      const traverse = (nodes: FormattedNode[]) => {
        nodes.forEach((node) => {
          if (node.id && node.last_name && (!node.children || node.children.length === 0)) {
            const hierarchicalKey = node.key || '';
            const studentId = node.id;
            keyToId[hierarchicalKey] = studentId;
            idToKey[studentId] = hierarchicalKey;
          }
          if (node.children && node.children.length > 0) {
            traverse(node.children);
          }
        });
      };

      traverse(nodes);
      return { keyToId, idToKey };
    };

    const { keyToId, idToKey } = buildKeyMappings(treeData);
    setHierarchicalKeyToStudentId((prev) => ({ ...prev, ...keyToId }));
    setStudentIdToHierarchicalKey((prev) => ({ ...prev, ...idToKey }));
  }, [treeData]);

  const addPlural = (value?: string[] | number, word?: string) => {
    if (value === undefined || word === undefined) {
      return '';
    }
    if (Array.isArray(value)) {
      return value.length === 1 ? word : word + 's';
    }
    return value === 1 ? word : word + 's';
  };

  const getAllKeys = (data: OriginalNode[]) => {
    const keys: string[] = [];
    const getKeys = (nodes: OriginalNode[]) => {
      nodes.forEach((node) => {
        if (!node.disableCheckbox && node.key) {
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

  const calculateHalfCheckedKeys = useCallback((treeData: FormattedNode[], checkedKeys: string[]): string[] => {
    const halfCheckedKeys: string[] = [];
    const checkedSet = new Set(checkedKeys);

    const processNode = (
      node: FormattedNode
    ): {
      allChecked: boolean;
      someChecked: boolean;
      enabledCount: number;
    } => {
      if (node.disableCheckbox) {
        return { allChecked: true, someChecked: false, enabledCount: 0 };
      }

      if (!node.children || node.children.length === 0) {
        const isChecked = checkedSet.has(node.key || '');
        return {
          allChecked: isChecked,
          someChecked: isChecked,
          enabledCount: 1,
        };
      }

      const childResults = node.children.map(processNode);

      const enabledChildren = childResults.filter((result) => result.enabledCount > 0);

      if (enabledChildren.length === 0) {
        return { allChecked: true, someChecked: false, enabledCount: 0 };
      }

      const allChildrenChecked = enabledChildren.every((result) => result.allChecked);
      const someChildrenChecked = enabledChildren.some((result) => result.someChecked);

      if (someChildrenChecked && !allChildrenChecked) {
        halfCheckedKeys.push(node.key || '');
      }

      return {
        allChecked: allChildrenChecked,
        someChecked: someChildrenChecked,
        enabledCount: enabledChildren.reduce((sum, result) => sum + result.enabledCount, 0),
      };
    };

    treeData.forEach(processNode);
    return halfCheckedKeys;
  }, []);

  const validateTreeIntegrity = useCallback(() => {
    const keyMap = new Map<string, { level: string; section?: string; student?: string; type: string }>();
    const duplicatedKeys: string[] = [];
    const keysByName = new Map<string, string[]>();

    const validateNode = (node: FormattedNode, path: string[], type: 'level' | 'section' | 'student') => {
      const nodeKey = node.key || '';
      const nodeName = node.name || '';

      if (keyMap.has(nodeKey)) {
        duplicatedKeys.push(nodeKey);
      } else {
        keyMap.set(nodeKey, {
          level: path[0] || '',
          section: path[1] || undefined,
          student: type === 'student' ? nodeName : undefined,
          type,
        });
      }

      if (!keysByName.has(nodeName)) {
        keysByName.set(nodeName, []);
      }
      keysByName.get(nodeName)!.push(nodeKey);

      if (node.children && node.children.length > 0) {
        const childType = type === 'level' ? 'section' : 'student';
        node.children.forEach((child) => {
          validateNode(child, [...path, nodeName], childType as any);
        });
      }
    };

    treeData.forEach((level) => {
      validateNode(level, [], 'level');
    });

    const nameConflicts: string[] = [];
    keysByName.forEach((keys, name) => {
      if (keys.length > 1) {
        nameConflicts.push(name);
      }
    });

    return { keyMap, duplicatedKeys, nameConflicts, keysByName };
  }, [treeData]);

  const handleCheckAll = (e: { target: { checked: any } }) => {
    if (e.target.checked) {
      const allKeys = getAllKeys(treeData);
      const onlyStudentsKeys = extractOnlyStudentKeys(treeData, allKeys);
      setCheckedIds(allKeys);
      setSelectedStudentIds(onlyStudentsKeys);
      setParentHalfChecked([]);
    } else {
      setCheckedIds([]);
      setSelectedStudentIds([]);
      setParentHalfChecked([]);
    }
  };

  const handleCheck = (checkedKeys: { checked: string[] }, info: { node: any }) => {
    const { node } = info;
    const { checked } = checkedKeys;

    const { duplicatedKeys } = validateTreeIntegrity();
    if (duplicatedKeys.length > 0) {
      return;
    }

    let checkedKeysToSave = checked;
    let checkedStudentsToSave: string[] = [...selectedStudentIds];

    const addNodeAndChildren = (node: { key: string; disableCheckbox: boolean; children: any[] }) => {
      if (!checkedKeysToSave.includes(node.key) && !node.disableCheckbox) {
        checkedKeysToSave.push(node.key);
      }
      if (node.children && node.children.length > 0 && !node.disableCheckbox) {
        node.children.forEach((child) => addNodeAndChildren(child));
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

    if (node.checked) {
      removeNodeAndChildren(node);
    } else {
      addNodeAndChildren(node);
    }

    const correctedCheckedIds = updateParentStates(checkedStudentsToSave);
    const updateHalfCheckedKeys = calculateHalfCheckedKeys(treeData, correctedCheckedIds);

    setCheckedIds(correctedCheckedIds);
    setSelectedStudentIds(checkedStudentsToSave);
    setParentHalfChecked(updateHalfCheckedKeys);
  };

  const updateParentStates = useCallback(
    (newSelectedStudentIds: string[]) => {
      const shouldBeChecked = new Set<string>(newSelectedStudentIds);

      const processNode = (node: FormattedNode): boolean => {
        if (node.disableCheckbox) {
          return true;
        }

        if (!node.children || node.children.length === 0) {
          return shouldBeChecked.has(node.key || '');
        }

        const enabledChildren = node.children.filter((child) => !child.disableCheckbox);

        if (enabledChildren.length === 0) {
          return true;
        }

        const childResults = enabledChildren.map((child) => processNode(child));
        const allChildrenSelected = childResults.every((result) => result);

        if (allChildrenSelected) {
          shouldBeChecked.add(node.key || '');
          return true;
        }

        return false;
      };

      treeData.forEach((level) => processNode(level));

      return Array.from(shouldBeChecked);
    },
    [treeData]
  );

  const restorationExecutedRef = useRef(false);

  useEffect(() => {
    if (!formData?.students || formData.students.length === 0) {
      restorationExecutedRef.current = false;
    }
  }, [formData?.students]);

  useEffect(() => {
    if (
      formData?.students &&
      studentsByLevels &&
      Object.keys(studentIdToHierarchicalKey).length > 0 &&
      !restorationExecutedRef.current
    ) {
      const hierarchicalKeys = formData.students
        .map((student) => studentIdToHierarchicalKey[student.id])
        .filter(Boolean);

      if (hierarchicalKeys.length > 0) {
        restorationExecutedRef.current = true;
        setSelectedStudentIds(hierarchicalKeys);
        const correctedCheckedIds = updateParentStates(hierarchicalKeys);
        setCheckedIds(correctedCheckedIds);
        const newHalfChecked = calculateHalfCheckedKeys(treeData, correctedCheckedIds);
        setParentHalfChecked(newHalfChecked);
      }
    }
  }, [formData?.students, studentsByLevels, studentIdToHierarchicalKey]);

  const onSubmit = () => {
    if (selectedStudentIds.length > 0) {
      const realStudentIds = selectedStudentIds
        .map((hierarchicalKey) => hierarchicalKeyToStudentId[hierarchicalKey])
        .filter(Boolean);

      const students = realStudentIds.map((id) => allStudents[id]).filter(Boolean);

      const data = {
        students: students.length > 0 ? students : formData?.students || [],
      };

      setErrorAlert(students.length === 0 && selectedStudentIds.length > 0);

      if (students.length > 0 || (formData?.students && formData.students.length > 0)) {
        if (formData?.students && formData.students.length > 0) {
          const studentsMap = new Map();

          formData.students.forEach((student) => {
            studentsMap.set(student.id, student);
          });

          students.forEach((student) => {
            studentsMap.set(student.id, student);
          });

          data.students = Array.from(studentsMap.values());
        }

        // @ts-ignore
        setData?.(data);
        onNext();
      } else {
        setErrorAlert(true);
      }
    } else if (formData?.students && formData.students.length > 0) {
      // @ts-ignore
      setData?.(formData);
      onNext();
    } else {
      setErrorAlert(true);
    }
  };

  const renderTreeTitle = (node: FormattedNode) => {
    const { title, disableCheckbox } = node;

    const [sectionName, levelName] = node.section?.split('|') || [];
    if (node.enrollment_code) {
      return (
        <span
          className={cn('flex justify-between ml-3 w-[320px] text-sm', {
            'cursor-not-allowed text-[#919EAB]': disableCheckbox,
          })}
        >
          <div
            className={cn('flex flex-col gap-2 min-w-[310px]', {
              'min-w-[260px]': sectionName && levelName,
            })}
          >
            {title}
            <div className="flex text-xs gap-2">
              <p
                className={cn('border text-[#454D64] pr-1 border-transparent', {
                  'cursor-not-allowed text-[#919EAB]': disableCheckbox,
                })}
              >
                {node.enrollment_code}
              </p>
            </div>
          </div>
          {sectionName && levelName ? (
            <div className="flex flex-col min-w-[165px]">
              <p className="text-[#1C1C1D] text-sm">{sectionName}</p>
              <p className="text-xs font-normal leading-[18px] text-left text-[#454D64]">{levelName}</p>
            </div>
          ) : (
            <div className="flex flex-col min-w-[155px] justify-center">
              <p className="text-xs font-normal leading-[18px] text-left text-[#454D64]">Sin sección</p>
            </div>
          )}
          <div className="flex gap-2">
            <div className="w-[113px]">
              <StudentStateCard state={node.state} />
            </div>
            <div>
              <StudentInscriptionStatusChip
                status={node.inscription_status as InscriptionStatusEnum}
                changeLabelToSchoolSelected
              />
            </div>
          </div>
        </span>
      );
    }
    return (
      <span
        className={cn('pb-1 w-full flex justify-between items-center px-2', {
          'cursor-not-allowed text-[#919EAB]': node.disableCheckbox,
        })}
      >
        <p className={cn({ 'font-semibold': node.total_student_by_level })}>{title}</p>
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

  const renderTreeNodes = (data: FormattedNode[]) =>
    data.map((item) => {
      const { firstParent, secondParent } = item;

      return (
        <TreeNode
          title={renderTreeTitle(item)}
          key={item.key}
          disableCheckbox={item.disableCheckbox}
          icon={(nodes) => {
            const { disableCheckbox, isStart, checked, halfChecked } = nodes;

            if (item.firstParent || item.secondParent) {
              return (
                <Tooltip
                  message={
                    disableCheckbox ? 'Todos los estudiantes de este grupo ya están asignados a este concepto' : ''
                  }
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
                    ? 'Este estudiante ya está asignado a este concepto'
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
    <div className="flex flex-col h-[92%] font-lota">
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
              {schoolCycles && schoolCycles.length > 0 ? (
                <SchoolCycleSelector
                  selected={schoolCycle || schoolCycles?.find((item) => item.is_active) || null}
                  setFn={setSchoolCycle}
                  cycles={schoolCycles || []}
                  hideTodos
                />
              ) : null}
            </div>
          </div>
          <MultipleFiltersChipsShorted
            onChange={handleChangeChipFilter}
            formFilterData={formFilterData}
            itemsCount={itemsCount}
            setItemsCount={setItemsCount}
          />
        </div>
      </div>
      <div className="flex items-center py-8">
        <div className="flex items-end min-w-[420px]">
          <CheckBox
            className="ml-[61px] mr-8"
            checked={checkedIds.length === 0 ? false : checkedIds.length === getAllKeys(treeData).length}
            onChange={handleCheckAll}
          />
          <span className="font-semibold text-sm text-[#637381]"> Estudiante </span>
        </div>
        <span className="font-semibold text-sm text-[#637381] border-l-[#919EAB]/24 border pr-12 pl-4 border-transparent min-w-[160px]">
          Sección
          {schoolCycle && (
            <p className="text-xs font-normal leading-[18px] text-left text-[#637381]">{schoolCycle.name}</p>
          )}
        </span>
        <span className="font-semibold text-sm text-[#637381] border-l-[#919EAB]/24 border pr-4 pl-4 border-transparent min-w-[120px]">
          Estado actual
        </span>
        <span className="font-semibold text-sm text-[#637381] border-l-[#919EAB]/24 border pr-4 pl-4 border-transparent">
          Inscripción
          {schoolCycle && (
            <p className="text-xs font-normal leading-[18px] text-left text-[#637381]">{schoolCycle.name}</p>
          )}
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
          justifyEnd
          children={
            <div className="w-[450px] flex items-center gap-2">
              <p className="font-bold text-lg">{selectedStudentIds.length}</p>
              <p className="font-normal text-sm">estudiantes seleccionados</p>
            </div>
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
