import * as Sentry from '@sentry/nextjs';
import { ScholarshipsOnboardingVideo } from '../scholarships/ScholarshipsOnboardingVideo';
import { ScholarshipAssignmentOnboardingVideo } from '../scholarships/ScholarshipAssignmentOnboardingVideo';
import type { VideoType } from '../../hooks/onboarding/useScholarshipsVideoState';

type OnboardingVideoRendererProps = {
  videoType: VideoType;
  onComplete: () => void;
  contextData?: Record<string, any>;
};

export function OnboardingVideoRenderer({
  videoType,
  onComplete,
  contextData,
}: Readonly<OnboardingVideoRendererProps>) {
  if (videoType === 'none') {
    return null;
  }

  return (
    <Sentry.ErrorBoundary
      beforeCapture={(scope) => {
        if (contextData) {
          scope.setContext('state', contextData);
        }
      }}
    >
      {videoType === 'onboarding' && <ScholarshipsOnboardingVideo onComplete={onComplete} />}
      {videoType === 'assignment' && <ScholarshipAssignmentOnboardingVideo onComplete={onComplete} />}
    </Sentry.ErrorBoundary>
  );
}
