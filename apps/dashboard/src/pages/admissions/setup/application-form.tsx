import { Button } from '@cometa/recreo/v2';
import { SchoolStepTags } from '@cometa/trpc/src/admissions/types';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { useUpdateStepStatus } from '/src/components/admissions/setup/hooks/useUpdateStepStatus';
import {
  ConfigurationContent,
  ConfigurationHeader,
  ConfigurationLayout,
  PhoneBody,
  PhoneContainer,
  PhoneHeader,
  PhoneSectionPreview,
  SectionHeader,
  ToggleableListItem,
} from '/src/components/admissions/setup/shared';
import { useToast } from '/src/components/molecules/dashboard/Toast/useToast';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { api } from '/src/utils/api';

export default function ApplicationFormConfigurationPage() {
  const router = useRouter();
  const selectedSchool = useSelectedSchool();
  const schoolId = selectedSchool?.id as string;
  const { toast } = useToast();

  const { data: schoolSteps = [] } = api.admissions.getSchoolSteps.useQuery({ schoolId }, { enabled: !!schoolId });
  const { data: schoolConfig } = api.students.getSchoolConfig.useQuery(
    { school_id: schoolId },
    { enabled: !!schoolId }
  );

  const applicationFormStep = schoolSteps?.find((step) => step.tag === SchoolStepTags.ApplicationForm);

  const stepNumber = applicationFormStep?.order || 1;

  const hiddenFields = useMemo(
    () => schoolConfig?.hidden_application_form_fields?.split(',').filter(Boolean) || [],
    [schoolConfig?.hidden_application_form_fields]
  );

  const allFields = useMemo(() => APPLICATION_FORM_FIELDS, []);
  const [enabledFields, setEnabledFields] = useState<Set<string>>(new Set(allFields));

  useEffect(() => {
    if (allFields.length === 0) return;

    const enabled = new Set<string>();
    for (const field of allFields) {
      if (!hiddenFields.includes(field) || field === 'curp') {
        enabled.add(field);
      }
    }
    setEnabledFields(enabled);
  }, [allFields, hiddenFields]);

  const updateSchoolConfigMutation = api.students.upsertSchoolConfig.useMutation();
  const { handleSaveAndUpdateStatus } = useUpdateStepStatus(SchoolStepTags.ApplicationForm);

  function handleBack() {
    router.push('/admissions/setup?config=true');
  }

  function handleClose() {
    router.push('/admissions/setup?config=true');
  }

  function onFieldToggle(field: string, enabled: boolean) {
    if (field === 'curp') return;

    const newEnabledFields = new Set(enabledFields);
    if (enabled) {
      newEnabledFields.add(field);
    } else {
      newEnabledFields.delete(field);
    }
    setEnabledFields(newEnabledFields);
  }

  async function handleSave() {
    const disabledFields = allFields.filter((field) => !enabledFields.has(field) && field !== 'curp');
    const hiddenFieldsString = disabledFields.join(',');

    async function saveConfigAction() {
      await updateSchoolConfigMutation.mutateAsync({
        school_id: schoolId,
        hidden_application_form_fields: hiddenFieldsString,
      });
    }

    await handleSaveAndUpdateStatus(saveConfigAction);
    toast({ title: 'Los cambios han sido guardados', variant: 'success' });
  }

  return (
    <div className="font-lota antialiased">
      <ConfigurationHeader title="Datos adicionales del postulante" onBack={handleBack} onClose={handleClose} />

      <ConfigurationLayout
        leftContent={
          <ApplicationFormContent
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

type ApplicationFormContentProps = {
  stepNumber: number;
  enabledFields: Set<string>;
  onFieldToggle: (field: string, enabled: boolean) => void;
  onSave: () => void;
  totalSteps: number;
};

function ApplicationFormContent({
  stepNumber,
  enabledFields,
  onFieldToggle,
  onSave,
  totalSteps,
}: ApplicationFormContentProps) {
  const isDisabled = enabledFields.size === 0;

  return (
    <ConfigurationContent
      title="Datos adicionales del postulante"
      stepNumber={stepNumber}
      description="Define qué datos quieres solicitar a las familias sobre el estudiante. Puedes partir de esta plantilla base y ajustarla según lo que necesites."
      onSave={onSave}
      totalSteps={totalSteps}
      isDisabled={isDisabled}
    >
      <div className="space-y-6">
        {APPLICATION_FORM_SECTIONS.map((section) => (
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
                  label={APPLICATION_FORM_LABELS[field]}
                  onToggle={() => onFieldToggle(field, !enabledFields.has(field))}
                  isEnabled={enabledFields.has(field)}
                  showDragHandle={false}
                  disabled={field === 'curp'}
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
  const visibleSections = APPLICATION_FORM_SECTIONS.filter((section) =>
    section.fields.some((field) => enabledFields.has(field))
  );

  if (!visibleSections.length) {
    return null;
  }

  return (
    <PhoneContainer>
      <PhoneHeader
        title="Formulario de aplicación"
        description="Completa la información adicional del postulante para continuar con el proceso."
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
                  <PhoneSectionPreview
                    title={section.title}
                    fields={sectionFields}
                    fieldLabels={APPLICATION_FORM_LABELS}
                  />
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

ApplicationFormConfigurationPage.auth = true;

const APPLICATION_FORM_SECTIONS = [
  {
    id: 'studentInfo',
    title: 'Información del estudiante',
    fields: ['curp', 'birthplace', 'is_outside_mx', 'nationality'],
  },
  {
    id: 'address',
    title: 'Dirección',
    fields: ['address', 'interior_number', 'neighborhood', 'municipality', 'state', 'zipcode', 'homephone'],
  },
  {
    id: 'guardianInfo',
    title: 'Información del tutor',
    fields: ['guardian_relationship', 'guardian_occupation', 'guardian_workplace', 'guardian_workphone'],
  },
  {
    id: 'additionalGuardian',
    title: 'Tutor adicional',
    fields: [
      'additional_guardian_first_name',
      'additional_guardian_last_name',
      'additional_guardian_email',
      'additional_guardian_phone',
      'additional_guardian_relationship',
      'additional_guardian_occupation',
      'additional_guardian_workplace',
      'additional_guardian_workphone',
    ],
  },
  {
    id: 'confirmation',
    title: 'Confirmación',
    fields: ['accept_truthfulness'],
  },
];

const APPLICATION_FORM_FIELDS = [
  'curp',
  'birthplace',
  'is_outside_mx',
  'nationality',
  'homephone',
  'address',
  'interior_number',
  'neighborhood',
  'municipality',
  'state',
  'zipcode',
  'guardian_relationship',
  'guardian_occupation',
  'guardian_workplace',
  'guardian_workphone',
  'additional_guardian_email',
  'additional_guardian_phone',
  'additional_guardian_first_name',
  'additional_guardian_last_name',
  'additional_guardian_relationship',
  'additional_guardian_occupation',
  'additional_guardian_workplace',
  'additional_guardian_workphone',
  'accept_truthfulness',
];

const APPLICATION_FORM_LABELS: Record<string, string> = {
  curp: 'CURP',
  birthplace: 'Lugar de nacimiento',
  is_outside_mx: '¿Es de fuera de México?',
  nationality: 'Nacionalidad',
  homephone: 'Teléfono de casa',
  address: 'Dirección',
  interior_number: 'Número interior',
  neighborhood: 'Colonia',
  municipality: 'Municipio',
  state: 'Estado',
  zipcode: 'Código postal',
  guardian_relationship: 'Relación con el tutor',
  guardian_occupation: 'Ocupación del tutor',
  guardian_workplace: 'Lugar de trabajo del tutor',
  guardian_workphone: 'Teléfono de trabajo del tutor',
  additional_guardian_email: 'Email del tutor adicional',
  additional_guardian_phone: 'Teléfono del tutor adicional',
  additional_guardian_first_name: 'Nombre del tutor adicional',
  additional_guardian_last_name: 'Apellidos del tutor adicional',
  additional_guardian_relationship: 'Relación con el tutor adicional',
  additional_guardian_occupation: 'Ocupación del tutor adicional',
  additional_guardian_workplace: 'Lugar de trabajo del tutor adicional',
  additional_guardian_workphone: 'Teléfono de trabajo del tutor adicional',
  accept_truthfulness: 'Acepto la veracidad de la información',
};
