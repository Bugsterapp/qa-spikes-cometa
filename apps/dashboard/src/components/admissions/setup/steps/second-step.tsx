import { StepContainer, useStepLogic } from '../container';
import { CheckboxCard } from '@cometa/recreo/v2';

export function SecondStepContent() {
  const { formData, handleFieldChange, getSelectedCount } = useStepLogic();

  const selectedCount = getSelectedCount(['schoolInfo']);

  return (
    <StepContainer selectedCount={selectedCount}>
      <div className="space-y-4">
        <CheckboxCard
          id="schoolInfo"
          title="Sí, quiero compartir documentos o información del colegio"
          description="Ej: Reglamentos, presentaciones, propuesta educativa, etc."
          checked={formData.schoolInfo}
          onCheckedChange={(checked) => handleFieldChange('schoolInfo', checked as boolean)}
        />
      </div>
    </StepContainer>
  );
}
