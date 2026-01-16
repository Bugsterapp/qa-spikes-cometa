import { useEffect, useState, useMemo, type FC } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import FilterSearch from '../filter-search';
import { api } from '/src/utils/api';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { SchoolCycleEntity } from '@cometa/trpc/src/students/types-mapping';
import useDebounce from '/src/hooks/useDebounce';
import { formFilterDataToParams } from '/src/components/MultipleFilters';
import { SchoolCycleSelector } from '/src/components/organisms/dashboard/SchoolCycleSelector';
import { useFormContext } from 'react-hook-form';
import { TrackEvents } from '/src/constants/events';
import { useSendEvent } from '/src/hooks/useSendEvent';

export type Student = {
  id: string;
  enrollment_code: string;
  inscription_status: string;
  is_active: boolean;
  is_assigned_concept: boolean;
  last_name: string;
  name: string;
  section: string;
  state: string;
};

type Section = {
  id: string;
  name: string;
  total_student_by_section: number;
  children: Student[];
};

type Level = {
  id: string;
  name: string;
  total_student_by_level: number;
  children?: Section[];
};

interface StudentBylevelAudiencePicker {
  name: string;
  children: Level[];
}

type FormFilterData = Record<string, { checked: boolean; name: string }>;

const AudiencePickerStep: FC = () => {
  const sendEvent = useSendEvent();
  const [expandedLevels, setExpandedLevels] = useState<Level[]>([]);
  const [expandedSections, setExpandedSections] = useState<Section[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [schoolCycle, setSchoolCycle] = useState<SchoolCycleEntity | null>(null);
  const [formFilterData] = useState<FormFilterData>({});
  const [search, setSearch] = useState('');
  const paramsFromForm = useMemo(() => formFilterDataToParams(formFilterData), [formFilterData]);
  const searchDebounced = useDebounce(search, 1200);
  const selectedSchool = useSelectedSchool();
  const { setValue, watch } = useFormContext();

  useEffect(() => {
    sendEvent(TrackEvents.announcements.audienceSelectorViewed);
  }, []);

  const watchedFilters = watch('filters');

  useEffect(() => {
    if (watchedFilters?.student_ids && Array.isArray(watchedFilters.student_ids) && selectedStudents.length === 0) {
      setSelectedStudents(watchedFilters.student_ids);
    }
  }, [watchedFilters?.student_ids]);

  useEffect(() => {
    setValue('filters', { student_ids: selectedStudents });
  }, [selectedStudents, setValue]);

  const { data: schoolCycles, isPending: isLoadingSchoolCycles } = api.schools.schoolsCycles.useQuery({
    school_id: selectedSchool?.id || '',
  });

  const params = {
    search: searchDebounced,
    ...paramsFromForm,
  };

  const { data, isPending: isLoading } = api.schools.schoolsStudentsByLevelListWithoutConcept.useQuery(
    {
      school_id: selectedSchool?.id || '',
      query: {
        school_cycle: schoolCycle?.id || schoolCycles?.find((item) => item.is_active)?.id,
        ...params,
      },
    },
    {
      enabled: !!selectedSchool && !isLoadingSchoolCycles,
    }
  );

  const studentsByLevels = data as StudentBylevelAudiencePicker | undefined;

  const toggleLevel = (level: Level) => {
    setExpandedLevels((prev) =>
      prev.some((l) => l.name === level.name) ? prev.filter((l) => l.name !== level.name) : [...prev, level]
    );
  };

  const toggleSection = (section: Section) => {
    setExpandedSections((prev) =>
      prev.some((s) => s.id === section.id) ? prev.filter((s) => s.id !== section.id) : [...prev, section]
    );
  };

  const toggleStudent = (id: string) => {
    const alreadySelected = selectedStudents.includes(id);
    sendEvent(
      alreadySelected
        ? TrackEvents.announcements.audienceStudentDeselected
        : TrackEvents.announcements.audienceStudentSelected
    );
    setSelectedStudents((prev) => (prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]));
  };

  const areAllSelected = (ids: string[]) => {
    if (!ids || ids.length === 0) return false;
    return ids.every((id) => selectedStudents.includes(id));
  };

  const areSomeSelected = (ids: string[]) => {
    if (!ids || ids.length === 0) return false;
    return ids.some((id) => selectedStudents.includes(id)) && !areAllSelected(ids);
  };

  const toggleManyStudents = (ids: string[]) => {
    const alreadySelected = selectedStudents.some((id) => ids.includes(id));

    sendEvent(
      alreadySelected
        ? TrackEvents.announcements.audienceGroupDeselected
        : TrackEvents.announcements.audienceGroupSelected
    );
    const allSelected = areAllSelected(ids);
    setSelectedStudents((prev) =>
      allSelected ? prev?.filter((id) => !ids.includes(id)) : [...prev, ...ids?.filter((id) => !prev.includes(id))]
    );
  };

  const getAllStudentIdsFromLevel = (level: Level): string[] =>
    level?.children?.flatMap((section: Section) => section.children?.map((student: Student) => student.id) ?? []) ?? [];

  const getAllStudentIdsFromSection = (section: Section): string[] =>
    section.children?.map((student: Student) => student.id) ?? [];

  return (
    <main className="px-[8.625rem]">
      <h2 className="text-neutral-950 text-lg font-semibold mb-[1rem]">Elige tu audiencia</h2>
      <span className="inline-block px-3 py-1 text-sm font-semibold text-gray-900 bg-white rounded-full shadow-sm border border-gray-100 mb-[1rem]">
        Estudiantes
      </span>
      <section className="bg-[#FAFBFB]  rounded-[10px]">
        <div className="flex items-center gap-6 mb-4">
          <FilterSearch
            withSearch
            search={search}
            onSearch={(value) => {
              sendEvent(TrackEvents.announcements.audienceSearchUsed);
              setSearch(value);
            }}
          />

          {schoolCycles && schoolCycles.length > 0 ? (
            <div>
              <SchoolCycleSelector
                selected={schoolCycle || schoolCycles?.find((item) => item.is_active) || null}
                setFn={(cycle) => {
                  sendEvent(TrackEvents.announcements.audienceSchoolYearChanged);
                  setSchoolCycle(cycle);
                }}
                cycles={schoolCycles || []}
                hideTodos
              />
            </div>
          ) : null}
        </div>

        <div className="rounded-xl shadow">
          <div className=" border-gray-200 rounded-lg overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-50 p-3 py-6 font-medium text-sm text-gray-600">
              <div>Estudiante</div>
              <div>Sección</div>
              <div>Estado actual</div>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center h-screen">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent border-galaxy-500" />
              </div>
            )}

            {!isLoading &&
              studentsByLevels?.children?.map((level: Level) => {
                const levelStudentIds = getAllStudentIdsFromLevel(level);
                const isAllSelected = areAllSelected(levelStudentIds);
                const isSomeSelected = areSomeSelected(levelStudentIds);

                return (
                  <div key={level.name}>
                    <div
                      className="flex items-center bg-white border border-gray-200 px-3 py-6 cursor-pointer"
                      onClick={() => toggleLevel(level)}
                    >
                      {expandedLevels.includes(level) ? (
                        <ChevronDown className="w-4 h-4 mr-2" />
                      ) : (
                        <ChevronRight className="w-4 h-4 mr-2" />
                      )}
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={isAllSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = isSomeSelected;
                        }}
                        onChange={() => toggleManyStudents(levelStudentIds)}
                      />
                      <span className="font-semibold text-sm text-gray-700">{level.name}</span>
                      <span className="ml-auto text-sm text-gray-500">
                        {level?.total_student_by_level || 0} estudiantes
                      </span>
                    </div>

                    {expandedLevels.includes(level) &&
                      level?.children?.map((section: any) => {
                        const sectionStudentIds = getAllStudentIdsFromSection(section);
                        const isAllSectionSelected = areAllSelected(sectionStudentIds);
                        const isSomeSectionSelected = areSomeSelected(sectionStudentIds);

                        return (
                          <div key={section.name} className="ml-6">
                            <div
                              className="flex items-center px-3 border border-gray-200 px-3 py-6 cursor-pointer"
                              onClick={() => {
                                sendEvent(TrackEvents.announcements.audienceGroupSelected);
                                toggleSection(section.children);
                              }}
                            >
                              {expandedSections.includes(section.children) ? (
                                <ChevronDown className="w-4 h-4 mr-2" />
                              ) : (
                                <ChevronRight className="w-4 h-4 mr-2" />
                              )}
                              <input
                                type="checkbox"
                                className="mr-2"
                                checked={isAllSectionSelected}
                                ref={(input) => {
                                  if (input) input.indeterminate = isSomeSectionSelected;
                                }}
                                onChange={() => {
                                  sendEvent(TrackEvents.announcements.audienceGroupSelected);
                                  toggleManyStudents(sectionStudentIds);
                                }}
                              />
                              <span className="text-sm text-gray-700">{section.name}</span>
                              <span className="ml-auto text-sm text-gray-500">
                                {section?.total_student_by_section} estudiantes
                              </span>
                            </div>

                            {expandedSections.includes(section.children) && (
                              <div className="ml-8">
                                {section.children.map((student: any) => (
                                  <div
                                    key={student.id}
                                    className="grid grid-cols-3 items-center border border-gray-200 px-3 py-6 border-t text-sm"
                                  >
                                    <div className="flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={selectedStudents.includes(student.id)}
                                        onChange={() => {
                                          toggleStudent(student.id);
                                        }}
                                        className="mr-2"
                                      />
                                      {student.name} {student.last_name}
                                    </div>
                                    <div className="text-gray-500">{student.section}</div>
                                    <div>
                                      {student.state === 'active' ? (
                                        <span className="text-green-600 bg-green-100 text-xs px-2 py-1 rounded-full">
                                          Activo
                                        </span>
                                      ) : (
                                        <span className="text-red-600 bg-red-100 text-xs px-2 py-1 rounded-full">
                                          Inactivo
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                );
              })}
          </div>
        </div>

        <div className="p-4 border bg-gray-100 border-gray-200 rounded-lg flex items-center justify-between mt-6 text-sm ">
          <p className="font-semibold">Total destinatarios</p>
          <p>{selectedStudents.length} estudiantes</p>
        </div>
      </section>
    </main>
  );
};

export default AudiencePickerStep;
