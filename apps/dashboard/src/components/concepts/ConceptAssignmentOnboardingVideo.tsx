import { ONBOARDING_VIDEO_IDS } from '../../stores/onboardingVideosStore';
import { OnboardingVideo } from '../onboarding/OnboardingVideo';

type ConceptAssignmentOnboardingVideoProps = {
  onComplete: () => void;
};

export function ConceptAssignmentOnboardingVideo({ onComplete }: Readonly<ConceptAssignmentOnboardingVideoProps>) {
  return (
    <OnboardingVideo
      title="Asignación de conceptos"
      videoId={ONBOARDING_VIDEO_IDS.CONCEPT_ASSIGNMENT}
      videoUrl="https://cometa-public-prd.s3.us-east-1.amazonaws.com/videos/concepts_assignment_video.mp4"
      onComplete={onComplete}
    />
  );
}
