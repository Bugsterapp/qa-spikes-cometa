import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { api } from '/src/utils/api';
import { SchoolStepTags } from '@cometa/trpc/src/admissions/types';
import {
  ConfigurationLayout,
  ConfigurationHeader,
  ConfigurationContent,
  SectionHeader,
  ToggleableListItem,
  PhoneHeader,
  PhoneBody,
  PhoneContainer,
  PhoneSectionPreview,
} from '/src/components/admissions/setup/shared';
import { useToast } from '/src/components/molecules/dashboard/Toast/useToast';
import { useUpdateStepStatus } from '/src/components/admissions/setup/hooks/useUpdateStepStatus';
import { Button } from '@cometa/recreo/v2';
import { motion, AnimatePresence } from 'framer-motion';

export default function MedicalFormConfigurationPage() {
  const router = useRouter();
  const selectedSchool = useSelectedSchool();
  const schoolId = selectedSchool?.id as string;
  const { toast } = useToast();

  const { data: schoolSteps = [] } = api.admissions.getSchoolSteps.useQuery({ schoolId }, { enabled: !!schoolId });
  const { data: schoolConfig } = api.students.getSchoolConfig.useQuery(
    { school_id: schoolId },
    { enabled: !!schoolId }
  );

  const medicalFormStep = schoolSteps?.find((step) => step.tag === SchoolStepTags.MedicalForm);

  const stepNumber = medicalFormStep?.order || 1;

  const hiddenFields = useMemo(
    () => schoolConfig?.hidden_medical_form_fields?.split(',').filter(Boolean) || [],
    [schoolConfig?.hidden_medical_form_fields]
  );

  const allFields = useMemo(() => MEDICAL_FORM_SECTIONS.flatMap((section) => section.fields), []);
  const [enabledFields, setEnabledFields] = useState<Set<string>>(new Set(allFields));

  useEffect(() => {
    if (allFields.length === 0) return;

    const enabled = new Set<string>();
    for (const field of allFields) {
      if (!hiddenFields.includes(field)) {
        enabled.add(field);
      }
    }
    setEnabledFields(enabled);
  }, [allFields, hiddenFields]);

  const updateSchoolConfigMutation = api.students.upsertSchoolConfig.useMutation();
  const { handleSaveAndUpdateStatus } = useUpdateStepStatus(SchoolStepTags.MedicalForm);

  function handleBack() {
    router.push('/admissions/setup?config=true');
  }

  function handleClose() {
    router.push('/admissions/setup?config=true');
  }

  function onFieldToggle(field: string, enabled: boolean) {
    const newEnabledFields = new Set(enabledFields);
    if (enabled) {
      newEnabledFields.add(field);
    } else {
      newEnabledFields.delete(field);
    }
    setEnabledFields(newEnabledFields);
  }

  async function handleSave() {
    const disabledFields = allFields.filter((field) => !enabledFields.has(field));
    const hiddenFieldsString = disabledFields.join(',');

    async function saveConfigAction() {
      await updateSchoolConfigMutation.mutateAsync({
        school_id: schoolId,
        hidden_medical_form_fields: hiddenFieldsString,
      });
    }

    await handleSaveAndUpdateStatus(saveConfigAction);
    toast({ title: 'Los cambios han sido guardados', variant: 'success' });
  }

  return (
    <div className="font-lota antialiased">
      <ConfigurationHeader title="Ficha médica" onBack={handleBack} onClose={handleClose} />

      <ConfigurationLayout
        leftContent={
          <MedicalFormContent
            stepNumber={stepNumber}
            enabledFields={enabledFields}
            onFieldToggle={onFieldToggle}
            onSave={handleSave}
            totalSteps={schoolSteps.length}
          />
        }
        rightContent={<PhoneContent enabledFields={enabledFields} />}
      />
    </div>
  );
}

type MedicalFormContentProps = {
  stepNumber: number;
  enabledFields: Set<string>;
  onFieldToggle: (field: string, enabled: boolean) => void;
  onSave: () => void;
  totalSteps: number;
};

function MedicalFormContent({ stepNumber, enabledFields, onFieldToggle, onSave, totalSteps }: MedicalFormContentProps) {
  const isDisabled = enabledFields.size === 0;

  return (
    <ConfigurationContent
      title="Ficha médica"
      stepNumber={stepNumber}
      description="Elige la información médica que necesitas recopilar de los estudiantes. Puedes usar esta plantilla como base y adaptar lo que sea necesario."
      onSave={onSave}
      totalSteps={totalSteps}
      isDisabled={isDisabled}
    >
      <div className="space-y-6">
        {MEDICAL_FORM_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-4">
            <SectionHeader
              title={section.title}
              tooltip="Incluye solo la información que sea relevante para tu colegio."
            />

            <div className="space-y-2">
              {section.fields.map((field) => (
                <ToggleableListItem
                  key={field}
                  id={field}
                  label={MEDICAL_FORM_LABELS[field]}
                  onToggle={() => onFieldToggle(field, !enabledFields.has(field))}
                  isEnabled={enabledFields.has(field)}
                  showDragHandle={false}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </ConfigurationContent>
  );
}

function PhoneContent({ enabledFields }: { enabledFields: Set<string> }) {
  const visibleSections = MEDICAL_FORM_SECTIONS.filter((section) =>
    section.fields.some((field) => enabledFields.has(field))
  );

  if (!visibleSections.length) {
    return null;
  }

  return (
    <PhoneContainer>
      <PhoneHeader
        title="Ficha médica"
        description="Registra la información médica relevante del estudiante, como antecedentes, tratamientos o condiciones especiales."
      />

      <PhoneBody>
        <AnimatePresence>
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {visibleSections.map((section, _index) => {
              const sectionFields = section.fields.filter((field) => enabledFields.has(field));
              if (sectionFields.length === 0) return null;

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
                  <PhoneSectionPreview title={section.title} fields={sectionFields} fieldLabels={MEDICAL_FORM_LABELS} />
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
  );
}

MedicalFormConfigurationPage.auth = true;

const MEDICAL_FORM_SECTIONS = [
  {
    id: 'generalInfo',
    title: 'Información general',
    tooltip: 'Incluye solo la información que sea relevante para tu colegio.',
    fields: ['blood_type', 'height', 'weight', 'laterality'],
  },
  {
    id: 'background',
    title: 'Antecedentes médicos',
    tooltip: 'Incluye solo la información que sea relevante para tu colegio.',
    fields: ['family_history', 'personal_history', 'current_ailments', 'other_history', 'recent_interventions'],
  },
  {
    id: 'allergies',
    title: 'Alergias',
    tooltip: 'Incluye solo la información que sea relevante para tu colegio.',
    fields: [
      'has_allergies',
      'drug_allergies',
      'food_allergies',
      'plant_allergies',
      'other_allergies',
      'dietary_restrictions',
    ],
  },
  {
    id: 'medicalAuthorization',
    title: 'Autorización médica',
    tooltip: 'Incluye solo la información que sea relevante para tu colegio.',
    fields: ['require_drugs', 'drugs', 'authorize_emergency_transfer', 'authorize_physical_activity'],
  },
  {
    id: 'emergencyContact',
    title: 'Contacto de emergencia',
    tooltip: 'Incluye solo la información que sea relevante para tu colegio.',
    fields: ['emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'],
  },
  {
    id: 'doctor',
    title: 'Médico tratante',
    tooltip: 'Incluye solo la información que sea relevante para tu colegio.',
    fields: ['has_private_doctor', 'doctor_name', 'doctor_phone', 'doctor_clinic', 'has_private_insurance'],
  },
  {
    id: 'additionalComments',
    title: 'Observaciones adicionales',
    tooltip: 'Incluye solo la información que sea relevante para tu colegio.',
    fields: ['has_all_vaccines', 'pending_vaccines', 'comments', 'accept_truthfulness'],
  },
];

const MEDICAL_FORM_LABELS: Record<string, string> = {
  // General info
  blood_type: 'Tipo de sangre',
  height: 'Altura',
  weight: 'Peso',
  laterality: 'Lateralidad',
  // Background
  family_history: 'Antecedentes familiares',
  personal_history: 'Antecedentes personales',
  current_ailments: 'Padecimientos actuales',
  other_history: 'Otros antecedentes',
  recent_interventions: 'Intervenciones recientes',
  // Allergies
  has_allergies: '¿Tiene alergias?',
  drug_allergies: 'Alergias a medicamentos',
  food_allergies: 'Alergias a alimentos',
  plant_allergies: 'Alergias a plantas o animales',
  other_allergies: 'Otras alergias',
  dietary_restrictions: 'Restricciones dietéticas',
  // Medical authorization
  require_drugs: '¿Requiere medicamentos?',
  drugs: 'Medicamentos',
  authorize_emergency_transfer: 'Autorizar traslado de emergencia',
  authorize_physical_activity: 'Autorizar actividad física',
  // Emergency contact
  emergency_contact_name: 'Nombre de contacto de emergencia',
  emergency_contact_phone: 'Teléfono de contacto de emergencia',
  emergency_contact_relationship: 'Relación con el contacto de emergencia',
  // Doctor
  has_private_doctor: '¿Tiene médico privado?',
  doctor_name: 'Nombre del médico',
  doctor_phone: 'Teléfono del médico',
  doctor_clinic: 'Clínica del médico',
  has_private_insurance: '¿Tiene seguro privado?',
  // Additional comments
  has_all_vaccines: '¿Tiene todas las vacunas?',
  pending_vaccines: 'Vacunas pendientes',
  comments: 'Comentarios',
  accept_truthfulness: 'Acepto la veracidad de la información',
};
