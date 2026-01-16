import { useState, useRef, useEffect, useMemo } from 'react';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { api } from '/src/utils/api';
import { FormEntity, SchoolStepTags } from '@cometa/trpc/src/admissions/types';

export function useContentScroll() {
  const [showShadow, setShowShadow] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (targetRef.current) {
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          setShowShadow(!entry.isIntersecting);
        },
        { threshold: 1 }
      );

      observerRef.current.observe(targetRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return { showShadow, targetRef };
}

function getFirstForm(forms: FormEntity[]): FormEntity | undefined {
  if (!forms) return;
  return Array.isArray(forms) ? forms[0] : forms;
}

export function useDynamicForm(answeredFor: string, tag: SchoolStepTags, category?: string) {
  const selectedSchool = useSelectedSchool();
  const schoolId = selectedSchool?.id as string;

  const { data: formsBySchool } = api.forms.getDynamicForm.useQuery(
    { tag, schoolId: schoolId },
    { enabled: !!schoolId }
  );
  const { data: formsByCategory } = api.forms.getDynamicForm.useQuery(
    { category },
    { enabled: !!schoolId && !!category }
  );

  const formBySchool = useMemo(() => getFirstForm(formsBySchool as FormEntity[]), [formsBySchool]);
  const formByCategory = useMemo(() => getFirstForm(formsByCategory as FormEntity[]), [formsByCategory]);

  const form = formBySchool || formByCategory;

  const { answers, refetch, sections, questions } = useAnswers(form as FormEntity, answeredFor);

  return { form, sections, questions, answers, refetchAnswers: refetch };
}

export function useDynamicFormByCreatedBy(createdBy: string): { forms: FormEntity[]; isLoading: boolean } {
  const { data: forms = [], isPending: isLoading } = api.forms.getDynamicForm.useQuery(
    { createdBy },
    { enabled: !!createdBy }
  );

  return { forms: forms as FormEntity[], isLoading };
}

export function useAnswers(form: FormEntity, answeredFor: string) {
  const { data: answers = [], refetch } = api.forms.getAnswers.useQuery(
    { form_id: form?.id as string, answered_for: answeredFor },
    { enabled: !!form?.id && !!answeredFor }
  );

  const sections = form?.layout || [];
  const questions =
    sections.flatMap((section) =>
      section.questions.flatMap((questionGroup) => questionGroup.flatMap((question) => question))
    ) || [];
  return { answers, refetch, sections, questions };
}
