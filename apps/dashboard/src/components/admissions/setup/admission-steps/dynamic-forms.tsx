import { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@cometa/recreo/v2';
import { Info, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { api } from '/src/utils/api';
import {
  SchoolStepTags,
  FormSection,
  QuestionEntity,
  SchoolStepTypeEnum,
  SchoolStepStatusEnum,
} from '@cometa/trpc/src/admissions/types';
import { Tooltip } from '/src/components/atoms/Tooltip';
import {
  ConfigurationLayout,
  ConfigurationHeader,
  ToggleableListItem,
  PhoneHeader,
  PhoneBody,
  PhoneContainer,
  PhoneSectionPreview,
  PhoneBooleanSectionPreview,
} from '/src/components/admissions/setup/shared';
import { useToast } from '/src/components/molecules/dashboard/Toast/useToast';
import { useUpdateStepStatus } from '/src/components/admissions/setup/hooks/useUpdateStepStatus';
import { motion, AnimatePresence } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type SortableToggleableListItemProps = {
  id: string;
  label: string;
  onToggle: () => void;
  isEnabled: boolean;
};

function SortableToggleableListItem({ id, label, onToggle, isEnabled }: SortableToggleableListItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-50' : ''}>
      <div className="relative">
        <ToggleableListItem id={id} label={label} onToggle={onToggle} isEnabled={isEnabled} showDragHandle />
        <div
          {...attributes}
          {...listeners}
          className="absolute left-[13px] top-1/2 transform -translate-y-1/2 cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-900 z-10"
        >
          <GripVertical className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export function DynamicFormConfiguration({
  tag,
  title,
  description,
  stepNumber,
}: {
  tag: SchoolStepTags;
  title: string;
  description: string;
  stepNumber: number;
}) {
  const { sections, enabledFields, handleFieldToggle, handleSave, handleBack, handleClose, sensors, handleDragEnd } =
    useDynamicFormConfig(tag);

  const currentQuestionIds = new Set(sections.flatMap((s) => s.questions.map((q: ProcessedQuestion) => q.id)));
  const validEnabledFields = new Set(Array.from(enabledFields).filter((id) => currentQuestionIds.has(id)));

  const isDisabled = sections.length === 0 || validEnabledFields.size === 0;
  const showTooltip = validEnabledFields.size === 0 && sections.length > 0;

  return (
    <div className="font-lota antialiased">
      <ConfigurationHeader title={title} onBack={handleBack} onClose={handleClose} />
      <ConfigurationLayout
        leftContent={
          <div className="space-y-10 max-w-[440px]">
            <div className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-[28px] font-semibold text-neutral-900">{title}</h1>
                <div className="bg-purple-50 px-2 py-1 rounded inline-flex items-center text-purple-500">
                  Paso {stepNumber}/10 de tu proceso de admisión
                </div>
              </div>
              <p className="text-neutral-700">{description}</p>
            </div>

            {sections.length > 0 ? (
              <div className="space-y-6">
                {sections.map((section) => (
                  <div key={section.id} className="space-y-4">
                    {section.name ? (
                      <div className="flex items-center gap-1">
                        <h3 className="text-lg font-semibold text-neutral-900">{section.name}</h3>
                        <Tooltip side="right" message={section.description}>
                          <Info className="w-4 h-4 text-neutral-500" />
                        </Tooltip>
                      </div>
                    ) : null}
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext
                        items={section.questions.map((question: ProcessedQuestion) => question.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2">
                          {section.questions.map((question: ProcessedQuestion) => (
                            <SortableToggleableListItem
                              key={question.id}
                              id={question.id}
                              label={question.label as string}
                              onToggle={() => handleFieldToggle(question.id, !enabledFields.has(question.id))}
                              isEnabled={enabledFields.has(question.id)}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">
                <p className="text-sm">No hay preguntas configuradas para este formulario</p>
              </div>
            )}

            {showTooltip ? (
              <Tooltip side="top" message="Debes seleccionar al menos un campo para continuar.">
                <span className="inline-block">
                  <Button onClick={handleSave} disabled>
                    Guardar
                  </Button>
                </span>
              </Tooltip>
            ) : (
              <Button onClick={handleSave} disabled={isDisabled}>
                Guardar
              </Button>
            )}
          </div>
        }
        rightContent={
          <PhoneContainer>
            <PhoneHeader title={title} description={description} />

            <PhoneBody>
              <AnimatePresence>
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {sections
                    .filter((section) => section.questions.some((q: ProcessedQuestion) => enabledFields.has(q.id)))
                    .map((section, _index) => {
                      const sectionQuestions = section.questions.filter((q: ProcessedQuestion) =>
                        enabledFields.has(q.id)
                      );
                      if (sectionQuestions.length === 0) return null;

                      const isConsentForm = tag === SchoolStepTags.ConsentForm;

                      return (
                        <motion.div
                          key={section.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{
                            duration: 0.3,
                            ease: 'easeInOut',
                            layout: { duration: 0.4, ease: 'easeInOut' },
                          }}
                        >
                          {isConsentForm ? (
                            <PhoneBooleanSectionPreview
                              title={section.name}
                              questions={sectionQuestions.map((q: ProcessedQuestion) => ({
                                id: q.id,
                                label: q.label,
                                description: q.description,
                                type: q.type,
                              }))}
                            />
                          ) : (
                            <PhoneSectionPreview
                              title={section.name}
                              fields={sectionQuestions.map((q: ProcessedQuestion) => q.id)}
                              fieldLabels={sectionQuestions.reduce(
                                (acc: Record<string, string>, question: ProcessedQuestion) => {
                                  acc[question.id] = question.label;
                                  return acc;
                                },
                                {} as Record<string, string>
                              )}
                            />
                          )}
                        </motion.div>
                      );
                    })}

                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      layout: { duration: 0.4, ease: 'easeInOut' },
                    }}
                  >
                    <Button variant="neutral" size="sm" className="w-full">
                      Guardar
                    </Button>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </PhoneBody>
          </PhoneContainer>
        }
      />
    </div>
  );
}

type ProcessedQuestion = {
  id: string;
  label: string;
  type: string;
  description: string;
};

type ProcessedSection = {
  id: string;
  name: string;
  description: string;
  questions: ProcessedQuestion[];
};

function createSectionId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '_');
}

function createQuestionFromTemplate(templateQuestion: QuestionEntity): ProcessedQuestion {
  return {
    id: templateQuestion.id as string,
    label: templateQuestion.entity_question?.name || templateQuestion.name || '',
    type: templateQuestion.entity_question?.type?.toString() || templateQuestion.type?.toString() || '',
    description: templateQuestion.entity_question?.description || templateQuestion.description || '',
  };
}

function findMatchingTemplateQuestion(savedQuestion: QuestionEntity, templateQuestions: QuestionEntity[]) {
  return templateQuestions.find(
    (tq) =>
      tq.name === savedQuestion.name ||
      tq.entity_question?.name === savedQuestion.name ||
      tq.entity_question?.name === savedQuestion.entity_question?.name
  );
}

function processSavedQuestions(savedSection: FormSection, templateSection: FormSection): ProcessedQuestion[] {
  if (!savedSection.questions) return [];

  return savedSection.questions.flatMap(
    (questionGroup) =>
      questionGroup
        ?.map((savedQ) => {
          if (!savedQ) return null;

          const flatTemplateQuestions = templateSection.questions.flatMap((tqg) => tqg);
          const templateQuestion = findMatchingTemplateQuestion(savedQ, flatTemplateQuestions);

          return templateQuestion ? createQuestionFromTemplate(templateQuestion) : null;
        })
        .filter((q): q is ProcessedQuestion => q !== null) || []
  );
}

function processSavedFormSections(savedLayout: FormSection[], templateLayout: FormSection[]): ProcessedSection[] {
  return savedLayout
    .map((savedSection) => {
      if (!savedSection) return null;

      const templateSection = templateLayout.find((ts) => ts.name === savedSection.name);

      if (!templateSection) return null;

      return {
        id: createSectionId(savedSection.name),
        name: savedSection.name,
        description: savedSection.description || '',
        questions: processSavedQuestions(savedSection, templateSection),
      };
    })
    .filter((section): section is ProcessedSection => section !== null);
}

function processTemplateSections(templateLayout: FormSection[]): ProcessedSection[] {
  return templateLayout.map((section) => ({
    id: createSectionId(section.name),
    name: section.name,
    description: section.description || '',
    questions: section.questions.flatMap((questionGroup) => questionGroup.map((q) => createQuestionFromTemplate(q))),
  }));
}

function getForm(createdBy: string, category: SchoolStepTags) {
  const { data, ...queryResult } = api.forms.getDynamicForm.useQuery({ createdBy, category }, { enabled: !!createdBy });

  const form = data?.[0];

  return { data: form, ...queryResult };
}

export function useDynamicFormConfig(tag: SchoolStepTags) {
  const router = useRouter();
  const selectedSchool = useSelectedSchool();
  const schoolId = selectedSchool?.id as string;
  const { toast } = useToast();
  const utils = api.useUtils();

  const { updateStepToDraft, currentStep, upsertSchoolSteps } = useUpdateStepStatus(tag);

  const updateStepRedirectUrls = useCallback(
    async (formId: string) => {
      if (!currentStep) return;

      const redirectUrl = `forms/${formId}`;

      const updatedStep = {
        ...currentStep,
        id: currentStep.id,
        name: currentStep.name as string,
        description: currentStep.description as string,
        school_id: currentStep.school_id as string,
        order: currentStep.order as number,
        tag: currentStep.tag as SchoolStepTags,
        type: currentStep.type as SchoolStepTypeEnum,
        status: SchoolStepStatusEnum.Draft,
        rules: currentStep.rules,
        actions: {
          ...currentStep.actions,
          to_do: {
            ...currentStep.actions?.to_do,
            label: currentStep.actions?.to_do?.label || 'Completar',
            redirect_url: redirectUrl,
          },
          in_progress: {
            ...currentStep.actions?.in_progress,
            label: currentStep.actions?.in_progress?.label || 'Continuar',
            redirect_url: currentStep.actions?.in_progress?.redirect_url || '',
          },
          completed: {
            ...currentStep.actions?.completed,
            label: currentStep.actions?.completed?.label || 'Revisar',
            redirect_url: redirectUrl,
          },
        },
      };

      await upsertSchoolSteps.mutateAsync([updatedStep]);
      await utils.admissions.getSchoolSteps.invalidate({ schoolId });
    },
    [currentStep, upsertSchoolSteps, utils, schoolId]
  );

  const { data: templateForm } = getForm(process.env.NEXT_PUBLIC_SCHOOL_ID_FOR_FORM as string, tag);
  const { data: existingForm } = getForm(schoolId, tag);

  const sections = useMemo(() => {
    if (!templateForm?.layout) return [];

    return existingForm?.layout && templateForm?.layout
      ? processSavedFormSections(existingForm.layout as FormSection[], templateForm.layout as FormSection[])
      : processTemplateSections((templateForm.layout as FormSection[]) || []);
  }, [templateForm, existingForm]);

  const allQuestions = useMemo(() => sections.flatMap((section) => section.questions), [sections]);
  const [enabledFields, setEnabledFields] = useState<Set<string>>(new Set());
  const [localSections, setLocalSections] = useState<ProcessedSection[]>(sections);

  useEffect(() => {
    setLocalSections(sections);
  }, [sections]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocalSections((sections) => {
        let activeSectionIndex = -1;
        let activeQuestionIndex = -1;
        let overSectionIndex = -1;
        let overQuestionIndex = -1;

        sections.forEach((section, sectionIdx) => {
          section.questions.forEach((question, questionIdx) => {
            if (question.id === active.id) {
              activeSectionIndex = sectionIdx;
              activeQuestionIndex = questionIdx;
            }
            if (question.id === over.id) {
              overSectionIndex = sectionIdx;
              overQuestionIndex = questionIdx;
            }
          });
        });

        if (activeSectionIndex === overSectionIndex && activeSectionIndex !== -1) {
          const newSections = [...sections];
          const section = newSections[activeSectionIndex];
          section.questions = arrayMove(section.questions, activeQuestionIndex, overQuestionIndex);
          return newSections;
        }

        return sections;
      });
    }
  }, []);

  useEffect(() => {
    if (allQuestions.length === 0) return;

    if (existingForm?.layout) {
      const enabledQuestionIds = new Set<string>();
      existingForm.layout.forEach((section) => {
        section.questions?.forEach((questionGroup) => {
          questionGroup?.forEach((question) => {
            if (question.entity_question?.is_visible) {
              const questionId = question.entity_question?.id;
              const questionName = question.entity_question?.name;

              if (questionId) enabledQuestionIds.add(questionId);

              if (questionName) {
                const match = allQuestions.find(
                  (q) =>
                    q.label === questionName ||
                    q.label?.includes(questionName) ||
                    questionName.includes(q.label as string)
                );
                if (match) enabledQuestionIds.add(match.id);
              }
            }
          });
        });
      });
      setEnabledFields(enabledQuestionIds);
    } else {
      setEnabledFields(new Set(allQuestions.map((q) => q.id)));
    }
  }, [allQuestions, existingForm]);

  const createFormMutation = api.forms.createForm.useMutation({
    onSuccess: async (data) => {
      await utils.forms.getDynamicForm.invalidate();

      if (data?.id) {
        await updateStepRedirectUrls(data.id);
      } else {
        await updateStepToDraft();
      }

      toast({ title: 'Los cambios han sido guardados', variant: 'success' });
      router.push('/admissions/setup?config=true');
    },
    onError: () => {
      toast({ title: 'Error al guardar los cambios', variant: 'error' });
    },
  });

  const updateFormMutation = api.forms.updateForm.useMutation({
    onSuccess: async () => {
      await utils.forms.getDynamicForm.invalidate();
      await updateStepToDraft();
      toast({ title: 'Los cambios han sido guardados', variant: 'success' });
      router.push('/admissions/setup?config=true');
    },
    onError: () => {
      toast({ title: 'Error al guardar los cambios', variant: 'error' });
    },
  });

  function handleFieldToggle(field: string, enabled: boolean) {
    setEnabledFields((prev) => {
      const newSet = new Set(prev);
      if (enabled) newSet.add(field);
      else newSet.delete(field);
      return newSet;
    });
  }

  function handleSave() {
    const layout = localSections.map((section) => ({
      name: section.name,
      description: section.description,
      questions: [
        section.questions.map((q) => ({
          original_name: q.label,
          name: q.label,
          description: null,
          type: q.type,
          is_visible: enabledFields.has(q.id),
          is_required: enabledFields.has(q.id),
          extra: null,
        })),
      ],
    }));

    if (existingForm?.id) {
      const updateData = {
        name: templateForm?.name as string,
        description: templateForm?.description || null,
        layout,
        created_by: schoolId,
        category: tag,
      };
      updateFormMutation.mutate({ id: existingForm.id, data: updateData });
    } else {
      const createData = {
        name: templateForm?.name as string,
        description: templateForm?.description || null,
        layout,
        created_by: schoolId,
        category: tag,
      };
      createFormMutation.mutate(createData);
    }
  }

  return {
    sections: localSections,
    enabledFields,
    handleFieldToggle,
    handleSave,
    handleBack: () => router.push('/admissions/setup?config=true'),
    handleClose: () => router.push('/admissions/setup?config=true'),
    sensors,
    handleDragEnd,
  };
}
