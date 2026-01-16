import { api } from '~/utils/api';
import { useMemo } from 'react';
import { SchoolStepDocsEntity } from '@cometa/trpc/src/admissions/types';

export type DocumentDefinition = {
  id: string;
  name: string;
  tag: string;
  isRequired: boolean;
  order: number;
};

type UseDocumentDefinitionsParams = {
  schoolStepId?: string;
  levelId?: string;
  enabled?: boolean;
};

type UseDocumentDefinitionsReturn = {
  documentDefinitions: DocumentDefinition[];
  isLoading: boolean;
  error: unknown;
};

const getOrderKey = (o: number | null | undefined): number => o ?? Number.POSITIVE_INFINITY;

const filterByLevel = (doc: SchoolStepDocsEntity, levelId?: string): boolean => {
  if (!levelId || !doc.level_ids) return true;
  return doc.level_ids.split(',').includes(levelId);
};

const mapToDocumentDefinition = (doc: SchoolStepDocsEntity): DocumentDefinition => ({
  id: doc.id as string,
  name: doc.name as string,
  tag: doc.tag as string,
  isRequired: doc.is_required ?? true,
  order: doc.order ?? 0,
});

const sortByOrder = (a: DocumentDefinition, b: DocumentDefinition): number => {
  const ak = getOrderKey(a.order);
  const bk = getOrderKey(b.order);
  return ak - bk;
};

export function useDocumentDefinitions({
  schoolStepId,
  levelId,
  enabled = true,
}: UseDocumentDefinitionsParams): UseDocumentDefinitionsReturn {
  const {
    data: schoolStepDocs,
    isLoading,
    error,
  } = api.admissions.getSchoolStepDocs.useQuery(
    {
      school_step_id: schoolStepId as string,
      active: true,
    },
    {
      enabled: enabled && !!schoolStepId,
    }
  );

  const documentDefinitions = useMemo(() => {
    if (!schoolStepDocs) return [];

    return schoolStepDocs
      .filter((doc) => filterByLevel(doc, levelId))
      .map(mapToDocumentDefinition)
      .sort(sortByOrder);
  }, [schoolStepDocs, levelId]);

  return {
    documentDefinitions,
    isLoading,
    error,
  };
}
