import { DynamicQuestionsSection, isVisible } from '@cometa/dynamic-forms';
import { CollapsibleCard, CardItem, ChipItems } from './Card';
import { DiscardChangesDialog } from './DiscardChangesDialog';
import { AnswerEntity, FormSection } from '@cometa/trpc/src/admissions/types';
import { Dispatch, SetStateAction } from 'react';
import { UseFormReturn } from 'react-hook-form';

type DefaultDynamicFormProps = {
  sections: FormSection[];
  isEditing: boolean;
  form: UseFormReturn<{ [x: string]: any }, any, { [x: string]: any }>;
  extraFields: Record<string, string>;
  setExtraFields: Dispatch<SetStateAction<Record<string, string>>>;
  validations?: { visibleConditionValue: string };
  isOpenDiscard: boolean;
  handleDiscardSubmit: () => void;
  isLoading: boolean;
  onCloseDiscard: () => void;
  answers: AnswerEntity[];
};

export function DefaultDynamicForm({
  sections,
  isEditing,
  form,
  extraFields,
  setExtraFields,
  validations,
  isOpenDiscard,
  handleDiscardSubmit,
  isLoading,
  onCloseDiscard,
  answers,
}: DefaultDynamicFormProps) {
  return (
    <>
      {sections.map((section) => {
        if (isSectionExcluded(section)) return null;

        return (
          <CollapsibleCard
            key={section.name}
            title={section.name}
            defaultOpen={sections.length < 3}
            singleColumnContent={isEditing}
          >
            {isEditing ? (
              <EditForm
                form={form}
                section={section}
                extraFields={extraFields}
                setExtraFields={setExtraFields}
                validations={validations}
                isOpenDiscard={isOpenDiscard}
                handleDiscardSubmit={handleDiscardSubmit}
                isLoading={isLoading}
                onCloseDiscard={onCloseDiscard}
              />
            ) : (
              <Info section={section} form={form} validations={validations} answers={answers} />
            )}
          </CollapsibleCard>
        );
      })}
    </>
  );
}

type EditFormProps = {
  form: UseFormReturn<{ [x: string]: any }, any, { [x: string]: any }>;
  section: FormSection;
  extraFields: Record<string, string>;
  setExtraFields: Dispatch<SetStateAction<Record<string, string>>>;
  validations?: { visibleConditionValue: string };
  isOpenDiscard: boolean;
  handleDiscardSubmit: () => void;
  isLoading: boolean;
  onCloseDiscard: () => void;
};

function EditForm({
  form,
  section,
  extraFields,
  setExtraFields,
  validations,
  isOpenDiscard,
  handleDiscardSubmit,
  isLoading,
  onCloseDiscard,
}: EditFormProps) {
  return (
    <>
      <DynamicQuestionsSection
        form={form}
        section={section}
        extraFields={[extraFields, setExtraFields] as const}
        cols={2}
        validations={validations}
      />
      <DiscardChangesDialog
        open={isOpenDiscard}
        onSubmit={handleDiscardSubmit}
        isLoading={isLoading}
        onClose={onCloseDiscard}
      />
    </>
  );
}

type InfoProps = {
  section: FormSection;
  form: UseFormReturn<{ [x: string]: any }, any, { [x: string]: any }>;
  validations?: { visibleConditionValue: string };
  answers: AnswerEntity[];
};

function Info({ section, form, validations, answers }: InfoProps) {
  return (
    <>
      {section.questions.flatMap((questionGroup) =>
        questionGroup
          .filter((q) => isVisible(q, validations, form))
          .map((question) => {
            const answer = answers?.find((answer) => answer.question_id === question.id)?.answer;
            const questionName = (question.entity_question?.name ?? question.name) as string;

            if (answer?.includes('|')) {
              return (
                <CardItem key={question.id} label={questionName} value={<ChipItems items={answer?.split('|')} />} />
              );
            }

            let extraAnswer;
            if (question.entity_question?.extra?.extra_field_condition) {
              extraAnswer = getAnswerForExtraField(question.id as string, answers);
            }

            return <CardItem key={question.id} label={questionName} value={answer} extraValue={extraAnswer} />;
          })
      )}
    </>
  );
}

function getAnswerForExtraField(questionId: string, answers?: AnswerEntity[]) {
  return answers?.find((answer) => answer.question_id === questionId && answer.field_type === 'textarea')?.answer;
}

function isSectionExcluded(section: FormSection) {
  const excludeFromList = ['Declaro que la información ingresada en este formulario es correcta y verdadera.'];

  return section.questions.some((questionGroup) =>
    questionGroup.some((question) => excludeFromList.includes(question.name ?? ''))
  );
}
