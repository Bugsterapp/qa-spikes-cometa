import { OnboardingEmptyState } from '../onboarding/OnboardingEmptyState';

type ConceptsEmptyStateProps = {
  onCreateConcept: () => void;
  onViewTutorial: () => void;
};

export function ConceptsEmptyState({ onCreateConcept, onViewTutorial }: Readonly<ConceptsEmptyStateProps>) {
  return (
    <OnboardingEmptyState
      imageSrc="/assets/images/concepts.png"
      imageAlt="Concept illustration"
      title="Crear tu primer concepto"
      description="Comienza a crear los conceptos necesarios para poder operar correctamente en Cometa."
      primaryButtonText="Crea nuevo concepto"
      onPrimaryAction={onCreateConcept}
      onViewTutorial={onViewTutorial}
    />
  );
}
