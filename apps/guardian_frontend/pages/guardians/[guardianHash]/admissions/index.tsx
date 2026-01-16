import Head from 'next/head';
import { useUTMRouter as useRouter } from '~/components/UtmNavigation';
import { useSession } from 'next-auth/react';
import Navbar from '~/components/Navbar';
import { useSelectedSchool } from '~/stores/globalStore';
import { AdmissionForm } from '~/components/AdmissionForm';
import { api } from '~/utils/api';
import { AdmissionCard } from '~/components/AdmissionCard';
import { ListStudentLeadDTO } from '@cometa/trpc/src/admissions/types';

function AdmissionsPage() {
  const selectedSchool = useSelectedSchool();
  const session = useSession();

  const guardian = session?.data?.user;

  const schoolId = (selectedSchool?.id ?? guardian?.schools[0]?.id) as string;

  const router = useRouter();
  const { guardianHash } = router.query;

  const { data: admissions, isLoading } = api.admissions.getAdmissions.useQuery(
    {
      schoolId,
      query: {
        external_guardian_id: [guardian?.id as string],
      },
    },
    {
      enabled: !!schoolId,
    }
  );

  function goToAdmission(student_lead: ListStudentLeadDTO) {
    return router.push(`/guardians/${guardianHash}/admissions/${student_lead.id}`);
  }

  return (
    <div className="font-lota antialiased">
      <header className="flex justify-between items-center p-6">
        <h2 className="text-2xl font-bold text-[#1c1c1d]">Admisiones</h2>
        <AdmissionForm schoolId={schoolId} guardian={guardian} />
      </header>

      <div className="text-base text-[#686F87] px-6 pb-6">
        <p>Revisa y completa tus procesos de admisión o inicia uno nuevo para un nuevo estudiante.</p>
      </div>

      <div className="px-6">
        {isLoading ? (
          <div className="h-20 w-full bg-slate-50 p-6 rounded-[14px] flex flex-col gap-3 items-start hover:cursor-pointer animate-pulse">
            <span className="w-2/3 h-2 bg-slate-300 rounded-xl" />
            <span className="w-1/3 h-2 bg-slate-300 rounded-xl" />
          </div>
        ) : (
          admissions?.results?.map((student_lead) => (
            <AdmissionCard.Root status={student_lead?.status} key={student_lead.id}>
              <AdmissionCard.Status />
              <AdmissionCard.Body>
                <AdmissionCard.Header firstName={student_lead.first_name} lastName={student_lead.last_name} />
                <div className="border-b-2 border-[#EBEBEB] my-3" />
                <AdmissionCard.Content>
                  <AdmissionCard.Item label="Ciclo de ingreso">{student_lead.school_cycle_name}</AdmissionCard.Item>
                  <AdmissionCard.Item label="Grado de postulación">
                    {student_lead.section_name} - {student_lead.level}
                  </AdmissionCard.Item>
                </AdmissionCard.Content>
                <AdmissionCard.Footer onClick={() => goToAdmission(student_lead)} />
              </AdmissionCard.Body>
            </AdmissionCard.Root>
          ))
        )}
      </div>
    </div>
  );
}

AdmissionsPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Admisiones</title>
      </Head>

      <div className="sticky top-0 z-20">
        <Navbar />
      </div>

      <main className="max-w-md mx-auto">{page}</main>
    </>
  );
};

AdmissionsPage.auth = true;

export default AdmissionsPage;
