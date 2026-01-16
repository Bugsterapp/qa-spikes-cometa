import { useState } from 'react';

export type VideoType = 'none' | 'onboarding' | 'assignment';

export function useScholarshipsVideoState() {
  const [activeVideo, setActiveVideo] = useState<VideoType>('none');

  const showOnboardingVideo = () => {
    setActiveVideo('onboarding');
  };

  const showAssignmentVideo = () => {
    setActiveVideo('assignment');
  };

  const hideVideos = () => {
    setActiveVideo('none');
  };

  return {
    activeVideo,
    showOnboardingVideo,
    showAssignmentVideo,
    hideVideos,
    isShowingVideo: activeVideo !== 'none',
  };
}
