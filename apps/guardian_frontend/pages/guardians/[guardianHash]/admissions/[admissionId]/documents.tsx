import Head from 'next/head';
import Link from 'next/link';
import { useUTMRouter as useRouter } from '~/components/UtmNavigation';
import { BackButton } from '~/components/BackButton';
import { api } from '~/utils/api';
import { AdmissionStepStatus, SchoolStepTags } from '@cometa/trpc/src/admissions/types';
import { DocumentManager } from '~/components/document-manager';

function UploadDocumentsPage() {
  const router = useRouter();
  const { guardianHash, admissionId, stepId } = router.query as {
    guardianHash: string;
    admissionId: string;
    stepId: string;
  };

  const { data: studentLead, refetch: refetchAdmission } = api.admissions.getAdmission.useQuery(
    { id: admissionId, includeNames: true },
    { enabled: !!admissionId }
  );

  let admissionStep = studentLead?.admission_steps?.find((step) => step?.school_step?.id === stepId);

  if (!admissionStep) {
    admissionStep = studentLead?.admission_steps?.find(
      (admissionStep) => (admissionStep?.school_step?.tag as string) === SchoolStepTags.Documents
    );
  }

  const schoolStep = admissionStep?.school_step;
  const levelId = studentLead?.level_id;

  const upsertAdmissionStep = api.admissions.upsertAdmissionStep.useMutation({
    onSuccess: () => {
      refetchAdmission();
      router.push(`/guardians/${guardianHash}/admissions/${admissionId}`);
    },
  });

  async function handleSuccess() {
    await upsertAdmissionStep.mutateAsync({
      student_lead_id: admissionId as string,
      school_step_id: schoolStep?.id as string,
      status: AdmissionStepStatus.Completed,
    });
  }

  return (
    <div className="min-h-screen flex flex-col font-lota antialiased">
      <header className="p-6 pb-3">
        <Link href={`/guardians/${guardianHash}/admissions/${admissionId}`} className="flex gap-3 items-center">
          <BackButton arrowColor="#686F87" circleColor="#F3F6FB" />
          <span className="text-sm font-semibold">VOLVER</span>
        </Link>

        <h2 className="text-2xl font-bold my-4">{schoolStep?.name}</h2>

        {schoolStep?.description ? <p className="text-base text-[#3E4559]">{schoolStep?.description}</p> : null}
      </header>

      <div className="flex-grow overflow-y-auto p-6 pb-3">
        <DocumentManager
          entityId={admissionId}
          schoolStepId={schoolStep?.id as string}
          levelId={levelId as string}
          onSubmit={handleSuccess}
          submitButtonText={
            admissionStep?.status === AdmissionStepStatus.Completed ? 'Actualizar documentos' : 'Enviar documentos'
          }
          helperText="Archivos permitidos .pdf, .jpg, .jpeg, .png (Máximo 10 MB)"
        />
      </div>
    </div>
  );
}

UploadDocumentsPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Carga de documentos</title>
      </Head>

      <main className="max-w-md mx-auto">{page}</main>
    </>
  );
};

UploadDocumentsPage.auth = true;

export default UploadDocumentsPage;
