import { FormSection, QuestionEntity } from '@cometa/trpc/src/admissions/types';
import { Dispatch, SetStateAction } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { DynamicConditionalQuestion, isVisible } from './DynamicQuestion';
import { cn } from '@cometa/utils';

type Validations = {
  visibleConditionValue?: string | null;
};

type QuestionsSectionProps = {
  section: FormSection;
  form: UseFormReturn<{ [x: string]: any }, any, { [x: string]: any }>;
  extraFields: [Record<string, string>, Dispatch<SetStateAction<Record<string, string>>>];
  validations?: Validations;
  cols?: number;
};

export function DynamicQuestionsSection({ section, form, extraFields, validations, cols = 1 }: QuestionsSectionProps) {
  function getVisibleQuestions(questionsGroup: QuestionEntity[]) {
    const visibleQuestions = questionsGroup.filter((question) => isVisible(question, validations, form));
    return visibleQuestions.map((question) => (
      <DynamicConditionalQuestion
        key={question.id}
        question={question}
        form={form}
        extraFieldsState={extraFields}
        validations={validations}
      />
    ));
  }

  return (
    <div className={cn('grid gap-4', `grid-cols-${cols}`)}>
      {section.questions.map((questionsGroup, idx) => {
        const visibleQuestions = getVisibleQuestions(questionsGroup);
        return visibleQuestions.length > 0 ? (
          <div key={`${section.name}-${idx}`} className="flex flex-col">
            {visibleQuestions}
          </div>
        ) : null;
      })}
    </div>
  );
}
