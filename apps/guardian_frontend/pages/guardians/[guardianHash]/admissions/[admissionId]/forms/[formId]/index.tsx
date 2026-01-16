'use client';

import { Button } from '@cometa/recreo';
import Head from 'next/head';
import { UTMLink as Link } from '~/components/UtmNavigation';
import { useUTMRouter as useRouter } from '~/components/UtmNavigation';
import { FormBuilder } from '~/components/FormBuilder';
import { api } from '~/utils/api';
import { useSession } from 'next-auth/react';
import { prepareDataForSubmit, useExtraFields } from '@cometa/dynamic-forms';
import { useState } from 'react';

function DynamicFormPage() {
  const session = useSession();
  const guardian = session?.data?.user;
  const guardianId = guardian?.id as string;

  const router = useRouter();
  const { guardianHash } = router.query;
  const [isLoading, setLoading] = useState(false);

  const admissionId = router.query.admissionId as string;
  const formId = router.query.formId as string;

  const { data: answers, refetch: refetchAnwers } = api.forms.getAnswers.useQuery(
    { form_id: formId, answered_for: admissionId },
    { enabled: !!formId }
  );

  const { data: studentLead, refetch: refetchAdmission } = api.admissions.getAdmission.useQuery(
    { id: admissionId, includeNames: true },
    { enabled: !!admissionId }
  );
  const { data: form } = api.forms.getForm.useQuery(
    { form_id: formId, school_id: studentLead?.school_id ?? '' },
    { enabled: !!formId && !!studentLead?.school_id }
  );

  const [extraFields, setExtraFields] = useExtraFields({ form, answers });

  const upsertAnswers = api.forms.upsertAnswersAndCompleteStep.useMutation({
    onSuccess: async () => {
      await refetchAdmission();
      await refetchAnwers();

      router.push(`/guardians/${guardianHash}/admissions/${admissionId}`);
    },
  });

  if (!form) {
    return null;
  }

  function handleSubmit(data: { [key: string]: string }) {
    setLoading(true);

    const formData = prepareDataForSubmit({
      data,
      admissionForm: form!,
      userId: guardianId,
      answeredFor: admissionId,
      extraFields,
    });

    upsertAnswers.mutate({ form_id: formId, data: formData });
  }

  return (
    <div className="font-lota antialiased">
      <header className="p-6 text-[#1c1c1d]">
        <Link href={`/guardians/${guardianHash}/admissions/${admissionId}`} className="flex gap-3 items-center">
          <BackButton bgFill="#f3f6fb" className="rounded-full" />
          <span className="text-sm font-semibold">VOLVER</span>
        </Link>

        <h2 className="text-2xl font-bold my-4 text-[#1C1C1D]">{form.name}</h2>
        {form.description ? <p className="text-[#3E4559]">{form.description}</p> : null}
      </header>

      <section className="flex flex-col gap-4 px-6 pb-10">
        <FormBuilder
          layout={form.layout || []}
          onSubmit={handleSubmit}
          answers={answers}
          extraFields={[extraFields, setExtraFields] as const}
          validations={{ visibleConditionValue: studentLead?.level_id }}
        >
          <Button
            className="w-full mt-2"
            size="medium"
            variant="solid"
            color="black"
            type="submit"
            disabled={isLoading}
          >
            Guardar
          </Button>
        </FormBuilder>
      </section>
    </div>
  );
}

function BackButton({ bgFill, className }: { bgFill?: string; className?: string }) {
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 38 38"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="19" cy="19" r="19" fill={bgFill ?? 'blue'} />
      <path
        d="M13.5582 18.6009C13.5577 18.3843 13.6507 18.1744 13.821 18.0077L19.5323 12.446C19.7262 12.2567 20.0048 12.1376 20.3068 12.115C20.6089 12.0924 20.9096 12.1681 21.1429 12.3255C21.3762 12.4828 21.5229 12.7089 21.5507 12.954C21.5786 13.1991 21.4853 13.4432 21.2914 13.6325L16.174 18.6009L21.1086 23.5694C21.2035 23.6642 21.2744 23.7733 21.3171 23.8904C21.3599 24.0075 21.3737 24.1303 21.3578 24.2518C21.3419 24.3732 21.2965 24.4909 21.2243 24.5981C21.1522 24.7053 21.0546 24.7999 20.9373 24.8764C20.8198 24.9613 20.682 25.0255 20.5326 25.0652C20.3831 25.1049 20.2251 25.1191 20.0685 25.1069C19.912 25.0947 19.7602 25.0564 19.6227 24.9944C19.4852 24.9324 19.365 24.848 19.2696 24.7466L13.7524 19.1849C13.6091 19.0133 13.5407 18.8077 13.5582 18.6009Z"
        fill="currentColor"
      />
    </svg>
  );
}

DynamicFormPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Formulario</title>
      </Head>

      <main className="max-w-md mx-auto">{page}</main>
    </>
  );
};

DynamicFormPage.auth = true;

export default DynamicFormPage;
