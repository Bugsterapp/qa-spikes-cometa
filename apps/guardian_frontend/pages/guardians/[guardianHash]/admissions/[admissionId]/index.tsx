import Head from 'next/head';
import { UTMLink as Link } from '~/components/UtmNavigation';
import { useUTMRouter as useRouter } from '~/components/UtmNavigation';
import { api } from '~/utils/api';
import { SchoolStepTags, type AdmissionStepEntity, type AdmissionStepStatus } from '@cometa/trpc/src/admissions/types';
import { cn } from '@cometa/utils';
import { BackButton } from '~/components/BackButton';
import { Button } from '@cometa/recreo';
import IcWhatsApp from '~/public/icons/ic_whatsapp.svg';
import { useSelectedSchool } from '~/stores/globalStore';

function AdmissionPage() {
  const router = useRouter();
  const { guardianHash, admissionId } = router.query;
  const selectedSchool = useSelectedSchool();

  const { data: studentLead } = api.admissions.getAdmission.useQuery(
    { id: admissionId as string },
    {
      enabled: !!admissionId,
    }
  );

  const { data: schoolConfig } = api.students.getSchoolConfig.useQuery(
    {
      school_id: selectedSchool?.id as string,
    },
    {
      enabled: !!selectedSchool?.id,
    }
  );

  if (!studentLead) {
    return null;
  }

  const admissionSteps = studentLead.admission_steps;
  const admissionStepsCount = admissionSteps?.length as number;

  let lastCompleted = 0;
  admissionSteps?.forEach((step, idx) => {
    if (step?.status === 'completed') {
      lastCompleted = idx;
    }
  });

  const handleWhatsAppClick = () => {
    if (!schoolConfig?.admission_whatsapp_phone) return;

    const message = `¡Hola ${selectedSchool?.name}! Tengo un proceso de admisión en curso para ${studentLead.first_name} ${studentLead.last_name} y quisiera hablar con alguien del equipo de admisiones. ¡Gracias!`;
    const whatsappUrl = `https://wa.me/${schoolConfig.admission_whatsapp_phone}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-[#873aff] bg-[url('/admissions/section-bg.svg')] bg-center font-lota antialiased">
      <header className="p-6 text-white">
        <div className="flex justify-between items-center">
          <Link href={`/guardians/${guardianHash}/admissions`} className="flex gap-3 items-center">
            <BackButton arrowColor="#873AFF" circleColor="white" />
            {!schoolConfig?.admission_whatsapp_phone ? <span className="text-sm font-semibold">VOLVER</span> : null}
          </Link>

          {schoolConfig?.admission_whatsapp_phone ? (
            <button
              onClick={handleWhatsAppClick}
              className="py-2 px-4 rounded-full bg-white text-[#873AFF] flex items-center gap-2 font-bold"
            >
              <span>Contactar al colegio</span>
              <IcWhatsApp className="scale-90" />
            </button>
          ) : null}
        </div>

        <div className="mt-7 mb-3">
          <p className="text-sm">Admisiones</p>
          <h2 className="text-2xl font-bold">
            {studentLead.first_name} {studentLead.last_name}
          </h2>
        </div>

        <p>Completa todos los pasos para finalizar el proceso de admisión.</p>
      </header>

      <section className="flex flex-col gap-4 p-6 pb-10 bg-white rounded-t-2xl">
        {admissionSteps?.map((step, idx) => (
          <AdmissionStep
            key={`${step?.id}-${idx}`}
            step={step}
            lastStep={idx === admissionStepsCount - 1}
            lastCompleted={idx < lastCompleted}
          />
        ))}
      </section>
    </div>
  );
}

function AdmissionStep({
  step,
  lastStep,
  lastCompleted,
}: {
  step: AdmissionStepEntity | null;
  lastStep: boolean;
  lastCompleted: boolean;
}) {
  const router = useRouter();
  const { guardianHash, admissionId } = router.query;

  if (!step) {
    return null;
  }

  const stepId = step.school_step?.id;
  const stepTag = step.school_step?.tag;
  const status = step.status as AdmissionStepStatus;
  const isCompleted = status === 'completed';
  const actions = step.school_step?.actions;
  const isVisible = actions?.to_do?.label && step.enabled_rules?.guardian;

  const handleClickAction = (redirectUrl?: string) => {
    if (!redirectUrl) return;

    if (redirectUrl.startsWith('http')) {
      return window.open(redirectUrl, '_blank');
    }

    if (redirectUrl.startsWith('/')) {
      return router.push(`/guardians/${guardianHash}${redirectUrl}`);
    }

    const basePath = `/guardians/${guardianHash}/admissions/${admissionId}/${redirectUrl}`;

    if ([SchoolStepTags.ScholarInfo, SchoolStepTags.Documents].includes(stepTag as SchoolStepTags)) {
      const pathWithStepId = `${basePath}?stepId=${stepId}`;
      return router.push(pathWithStepId);
    }

    return router.push(basePath);
  };

  return (
    <div className="relative flex items-start">
      <div className="absolute left-0 top-4 -bottom-8 flex flex-col items-center">
        <div
          className={cn('w-6 h-6 rounded-full border-2 border-[#e4ebf6] bg-white flex items-center justify-center', {
            'border-[#28c441]': isCompleted,
          })}
        >
          {isCompleted ? <CheckIcon className="text-[#28c441]" /> : null}
        </div>
        {lastStep ? null : (
          <div className={cn('w-0.5 flex-1 bg-[#e4ebf6]', { 'bg-[#28c441]': isCompleted && lastCompleted })} />
        )}
      </div>

      <div className={cn('w-full ml-12 p-4 border-2 border-[#e4ebf6] rounded-lg', { 'border-[#28c441]': isCompleted })}>
        <h3 className="font-semibold text-[#1c1c1d]">{step.school_step?.name}</h3>

        <p className="text-sm text-[#686f87] py-4">{step.school_step?.description}</p>

        {isVisible ? (
          <Button
            size="small"
            className={cn('bg-[#1c1c1d] hover:bg-[#353540] px-5 py-2 mt-2 font-semibold', {
              'bg-[#f3f6fb] text-[#1c1c1d] hover:bg-gray-50': isCompleted,
            })}
            onClick={() => handleClickAction(actions[status]?.redirect_url)}
          >
            {actions[status]?.label}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="10" height="9" viewBox="0 0 10 9" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.64304 0.61002C10.045 0.968337 10.0804 1.58468 9.7221 1.98666L4.10206 8.29153L0.766396 5.27452C0.367023 4.9133 0.336095 4.29672 0.697315 3.89735C1.05854 3.49797 1.67512 3.46705 2.07449 3.82827L3.95338 5.52766L8.2664 0.689078C8.62472 0.287099 9.24106 0.251703 9.64304 0.61002Z"
        fill="#28C441"
      />
    </svg>
  );
}

AdmissionPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Admisión</title>
      </Head>

      <main className="max-w-md mx-auto">{page}</main>
    </>
  );
};

AdmissionPage.auth = true;

export default AdmissionPage;
