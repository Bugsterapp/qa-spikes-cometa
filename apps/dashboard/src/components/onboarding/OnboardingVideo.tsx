import { Button } from '@cometa/recreo/components/ui/Button';
import { useOnboardingVideosStore, type OnboardingVideoId } from '../../stores/onboardingVideosStore';

type OnboardingVideoProps = {
  title: string;
  videoId: OnboardingVideoId;
  videoUrl: string;
  onComplete: () => void;
};

export function OnboardingVideo({ title, videoId, videoUrl, onComplete }: Readonly<OnboardingVideoProps>) {
  const { markVideoAsWatched, hasWatchedVideo } = useOnboardingVideosStore();
  const hasWatched = hasWatchedVideo(videoId);

  function handleButtonClick() {
    markVideoAsWatched(videoId);
    onComplete();
  }

  return (
    <div className="bg-[#FBFCFD] min-h-screen w-full relative">
      <div className="absolute left-[43px] top-[27px]">
        <h1 className="font-semibold text-2xl leading-8 text-[#22283A] font-lota">{title}</h1>
      </div>

      <div className="absolute left-[173px] top-[147px] w-[600px] flex flex-col gap-8 items-end">
        <div className="flex flex-col gap-8 items-start w-full">
          <div className="h-6 w-full" />
          <div className="h-[330.12px] w-full relative">
            <div className="w-full h-full bg-neutral-900 rounded-lg relative overflow-hidden">
              <video
                className="w-full h-full object-cover rounded-lg border border-[#22283A]"
                controls
                disablePictureInPicture
                controlsList="nodownload"
                poster="https://cometa-public-prd.s3.us-east-1.amazonaws.com/videos/welcome_video_thumbnail.jpg"
              >
                <source src={videoUrl} type="video/mp4" />
                Tu navegador no soporta el elemento de video.
              </video>
            </div>
          </div>
        </div>

        <Button
          variant="solid"
          size="medium"
          onClick={handleButtonClick}
          className="bg-[#22283a] text-white hover:bg-[#22283a]/90 h-10 px-6 py-2 text-sm font-semibold rounded-full shadow-[0px_1px_2px_0px_rgba(34,40,58,0.05)]"
        >
          {hasWatched ? 'Regresar' : 'Empezar'}
        </Button>
      </div>
    </div>
  );
}
