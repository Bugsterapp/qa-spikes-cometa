import Head from 'next/head';
import { UTMLink as Link } from '~/components/UtmNavigation';
import { BackButton } from '~/components/BackButton';
import { useSelectedSchool } from '~/stores/globalStore';
import { api } from '~/utils/api';
import { Button } from '@cometa/recreo';
import { Fragment, useMemo, useState } from 'react';
import { AdmissionStepStatus, SchoolStepTags, UrlFileEntity } from '@cometa/trpc/src/admissions/types';
import { FileCard } from '~/components/school-steps/resources/file-card';
import { VideoCard } from '~/components/school-steps/resources/video-card';
import { useRouter } from 'next/router';

function ScholarInfoPage() {
  const selectedSchool = useSelectedSchool();
  const schoolId = selectedSchool?.id as string;

  const router = useRouter();
  const { guardianHash, admissionId, stepId } = router.query as {
    guardianHash: string;
    admissionId: string;
    stepId: string;
  };

  const [isLoading, setLoading] = useState(false);

  const { data: studentLead } = api.admissions.getAdmission.useQuery(
    { id: admissionId as string },
    {
      enabled: !!admissionId,
    }
  );

  let admissionStep = studentLead?.admission_steps?.find((step) => step?.school_step?.id === stepId);

  if (!admissionStep) {
    admissionStep = studentLead?.admission_steps?.find(
      (admissionStep) => (admissionStep?.school_step?.tag as string) === SchoolStepTags.ScholarInfo
    );
  }

  const stepName = admissionStep?.school_step?.name;
  const isPending = admissionStep?.status !== AdmissionStepStatus.Completed;
  const schoolStepId = admissionStep?.school_step?.id;

  const { data: resources } = api.admissions.getSchoolStepResources.useQuery(
    { school_step_id: schoolStepId as string },
    { enabled: !!schoolStepId }
  );

  const getOrderKey = (o: number | null | undefined): number => o ?? Number.POSITIVE_INFINITY;

  const sortedResources = useMemo(() => {
    if (!resources) return undefined;

    return [...resources].sort((a, b) => {
      const ak = getOrderKey(a.order);
      const bk = getOrderKey(b.order);

      if (ak !== bk) return ak - bk;

      return 0;
    });
  }, [resources]);

  const fileResources = sortedResources?.filter((resource) => resource.type === 'file');

  const fileIds = fileResources?.map((resource) => resource.source as string);
  const { data: files } = api.admissions.getFiles.useQuery(
    { school_id: schoolId, ids: fileIds },
    { enabled: !!schoolId && !!fileIds }
  );

  const utils = api.useUtils();

  const upsertAdmissionStep = api.admissions.upsertAdmissionStep.useMutation({
    onSuccess: async () => {
      await utils.admissions.getAdmission.invalidate({ id: admissionId as string });
      await utils.admissions.getFiles.invalidate({ school_id: schoolId });

      router.push(`/guardians/${guardianHash}/admissions/${admissionId}`);
    },
  });

  function handleConfirmation() {
    setLoading(true);

    upsertAdmissionStep.mutate({
      student_lead_id: admissionId as string,
      school_step_id: schoolStepId as string,
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

        <h2 className="text-2xl font-bold my-4">{stepName}</h2>

        <p className="text-base text-[#3E4559]">
          En los siguientes documentos podrás encontrar información acerca del colegio y el proceso de admisión.
        </p>
      </header>

      <div className="flex-grow overflow-y-auto p-6 pb-3 flex flex-col gap-4">
        {sortedResources?.map((resource) => {
          const isFile = resource.type === 'file';
          const file = files?.find((file) => file.id === resource.source) as UrlFileEntity;

          return (
            <Fragment key={resource.id}>
              {isFile ? <FileCard resource={resource} file={file} /> : <VideoCard resource={resource} />}
            </Fragment>
          );
        })}
      </div>

      <div className="px-6 pb-6">
        {sortedResources && isPending ? (
          <Button
            onClick={handleConfirmation}
            className="w-full mt-2"
            size="medium"
            variant="solid"
            color="black"
            disabled={isLoading}
          >
            Listo
          </Button>
        ) : null}
      </div>
    </div>
  );
}

ScholarInfoPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Información escolar</title>
      </Head>

      <main className="max-w-md mx-auto">{page}</main>
    </>
  );
};

ScholarInfoPage.auth = true;

export default ScholarInfoPage;
