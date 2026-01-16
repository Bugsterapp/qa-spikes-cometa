import * as Sentry from '@sentry/nextjs';
import {
  DynamicConditionalQuestion,
  prepareDataForSubmit,
  useDynamicFormControl,
  useExtraFields,
  isVisible,
} from '@cometa/dynamic-forms';
import { Button } from '@cometa/recreo';
import { SchoolStepTags } from '@cometa/trpc/src/admissions/types';
import { InscriptionEntity } from '@cometa/trpc/src/students/types-mapping';
import { useSession } from 'next-auth/react';
import { useRef, useState } from 'react';
import { z } from 'zod';
import { Card, CardContent, CardTitle } from '~/components/Card';
import { useAlert } from '~/hooks';
import { api } from '~/utils/api';
import { FieldErrors } from 'react-hook-form';
import { RichTextLink } from '@cometa/recreo';

type ConsentmentsStepProps = {
  studentId: string;
  schoolId: string;
  inscriptionId: string;
  onUpdateInscription: (inscription: Partial<InscriptionEntity>) => Promise<void>;
  onNext: () => void;
};

export type ConsentmentsSubmitResult = {
  success: boolean;
};

export function ConsentmentsStep({
  studentId,
  schoolId,
  inscriptionId,
  onUpdateInscription,
  onNext,
}: ConsentmentsStepProps) {
  const { setAlert } = useAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: session } = useSession();
  const userId = session?.user.id as string;

  const { data: inscription } = api.students.getInscription.useQuery({ inscriptionId }, { enabled: !!inscriptionId });

  const {
    sections,
    questions,
    answers,
    form: admissionForm,
  } = useDynamicForm(schoolId, studentId, userId, SchoolStepTags.ConsentForm);

  const [extraFields, setExtraFields] = useExtraFields({ form: admissionForm, answers });
  const { form, schema } = useDynamicFormControl(
    sections,
    answers,
    {},
    { visibleConditionValue: inscription?.level_id }
  );
  const upsertDynamicAnswers = api.forms.upsertAnswers.useMutation({
    onError(error) {
      Sentry.captureException(error);
    },
  });

  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const { handleSubmit } = form;

  async function onSubmit(data: z.infer<typeof schema>) {
    try {
      if (!admissionForm?.id || admissionForm.id === null || !userId) {
        return;
      }

      setIsSubmitting(true);

      const formData = prepareDataForSubmit({
        data,
        admissionForm,
        userId,
        answeredFor: studentId,
        extraFields,
      });

      await upsertDynamicAnswers.mutateAsync({ data: formData });
      setAlert('Datos actualizados exitosamente', 'success');
      await onUpdateInscription({ consentments_step_completed_at: new Date().toISOString() });
      onNext();
      setIsSubmitting(false);
    } catch (error) {
      setAlert('Ocurrió un error al actualizar los datos');
      setIsSubmitting(false);
    }
  }

  async function onError(errors: FieldErrors<z.infer<typeof schema>>) {
    const errorQuestionIds = questions.filter((q) => q.id && errors[q.id]).map((q) => q.id);
    if (errorQuestionIds.length) {
      const [firstErrorId] = errorQuestionIds;
      if (firstErrorId) {
        const element = cardRefs.current[firstErrorId];
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  const questionsFiltered = questions.filter((question) =>
    isVisible(question, { visibleConditionValue: inscription?.level_id }, form)
  );

  return (
    <>
      {questionsFiltered.map((question) => (
        <div key={question.id} ref={(el) => (cardRefs.current[question.id as string] = el)}>
          <Card>
            <CardTitle className="py-4">{question.entity_question?.name ?? question.name}</CardTitle>
            <CardContent singleColumn>
              <RichTextLink
                className="text-sm text-gray-600 dark:text-gray-400"
                text={question.entity_question?.description ?? (question.description as string)}
              />
              <DynamicConditionalQuestion
                key={question.id}
                question={question}
                form={form}
                extraFieldsState={[extraFields, setExtraFields] as const}
                onlyInput
              />
            </CardContent>
          </Card>
        </div>
      ))}

      <Button
        className="bg-[#1C1C1D] hover:bg-[#1C1C1D]/90 mt-2 px-5 py-2.5"
        onClick={handleSubmit(onSubmit, onError)}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Guardando...' : 'Siguiente'}
      </Button>
    </>
  );
}

function useDynamicForm(schoolId: string, answeredFor: string, answeredBy: string, category?: string) {
  const { data: form } = api.forms.getDynamicForm.useQuery({ createdBy: schoolId, category }, { enabled: !!schoolId });

  const { data: answers } = api.forms.getAnswers.useQuery(
    { form_id: form?.id as string, answered_for: answeredFor, answered_by: answeredBy },
    { enabled: !!form?.id && !!answeredFor && !!answeredBy }
  );

  const sections = form?.layout || [];
  const questions =
    sections.flatMap((section) =>
      section.questions.flatMap((questionGroup) => questionGroup.flatMap((question) => question))
    ) || [];

  return { form, sections, questions, answers: answers || [] };
}
