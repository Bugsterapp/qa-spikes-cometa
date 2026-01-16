import type { FormSection as Layout, QuestionEntity } from '@cometa/trpc/src/admissions/types';
import { z, ZodObject, ZodSchema, ZodTypeAny } from 'zod';

const REQUIRED_MESSAGE = 'Falta completar este campo.';

export type SchemaOptions = {
  makeOptional?: boolean;
};

export type Validations = {
  visibleConditionValue?: string | null;
};

export function generateDynamicLayoutSchema(
  layout: Layout[],
  options: SchemaOptions = {},
  validations?: Validations
): ZodObject<Record<string, ZodTypeAny>> {
  const schema: Record<string, ZodTypeAny> = {};

  layout.forEach((section) => {
    section.questions.forEach((questionGroup) => {
      questionGroup.forEach((question) => {
        if (isVisible(question, validations)) {
          const questionId = question.id as string;
          schema[questionId] = generateDynamicFieldSchema(question, options);
        }
      });
    });
  });

  return z.object(schema);
}

export function generateDynamicFieldSchema(question: QuestionEntity, options: SchemaOptions = {}): ZodSchema<any> {
  let fieldSchema: ZodSchema<any>;

  const questionType = question.entity_question?.type || question.type;
  const required = options.makeOptional ? false : question.entity_question?.is_required;

  switch (questionType) {
    case 'text':
    case 'textarea': {
      fieldSchema = required
        ? z.string({ required_error: REQUIRED_MESSAGE }).min(1, REQUIRED_MESSAGE)
        : z.string().nullish().optional();
      break;
    }
    case 'select':
    case 'radio': {
      const initialOptions = question.entity_question?.extra?.options || question?.extra?.options || [];
      const options = ['', ...initialOptions] as const;
      fieldSchema = required
        ? z.enum(options, { errorMap: () => ({ message: 'Selecciona una opción.' }) })
        : z.enum(options).optional();
      break;
    }
    case 'checkbox': {
      const initialOptions = question.entity_question?.extra?.options || question?.extra?.options || [];

      if (initialOptions.length === 0) {
        fieldSchema = required
          ? z
              .boolean({ required_error: REQUIRED_MESSAGE })
              .refine((value) => value === true, { message: REQUIRED_MESSAGE })
          : z.boolean().optional();
      } else {
        const options = ['', ...initialOptions] as const;
        const message = 'Selecciona al menos una opción.';
        fieldSchema = required
          ? z.array(z.enum(options), { errorMap: () => ({ message }) }).min(1, { message })
          : z.array(z.string()).optional();
      }
      break;
    }
    default: {
      fieldSchema = z.any();
    }
  }

  return fieldSchema;
}

function isVisible(question: QuestionEntity, validations?: Validations) {
  const entityQuestion = question?.entity_question;

  if (!entityQuestion?.is_visible) {
    return false;
  }

  const visibleCondition = entityQuestion?.extra?.visible_condition;

  if (!visibleCondition) {
    return true;
  }

  const [_, conditionValue] = visibleCondition;

  if (validations?.visibleConditionValue) {
    const isVisible = conditionValue.split(',').includes(validations.visibleConditionValue);
    if (!isVisible) return false;
  }

  return true;
}
