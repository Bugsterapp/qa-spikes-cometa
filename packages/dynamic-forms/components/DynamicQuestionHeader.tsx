import { Label, RichTextLink } from '@cometa/recreo';
import { QuestionEntity } from '@cometa/trpc/src/admissions/types';

export function DynamicQuestionHeader({ question }: { question: QuestionEntity }) {
  const entityQuestion = question?.entity_question;

  const noLabel = entityQuestion?.extra?.no_label;
  const isRequired = entityQuestion?.is_required;

  const questionName = entityQuestion?.name || question.name;
  const questionDescription = entityQuestion?.description || question.description;

  if (noLabel) {
    if (questionDescription) {
      return <RichTextLink className="text-sm text-[#3E4559]" text={questionDescription} />;
    }
    return null;
  }

  return (
    <>
      <Label htmlFor={question.id as string} className="font-semibold text-base leading-6">
        {noLabel ? null : questionName}
        {isRequired && !noLabel ? null : <span className="font-normal text-sm text-[#3E4559]"> (Opcional)</span>}
      </Label>

      {questionDescription ? <RichTextLink className="text-sm text-[#3E4559]0" text={questionDescription} /> : null}
    </>
  );
}
