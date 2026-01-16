import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type OnboardingVideoState = {
  watchedVideos: Record<string, boolean>;
  hasWatchedVideo: (videoId: string) => boolean;
  markVideoAsWatched: (videoId: string) => void;
  resetVideoState: (videoId: string) => void;
};

export const useOnboardingVideosStore = create<OnboardingVideoState>()(
  persist(
    (set, get) => ({
      watchedVideos: {},

      hasWatchedVideo: (videoId: string) => get().watchedVideos[videoId] ?? false,

      markVideoAsWatched: (videoId: string) => {
        set((state) => ({
          watchedVideos: {
            ...state.watchedVideos,
            [videoId]: true,
          },
        }));
      },

      resetVideoState: (videoId: string) => {
        set((state) => {
          const { [videoId]: _, ...rest } = state.watchedVideos;
          return { watchedVideos: rest };
        });
      },
    }),
    {
      name: 'onboarding-videos-storage',
    }
  )
);

export const ONBOARDING_VIDEO_IDS = {
  STUDENTS: 'students',
  CONCEPTS: 'concepts',
  CONCEPT_ASSIGNMENT: 'concept-assignment',
  SCHOLARSHIPS: 'scholarships',
  SCHOLARSHIP_ASSIGNMENT: 'scholarship-assignment',
} as const;

export type OnboardingVideoId = (typeof ONBOARDING_VIDEO_IDS)[keyof typeof ONBOARDING_VIDEO_IDS];
