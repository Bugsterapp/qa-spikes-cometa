import { AnswerEntity, FormEntity, FormSection as Layout, QuestionEntity } from '@cometa/trpc/src/admissions/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateDynamicLayoutSchema, SchemaOptions, Validations } from './schema';
import { getDynamicFormAnswers } from './answers';
import { useEffect, useMemo, useState, useRef } from 'react';
import isEqual from 'lodash/isEqual';

export function useDynamicFormControl(
  layout: Layout[],
  answers?: AnswerEntity[],
  options: SchemaOptions = {},
  validations?: Validations
) {
  const schema = useMemo(
    () => generateDynamicLayoutSchema(layout, options, validations),
    [layout, options, validations]
  );

  const formAnswers = useMemo(() => getDynamicFormAnswers(answers), [answers]);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: formAnswers,
    mode: 'all',
    reValidateMode: 'onSubmit',
  });

  const previousFormAnswers = useRef<typeof formAnswers | null>(null);

  useEffect(() => {
    if (!isEqual(formAnswers, previousFormAnswers.current)) {
      form.reset(formAnswers);
      previousFormAnswers.current = formAnswers;
    }
  }, [formAnswers, form]);

  return { form, schema, formAnswers };
}

function getFieldType(questionId: string, questions: QuestionEntity[]) {
  const question = questions?.find((q) => q.id === questionId);
  return question?.type as string;
}

type PrepareDataForSubmitProps = {
  data: z.infer<ReturnType<typeof generateDynamicLayoutSchema>>;
  admissionForm: FormEntity;
  userId: string;
  answeredFor: string;
  extraFields: Record<string, string>;
};

export function prepareDataForSubmit({
  data,
  admissionForm,
  userId,
  answeredFor,
  extraFields,
}: PrepareDataForSubmitProps) {
  const questions =
    admissionForm?.layout?.flatMap((section: Layout) =>
      section.questions.flatMap((questionGroup) => questionGroup.flatMap((question) => question))
    ) || [];

  const answersList = Object.entries(data)
    .filter(([_, answer]) => !!answer)
    .map(([questionId, answer]) => ({
      answer: Array.isArray(answer) ? answer.join('|') : answer ? String(answer) : '',
      answered_by: userId,
      answered_for: answeredFor,
      question_id: questionId,
      form_id: admissionForm.id!,
      field_type: getFieldType(questionId, questions),
    }));
  const extraFieldsList = Object.entries(extraFields).map(([questionId, answer]) => ({
    answer,
    answered_by: userId,
    answered_for: answeredFor,
    question_id: questionId,
    form_id: admissionForm.id!,
    field_type: 'textarea',
  }));

  return [...answersList, ...extraFieldsList];
}

function getAnswerForExtraField(questionId: string, answers?: AnswerEntity[]) {
  return answers?.find((answer) => answer.question_id === questionId && answer.field_type === 'textarea')?.answer;
}

export function useExtraFields({ form, answers }: { form?: FormEntity; answers?: AnswerEntity[] }) {
  const [extraFields, setExtraFields] = useState<Record<string, string>>({});

  useEffect(() => {
    const questionIdsWithExtraFields: Record<string, string> = {};
    form?.layout?.forEach((section) =>
      section.questions.forEach((questionGroup) =>
        questionGroup.forEach((question) => {
          if (question.entity_question?.extra?.extra_field_condition) {
            const questionId = question.id as string;
            questionIdsWithExtraFields[questionId] = getAnswerForExtraField(questionId, answers) ?? '';
          }
        })
      )
    );

    setExtraFields(questionIdsWithExtraFields);
  }, [form]);

  return [extraFields, setExtraFields] as const;
}
