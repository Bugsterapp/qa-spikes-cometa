import { ONBOARDING_VIDEO_IDS } from '../../stores/onboardingVideosStore';
import { OnboardingVideo } from '../onboarding/OnboardingVideo';

type ScholarshipsOnboardingVideoProps = {
  onComplete: () => void;
};

export function ScholarshipsOnboardingVideo({ onComplete }: Readonly<ScholarshipsOnboardingVideoProps>) {
  return (
    <OnboardingVideo
      title="Becas"
      videoId={ONBOARDING_VIDEO_IDS.SCHOLARSHIPS}
      videoUrl="https://cometa-public-prd.s3.us-east-1.amazonaws.com/videos/scholarships_create_video.mp4"
      onComplete={onComplete}
    />
  );
}
