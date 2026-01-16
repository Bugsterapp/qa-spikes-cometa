import { Dispatch, SetStateAction } from 'react';
import { CheckBox, ContainerError, Input, Label, PhoneInput, Radio, Select, TextArea } from '@cometa/recreo';
import type { QuestionEntity } from '@cometa/trpc/src/admissions/types';
import { Controller, UseFormReturn } from 'react-hook-form';
import { cn } from '@cometa/utils';
import { DynamicQuestionHeader } from './DynamicQuestionHeader';

type Validations = {
  visibleConditionValue?: string | null;
};

type QuestionProps = {
  question: QuestionEntity;
  form: UseFormReturn<{ [x: string]: any }, any, { [x: string]: any }>;
  extraFieldsState: [Record<string, string>, Dispatch<SetStateAction<Record<string, string>>>];
  validations?: Validations;
  onlyInput?: boolean;
};

export function isVisible(
  question: QuestionEntity,
  validations?: Validations,
  form?: UseFormReturn<{ [x: string]: any }, any, { [x: string]: any }>
) {
  const entityQuestion = question?.entity_question;

  if (!entityQuestion?.is_visible) {
    return false;
  }

  const visibleCondition = entityQuestion?.extra?.visible_condition;

  if (!visibleCondition) {
    return true;
  }

  const [questionId, conditionValue] = visibleCondition;

  if (questionId && conditionValue) {
    const isVisible = !['', null, undefined].includes(questionId) && form?.watch(questionId) === conditionValue;
    if (!isVisible) return false;
  }

  if (!questionId && validations?.visibleConditionValue) {
    const isVisible = conditionValue.split(',').includes(validations.visibleConditionValue);
    if (!isVisible) return false;
  }

  return true;
}

export function DynamicConditionalQuestion({
  question,
  form,
  extraFieldsState,
  validations,
  onlyInput,
}: QuestionProps) {
  const entityQuestion = question?.entity_question;

  const questionName = entityQuestion?.name || question.name;

  if (!entityQuestion?.is_visible) {
    return null;
  }

  const visibleCondition = entityQuestion?.extra?.visible_condition;
  if (visibleCondition) {
    const [questionId, conditionValue] = visibleCondition;

    if (questionId && conditionValue) {
      const isVisible = !['', null, undefined].includes(questionId) && form.watch(questionId) === conditionValue;
      if (!isVisible) return null;
    }

    if (!questionId && validations?.visibleConditionValue) {
      const isVisible = conditionValue.split(',').includes(validations.visibleConditionValue);
      if (!isVisible) return null;
    }
  }

  return (
    <div key={questionName} className="mb-5">
      <DynamicQuestion question={question} form={form} extraFieldsState={extraFieldsState} onlyInput={onlyInput} />
    </div>
  );
}

export function DynamicQuestion({ question, form, extraFieldsState, onlyInput }: QuestionProps) {
  const [extraFields, setExtraFields] = extraFieldsState;

  const entityQuestion = question?.entity_question;

  const questionId = question.id as string;
  const questionName = entityQuestion?.name || question.name;
  const questionType = entityQuestion?.type || question.type;

  const { control, formState } = form;
  const { errors } = formState;
  const error = errors?.[questionId]?.message as string;

  const options = entityQuestion?.extra?.options || question?.extra?.options || [];

  if (questionType === 'select') {
    return (
      <Controller
        control={control}
        name={questionId}
        render={({ field: { onChange, value } }) => (
          <div className="flex flex-col gap-2">
            {onlyInput ? null : <DynamicQuestionHeader question={question} />}
            <Select placeholder={questionName} onValueChange={onChange} value={value} error={error} isLegacy={false}>
              <Select.Content className="w-full outline-none">
                {options?.map((option) => (
                  <Select.Item key={option} value={option} className="w-full hover:bg-[#F5FAFF] outline-none">
                    {option}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <ContainerError error={error} />
          </div>
        )}
      />
    );
  }

  if (questionType === 'radio') {
    const orientation = entityQuestion?.extra?.orientation;
    const extraFieldCondition = entityQuestion?.extra?.extra_field_condition;
    const hasExtraField = extraFieldCondition && extraFieldCondition === form.watch(questionId);

    return (
      <>
        <Controller
          control={control}
          name={questionId}
          render={({ field }) => (
            <Radio.Group
              onValueChange={field.onChange}
              value={field.value}
              error={error}
              className="flex flex-col gap-2"
            >
              {onlyInput ? null : <DynamicQuestionHeader question={question} />}
              <div className={cn('flex gap-4 flex-col', { 'flex-row': orientation === 'horizontal' })}>
                {options?.map((option) => {
                  const optionId = `${questionId}-${option}`;

                  return (
                    <div key={optionId} className="flex items-center gap-2">
                      <Radio.Item id={optionId} value={option} className="hover:cursor-pointer" />
                      <Label htmlFor={optionId} className="hover:cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </Radio.Group>
          )}
        />

        {hasExtraField ? (
          <TextArea
            onChange={(event) => setExtraFields({ ...extraFields, [questionId]: event.target.value })}
            value={extraFields[questionId]}
            placeholder={entityQuestion?.extra?.extra_field as string}
            isLegacy={false}
            className="mt-4"
          />
        ) : null}
      </>
    );
  }

  if (questionType === 'checkbox') {
    if (!options || options.length === 0) {
      return (
        <Controller
          control={control}
          name={questionId}
          render={({ field }) => (
            <CheckBox.Group error={error} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <CheckBox.Item
                  id={questionId}
                  checked={Boolean(field.value)}
                  onCheckedChange={(value) => field.onChange(Boolean(value))}
                  className="w-10 hover:cursor-pointer"
                />
                <Label htmlFor={questionId} className="font-normal text-base leading-6 hover:cursor-pointer">
                  {questionName}
                </Label>
              </div>
            </CheckBox.Group>
          )}
        />
      );
    }

    return (
      <Controller
        control={control}
        name={questionId}
        render={({ field }) => (
          <CheckBox.Group error={error} className="flex flex-col gap-2">
            {onlyInput ? null : <DynamicQuestionHeader question={question} />}
            <div
              className={cn('flex gap-4 flex-wrap', {
                'flex-col': entityQuestion?.extra?.orientation === 'vertical',
              })}
            >
              {options?.map((option) => {
                const isChecked = field.value?.includes(option);

                return (
                  <div key={option} className="flex items-center gap-2">
                    <CheckBox.Item
                      id={option}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        const newValue = checked
                          ? [...(field.value || []), option]
                          : (field.value || []).filter((val: string) => val !== option);
                        field.onChange(newValue);
                      }}
                      className="hover:cursor-pointer"
                    />
                    <Label htmlFor={option} className="font-normal text-base leading-6 hover:cursor-pointer">
                      {option}
                    </Label>
                  </div>
                );
              })}
            </div>
          </CheckBox.Group>
        )}
      />
    );
  }

  if (questionType === 'textarea') {
    const noLabel = entityQuestion?.extra?.no_label;
    const isRequired = entityQuestion?.is_required;

    let placeholder: string | undefined;
    if (noLabel) {
      placeholder = questionName;
    }
    if (!isRequired) {
      placeholder += ' (Opcional)';
    }

    return (
      <Controller
        control={control}
        name={questionId}
        render={({ field }) => (
          <div className="flex flex-col gap-2">
            {onlyInput ? null : <DynamicQuestionHeader question={question} />}
            <TextArea {...field} id={questionId} hasErrors={!!error} placeholder={placeholder} isLegacy={false} />
            <ContainerError error={error} />
          </div>
        )}
      />
    );
  }

  if (entityQuestion?.extra?.variant === 'phone') {
    return (
      <Controller
        control={control}
        name={questionId}
        render={() => (
          <div className="flex flex-col gap-2">
            {onlyInput ? null : <DynamicQuestionHeader question={question} />}
            <PhoneInput onChange={() => form.clearErrors(questionId)} error={error} isLegacy={false} />
          </div>
        )}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {onlyInput ? null : <DynamicQuestionHeader question={question} />}
      <Input {...form.register(questionId)} type="text" error={error} isLegacy={false} />
      <ContainerError error={error} />
    </div>
  );
}
