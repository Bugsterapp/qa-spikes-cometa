import { Button } from '@cometa/recreo/v2';
import { useSession } from 'next-auth/react';
import { Tooltip } from '../atoms/Tooltip';
import { useWelcomeFlowStore } from '../../stores/welcomeFlowStore';

type VideoStepProps = {
  onNext: () => void;
  onProgressChange?: (progress: number) => void;
};

export function VideoStep({ onNext, onProgressChange }: Readonly<VideoStepProps>) {
  const { data: session } = useSession();
  const store = useWelcomeFlowStore();
  const hasWatchedVideo = store((state) => state.hasWatchedVideo);
  const setVideoWatched = store((state) => state.setVideoWatched);

  const firstName = session?.user?.first_name;

  function handleVideoEnd() {
    setVideoWatched(true);
    onProgressChange?.(25);
  }

  return (
    <div className="bg-white box-border flex flex-col h-screen font-lota antialiased">
      <div className="flex-1 box-border flex flex-col items-center justify-center min-h-[572px] px-[340px] py-[31px] w-full">
        <div className="box-border flex flex-col gap-8 items-end justify-start w-[600px]">
          <div className="box-border flex flex-col gap-8 items-start justify-start w-full">
            <div className="box-border flex flex-col gap-2 items-start justify-start w-full">
              <div className="font-semibold text-[28px] leading-[34px] text-[#22283a] w-full">
                ¡Bienvenido a Cometa!
              </div>
              <div className="font-normal text-[16px] leading-[24px] text-[#697086] w-full">
                {firstName ? `${firstName}, estamos` : 'Estamos'} felices de tenerte aquí. ¡Comencemos!
              </div>
            </div>

            <div className="h-[330.12px] w-full relative">
              <div className="w-full h-full bg-neutral-900 rounded-lg relative overflow-hidden">
                <video
                  className="w-full h-full object-cover rounded-lg border border-[#22283A]"
                  controls
                  disablePictureInPicture
                  controlsList="nodownload"
                  autoPlay
                  onEnded={handleVideoEnd}
                  poster="https://cometa-public-prd.s3.us-east-1.amazonaws.com/videos/welcome_video_thumbnail.jpg"
                >
                  <source
                    src="https://cometa-public-prd.s3.us-east-1.amazonaws.com/videos/welcome_video.mp4"
                    type="video/mp4"
                  />
                  Tu navegador no soporta el elemento de video.
                </video>
              </div>
            </div>
          </div>

          <div className="flex justify-end w-full">
            <Tooltip
              message={!hasWatchedVideo ? 'Termina de ver el video antes de continuar' : undefined}
              side="top"
              disableHover={hasWatchedVideo}
            >
              <div className={!hasWatchedVideo ? 'pointer-events-none' : ''}>
                <Button
                  variant="neutral"
                  size="lg"
                  onClick={onNext}
                  disabled={!hasWatchedVideo}
                  className="bg-[#22283a] text-white hover:bg-[#22283a]/90 h-10 px-6 py-2 text-[14px] leading-[20px] font-semibold shadow-[0px_1px_2px_0px_rgba(34,40,58,0.05)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#22283a]"
                >
                  Empezar
                </Button>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
