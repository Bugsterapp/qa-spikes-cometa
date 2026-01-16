import { StepContainer, useStepLogic } from '../container';
import { CheckboxCard } from '@cometa/recreo/v2';
import { AdmissionFormData } from '../context/admission-setup-provider';

type CheckboxItems = {
  id: keyof AdmissionFormData;
  label: string | React.ReactNode;
  description?: string;
  checked: boolean;
  disabled?: boolean;
};

export function FirstStepContent() {
  const { formData, handleFieldChange, getSelectedCount } = useStepLogic();

  const checkboxItems: CheckboxItems[] = [
    {
      id: 'basicData',
      label: 'Datos básicos del postulante (obligatorio)',
      description: 'Ej: Nombre, nacimiento, contactos, etc.',
      checked: formData.basicData,
      disabled: true,
    },
    {
      id: 'applicationForm',
      label: 'Datos adicionales del postulante (obligatorio)',
      description: 'Ej: CURP, dirección, información de los tutores etc.',
      checked: formData.applicationForm,
      disabled: true,
    },
    {
      id: 'medicalInfo',
      label: 'Información médica',
      description: 'Ej: Exámenes, alergias, autorizaciones médicas, etc.',
      checked: formData.medicalInfo,
    },
    {
      id: 'psychopedagogicalForm',
      label: 'Contexto familiar y emocional',
      description: 'Ej: Situación del hogar, necesidades especiales, etc.',
      checked: formData.psychopedagogicalForm,
    },
    {
      id: 'consentForm',
      label: 'Acuerdos o permisos legales',
      description: 'Ej: Políticas, uso de imagen, reglamentos internos, etc.',
      checked: formData.consentForm,
    },
  ];

  const selectedCount = getSelectedCount(['medicalInfo', 'psychopedagogicalForm', 'consentForm']);

  return (
    <StepContainer selectedCount={selectedCount}>
      {checkboxItems.map((item) => (
        <CheckboxCard
          key={item.id}
          id={item.id}
          title={item.label as string}
          description={item.description}
          checked={item.checked}
          onCheckedChange={(checked) => {
            if (item.disabled) return;
            handleFieldChange(item.id, checked as boolean);
          }}
          disabled={item.disabled}
        />
      ))}
    </StepContainer>
  );
}
