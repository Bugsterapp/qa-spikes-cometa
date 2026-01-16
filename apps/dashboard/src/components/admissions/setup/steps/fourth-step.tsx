import { StepContainer, useStepLogic } from '../container';
import { CheckboxCard } from '@cometa/recreo/v2';
import { useAdmissionSetup } from '../context/admission-setup-context';
import { AdmissionFormData } from '../context/admission-setup-provider';

export function FourthStepContent() {
  const { formData, handleFieldChange, getSelectedCount } = useStepLogic();
  const { startLoading } = useAdmissionSetup();

  const checkboxItems = [
    {
      id: 'visitSchool' as keyof AdmissionFormData,
      label: 'Visita al colegio o reunión',
      description: 'Ej: Conocer a la familia, mostrar instalaciones, etc.',
      checked: formData.visitSchool,
    },
    {
      id: 'admissionExam' as keyof AdmissionFormData,
      label: 'Examen de ingreso',
      description: 'Ej: Evaluación académica, nivelación, etc.',
      checked: formData.admissionExam,
    },
  ];

  const selectedCount = getSelectedCount(['visitSchool', 'admissionExam']);

  function handleFinish() {
    startLoading();
  }

  return (
    <StepContainer selectedCount={selectedCount} onFinish={handleFinish}>
      {checkboxItems.map((item) => (
        <CheckboxCard
          key={item.id}
          id={item.id}
          title={item.label}
          description={item.description}
          checked={item.checked}
          onCheckedChange={(checked) => handleFieldChange(item.id, checked as boolean)}
        />
      ))}
    </StepContainer>
  );
}
