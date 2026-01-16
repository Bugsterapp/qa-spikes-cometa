import { useToggle } from '@cometa/hooks';
import { cn } from '@cometa/utils';
import { ChevronRightIcon, EditIcon, XIcon } from 'lucide-react';
import { CardTitle, Card, CardContent } from './Card';
import Sheet from '/src/components/atoms/Sheet';
import Status from '/src/components/Status';
import { useContentScroll, useDynamicForm } from '../DynamicForms';
import { SchoolStepTags } from '@cometa/trpc/src/admissions/types';
import { Button } from '@cometa/recreo';
import { useState } from 'react';
import {
  DynamicConditionalQuestion,
  prepareDataForSubmit,
  useDynamicFormControl,
  useExtraFields,
} from '@cometa/dynamic-forms';
import { api } from '/src/utils/api';
import { DiscardChangesDialog } from './DiscardChanagesDialog';
import { useSession } from 'next-auth/react';
import { z } from 'zod';
import { RichTextLink } from '@cometa/recreo';
import { UseFormReturn } from 'react-hook-form';

export function ConsentmentSection({
  answeredFor,
  category,
  validations,
}: {
  answeredFor: string;
  category?: string;
  validations?: { visibleConditionValue: string };
}) {
  const session = useSession();
  const userId = session.data?.user.id;
  const { toggle: isOpenSheet, onOpen: onOpenSheet, onClose: onCloseSheet } = useToggle();
  const { toggle: isOpenDiscard, onOpen: onOpenDiscard, onClose: onCloseDiscard } = useToggle();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const { showShadow, targetRef } = useContentScroll();
  const {
    sections,
    questions,
    answers,
    form: admissionForm,
    refetchAnswers,
  } = useDynamicForm(answeredFor, SchoolStepTags.ConsentForm, category);
  const [extraFields, setExtraFields] = useExtraFields({ form: admissionForm, answers });
  const { form, schema } = useDynamicFormControl(sections, answers);
  const upsertDynamicAnswers = api.forms.upsertAnswers.useMutation({
    onSuccess: () => refetchAnswers(),
  });

  const {
    formState: { isDirty, isValid },
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
          <h2 className="text-[#1C1C1D] font-bold text-lg">Consentimientos y autorizaciones de los padres</h2>
          <p className="text-#3E4559 text-sm">Accede a los consentimientos otorgados por los padres.</p>
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
            <h3 className="text-[#454D64] font-bold text-lg">Consentimientos y autorizaciones</h3>

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
                    disabled={isLoading || !isValid}
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
              <span
                onClick={handleCloseSheet}
                className="px-1.5 py-1 hover:cursor-pointer hover:bg-[#F0F0F0] rounded-full"
              >
                <XIcon className="text-[#98A2B3] w-5" />
              </span>
            </div>
          </div>

          <div className="bg-[#FBFCFD] overflow-y-auto">
            <div className="h-1" ref={targetRef} />
            <div className="flex flex-col gap-6 px-8 py-7">
              {isEditing ? (
                <div className="flex flex-col gap-6">
                  {questions.map((question) => (
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
                          form={form as unknown as UseFormReturn<{ [x: string]: any }, any, { [x: string]: any }>}
                          extraFieldsState={[extraFields, setExtraFields] as const}
                          onlyInput
                          validations={validations}
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
              ) : (
                <>
                  {questions.map((question) => {
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
                          <RichTextLink
                            className="text-sm text-gray-600 dark:text-gray-400"
                            text={questionDescription as string}
                          />
                        </CardContent>
                      </Card>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </Sheet.Content>
      </Sheet>
    </>
  );
}

type StatusVariant = 'info' | 'success' | 'error' | 'muted' | 'warning';

function getStatus(answer: string | undefined): Record<string, string> {
  const newStatus = answer ? answer.toLowerCase() : '';

  if (newStatus.includes('sí') || newStatus.includes('si')) {
    return { label: 'Aceptado', variant: 'success', borderColor: '#229A16' };
  }

  if (newStatus.includes('no')) {
    return { label: 'Rechazado', variant: 'error', borderColor: '#D32F2F' };
  }

  return { label: 'Sin respuesta', variant: 'muted', borderColor: '#E6EBF5' };
}
