import { api } from '/src/utils/api';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { useSchoolCycleSelector } from '/src/components/organisms/dashboard/SchoolCycleSelector';
import type { TemplateCategory } from '@cometa/trpc/src/students/types';
import useAlert from '/src/hooks/useAlert';

interface UseTemplatesProps {
  category?: TemplateCategory;
  is_active?: boolean;
}

export function useTemplates({ category, is_active = true }: UseTemplatesProps = {}) {
  const selectedSchool = useSelectedSchool();
  const { activeCycle } = useSchoolCycleSelector();

  const {
    data: templates,
    isPending: isLoading,
    refetch,
  } = api.students.listTemplates.useQuery(
    {
      school_id: selectedSchool?.id as string,
      school_cycle_id: activeCycle?.id,
      category: category,
      is_active: is_active,
    },
    {
      enabled: !!selectedSchool?.id,
    }
  );

  return {
    templates: templates ?? [],
    isLoading,
    refetch,
  };
}

export function useDeleteTemplate() {
  const utils = api.useUtils();
  const { setAlertState } = useAlert();

  return api.students.deleteTemplate.useMutation({
    onSuccess: () => {
      utils.students.listTemplates.invalidate();
      setAlertState({
        open: true,
        severity: 'success',
        message: 'Plantilla eliminada exitosamente',
      });
    },
    onError: (error: any) => {
      const message = error?.message || 'No se pudo eliminar la plantilla';
      setAlertState({
        open: true,
        severity: 'error',
        message,
      });
    },
  });
}
