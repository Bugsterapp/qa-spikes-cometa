import Sheet from '/src/components/atoms/Sheet';
import { FormEntity, QuestionTypeEnum, SchoolStepTags } from '@cometa/trpc/src/admissions/types';
import { ChevronRightIcon, EditIcon, XIcon } from 'lucide-react';
import { useAnswers, useContentScroll } from './hooks';
import { prepareDataForSubmit, useDynamicFormControl, useExtraFields } from '@cometa/dynamic-forms';
import { api } from '/src/utils/api';
import { useMemo, useState } from 'react';
import { useToggle } from '@cometa/hooks';
import { useSession } from 'next-auth/react';
import { z } from 'zod';
import { cn } from '@cometa/utils';
import { Button } from '@cometa/recreo';
import { DefaultDynamicForm } from './DefaultDynamicForm';
import { BooleanDynamicForm } from './BooleanDynamicForm';

export function DynamicFormSection({
  formEntity,
  answeredFor,
  validations,
}: {
  formEntity: FormEntity;
  answeredFor: string;
  validations?: { visibleConditionValue: string };
}) {
  const session = useSession();
  const userId = session.data?.user.id;
  const { toggle: isOpenSheet, onOpen: onOpenSheet, onClose: onCloseSheet } = useToggle();
  const { toggle: isOpenDiscard, onOpen: onOpenDiscard, onClose: onCloseDiscard } = useToggle();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const { showShadow, targetRef } = useContentScroll();
  const { sections, answers, questions, refetch: refetchAnswers } = useAnswers(formEntity, answeredFor);
  const [extraFields, setExtraFields] = useExtraFields({ form: formEntity, answers });
  const { form, schema } = useDynamicFormControl(sections, answers, { makeOptional: true });
  const isBooleanForm = useMemo(() => {
    const hasOnlyRadioQuestions = questions.every((q) => q.type === QuestionTypeEnum.Radio);
    const isConsentForm = formEntity.category === SchoolStepTags.ConsentForm;
    const hasOneSection = sections.length === 1;

    return (hasOnlyRadioQuestions && hasOneSection) || isConsentForm;
  }, [formEntity, questions, sections]);

  const upsertDynamicAnswers = api.forms.upsertAnswers.useMutation({
    onSuccess: () => refetchAnswers(),
  });

  const {
    formState: { isDirty },
  } = form;

  function handleDiscard() {
    if (isDirty) {
      onOpenDiscard();
    } else {
      setIsEditing(false);
    }
  }

  function handleDiscardSubmit() {
    onCloseDiscard();
    setIsEditing(false);
    form.reset();
  }

  function onSubmit(data: z.infer<typeof schema>) {
    if (!formEntity?.id || formEntity.id === null || !userId || !isDirty) {
      return;
    }

    setLoading(true);

    const formData = prepareDataForSubmit({
      data,
      admissionForm: formEntity,
      userId,
      answeredFor,
      extraFields,
    });

    upsertDynamicAnswers.mutate({ data: formData });

    setLoading(false);
    setIsEditing(false);
  }

  function handleCloseSheet() {
    if (isEditing && isDirty) {
      onOpenDiscard();
    } else {
      onCloseDiscard();
      setIsEditing(false);
      onCloseSheet();
    }
  }

  return (
    <>
      <div
        className="bg-white border border-[#E4EBF6] rounded-xl px-8 py-6 flex justify-between items-center hover:cursor-pointer"
        onClick={onOpenSheet}
      >
        <div className="flex flex-col gap-2 w-[80%] pr-8">
          <h2 className="text-[#1C1C1D] font-bold text-lg">{formEntity.name}</h2>
          <p className="text-[#3E4559] text-sm leading-5 break-normal">{formEntity.description}</p>
        </div>

        <span className="text-[#00AB55] flex items-center gap-3 text-sm font-bold whitespace-nowrap flex-shrink-0">
          Ver información <ChevronRightIcon className="w-5" />
        </span>
      </div>

      <Sheet open={isOpenSheet} onOpenChange={(open) => !open && onCloseSheet()}>
        <Sheet.Content className="max-h-[calc(100vh-16px)] h-full max-w-4xl w-full m-2 rounded-2xl font-lota antialiased overflow-hidden shadow-[0px_20px_40px_-4px_rgba(145,158,171,0.16)]">
          <div
            className={cn(
              'flex items-center justify-between bg-white border-b border-[#D5DEED] px-8 py-5 sticky top-0',
              { 'shadow-[0px_20px_40px_-4px_rgba(145,158,171,0.16)]': showShadow }
            )}
          >
            <h3 className="text-[#454D64] font-bold text-lg">{formEntity.name}</h3>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleDiscard} size="small" variant="outline" color="legacy" disabled={isLoading}>
                    Descartar
                  </Button>
                  <Button
                    onClick={form.handleSubmit(onSubmit)}
                    size="small"
                    color="legacy"
                    variant="solid"
                    disabled={isLoading}
                  >
                    Guardar
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} size="small" color="black" variant="solid-light">
                  <EditIcon className="h-4" />
                  Editar
                </Button>
              )}

              <div className="h-8 w-[1px] bg-[#919EAB]/24" />

              <span
                onClick={handleCloseSheet}
                className="px-1.5 py-1 hover:cursor-pointer hover:bg-[#F0F0F0] rounded-full"
              >
                <XIcon className="text-[#98A2B3] w-5" />
              </span>
            </div>
          </div>

          <div
            className={cn('bg-[#FBFCFD] overflow-y-auto', {
              'h-full': !isBooleanForm,
            })}
          >
            <div className="h-1" ref={targetRef} />
            <div className="flex flex-col gap-6 px-8 py-7">
              {isBooleanForm ? (
                <BooleanDynamicForm
                  isEditing={isEditing}
                  questions={questions}
                  form={form}
                  extraFields={extraFields}
                  setExtraFields={setExtraFields}
                  validations={validations}
                  isOpenDiscard={isOpenDiscard}
                  handleDiscardSubmit={handleDiscardSubmit}
                  isLoading={isLoading}
                  onCloseDiscard={onCloseDiscard}
                  answers={answers}
                />
              ) : (
                <DefaultDynamicForm
                  sections={sections}
                  isEditing={isEditing}
                  form={form}
                  extraFields={extraFields}
                  setExtraFields={setExtraFields}
                  validations={validations}
                  isOpenDiscard={isOpenDiscard}
                  handleDiscardSubmit={handleDiscardSubmit}
                  isLoading={isLoading}
                  onCloseDiscard={onCloseDiscard}
                  answers={answers}
                />
              )}
            </div>
          </div>
        </Sheet.Content>
      </Sheet>
    </>
  );
}

function DynamicSectionSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-white border border-[#E4EBF6] rounded-xl px-8 py-6 flex justify-between items-center',
        className
      )}
    >
      <div className="flex flex-col gap-2 w-full max-w-md">
        <div className="h-6 bg-gray-200 rounded-md w-3/4 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded-md w-full animate-pulse" />
      </div>

      <span className="text-[#00AB55] flex items-center gap-3 text-sm font-bold whitespace-nowrap flex-shrink-0">
        <div className="h-4 bg-gray-200 rounded-md w-24 animate-pulse" />
        <ChevronRightIcon className="w-5 text-gray-200" />
      </span>
    </div>
  );
}

export function DynamicSectionSkeletonList({ total = 3 }: { total?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: total }).map((_, index) => (
        <DynamicSectionSkeleton key={index} />
      ))}
    </div>
  );
}
