import { ONBOARDING_VIDEO_IDS } from '../../stores/onboardingVideosStore';
import { OnboardingVideo } from '../onboarding/OnboardingVideo';

type ScholarshipAssignmentOnboardingVideoProps = {
  onComplete: () => void;
};

export function ScholarshipAssignmentOnboardingVideo({
  onComplete,
}: Readonly<ScholarshipAssignmentOnboardingVideoProps>) {
  return (
    <OnboardingVideo
      title="Asignación de becas"
      videoId={ONBOARDING_VIDEO_IDS.SCHOLARSHIP_ASSIGNMENT}
      videoUrl="https://cometa-public-prd.s3.us-east-1.amazonaws.com/videos/scholarships_assignment_video.mp4"
      onComplete={onComplete}
    />
  );
}
