import Head from 'next/head';
import Link from 'next/link';
import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useUTMRouter as useRouter } from '~/components/UtmNavigation';
import { BackButton } from '~/components/BackButton';
import { api } from '~/utils/api';
import { AdmissionStepStatus } from '@cometa/trpc/src/admissions/types';
import { SignatureManager } from '~/components/signatures/signature-manager';

function SignaturesPage() {
  const router = useRouter();
  const utils = api.useUtils();
  const { data: session } = useSession();
  const { guardianHash, admissionId, schoolStepId } = router.query as {
    guardianHash: string;
    admissionId: string;
    schoolStepId: string;
  };

  const { data: studentLead } = api.admissions.getAdmission.useQuery({ id: admissionId }, { enabled: !!admissionId });
  const { data: signatureTemplates } = api.admissions.listSignatureTemplates.useQuery(
    { school_step_id: schoolStepId },
    { enabled: !!schoolStepId }
  );

  const admissionStep = studentLead?.admission_steps?.find((step) => step?.school_step?.id === schoolStepId);
  const schoolStep = admissionStep?.school_step;

  const templateIds = useMemo(() => {
    if (!signatureTemplates || !studentLead) return [];

    const filtered = signatureTemplates.filter((template) => {
      if (!template.level_ids || template.level_ids.length === 0) {
        return true;
      }
      return template.level_ids.includes(studentLead.level_id as string);
    });

    return filtered.sort((a, b) => a.order - b.order).map((t) => t.signature_template_id);
  }, [signatureTemplates, studentLead]);

  const signer = useMemo(() => {
    if (!session?.user) return null;
    const userName = `${session.user.first_name || ''} ${session.user.last_name || ''}`.trim();
    return {
      id: session.user.id as string,
      email: session.user.email as string,
      name: userName || session.user.email,
    };
  }, [session]);

  const upsertAdmissionStep = api.admissions.upsertAdmissionStep.useMutation({
    onSuccess: () => {
      utils.admissions.getAdmissions.invalidate();
      router.push(`/guardians/${guardianHash}/admissions/${admissionId}`);
    },
  });

  function handleAllCompleted() {
    upsertAdmissionStep.mutate({
      student_lead_id: admissionId,
      school_step_id: schoolStepId,
      status: AdmissionStepStatus.Completed,
    });
  }

  if (!signer || !studentLead) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <>
      <header className="p-6 pb-2">
        <Link href={`/guardians/${guardianHash}/admissions/${admissionId}`} className="flex gap-3 items-center">
          <BackButton arrowColor="#686F87" circleColor="#F3F6FB" />
          <span className="text-sm font-semibold">VOLVER</span>
        </Link>
      </header>

      <SignatureManager
        templateIds={templateIds}
        signer={signer}
        schoolId={studentLead.school_id as string}
        externalId={studentLead.id as string}
        module="admissions"
        onCompleted={handleAllCompleted}
        title={schoolStep?.name || 'Firma de contratos'}
        description={schoolStep?.description || 'Firma los siguientes contratos solicitados por el colegio.'}
      />
    </>
  );
}

SignaturesPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Firma de contratos</title>
      </Head>
      <main className="max-w-md mx-auto bg-white h-screen flex flex-col">{page}</main>
    </>
  );
};

SignaturesPage.auth = true;

export default SignaturesPage;
