import React, { useEffect } from 'react';
import { getSession, useSession } from 'next-auth/react';
import Head from 'next/head';
import Navbar from '~/components/Navbar';
import { useSendPageEvent } from '~/hooks/useSendEvent';
import { PageViewedCategory, TrackEvents } from '~/constants/events';
import type { GetServerSideProps } from 'next';
import redirectByGuardianFraudStatus from '~/utils/redirectByGuardianFraudStatus';
import { useRouter } from 'next/router';
import { Button } from '@cometa/recreo';
import { api } from '~/utils/api';
import { useSelectedSchool } from '~/stores/globalStore';
import type { MainStudentEntity, InscriptionStepsEntity } from '@cometa/trpc/src/students/types';
import Alert from '~/components/ui/Alert';
import { useSchoolInscriptionConfig } from '~/hooks/useSchoolInscriptionConf';

function StudentsPage() {
  const session = useSession();
  const guardianId = session.data?.user.id as string;

  const selectedSchool = useSelectedSchool();
  const { isInscriptionsEnabled, inscriptionSteps, schoolCycle } = useSchoolInscriptionConfig();
  const schoolId = selectedSchool?.id as string;

  const { data: students } = api.students.getStudents.useQuery(
    { guardianId, schoolId },
    {
      enabled: !!guardianId && !!schoolId,
    }
  );

  const isAllDataCompleted = students?.every((student) =>
    isDataCompleted(student, !!inscriptionSteps?.enable_consentments_step, schoolCycle?.id as string)
  );

  const sendPageEvent = useSendPageEvent();
  useEffect(() => {
    sendPageEvent(TrackEvents.students.pageViewed, PageViewedCategory);
  }, []);

  return (
    <div className="flex flex-col gap-6 p-5 pt-3">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[#1C1C1C] pt-3">Estudiantes</h1>
        <p className="text-[#686F87]">Estos son los estudiantes vinculados en este colegio.</p>
      </header>

      {isInscriptionsEnabled && !isAllDataCompleted ? (
        <Alert
          variant="info"
          message="Actualiza la información de tus estudiantes para reinscribirlos en el siguiente ciclo escolar."
          className="mb-6"
        />
      ) : null}

      <div className="flex flex-col gap-4">
        {students?.map((student) => (
          <StudentCard
            key={student.id}
            student={student}
            schoolCycleId={schoolCycle?.id as string}
            hasInscriptions={isInscriptionsEnabled}
            inscriptionSteps={inscriptionSteps}
          />
        ))}
      </div>
    </div>
  );
}

export function StudentCard({
  student,
  schoolCycleId,
  hasInscriptions,
  inscriptionSteps,
}: {
  student: MainStudentEntity;
  schoolCycleId: string;
  hasInscriptions: boolean;
  inscriptionSteps: InscriptionStepsEntity | null | undefined;
}) {
  const router = useRouter();
  const { guardianHash } = router.query;

  const hasUpdatedData = isDataCompleted(student, !!inscriptionSteps?.enable_consentments_step, schoolCycleId);

  const section = student.section?.grade
    ? `${student.section?.grade} ${student.section?.group} - ${student.section?.level_name}`
    : '-';

  return (
    <div className="bg-white rounded-lg p-4 pb-3 flex flex-col gap-4 border border-[#E9EEF7]">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10">
          {student.photo ? (
            <img
              src={student.photo}
              alt={student.first_name}
              className="w-full h-full rounded-full object-cover border-2 border-[#4CAF50] p-1"
            />
          ) : (
            <img
              src="/images/avatar.jpg"
              alt="Default avatar"
              className="w-full h-full rounded-full object-cover border-2 border-[#4CAF50] p-1"
            />
          )}
        </div>

        <div className="flex flex-col gap-0.5">
          <h3 className="font-semibold text-[#1C1C1C]">
            {student.first_name} {student.last_name}
          </h3>
          <p className="text-xs text-[#535765]">{section}</p>
        </div>
      </div>
      {hasInscriptions && !hasUpdatedData ? (
        <Button
          variant="solid-light"
          color="galaxy"
          size="small"
          onClick={() => router.push(`/guardians/${guardianHash}/students/${student.id}/update-profile-step`)}
        >
          Actualizar información
        </Button>
      ) : null}

      <Button
        className="px-4 py-1.5"
        size="small"
        variant="solid-light"
        color="black"
        onClick={() => router.push(`/guardians/${guardianHash}/students/${student.id}`)}
      >
        Ver perfil
      </Button>
    </div>
  );
}

export function isDataCompleted(student: MainStudentEntity, isConsenmentsEnabled: boolean, schoolCycleId: string) {
  const currentInscription = student.inscriptions?.find(
    (inscription) => inscription?.school_cycle?.id === schoolCycleId
  );

  if (!currentInscription) return true;

  const consentmentsCompleted = !isConsenmentsEnabled || !!currentInscription?.consentments_step_completed_at;

  const dataCompleted =
    !!currentInscription?.personal_step_completed_at && !!currentInscription?.medical_step_completed_at;

  return consentmentsCompleted && dataCompleted;
}

StudentsPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Estudiantes</title>
      </Head>

      <div className="sticky top-0 z-20">
        <Navbar />
      </div>

      <main className="max-w-sm mx-auto">{page}</main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const { guardianHash } = context.query;

  const redirect = redirectByGuardianFraudStatus(session, guardianHash as string, context.query);
  if (redirect) return redirect;

  return {
    props: {},
  };
};

StudentsPage.auth = true;

export default StudentsPage;
