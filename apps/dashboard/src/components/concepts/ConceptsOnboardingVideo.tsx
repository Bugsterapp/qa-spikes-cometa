import { ONBOARDING_VIDEO_IDS } from '../../stores/onboardingVideosStore';
import { OnboardingVideo } from '../onboarding/OnboardingVideo';

type ConceptsOnboardingVideoProps = {
  onComplete: () => void;
};

export function ConceptsOnboardingVideo({ onComplete }: Readonly<ConceptsOnboardingVideoProps>) {
  return (
    <OnboardingVideo
      title="Conceptos"
      videoId={ONBOARDING_VIDEO_IDS.CONCEPTS}
      videoUrl="https://cometa-public-prd.s3.us-east-1.amazonaws.com/videos/concepts_create_video.mp4"
      onComplete={onComplete}
    />
  );
}
