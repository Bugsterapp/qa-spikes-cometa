import { Button } from '@cometa/recreo/v2';
import {
  SchoolStepActions,
  SchoolStepEntity,
  SchoolStepStatusEnum,
  SchoolStepTags,
  SchoolStepTypeEnum,
} from '@cometa/trpc/src/admissions/types';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Info } from 'lucide-react';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdmissionSetup } from '../context/admission-setup-context';
import { AddButton, ConfigurationLayout, PhoneBody, PhoneContainer, PhoneHeader, SortableListItem } from '../shared';
import { StepSelectorDrawer } from './step-selector-drawer';
import { Tooltip } from '/src/components/atoms/Tooltip';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { api } from '/src/utils/api';
import { useSendEvent } from '/src/hooks/useSendEvent';

export function ProcessConfigurationContainer() {
  const router = useRouter();
  const selectedSchool = useSelectedSchool();
  const schoolId = selectedSchool?.id as string;
  const [isStepSelectorOpen, setIsStepSelectorOpen] = useState(false);
  const [localSteps, setLocalSteps] = useState<SchoolStepEntity[]>([]);

  const utils = api.useUtils();

  const { data: schoolSteps = [], isPending: isLoadingSteps } = api.admissions.getSchoolSteps.useQuery(
    { schoolId, includeDeleted: true },
    { enabled: !!schoolId }
  );

  useEffect(() => {
    if (schoolSteps.length === 0) return;

    const filteredSteps = schoolSteps.filter((step) => !step.deleted_at);
    setLocalSteps((prev) => {
      if (JSON.stringify(prev) !== JSON.stringify(filteredSteps)) {
        return filteredSteps;
      }
      return prev;
    });
  }, [schoolSteps]);

  const upsertSchoolSteps = api.admissions.upsertSchoolSteps.useMutation({
    onSuccess: () => {
      utils.admissions.getSchoolSteps.invalidate({ schoolId });
    },
  });

  const deleteSchoolStep = api.admissions.deleteSchoolStep.useMutation({
    onSuccess: () => {
      utils.admissions.getSchoolSteps.invalidate({ schoolId });
    },
  });

  const configurableSteps: SchoolStepEntity[] = useMemo(() => localSteps.map((localStep) => localStep), [localSteps]);

  function handleConfigureStep(step: SchoolStepEntity) {
    if (!step) return;

    if (step.tag === SchoolStepTags.ScholarInfo) {
      router.push('/admissions/setup/scholar-info');
      return;
    }

    if (step.tag === SchoolStepTags.ApplicationForm) {
      router.push('/admissions/setup/application-form');
      return;
    }

    if (step.tag === SchoolStepTags.MedicalForm) {
      router.push('/admissions/setup/medical-form');
      return;
    }

    if (step.tag === SchoolStepTags.PsychopedagogicalForm) {
      router.push('/admissions/setup/psychopedagogical-form');
      return;
    }

    if (step.tag === SchoolStepTags.ConsentForm) {
      router.push('/admissions/setup/consentment-form');
      return;
    }

    if (step.tag === SchoolStepTags.VisitSchool) {
      router.push('/admissions/setup/visit-school');
      return;
    }

    if (step.tag === SchoolStepTags.AdmissionExam) {
      router.push('/admissions/setup/admission-exam');
      return;
    }

    if (step.tag === SchoolStepTags.Documents) {
      router.push('/admissions/setup/documents');
      return;
    }

    if (step.tag === SchoolStepTags.DocumentsValidation) {
      router.push('/admissions/setup/documents-validation');
      return;
    }
  }

  async function handleSaveStepSelection(selectedStepTags: string[]) {
    const activeSchoolSteps = schoolSteps.filter((step) => !step.deleted_at);
    const currentSelectedTags = activeSchoolSteps.map((step) => step.tag);

    const stepsToCreate = selectedStepTags.filter((tag) => !currentSelectedTags.includes(tag as SchoolStepTags));
    const stepsToDelete = activeSchoolSteps.filter((step) => !selectedStepTags.includes(step.tag as SchoolStepTags));

    if (stepsToCreate.length > 0) {
      const newSteps = stepsToCreate.map((tag) => {
        const stepTemplate = AVAILABLE_STEPS.find((step) => step.tag === tag);
        const order = selectedStepTags.indexOf(tag) + 1;
        const existingStep = schoolSteps.find((step) => step.tag === tag);

        return {
          id: existingStep?.id || null,
          name: stepTemplate?.name || '',
          order: order,
          description: stepTemplate?.description || '',
          type: stepTemplate?.type || SchoolStepTypeEnum.Form,
          school_id: schoolId,
          status: SchoolStepStatusEnum.Inactive,
          actions: createDefaultActions(),
          tag: tag as SchoolStepTags,
          rules: null,
          deleted_at: null,
        };
      });

      await upsertSchoolSteps.mutateAsync(newSteps);
    }

    for (const step of stepsToDelete) {
      if (step.id) {
        await deleteSchoolStep.mutateAsync({ schoolStepId: step.id });
      }
    }

    setIsStepSelectorOpen(false);
  }

  const onSaveStepOrder = useCallback(
    (updatedSteps: SchoolStepEntity[]) => {
      const stepsToUpdate = updatedSteps.map((step) => ({
        id: step.id,
        name: step.name || '',
        order: step.order || 0,
        description: step.description || '',
        type: step.type || SchoolStepTypeEnum.Form,
        school_id: schoolId,
        status: step.status || SchoolStepStatusEnum.Inactive,
        actions: createDefaultActions(step.actions as SchoolStepActions),
        tag: step.tag as SchoolStepTags,
        rules: step.rules,
        deleted_at: step.deleted_at,
      }));

      upsertSchoolSteps.mutate(stepsToUpdate);
    },
    [upsertSchoolSteps, schoolId]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        let updatedSteps: SchoolStepEntity[] = [];

        setLocalSteps((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over.id);

          const newItems = arrayMove(items, oldIndex, newIndex);

          updatedSteps = newItems.map((step, index) => ({
            ...step,
            order: index + 1,
          }));

          return updatedSteps;
        });

        onSaveStepOrder(updatedSteps);
      }
    },
    [onSaveStepOrder]
  );

  function handleEditSteps() {
    setIsStepSelectorOpen(true);
  }

  return (
    <>
      <ConfigurationLayout
        leftContent={
          <ProcessConfigurationContent
            configurableSteps={configurableSteps}
            isLoading={isLoadingSteps}
            onEditSteps={handleEditSteps}
            onConfigureStep={handleConfigureStep}
            onDragEnd={handleDragEnd}
          />
        }
        rightContent={<PhoneContent steps={configurableSteps} />}
      />

      <StepSelectorDrawer
        isOpen={isStepSelectorOpen}
        onClose={() => setIsStepSelectorOpen(false)}
        existingSchoolSteps={schoolSteps}
        onSaveSelection={handleSaveStepSelection}
        isLoading={upsertSchoolSteps.isPending}
      />
    </>
  );
}

function ProcessConfigurationContent({
  configurableSteps,
  isLoading,
  onEditSteps,
  onConfigureStep,
  onDragEnd,
}: {
  configurableSteps: SchoolStepEntity[];
  isLoading: boolean;
  onEditSteps: () => void;
  onConfigureStep: (step: SchoolStepEntity) => void;
  onDragEnd: (event: DragEndEvent) => void;
}) {
  const { stepCreationError, isCreatingSteps, startPublishing } = useAdmissionSetup();
  const sendTrackEvent = useSendEvent();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const totalStepCount = configurableSteps.length;
  const canPublishSteps = configurableSteps.every((step) => step.status === SchoolStepStatusEnum.Draft);

  function handlePublish() {
    sendTrackEvent('Admission Process Published', {
      totalSteps: totalStepCount,
      stepsConfiguration: configurableSteps.map((step) => ({
        tag: step.tag,
        name: step.name,
        order: step.order,
        type: step.type,
      })),
    });
    startPublishing();
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold text-neutral-900">🎉 Este es tu proceso de admisión</h1>

        <p className="text-neutral-700">
          Este es tu punto de partida. Ordena y configura los pasos que tendrán que realizar las familias.
        </p>

        {stepCreationError ? (
          <div className="flex items-center gap-3 bg-error-50 text-error-700 rounded-lg px-4 py-3 border border-error-200">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <p>Error: {stepCreationError}</p>
          </div>
        ) : null}

        {isCreatingSteps || isLoading ? (
          <div className="flex items-center gap-3 bg-blue-50 text-blue-700 rounded-lg px-4 py-3 border border-blue-200">
            <Info className="w-6 h-6 flex-shrink-0" />
            <p>{isCreatingSteps ? 'Creando pasos de admisión...' : 'Cargando pasos de admisión...'}</p>
          </div>
        ) : null}

        {totalStepCount >= 7 ? (
          <div className="flex items-center gap-3 bg-blue-50 text-blue-800 rounded-lg px-4 py-3">
            <Info className="w-6 h-6 flex-shrink-0" />
            <p>Procesos más simples funcionan mejor. Sugerimos mantener menos de 7 pasos.</p>
          </div>
        ) : null}

        {totalStepCount < 3 && !isLoading ? (
          <div className="flex items-center gap-3 bg-blue-50 text-blue-800 rounded-lg px-4 py-3">
            <Info className="w-6 h-6 flex-shrink-0" />
            <p>Menos es más. Te sugerimos un flujo minimalista para partir con lo esencial.</p>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-neutral-900">Pasos personalizados para configurar</h3>
          <Tooltip side="right" message="Estos son los pasos personalizados de tu proceso de admisión.">
            <Info className="w-4 h-4 text-neutral-500" />
          </Tooltip>
        </div>

        <div className="space-y-2">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext
              items={configurableSteps.map((step) => step.id as string)}
              strategy={verticalListSortingStrategy}
            >
              {configurableSteps.map((step) => (
                <SortableListItem
                  key={step.id}
                  item={step}
                  onClick={onConfigureStep}
                  onAction={onConfigureStep}
                  getTitle={(step) => step.name as string}
                  getNumber={(step) => step.order as number}
                  getId={(step) => step.id as string}
                  isCompleted={step.status === SchoolStepStatusEnum.Draft}
                  actionLabel="Configurar paso"
                  isDraggable
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <AddButton onClick={onEditSteps} label="Editar pasos" />
      </div>

      {canPublishSteps ? (
        <Button onClick={handlePublish}>Publicar proceso de admisión</Button>
      ) : (
        <Tooltip
          side="right"
          message="Necesitas completar la configuración de todos los pasos antes de publicar tu proceso de admisión."
        >
          <Button disabled>Publicar proceso de admisión</Button>
        </Tooltip>
      )}
    </div>
  );
}

function PhoneContent({ steps }: { steps: SchoolStepEntity[] }) {
  return (
    <PhoneContainer>
      <PhoneHeader
        title="Proceso de admisión"
        subtitle="{Nombre del postulante}"
        description="Sigue los pasos para completar tu postulación. Tu progreso se guarda automáticamente."
        isMain
      />

      <PhoneBody>
        <AnimatePresence>
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                className="relative flex items-start"
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
                <div className="absolute left-0 top-3 -bottom-6 flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full border border-neutral-300 bg-white flex items-center justify-center" />
                  {index < steps.length - 1 ? <div className="w-[1px] flex-1 bg-neutral-300" /> : null}
                </div>

                <motion.div
                  className="w-full ml-8 px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="font-semibold text-neutral-900 text-sm">{step.name}</h3>
                  <p className="text-[10px] text-neutral-600 mb-2 mt-1">{step.description}</p>
                  <Button variant="neutral" size="sm" className="py-1 h-auto">
                    Revisar
                  </Button>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </PhoneBody>
    </PhoneContainer>
  );
}

const AVAILABLE_STEPS = [
  {
    tag: SchoolStepTags.ScholarInfo,
    name: 'Información escolar',
    description: 'Para que las familias revisen materiales del colegio.',
    type: SchoolStepTypeEnum.Review,
  },
  {
    tag: SchoolStepTags.ApplicationForm,
    name: 'Datos adicionales del postulante',
    description: 'Para recopilar datos adicionales del estudiante y su familia.',
    type: SchoolStepTypeEnum.Form,
  },
  {
    tag: SchoolStepTags.MedicalForm,
    name: 'Ficha médica',
    description: 'Para registrar información de salud y autorizaciones médicas.',
    type: SchoolStepTypeEnum.Form,
  },
  {
    tag: SchoolStepTags.PsychopedagogicalForm,
    name: 'Información psicopedagógica',
    description: 'Para conocer el contexto emocional, familiar y escolar del estudiante.',
    type: SchoolStepTypeEnum.Form,
  },
  {
    tag: SchoolStepTags.ConsentForm,
    name: 'Acuerdos y permisos',
    description: 'Para que las familias acepten políticas del colegio.',
    type: SchoolStepTypeEnum.Form,
  },
  {
    tag: SchoolStepTags.Documents,
    name: 'Carga de documentos',
    description: 'Para solicitar documentos como CURP, boletas o certificados.',
    type: SchoolStepTypeEnum.Upload,
  },
  {
    tag: SchoolStepTags.PaymentFee,
    name: 'Pago de tarifas',
    description: 'Para cobrar tarifas del proceso de admisión directamente en Cometa.',
    type: SchoolStepTypeEnum.Payment,
  },
  {
    tag: SchoolStepTags.VisitSchool,
    name: 'Visita al colegio',
    description: 'Para agendar una visita presencial o reunión con las familias.',
    type: SchoolStepTypeEnum.VisitSchool,
  },
  {
    tag: SchoolStepTags.AdmissionExam,
    name: 'Agendar examen',
    description: 'Para coordinar una evaluación del postulante antes de la aceptación.',
    type: SchoolStepTypeEnum.AdmissionExam,
  },
  {
    tag: SchoolStepTags.DocumentsValidation,
    name: 'Validación de documentos',
    description: 'Para revisar y aprobar documentos que subieron las familias.',
    type: SchoolStepTypeEnum.DocsValidation,
  },
];

function createDefaultActions(actions?: SchoolStepActions) {
  return {
    to_do: {
      label: actions?.to_do?.label || 'Completar',
      redirect_url: actions?.to_do?.redirect_url || '',
    },
    in_progress: {
      label: actions?.in_progress?.label || 'Continuar',
      redirect_url: actions?.in_progress?.redirect_url || '',
    },
    completed: {
      label: actions?.completed?.label || 'Revisar',
      redirect_url: actions?.completed?.redirect_url || '',
    },
  };
}
