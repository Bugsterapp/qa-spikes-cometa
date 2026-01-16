import { DocumentTemplateEntity } from '@cometa/trpc/src/students/types';
import { api } from '../utils/api';
import { useSelectedSchool } from '../guards/AuthGuard';

export type SignatureTemplate = DocumentTemplateEntity;

export function useSignatureTemplates() {
  const selectedSchool = useSelectedSchool();

  const {
    data: templates = [],
    isLoading: loading,
    error,
  } = api.students.listTemplates.useQuery(
    { school_id: selectedSchool?.id || '' },
    {
      enabled: !!selectedSchool?.id,
    }
  );

  return {
    templates,
    loading,
    error: error?.message || null,
  };
}
