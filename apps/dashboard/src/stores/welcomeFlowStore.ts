import { create } from 'zustand';
import { persist, type StorageValue } from 'zustand/middleware';
import { InstitutionFormValues } from '../components/InstitutionForm';
import { useSelectedSchoolId } from '../guards/AuthGuard';
import { fileToSerializableFormat, compressImage } from '../utils/file-utils';
import * as Sentry from '@sentry/nextjs';

export enum WelcomeStep {
  VIDEO = 'video',
  INSTITUTION_SETUP = 'institution',
  TEAM_SETUP = 'team',
  LOADING_WORKSPACE = 'loading',
}

const STORAGE_KEY = 'welcome-flow-storage';

export type TeamMember = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile?: string | null;
  membership: string;
};

export type SerializedLogo = {
  name: string;
  type: string;
  data: string;
};

type SchoolWelcomeState = {
  institution?: InstitutionFormValues;
  logoFile?: SerializedLogo | null;
  currentStep: WelcomeStep;
  teamMembers: TeamMember[];
  isSchoolCreated: boolean;
  hasWatchedVideo: boolean;
  progress: number;
};

type WelcomeFlowState = SchoolWelcomeState & {
  currentSchoolId?: string;
  schoolStates: Record<string, SchoolWelcomeState>;
  setInstitution: (data: InstitutionFormValues, logoFile?: File) => Promise<void>;
  addTeamMember: (member: TeamMember) => void;
  removeTeamMember: (memberId: string) => void;
  setTeamMembers: (members: TeamMember[]) => void;
  setCurrentStep: (step: WelcomeStep) => void;
  setSchoolCreated: (schoolCreated: boolean) => void;
  setVideoWatched: (watched: boolean) => void;
  setProgress: (progress: number) => void;
  _ensureSchoolState: (schoolId: string) => void;
};

const initialSchoolState: SchoolWelcomeState = {
  currentStep: WelcomeStep.VIDEO,
  teamMembers: [],
  isSchoolCreated: false,
  hasWatchedVideo: false,
  progress: 0,
};

const serializeWelcomeFlowState = (state: StorageValue<WelcomeFlowState>) =>
  JSON.stringify({
    state: {
      currentSchoolId: state.state.currentSchoolId,
      schoolStates: state.state.schoolStates,
      ...initialSchoolState,
    },
    version: state.version,
  });

const getCurrentSchoolState = (state: WelcomeFlowState): SchoolWelcomeState => {
  if (!state.currentSchoolId) return initialSchoolState;
  return state.schoolStates[state.currentSchoolId] || initialSchoolState;
};

const updateSchoolState = (
  state: WelcomeFlowState,
  updater: (current: SchoolWelcomeState) => Partial<SchoolWelcomeState>
): Partial<WelcomeFlowState> => {
  if (!state.currentSchoolId) {
    return {};
  }
  const current = getCurrentSchoolState(state);
  const updated = {
    ...current,
    ...updater(current),
  };
  return {
    ...updated,
    schoolStates: {
      ...state.schoolStates,
      [state.currentSchoolId]: updated,
    },
  };
};

const baseStore = create<WelcomeFlowState>()(
  persist(
    (set, get) => ({
      ...initialSchoolState,
      currentSchoolId: undefined,
      schoolStates: {},

      _ensureSchoolState: (schoolId: string) => {
        const { currentSchoolId, schoolStates } = get();
        if (currentSchoolId !== schoolId) {
          const newSchoolState = schoolStates[schoolId] || initialSchoolState;
          set({
            ...newSchoolState,
            currentSchoolId: schoolId,
            schoolStates: schoolStates[schoolId]
              ? schoolStates
              : {
                  ...schoolStates,
                  [schoolId]: { ...initialSchoolState },
                },
          });
        }
      },

      setInstitution: async (data: InstitutionFormValues, logoFile?: File) => {
        let serializedLogo: SerializedLogo | null = null;

        if (logoFile) {
          try {
            const compressedLogo = await compressImage(logoFile, 500);
            serializedLogo = await fileToSerializableFormat(compressedLogo);
          } catch (error) {
            Sentry.captureException(error);
            serializedLogo = null;
          }
        }

        const updater = () => ({
          institution: data,
          logoFile: serializedLogo,
          currentStep: WelcomeStep.INSTITUTION_SETUP,
        });
        set((state) => updateSchoolState(state, updater));
      },

      addTeamMember: (member: TeamMember) => {
        const updater = (current: SchoolWelcomeState) => ({
          teamMembers: [...current.teamMembers, member],
        });
        set((state) => updateSchoolState(state, updater));
      },

      removeTeamMember: (memberId: string) => {
        const updater = (current: SchoolWelcomeState) => {
          const filtered = current.teamMembers.filter((m) => m.id !== memberId);
          return { teamMembers: filtered };
        };
        set((state) => updateSchoolState(state, updater));
      },

      setTeamMembers: (members: TeamMember[]) => {
        const updater = () => ({ teamMembers: members });
        set((state) => updateSchoolState(state, updater));
      },

      setCurrentStep: (step: WelcomeStep) => {
        const updater = () => ({ currentStep: step });
        set((state) => updateSchoolState(state, updater));
      },

      setSchoolCreated: (schoolCreated: boolean) => {
        const updater = () => ({ isSchoolCreated: schoolCreated });
        set((state) => updateSchoolState(state, updater));
      },

      setVideoWatched: (watched: boolean) => {
        const updater = () => ({ hasWatchedVideo: watched });
        set((state) => updateSchoolState(state, updater));
      },

      setProgress: (progress: number) => {
        const updater = () => ({ progress });
        set((state) => updateSchoolState(state, updater));
      },
    }),
    {
      name: STORAGE_KEY,
      serialize: serializeWelcomeFlowState,
    }
  )
);

export const useWelcomeFlowStore = () => {
  const schoolId = useSelectedSchoolId();

  if (schoolId) {
    baseStore.getState()._ensureSchoolState(schoolId);
  }

  return baseStore;
};
