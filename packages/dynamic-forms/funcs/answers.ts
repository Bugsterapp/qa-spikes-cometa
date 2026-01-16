import { AnswerEntity } from '@cometa/trpc/src/admissions/types';

export function getDynamicFormAnswers(answers?: AnswerEntity[]) {
  return answers?.reduce((acc, answer) => {
    const questionId = answer.question_id as string;

    if (answer?.question?.type === 'checkbox') {
      const options = answer.question?.extra?.options ?? [];
      if (options && options.length > 0) {
        return { ...acc, [questionId]: answer.answer?.split('|') };
      }

      return { ...acc, [questionId]: Boolean(answer.answer) };
    }

    if (answer?.question?.type === 'radio') {
      return answer.field_type === 'radio' ? { ...acc, [questionId]: answer.answer } : acc;
    }

    return { ...acc, [questionId]: answer.answer };
  }, {});
}
