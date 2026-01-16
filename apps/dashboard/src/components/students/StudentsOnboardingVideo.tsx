import { ONBOARDING_VIDEO_IDS } from '../../stores/onboardingVideosStore';
import { OnboardingVideo } from '../onboarding/OnboardingVideo';

type StudentsOnboardingVideoProps = {
  onComplete: () => void;
};

export function StudentsOnboardingVideo({ onComplete }: Readonly<StudentsOnboardingVideoProps>) {
  return (
    <OnboardingVideo
      title="Estudiantes"
      videoId={ONBOARDING_VIDEO_IDS.STUDENTS}
      videoUrl="https://cometa-public-prd.s3.us-east-1.amazonaws.com/videos/students_video.mp4"
      onComplete={onComplete}
    />
  );
}
