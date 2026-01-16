import { useMemo } from 'react';
import { splitSection } from '../utils/section';
import { DashboardSchoolSection, InternalSchool } from '@cometa/trpc/src/types';

interface SectionsPerLevelMap {
  [key: string]: Set<string>;
}

function useLevelOptions(
  sections: DashboardSchoolSection[],
  levels: InternalSchool[],
  level: string,
  sectionSelected: any,
  grade: string
) {
  const sectionsPerLevel = useMemo(
    () =>
      sections?.reduce((acc: SectionsPerLevelMap, section) => {
        const levelName = levels?.find((lvl) => lvl.id === section.level)?.name || '';
        if (acc[levelName]) {
          acc[levelName].add(section.name);
        } else {
          acc[levelName] = new Set([section.name]);
        }
        return acc;
      }, {} as SectionsPerLevelMap) || {},
    [sections, levels]
  );

  const gradesPerLevel = useMemo(() => {
    const tempGradesPerLevel: Record<string, Record<string, string[]>> = {};
    for (const levelName in sectionsPerLevel) {
      tempGradesPerLevel[levelName] = {};
      sectionsPerLevel[levelName].forEach((section) => {
        const [grade, group] = splitSection(section);
        if (!grade || !group) {
          tempGradesPerLevel[levelName][grade] = [];
          return;
        }

        if (tempGradesPerLevel[levelName][grade]) {
          tempGradesPerLevel[levelName][grade].push(section);
        } else {
          tempGradesPerLevel[levelName][grade] = [section];
        }
      });
    }
    return tempGradesPerLevel;
  }, [sectionsPerLevel]);

  const levelSelected = useMemo(
    () => levels.find((e) => e.id === level) || levels.find((lvl) => lvl.id === sectionSelected?.level),
    [levels, level, sectionSelected]
  );

  const gradeSelected = useMemo(() => {
    const level = levelSelected?.name;
    if (!level || !sectionSelected?.name) {
      return '';
    }

    const grades = gradesPerLevel[level];
    if (!grades || Object.keys(grades).length === 0) {
      return '';
    }

    return Object.keys(grades).find((e) => grades[e].includes(sectionSelected.name));
  }, [gradesPerLevel, levelSelected, sectionSelected]);

  const gradesOptions = useMemo(
    () =>
      levelSelected?.name && gradesPerLevel[levelSelected?.name]
        ? Object.keys(gradesPerLevel[levelSelected?.name])
        : [],
    [gradesPerLevel, levelSelected]
  );

  const groupOptions = useMemo(() => {
    const options =
      levelSelected?.name && gradesPerLevel[levelSelected?.name] && grade
        ? gradesPerLevel[levelSelected?.name][grade]?.map((e) => {
            const [, group] = splitSection(e);
            return group;
          })
        : [];
    options?.sort();
    return options;
  }, [gradesPerLevel, levelSelected, grade]);

  return { gradesOptions, groupOptions, levelSelected, gradeSelected };
}

export default useLevelOptions;
