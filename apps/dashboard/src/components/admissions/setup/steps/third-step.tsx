import { StepContainer, useStepLogic } from '../container';
import { CheckboxCard } from '@cometa/recreo/v2';

export function ThirdStepContent() {
  const { formData, handleFieldChange, getSelectedCount } = useStepLogic();

  const selectedCount = getSelectedCount(['uploadDocuments', 'documentsValidation']);

  return (
    <StepContainer selectedCount={selectedCount}>
      <div className="space-y-8">
        <CheckboxCard
          id="uploadDocuments"
          title="Sí, quiero solicitar documentos a las familias"
          description="Ej: Actas, comprobantes de domicilio o constancias."
          checked={formData.uploadDocuments}
          onCheckedChange={(checked) => handleFieldChange('uploadDocuments', checked as boolean)}
        />

        {formData.uploadDocuments ? (
          <div>
            <h3 className="text-lg font-semibold text-neutral-700 mb-6">
              ¿Necesitas revisar y aprobar los documentos que suben las familias al sistema antes de que continúen con
              el proceso?
            </h3>
            <CheckboxCard
              id="documentsValidation"
              title="Sí, quiero revisar y validar los documentos que suben"
              checked={formData.documentsValidation}
              onCheckedChange={(checked) => handleFieldChange('documentsValidation', checked as boolean)}
            />
          </div>
        ) : null}
      </div>
    </StepContainer>
  );
}
