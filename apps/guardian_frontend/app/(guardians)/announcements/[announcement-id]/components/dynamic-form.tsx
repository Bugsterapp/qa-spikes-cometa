'use client';

import React from 'react';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import type { Answer, QuestionDTO } from '@cometa/trpc/src/announcements/types';
import { Button, Label, Radio, TextArea } from '@cometa/recreo';
import { cn } from '~/lib/cn';
import { useSendEvent } from '~/hooks/useSendEvent';
import { TrackEvents } from '~/constants/events';

interface DynamicFormProps {
  readonly questions: QuestionDTO[];
  readonly onSubmit: (data: Record<string, string>) => Promise<void>;
  readonly disabled?: boolean;
  readonly answers?: Answer[];
}

const createFormSchema = (questions: QuestionDTO[]) => {
  const schemaObj: Record<string, z.ZodString | z.ZodOptional<z.ZodString>> = {};

  questions.forEach((question) => {
    if (question.is_required) {
      schemaObj[question.id] = z.string().min(1, `${question.statement} es requerido`);
    } else {
      schemaObj[question.id] = z.string().optional();
    }
  });

  return z.object(schemaObj);
};

export default function DynamicForm({ questions, onSubmit, disabled, answers }: DynamicFormProps) {
  const formSchema = React.useMemo(() => createFormSchema(questions), [questions]);
  const sendEvent = useSendEvent();

  const form = useForm({
    defaultValues: questions.reduce((acc, question) => {
      const answer = answers?.find((answer) => answer.question_id === question.id);
      acc[question.id] = answer?.response ?? '';
      return acc;
    }, {} as Record<string, string>),
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
    validators: {
      onChange: ({ value }) => {
        const result = formSchema.safeParse(value);
        if (!result.success) {
          const errors: Record<string, string> = {};
          result.error.errors.forEach((error) => {
            if (error.path[0]) {
              errors[error.path[0].toString()] = error.message;
            }
          });
          return errors;
        }
        return undefined;
      },
    },
  });

  const renderQuestion = (question: QuestionDTO) => (
    <form.Field
      key={question.id}
      name={question.id}
      validators={{
        onChange: ({ value }) => {
          if (question.is_required && (!value || value.trim() === '')) {
            return 'Este campo es requerido';
          }
          return undefined;
        },
        onSubmit: ({ value }) => {
          if (question.is_required && (!value || value.trim() === '')) {
            return 'Este campo es requerido';
          }
          return undefined;
        },
      }}
    >
      {(field) => {
        const isTextQuestion = question.question_type === 'text';
        const isOptionsQuestion = question.question_type === 'options' && question.options;

        return (
          <div className="flex flex-col gap-2 w-full">
            <Label className="font-semibold mb-2.5">{question.statement}</Label>
            {isTextQuestion && (
              <TextArea
                value={field.state.value || ''}
                id={question.id}
                onChange={(e) => {
                  field.handleChange(e.currentTarget.value);
                  sendEvent(TrackEvents.announcements.detail.freeTextEdited, {
                    id: question.id,
                    value: e.currentTarget.value,
                  });
                }}
                disabled={disabled}
                isLegacy={false}
              />
            )}
            {isOptionsQuestion && (
              <Radio.Group
                name="action"
                className={cn('flex w-full', {
                  'flex-col gap-2': question.options && question.options.length > 2,
                  'flex-row flex-wrap gap-2': question.options && question.options.length <= 2,
                })}
                value={field.state.value || ''}
                onValueChange={(value: string) => {
                  field.handleChange(value);
                  sendEvent(TrackEvents.announcements.detail.multipleChoiceClicked, {
                    id: question.id,
                    option: value,
                  });
                }}
                disabled={disabled}
              >
                {question.options?.map((option) => (
                  <div className="flex items-center gap-2 px-3 py-2" key={option.id}>
                    <Radio.Item
                      id={option.id}
                      value={option.id}
                      className="cursor-pointer disabled:cursor-none data-[state=checked]:border-galaxy-600 disabled:data-[state=checked]:border-neutral-300 disabled:data-[state=checked]:text-neutral-300  data-[state=checked]:text-galaxy-600 min-w-5 min-h-5 flex-shrink-0"
                    />
                    <Label
                      htmlFor={option.id}
                      className={cn('text-base cursor-pointer', {
                        'text-neutral-300': disabled,
                      })}
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </Radio.Group>
            )}

            {field.state.meta.errors.length > 0 && <p className="text-sm text-red-500">{field.state.meta.errors[0]}</p>}
          </div>
        );
      }}
    </form.Field>
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col gap-6 w-full"
    >
      {questions.map(renderQuestion)}

      {questions.length > 0 && !disabled && (
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" variant="solid" color="black" disabled={!canSubmit || disabled}>
              {isSubmitting ? 'Enviando...' : 'Enviar respuesta'}
            </Button>
          )}
        </form.Subscribe>
      )}
    </form>
  );
}
