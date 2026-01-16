import Sheet from '/src/components/atoms/Sheet';
import { useToggle } from '@cometa/hooks';
import { XIcon, ChevronRightIcon, EditIcon } from 'lucide-react';
import { cn } from '@cometa/utils';
import {
  DynamicQuestionsSection,
  prepareDataForSubmit,
  useDynamicFormControl,
  useExtraFields,
} from '@cometa/dynamic-forms';
import { AnswerEntity, FormSection, SchoolStepTags } from '@cometa/trpc/src/admissions/types';
import { CollapsibleCard, CardItem, ChipItems } from './Card';
import { useContentScroll, useDynamicForm } from '../DynamicForms';
import { Button } from '@cometa/recreo';
import { useState } from 'react';
import { DiscardChangesDialog } from './DiscardChanagesDialog';
import { useSession } from 'next-auth/react';
import { api } from '/src/utils/api';
import { z } from 'zod';
import { UseFormReturn } from 'react-hook-form';

type PsychopedagogicalSectionProps = {
  answeredFor: string;
  category?: string;
  validations?: { visibleConditionValue: string };
};

export function PsychopedagogicalSection({ answeredFor, category, validations }: PsychopedagogicalSectionProps) {
  const session = useSession();
  const userId = session.data?.user.id;
  const { toggle: isOpenSheet, onOpen: onOpenSheet, onClose: onCloseSheet } = useToggle();
  const { toggle: isOpenDiscard, onOpen: onOpenDiscard, onClose: onCloseDiscard } = useToggle();
  const [isEditing, setIsEditing] = useState(false);
  const { showShadow, targetRef } = useContentScroll();
  const [isLoading, setLoading] = useState(false);
  const {
    sections,
    answers,
    form: admissionForm,
    refetchAnswers,
  } = useDynamicForm(answeredFor, SchoolStepTags.PsychopedagogicalForm, category);
  const [extraFields, setExtraFields] = useExtraFields({ form: admissionForm, answers });
  const { form, schema } = useDynamicFormControl(sections, answers, { makeOptional: true });
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
    if (!admissionForm?.id || admissionForm.id === null || !userId || !isDirty) {
      return;
    }

    setLoading(true);

    const formData = prepareDataForSubmit({
      data,
      admissionForm,
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
        <div className="flex flex-col gap-2">
          <h2 className="text-[#020202] font-bold text-lg">Información psicopedagógica</h2>
          <p className="text-#3E4559 text-sm">Revisa la información psicopedagógica del estudiante.</p>
        </div>

        <span className="text-[#00AB55] flex items-center gap-3 text-sm font-bold">
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
            <h3 className="text-[#454D64] font-bold text-lg">Información psicopedagógica</h3>

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

          <div className="bg-[#FBFCFD] overflow-y-auto h-full">
            <div className="h-1" ref={targetRef} />
            <div className="flex flex-col gap-6 px-8 py-7">
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
                      <>
                        <DynamicQuestionsSection
                          form={form as unknown as UseFormReturn<{ [x: string]: any }, any, { [x: string]: any }>}
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
                    ) : (
                      <>
                        {section.questions.flatMap((questionGroup) =>
                          questionGroup.flatMap((question) => {
                            const answer = answers?.find((answer) => answer.question_id === question.id)?.answer;
                            const questionName = (question.entity_question?.name ?? question.name) as string;

                            if (answer?.includes('|')) {
                              return (
                                <CardItem
                                  key={question.id}
                                  label={questionName}
                                  value={<ChipItems items={answer?.split('|')} />}
                                />
                              );
                            }

                            let extraAnswer;
                            if (question.entity_question?.extra?.extra_field_condition) {
                              extraAnswer = getAnswerForExtraField(question.id as string, answers);
                            }

                            return (
                              <CardItem
                                key={question.id}
                                label={questionName}
                                value={answer}
                                extraValue={extraAnswer}
                              />
                            );
                          })
                        )}
                      </>
                    )}
                  </CollapsibleCard>
                );
              })}
            </div>
          </div>
        </Sheet.Content>
      </Sheet>
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
