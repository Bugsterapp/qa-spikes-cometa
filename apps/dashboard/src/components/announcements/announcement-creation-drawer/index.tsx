import StepWizard from '/src/components/step-wizard';
import CreateContentStep from '/src/components/announcements/steps/create-content-step';
import AudiencePickerStep from '/src/components/announcements/steps/audience-picker-step';
import ConfigurationSendStep from '/src/components/announcements/steps/configuration-send-step';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useCallback, useRef } from 'react';
import { X } from 'lucide-react';
import AnnouncementPrevisualization from '../steps/components/announcements-previsualization';
import { useSelectedSchoolId } from '/src/guards/AuthGuard';
import { useSession } from 'next-auth/react';
import useAlert, { defaultAlertTime } from '/src/hooks/useAlert';
import { CommunicationDetail } from '@cometa/trpc/src/announcements/types';
import { useEffect } from 'react';
import SaveDraftModal from '../save-draft-modal';
import { CampaignStatus } from '@cometa/trpc/src/announcements/types';
import { formatInTimeZone } from 'date-fns-tz';
import { useSendEvent, useSendPageEvent } from '/src/hooks/useSendEvent';
import { PageViewedCategory, TrackEvents } from '/src/constants/events';

const panelMotion = {
  initial: { opacity: 0, x: '100%' },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: '100%' },
  transition: { duration: 0.25, ease: 'easeInOut' },
};

export const QuestionSchema = z.discriminatedUnion('question_type', [
  z.object({
    question_type: z.literal('text'),
    requires_response: z.boolean().optional(),
    statement: z.string().min(1, 'El enunciado es requerido'),
    open: z.string().optional(),
    options: z.optional(z.array(z.any())),
  }),
  z.object({
    question_type: z.literal('options'),
    requires_response: z.boolean().optional(),
    statement: z.string().min(1, 'El enunciado es requerido'),
    options: z
      .array(z.object({ value: z.string().min(1, 'La opción no puede estar vacía') }))
      .min(2, 'Al menos 2 opciones')
      .max(5, 'Máximo 5 opciones'),
    open: z.optional(z.string()),
  }),
]);

export const schema = z
  .object({
    title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
    description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
    cover_image: z.any().optional(),
    question: z.array(QuestionSchema).max(5).optional(),
    form: z.object({ questions: z.array(QuestionSchema).max(5).optional() }).optional(),
    files_list: z
      .array(z.any())
      .refine(
        (files) =>
          files.every(
            (f) =>
              (typeof File !== 'undefined' && f instanceof File) ||
              (f && typeof f === 'object' && 'isExisting' in f && f.isExisting === true)
          ),
        {
          message: 'Todos los elementos deben ser archivos válidos',
        }
      )
      .refine(
        (files) => {
          const totalSize = files.reduce((sum, f) => {
            if (typeof File !== 'undefined' && f instanceof File) {
              return sum + f.size;
            }
            return sum;
          }, 0);
          return totalSize <= 25 * 1024 * 1024; // 25MB total in bytes
        },
        {
          message: 'El tamaño total de todos los archivos debe ser máximo 25MB',
        }
      )
      .optional(),
    execution_time: z.union([z.string(), z.date(), z.null()]).optional(),
    execution_date: z.string().optional(),
    execution_time_part: z.string().optional(),
    response_deadline: z.union([z.string(), z.date(), z.null()]).optional(),
    response_deadline_accepted: z.boolean().optional(),
    response_date: z.string().optional(),
    response_time_part: z.string().optional(),
    requires_response: z.boolean().optional().default(false),
    communication_status: z.enum(['active', 'active', 'draft', 'completed']).default('active'),
    filters: z.object({
      student_ids: z
        .array(z.string(), {
          required_error: 'Debes proporcionar una lista de estudiantes',
        })
        .min(1, 'Debes seleccionar al menos un estudiante'),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.response_deadline_accepted === true) {
      if (!data.response_date) {
        ctx.addIssue({
          path: ['response_date'],
          code: z.ZodIssueCode.custom,
          message: 'La fecha límite de respuesta es obligatoria cuando está habilitada.',
        });
      }

      if (!data.response_time_part) {
        ctx.addIssue({
          path: ['response_time_part'],
          code: z.ZodIssueCode.custom,
          message: 'La hora límite de respuesta es obligatoria cuando está habilitada.',
        });
      }
    }

    // Only validate execution date/time if we have execution_time set (scheduled send)
    if (data.communication_status === 'active' && data.execution_time) {
      if (!data.execution_date) {
        ctx.addIssue({
          path: ['execution_date'],
          code: z.ZodIssueCode.custom,
          message: 'La fecha de ejecución es obligatoria cuando se programa el envío.',
        });
      }

      if (!data.execution_time_part) {
        ctx.addIssue({
          path: ['execution_time_part'],
          code: z.ZodIssueCode.custom,
          message: 'La hora de ejecución es obligatoria cuando se programa el envío.',
        });
      }
    }
  });

export type Question = z.infer<typeof QuestionSchema>;
export type TypeSchema = z.infer<typeof schema>;
interface AnnouncementCreationDrawerProps {
  announcementDetail: CommunicationDetail | undefined;
  action: () => void;
  refetchAnnouncements?: () => void;
}

function AnnouncementCreationDrawer({
  announcementDetail,
  action,
  refetchAnnouncements,
}: AnnouncementCreationDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
  const schoolId = useSelectedSchoolId();
  const { data: session } = useSession();
  const [isSending, setIsSending] = useState(false);
  const { setAlertState } = useAlert();
  const initialFormValues = useRef<Partial<TypeSchema> | null>(null);

  const isEditMode = !!announcementDetail;

  const methods = useForm<TypeSchema>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const {
    control,
    handleSubmit,
    trigger,
    setError,
    getValues,
    setError: setFormError,
    clearErrors,
    watch,
    reset,
    formState: { errors },
  } = methods;

  const convertFileMetadataToExistingFiles = (files: any[]) =>
    files.map((file) => ({
      url: file.url,
      name: file.name,
      isExisting: true as const,
      size: file.size,
    }));

  const transformAnnouncementToFormData = (announcement: CommunicationDetail): Partial<TypeSchema> => ({
    title: announcement.title,
    description: announcement.description,
    cover_image: announcement.cover_image?.url,
    communication_status:
      announcement?.status === 'completed'
        ? 'active'
        : (announcement?.status as 'active' | 'active' | 'draft' | undefined),
    question: announcement.form?.questions
      ? ((announcement.form.questions as any[]).map((q) => ({
          ...q,
          requires_response: q.is_required ?? false,
        })) as Question[])
      : undefined,
    execution_time: announcement.execution_time,
    execution_date: announcement.execution_time
      ? new Date(announcement.execution_time).toISOString().split('T')[0]
      : undefined,
    execution_time_part: announcement.execution_time
      ? new Date(announcement.execution_time).toTimeString().slice(0, 5)
      : undefined,
    response_deadline: announcement.response_deadline,
    response_deadline_accepted: !!announcement.response_deadline,
    response_date: announcement.response_deadline
      ? new Date(announcement.response_deadline).toISOString().split('T')[0]
      : undefined,
    response_time_part: announcement.response_deadline
      ? new Date(announcement.response_deadline).toTimeString().slice(0, 5)
      : undefined,
    requires_response: Array.isArray(announcement.form?.questions)
      ? (announcement.form.questions as any[]).some((q) => 'is_required' in q && q.is_required)
      : false,
    filters: { student_ids: (announcement.filters as any)?.student_ids ?? [] },
    files_list: announcement.files_list ?? [],
  });

  useEffect(() => {
    const initializeForm = async () => {
      if (announcementDetail) {
        const formData = transformAnnouncementToFormData(announcementDetail);
        if (announcementDetail.files_list && Array.isArray(announcementDetail.files_list)) {
          try {
            const fileObjects = convertFileMetadataToExistingFiles(announcementDetail.files_list);
            formData.files_list = fileObjects;
          } catch (error) {
            formData.files_list = [];
          }
        }

        initialFormValues.current = formData;
        reset(formData);
        // Trigger validation after loading announcement data to show errors immediately
        setTimeout(() => trigger(), 0);
      } else {
        initialFormValues.current = null;
      }
    };

    initializeForm();
  }, [reset, trigger]);

  const sendPageEvent = useSendPageEvent();
  const sendEvent = useSendEvent();

  useEffect(() => {
    sendPageEvent(TrackEvents.announcements.pageViewedNewAnnouncement, PageViewedCategory);
  }, []);

  const hasFormContent = useCallback(() => {
    const values = getValues();

    const hasTitle = values.title && values.title.trim().length > 0;
    const hasDescription = values.description && values.description.trim().length > 0;
    const hasCoverImage = values.cover_image !== undefined && values.cover_image !== null;
    const hasFiles = values.files_list && values.files_list.length > 0;
    const hasQuestions = values.question && values.question.length > 0;
    const hasFilters = values.filters?.student_ids && values.filters.student_ids.length > 0;

    return hasTitle || hasDescription || hasCoverImage || hasFiles || hasQuestions || hasFilters;
  }, [getValues]);

  const hasFormChanged = useCallback(() => {
    if (!isEditMode || !initialFormValues.current) {
      return hasFormContent();
    }

    const currentValues = getValues();
    const initialValues = initialFormValues.current;

    // Compare basic fields
    if (currentValues.title !== initialValues.title) return true;
    if (currentValues.description !== initialValues.description) return true;
    if (currentValues.cover_image !== initialValues.cover_image) return true;

    // Compare execution settings
    if (currentValues.execution_date !== initialValues.execution_date) return true;
    if (currentValues.execution_time_part !== initialValues.execution_time_part) return true;
    if (currentValues.response_deadline_accepted !== initialValues.response_deadline_accepted) return true;
    if (currentValues.response_date !== initialValues.response_date) return true;
    if (currentValues.response_time_part !== initialValues.response_time_part) return true;
    if (currentValues.communication_status !== initialValues.communication_status) return true;

    // Compare student filters
    const currentStudentIds = currentValues.filters?.student_ids || [];
    const initialStudentIds = initialValues.filters?.student_ids || [];
    if (JSON.stringify(currentStudentIds.sort()) !== JSON.stringify(initialStudentIds.sort())) return true;

    // Compare questions
    const currentQuestions = currentValues.question || [];
    const initialQuestions = initialValues.question || [];
    if (JSON.stringify(currentQuestions) !== JSON.stringify(initialQuestions)) return true;

    // Compare files
    const currentFiles = currentValues.files_list || [];
    const initialFiles = initialValues.files_list || [];
    if (currentFiles.length !== initialFiles.length) return true;

    return false;
  }, [getValues, isEditMode]);

  const handleCloseAttempt = useCallback(() => {
    if (hasFormChanged() && announcementDetail?.status !== 'active' && announcementDetail?.status !== 'executing') {
      setShowSaveDraftModal(true);
    } else {
      reset();
      setCurrentStep(0);
      action();
    }
  }, [hasFormChanged, reset, setCurrentStep, action]);

  const handleSaveDraft = useCallback(async () => {
    const values = getValues();

    const draftData = {
      ...values,
      communication_status: 'draft' as const,
    };

    const formData = new FormData();

    if (draftData.question && Array.isArray(draftData.question)) {
      const updatedQuestions = draftData.question.map((question) => ({
        statement: question.statement,
        question_type: question.question_type,
        is_required: question.requires_response ?? (draftData.requires_response || false),
        options: question.question_type === 'text' ? undefined : question.options?.map((option) => option.value),
      }));

      if (updatedQuestions.length > 0) {
        formData.append('form', JSON.stringify({ questions: updatedQuestions }));
      }
    }

    formData.append('school_id', schoolId ?? '');
    formData.append('title', draftData.title || 'Borrador sin título');
    formData.append('created_by', session?.user?.id ?? '');

    const draftDescriptionWithBreaks = (draftData.description || '').replace(/<p><\/p>/g, '<p><br></p>');
    formData.append('description', draftDescriptionWithBreaks);
    formData.append('communication_status', 'draft');

    if (draftData.cover_image instanceof File) {
      formData.append('cover_image', draftData.cover_image);
    }

    if (Array.isArray(draftData.files_list)) {
      draftData.files_list.forEach((file) => {
        if (file instanceof File) {
          formData.append('files_list', file);
        }
      });
    }

    if (draftData.filters) {
      formData.append('filters', JSON.stringify(draftData.filters));
    }

    try {
      setIsSending(true);
      let response;
      if (announcementDetail?.status === 'draft') {
        response = await fetch(
          `${process.env.NEXT_PUBLIC_COMETARDO_API_BASE_URL}/dashboard/${announcementDetail?.id}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_ANNOUNCEMENTS_API_TOKEN}`,
            },
            body: formData,
          }
        );
      } else {
        response = await fetch(`${process.env.NEXT_PUBLIC_COMETARDO_API_BASE_URL}/dashboard/`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_ANNOUNCEMENTS_API_TOKEN}`,
          },
          body: formData,
        });
      }

      if (response.ok) {
        setAlertState({
          open: true,
          severity: 'success',
          message: 'Borrador guardado correctamente',
          alertTime: defaultAlertTime,
        });

        setShowSaveDraftModal(false);
        clearLocalStorage();
        setIsSending(false);

        // Refetch announcements list after saving draft
        if (refetchAnnouncements) {
          refetchAnnouncements();
        }

        reset();
        setCurrentStep(0);
        action();
      } else {
        throw new Error('Failed to save draft');
      }
    } catch (error) {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Error al guardar el borrador',
        alertTime: defaultAlertTime,
      });
      setIsSending(false);
    }
  }, [getValues, schoolId, session?.user?.id, setAlertState, reset, setCurrentStep, action]);

  const handleDiscardChanges = useCallback(() => {
    setShowSaveDraftModal(false);
    localStorage.removeItem('announcementDraft');
    reset();
    setCurrentStep(0);
    action();
  }, [reset, setCurrentStep, action]);

  const clearLocalStorage = useCallback(() => {
    localStorage.removeItem('announcementDraft');
  }, []);

  const filters = watch('filters');
  const isStepValid = currentStep === 1 ? filters?.student_ids && filters.student_ids.length > 0 : true;

  // Trigger validation when filters change
  useEffect(() => {
    if (filters) {
      trigger('filters');
    }
  }, [filters, trigger]);

  const validateStepFields = async (step: number) => {
    const fieldsToValidate: Record<number, (keyof TypeSchema)[]> = {
      0: ['title', 'description', 'question'],
      1: ['filters'],
      2: [],
    };

    const fields = fieldsToValidate[step] || [];
    if (fields.length === 0) return true;

    if (step === 0) {
      const formValues = getValues();
      const questions = formValues.question;

      if (questions && questions.length > 0) {
        let hasErrors = false;

        questions.forEach((question, questionIndex) => {
          if (question.question_type === 'options' && question.options) {
            question.options.forEach((option, optionIndex) => {
              if (!option.value || option.value.trim() === '') {
                setFormError(`question.${questionIndex}.options.${optionIndex}.value` as any, {
                  type: 'manual',
                  message: 'La opción no puede estar vacía',
                });
                hasErrors = true;
              }
            });
          }
        });

        if (hasErrors) {
          return false;
        }
      }
    }

    if (step === 1) {
      const formValues = getValues();
      if (!formValues.filters?.student_ids || formValues.filters.student_ids.length === 0) {
        setFormError('filters.student_ids', {
          type: 'manual',
          message: 'Debes seleccionar al menos un estudiante',
        });
        return false;
      }
      clearErrors('filters.student_ids');
    }

    return await trigger(fields as any);
  };

  const onSubmit = async (data: TypeSchema) => {
    sendEvent(TrackEvents.announcements.announcementSendClicked);
    const formData = new FormData();
    setIsSending(true);

    const requiresResponse = data.requires_response || false;

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const appendZonedDate = (key: string, value?: string | Date | null) => {
      if (!value) return;
      const date = new Date(value);
      if (isNaN(date.getTime())) return;
      const localWithOffset = formatInTimeZone(date, timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX");
      formData.append(key, localWithOffset);
    };

    if (data.question && Array.isArray(data.question)) {
      const updatedQuestions = data.question.map((question) => ({
        statement: question.statement,
        question_type: question.question_type,
        is_required: question.requires_response ?? requiresResponse,
        options: question.question_type === 'text' ? undefined : question.options?.map((option) => option.value),
      }));

      if (updatedQuestions.length > 0) {
        formData.append('form', JSON.stringify({ questions: updatedQuestions }));
      } else {
        formData.append('form', JSON.stringify({ questions: [] }));
      }
    } else {
      formData.append('form', JSON.stringify({ questions: [] }));
    }

    appendZonedDate('response_deadline', data.response_deadline);
    appendZonedDate('execution_time', data.execution_time);
    formData.append('school_id', schoolId ?? '');
    formData.append('title', data.title);
    formData.append('created_by', session?.user?.id ?? '');

    const descriptionWithBreaks = data.description.replace(/<p><\/p>/g, '<p><br></p>');
    formData.append('description', descriptionWithBreaks);

    // When hitting "enviar", always send as active (even if editing a draft)
    const finalStatus =
      data.communication_status === CampaignStatus.Draft ? CampaignStatus.Active : data.communication_status;
    formData.append('communication_status', finalStatus);
    if (data.cover_image instanceof File) {
      formData.append('cover_image', data.cover_image);
    }

    if (Array.isArray(data.files_list)) {
      data?.files_list?.forEach((file) => {
        if (file instanceof File) {
          formData.append('files_list', file);
        }
      });
    }

    if (data.filters) {
      formData.append('filters', JSON.stringify(data.filters));
    }

    try {
      const url = isEditMode
        ? `${process.env.NEXT_PUBLIC_COMETARDO_API_BASE_URL}/dashboard/${announcementDetail?.id}`
        : `${process.env.NEXT_PUBLIC_COMETARDO_API_BASE_URL}/dashboard/`;

      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_ANNOUNCEMENTS_API_TOKEN}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        setError('root', {
          type: 'validate',
          message: `Error al ${isEditMode ? 'actualizar' : 'crear'} el comunicado: ${errorText}`,
        });
        setIsSending(false);
        setAlertState({
          open: true,
          severity: 'error',
          message: `Error al ${isEditMode ? 'actualizar' : 'crear'} comunicado`,
          alertTime: defaultAlertTime,
        });
        return;
      }

      await response.json();
      setIsSending(false);
      setAlertState({
        open: true,
        severity: 'success',
        message: `Comunicado ${isEditMode ? 'actualizado' : 'creado'} correctamente`,
        alertTime: defaultAlertTime,
      });
      clearLocalStorage();

      if (refetchAnnouncements) {
        refetchAnnouncements();
      }

      action();
    } catch (error) {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Error al crear comunicado',
        alertTime: defaultAlertTime,
      });
      setIsSending(false);
      setError('root', { type: 'validate', message: 'Error al crear el anuncio' });
    }
  };

  const steps = [
    {
      title: 'Crea tu contenido',
      content: <CreateContentStep formErrors={errors} />,
      value: 'step-1',
    },
    {
      title: 'Elige tu audiencia',
      content: <AudiencePickerStep />,
      value: 'step-2',
    },
    {
      title: 'Configura y envia',
      content: <ConfigurationSendStep formControl={control as any} isEditMode={isEditMode} />,
      value: 'step-3',
    },
  ];

  return (
    <FormProvider {...methods}>
      <div className="w-full h-full">
        <form onSubmit={handleSubmit(onSubmit)}>
          <StepWizard
            title={isEditMode ? 'Editar comunicado' : 'Nuevo comunicado'}
            steps={steps}
            hasErrors={Object.keys(errors).length !== 0}
            action={handleCloseAttempt}
            formTrigger={() => validateStepFields(currentStep)}
            onOpenPrev={(open) => {
              sendEvent(TrackEvents.announcements.audiencePreviewClicked);
              setIsOpen(open);
            }}
            onStepChange={setCurrentStep}
            isStepValid={isStepValid}
            isSending={isSending}
            initialCompletedSteps={isEditMode ? ['step-1', 'step-2', 'step-3'] : []}
            allowSubmitFromAnyStep={isEditMode}
            onNextStep={(nextStep) => {
              sendEvent(TrackEvents.announcements.stepNextClicked, {
                step: nextStep,
              });
            }}
            onPrevStep={() => {
              sendEvent(TrackEvents.announcements.stepperBackClicked);
            }}
          />
        </form>

        <AnimatePresence>
          {isOpen && (
            <>
              {/* Overlay oscurecido */}
              <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setIsOpen(false)} />

              {/* Drawer */}
              <motion.div
                className="fixed right-0 top-0 z-50 h-screen w-[30%] bg-white shadow-lg py-6  rounded-l-2xl"
                {...panelMotion}
              >
                {/* Botón de cerrar */}
                <div className="flex justify-between items-center border-b-2 border-gray pb-4 px-6">
                  <h2 className="font-bold text-xl leading-7 ">Previsualizar</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Contenido */}
                <div className="mt-10 flex flex-col items-center">
                  <AnnouncementPrevisualization />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Save Draft Modal */}
        <SaveDraftModal
          loading={isSending}
          isOpen={showSaveDraftModal}
          isEditing={announcementDetail?.status === 'draft'}
          onClose={() => setShowSaveDraftModal(false)}
          onSaveDraft={handleSaveDraft}
          onDiscardChanges={handleDiscardChanges}
        />
      </div>
    </FormProvider>
  );
}

export default AnnouncementCreationDrawer;
