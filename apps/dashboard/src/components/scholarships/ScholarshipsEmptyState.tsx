import * as Sentry from '@sentry/nextjs';
import { OnboardingEmptyState } from '../onboarding/OnboardingEmptyState';

type ScholarshipsEmptyStateProps = {
  onCreateScholarship: () => void;
  onViewTutorial: () => void;
};

export function ScholarshipsEmptyState({ onCreateScholarship, onViewTutorial }: Readonly<ScholarshipsEmptyStateProps>) {
  return (
    <Sentry.ErrorBoundary fallback={<div>Error loading empty state</div>}>
      <OnboardingEmptyState
        imageSrc="/assets/images/concepts.png"
        imageAlt="Scholarship illustration"
        title="Crea tu primer beca"
        description="Comienza a crear las becas necesarios para poder operar correctamente en Cometa."
        primaryButtonText="Crear beca"
        onPrimaryAction={onCreateScholarship}
        onViewTutorial={onViewTutorial}
      />
    </Sentry.ErrorBoundary>
  );
}
