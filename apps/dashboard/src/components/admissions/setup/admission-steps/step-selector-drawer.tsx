import { useState, useEffect } from 'react';
import { SchoolStepTags, SchoolStepEntity } from '@cometa/trpc/src/admissions/types';
import { ConfigurationDrawer } from '/src/components/admissions/setup/shared';
import { CheckboxCard } from '@cometa/recreo/v2';

type AvailableStep = {
  id: string;
  name: string;
  description: string;
  isSelected: boolean;
  isDisabled?: boolean;
  badge?: string;
};

type StepSelectorDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  onSaveSelection: (selectedSteps: string[]) => void;
  existingSchoolSteps?: SchoolStepEntity[];
  isLoading?: boolean;
};

export function StepSelectorDrawer({
  isOpen,
  onClose,
  onSaveSelection,
  existingSchoolSteps = [],
  isLoading = false,
}: StepSelectorDrawerProps) {
  const existingStepTags = existingSchoolSteps
    .filter((step) => !step.deleted_at)
    .map((step) => step.tag)
    .filter(Boolean);

  const [availableSteps, setAvailableSteps] = useState<AvailableStep[]>([
    {
      id: SchoolStepTags.ScholarInfo,
      name: 'Información escolar',
      description: 'Para que las familias revisen materiales del colegio.',
      isSelected: existingStepTags.includes(SchoolStepTags.ScholarInfo),
    },
    {
      id: SchoolStepTags.ApplicationForm,
      name: 'Datos adicionales del postulante',
      description: 'Para recopilar datos adicionales del estudiante y su familia.',
      isSelected: existingStepTags.includes(SchoolStepTags.ApplicationForm),
    },
    {
      id: SchoolStepTags.MedicalForm,
      name: 'Ficha médica',
      description: 'Para registrar información de salud y autorizaciones médicas.',
      isSelected: existingStepTags.includes(SchoolStepTags.MedicalForm),
    },
    {
      id: SchoolStepTags.PsychopedagogicalForm,
      name: 'Información psicopedagógica',
      description: 'Para conocer el contexto emocional, familiar y escolar del estudiante.',
      isSelected: existingStepTags.includes(SchoolStepTags.PsychopedagogicalForm),
    },
    {
      id: SchoolStepTags.ConsentForm,
      name: 'Acuerdos y permisos',
      description: 'Para que las familias acepten políticas del colegio.',
      isSelected: existingStepTags.includes(SchoolStepTags.ConsentForm),
    },
    {
      id: SchoolStepTags.Documents,
      name: 'Carga de documentos',
      description: 'Para solicitar documentos como CURP, boletas o certificados.',
      isSelected: existingStepTags.includes(SchoolStepTags.Documents),
    },
    {
      id: SchoolStepTags.PaymentFee,
      name: 'Pago de tarifas',
      description: 'Para cobrar tarifas del proceso de admisión directamente en Cometa.',
      isSelected: existingStepTags.includes(SchoolStepTags.PaymentFee),
      isDisabled: true,
      badge: 'PRÓXIMAMENTE',
    },
    {
      id: SchoolStepTags.VisitSchool,
      name: 'Visita al colegio',
      description: 'Para agendar una visita presencial o reunión con las familias.',
      isSelected: existingStepTags.includes(SchoolStepTags.VisitSchool),
    },
    {
      id: SchoolStepTags.AdmissionExam,
      name: 'Agendar examen',
      description: 'Para coordinar una evaluación del postulante antes de la aceptación.',
      isSelected: existingStepTags.includes(SchoolStepTags.AdmissionExam),
    },
    {
      id: SchoolStepTags.DocumentsValidation,
      name: 'Validación de documentos',
      description: 'Para revisar y aprobar documentos que subieron las familias.',
      isSelected: existingStepTags.includes(SchoolStepTags.DocumentsValidation),
    },
  ]);

  useEffect(() => {
    const existingTags = existingSchoolSteps
      .filter((step) => !step.deleted_at)
      .map((step) => step.tag)
      .filter(Boolean);
    setAvailableSteps((prevSteps) =>
      prevSteps.map((step) => ({
        ...step,
        isSelected: existingTags.includes(step.id as SchoolStepTags),
      }))
    );
  }, [existingSchoolSteps]);

  function toggleStep(stepId: string) {
    const updatedSteps = availableSteps.map((step) =>
      step.id === stepId && !step.isDisabled ? { ...step, isSelected: !step.isSelected } : step
    );
    setAvailableSteps(updatedSteps);
  }

  function handleSave() {
    const selectedStepIds = availableSteps.filter((step) => step.isSelected).map((step) => step.id);
    onSaveSelection(selectedStepIds);
    onClose();
  }

  function handleDiscard() {
    onClose();
  }

  const selectedCount = availableSteps.filter((step) => step.isSelected).length;

  return (
    <ConfigurationDrawer
      isOpen={isOpen}
      onClose={handleDiscard}
      onSave={handleSave}
      title="Configurar pasos"
      isLoading={isLoading}
      isSaveDisabled={selectedCount === 0}
      saveDisabledTooltip="Debes seleccionar al menos un paso para el proceso de admisión"
    >
      <div className="space-y-6">
        <p className="text-neutral-700">
          Selecciona los pasos que quieres agregar a tu proceso de admisión. Puedes elegir más de uno. Esto te ayudará a
          construir el flujo ideal según tus necesidades.
        </p>

        <div className="space-y-2">
          {availableSteps.map((step) => (
            <div key={step.id} className="relative">
              <CheckboxCard
                id={step.id}
                title={step.name}
                description={step.description}
                badge={
                  step.badge ? (
                    <span className="px-2 py-1 rounded-sm text-[10px] font-bold bg-success-200 text-success-900">
                      {step.badge}
                    </span>
                  ) : null
                }
                checked={step.isSelected}
                onCheckedChange={() => toggleStep(step.id)}
                disabled={step.isDisabled}
              />
            </div>
          ))}
        </div>
      </div>
    </ConfigurationDrawer>
  );
}
