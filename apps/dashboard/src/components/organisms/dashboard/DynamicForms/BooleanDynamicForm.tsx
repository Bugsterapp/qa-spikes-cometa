import { Card, CardContent, CardTitle } from './Card';
import { DynamicConditionalQuestion, isVisible } from '@cometa/dynamic-forms';
import { RichTextLink } from '@cometa/recreo';
import Status from '/src/components/Status';
import { DiscardChangesDialog } from './DiscardChangesDialog';
import { AnswerEntity, QuestionEntity } from '@cometa/trpc/src/admissions/types';
import { Dispatch, SetStateAction } from 'react';
import { UseFormReturn } from 'react-hook-form';

export type StatusVariant = 'info' | 'success' | 'error' | 'muted' | 'warning';

type EditFormProps = {
  questions: QuestionEntity[];
  form: UseFormReturn<{ [x: string]: any }, any, { [x: string]: any }>;
  extraFields: Record<string, string>;
  setExtraFields: Dispatch<SetStateAction<Record<string, string>>>;
  validations?: { visibleConditionValue: string };
  isOpenDiscard: boolean;
  handleDiscardSubmit: () => void;
  isLoading: boolean;
  onCloseDiscard: () => void;
};

function EditForm({
  questions,
  form,
  extraFields,
  setExtraFields,
  validations,
  isOpenDiscard,
  handleDiscardSubmit,
  isLoading,
  onCloseDiscard,
}: EditFormProps) {
  const questionsFiltered = questions.filter((question) => isVisible(question, validations, form));

  return (
    <div className="flex flex-col gap-6">
      {questionsFiltered.map((question) => (
        <Card key={question.id}>
          <CardTitle className="text-lg flex items-center justify-between py-4">
            {question.entity_question?.name ?? question.name}
          </CardTitle>
          <CardContent singleColumn>
            <RichTextLink
              className="text-sm text-gray-600 dark:text-gray-400"
              text={question.entity_question?.description ?? (question.description as string)}
            />
            <DynamicConditionalQuestion
              key={question.id}
              question={question}
              form={form}
              extraFieldsState={[extraFields, setExtraFields] as any}
              onlyInput
            />
          </CardContent>
        </Card>
      ))}

      <DiscardChangesDialog
        open={isOpenDiscard}
        onSubmit={handleDiscardSubmit}
        isLoading={isLoading}
        onClose={onCloseDiscard}
      />
    </div>
  );
}

type InfoProps = {
  form: UseFormReturn<{ [x: string]: any }, any, { [x: string]: any }>;
  questions: QuestionEntity[];
  answers?: AnswerEntity[];
  validations?: { visibleConditionValue: string };
  getStatus: (answer: string | undefined) => Record<string, string>;
};

function Info({ form, questions, answers, validations, getStatus }: InfoProps) {
  const questionsFiltered = questions.filter((question) => isVisible(question, validations, form));

  return (
    <>
      {questionsFiltered.map((question) => {
        const answer = answers?.find((answer) => answer.question_id === question.id)?.answer;
        const status = getStatus(answer);

        const questionName = question.entity_question?.name ?? question.name;
        const questionDescription = question.entity_question?.description ?? question.description;

        return (
          <Card key={question.id} className={`border-[${status.borderColor}]`}>
            <CardTitle className="text-lg flex items-center justify-between py-4">
              {questionName}
              <Status variant={status.variant as StatusVariant}>{status.label}</Status>
            </CardTitle>
            <CardContent singleColumn>
              <RichTextLink className="text-sm text-gray-600 dark:text-gray-400" text={questionDescription as string} />
            </CardContent>
          </Card>
        );
      })}
    </>
  );
}

type BooleanDynamicFormProps = {
  isEditing: boolean;
  questions: QuestionEntity[];
  form: UseFormReturn<{ [x: string]: any }, any, { [x: string]: any }>;
  extraFields: Record<string, string>;
  setExtraFields: Dispatch<SetStateAction<Record<string, string>>>;
  validations?: { visibleConditionValue: string };
  isOpenDiscard: boolean;
  handleDiscardSubmit: () => void;
  isLoading: boolean;
  onCloseDiscard: () => void;
  answers?: AnswerEntity[];
};

export function BooleanDynamicForm({
  isEditing,
  questions,
  form,
  extraFields,
  setExtraFields,
  validations,
  isOpenDiscard,
  handleDiscardSubmit,
  isLoading,
  onCloseDiscard,
  answers,
}: BooleanDynamicFormProps) {
  if (isEditing) {
    return (
      <EditForm
        questions={questions}
        form={form}
        extraFields={extraFields}
        setExtraFields={setExtraFields}
        validations={validations}
        isOpenDiscard={isOpenDiscard}
        handleDiscardSubmit={handleDiscardSubmit}
        isLoading={isLoading}
        onCloseDiscard={onCloseDiscard}
      />
    );
  }

  return <Info form={form} questions={questions} answers={answers} validations={validations} getStatus={getStatus} />;
}

export function getStatus(answer: string | undefined): Record<string, string> {
  const newStatus = answer ? answer.toLowerCase() : '';

  if (newStatus.includes('sí') || newStatus.includes('si')) {
    return { label: 'Aceptado', variant: 'success', borderColor: '#229A16' };
  }

  if (newStatus.includes('no')) {
    return { label: 'Rechazado', variant: 'error', borderColor: '#D32F2F' };
  }

  return { label: 'Sin respuesta', variant: 'muted', borderColor: '#E6EBF5' };
}
