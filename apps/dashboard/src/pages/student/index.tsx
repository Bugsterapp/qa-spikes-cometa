import type { DashboardStudentResumeSerializerV2 } from '@cometa/trpc/src/types';
import { SchoolCycleEntity } from '@cometa/trpc/src/students/types-mapping';
import * as Sentry from '@sentry/nextjs';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import 'react-circular-progressbar/dist/styles.css';

import Layout from '/src/components/layouts';
import Box from '/src/components/organisms/dashboard/Box';
import OrderTableForStudents from '/src/components/organisms/dashboard/OrderTableForStudents';
import StudentInscriptionsSummary from '/src/components/students/StudentInscriptionsSummary';
import StudentSummaryCard from '/src/components/StudentSummaryCard';
import { StudentsOnboardingVideo } from '../../components/students/StudentsOnboardingVideo';
import { useGetPermissions, useSelectedSchool } from '/src/guards/AuthGuard';
import useSendPageViewedEvent from '/src/hooks/useSendPageViewedEvent';
import { api } from '/src/utils/api';
import { SchoolCycleSelector, useSchoolCycleSelector } from '/src/components/organisms/dashboard/SchoolCycleSelector';
import IcVideoTutorial from 'public/assets/icons/ic_video_tutorial.svg';
import { Button } from '@cometa/recreo/v2';
import { Status2B3Enum } from '@cometa/trpc';
import { useFlagWithVariableMatching } from '../../components/flags/FlagsProvider';
import { useOnboardingVideosStore, ONBOARDING_VIDEO_IDS } from '../../stores/onboardingVideosStore';

StudentPage.getLayout = function getLayout(page: JSX.Element) {
  return <Layout title="Estudiantes">{page}</Layout>;
};

function StudentPage() {
  const { data: session } = useSession();
  const selectedSchool = useSelectedSchool();
  const { activeCycle, schoolCycles, selectedSchoolCycle, setSelectedSchoolCycle } = useSchoolCycleSelector('students');

  const { isEnabled: welcomePageFlag } = useFlagWithVariableMatching('enable_welcome_page');
  const isOnboardingSchool = selectedSchool?.status === Status2B3Enum.Onboarding;
  const showVideoFeature = isOnboardingSchool && welcomePageFlag;

  const { hasWatchedVideo } = useOnboardingVideosStore();
  const hasWatchedStudentsVideo = hasWatchedVideo(ONBOARDING_VIDEO_IDS.STUDENTS);

  const shouldShowVideoOnLoad = showVideoFeature && !hasWatchedStudentsVideo;
  const [showOnboarding, setShowOnboarding] = useState(shouldShowVideoOnLoad);

  const { data: studentsHeaderActives, isPending: isLoading } = api.schools.schoolsResume.useQuery(
    {
      school_id: selectedSchool?.id as string,
      school_cycle: selectedSchoolCycle?.id || '',
    },
    {
      enabled: Boolean(selectedSchool?.id) && !!schoolCycles && schoolCycles.length > 0,
      staleTime: 60 * 1000 * 60,
      refetchOnWindowFocus: false,
    }
  );

  useSendPageViewedEvent('Estudiantes', selectedSchool);

  const schoolCyclesFilteredByPreviousCurrentAndNext = useMemo(() => {
    if (!schoolCycles) return [];

    const activeCycle = schoolCycles.find((cycle) => cycle.is_active);
    if (!activeCycle) return [];

    const nextCycle = schoolCycles.find((cycle) => cycle.id === activeCycle.next_id);
    const previousCycle = schoolCycles.find((cycle) => cycle.next_id === activeCycle.id);

    return [previousCycle, activeCycle, nextCycle]
      .filter((cycle): cycle is SchoolCycleEntity => cycle !== undefined)
      .map((cycle) => ({
        ...cycle,
        disabled: cycle.is_active,
      }));
  }, [schoolCycles]);

  const [selectedSchoolCycleForChange, setSelectedSchoolCycleForChange] = useState<SchoolCycleEntity | null>(null);

  useEffect(() => {
    if (!selectedSchoolCycleForChange && schoolCyclesFilteredByPreviousCurrentAndNext?.length) {
      setSelectedSchoolCycleForChange(
        schoolCyclesFilteredByPreviousCurrentAndNext?.find((cycle) => !cycle.is_active) || null
      );
    }
  }, [selectedSchoolCycle, schoolCyclesFilteredByPreviousCurrentAndNext]);

  const permissions = useGetPermissions();

  useEffect(() => {
    setShowOnboarding(shouldShowVideoOnLoad);
  }, [shouldShowVideoOnLoad]);

  if (showOnboarding) {
    return (
      <Sentry.ErrorBoundary
        beforeCapture={(scope) => {
          scope.setContext('state', {
            session,
            selectedSchool,
          });
        }}
      >
        <StudentsOnboardingVideo onComplete={() => setShowOnboarding(false)} />
      </Sentry.ErrorBoundary>
    );
  }

  return (
    <Sentry.ErrorBoundary
      beforeCapture={(scope) => {
        scope.setContext('state', {
          // studentsHeader,
          session,
          selectedSchool,
        });
      }}
    >
      <div>
        <div className="flex items-center gap-2 justify-between w-full mt-[32px]">
          <h3 className="font-bold text-[32px]">Estudiantes</h3>
          {showVideoFeature && (
            <Button variant="ghost" size="default" onClick={() => setShowOnboarding(true)}>
              <IcVideoTutorial className="w-4 h-4" />
              Ver tutorial
            </Button>
          )}
        </div>
        {!permissions.can_view_inscriptions_page ? (
          <>
            <span className="block h-[1px] w-full bg-[#919EAB3D] my-8" />
            {selectedSchool?.config_dashboard?.display_inscriptions_status && (
              <StudentInscriptionsSummary selectedSchoolCycle={selectedSchoolCycle || activeCycle} />
            )}
          </>
        ) : null}
        <div className="flex items-center gap-8 my-8">
          <h4 className="font-bold text-[24px]">Resumen de estudiantes</h4>
          {schoolCycles?.length ? (
            <SchoolCycleSelector
              cycles={schoolCycles}
              selected={selectedSchoolCycle ?? null}
              setFn={setSelectedSchoolCycle}
            />
          ) : null}
        </div>

        <StudentSummaryCard
          studentsHeader={studentsHeaderActives as DashboardStudentResumeSerializerV2}
          loading={isLoading}
        />

        <span className="block h-[1px] w-full bg-[#919EAB3D] my-8" />
        {/* <TripleCardWithStatistics studentsHeader={studentsHeader} loading={dueOrdersLoading} /> */}
        <Box className="mt-6">
          <OrderTableForStudents
            selectedSchoolCycle={selectedSchoolCycle ?? null}
            setSelectedSchoolCycle={setSelectedSchoolCycle}
            schoolCycles={schoolCycles}
          />
        </Box>
      </div>
    </Sentry.ErrorBoundary>
  );
}

StudentPage.auth = true;

export default StudentPage;
