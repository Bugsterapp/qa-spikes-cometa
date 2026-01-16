'use client';

import Head from 'next/head';
import { BackButton } from '~/components/BackButton';
import { useRouter } from 'next/router';
import { api } from '~/utils/api';
import { CollapsibleCard, CardTitle } from '~/components/Card';
import Status from '~/components/Status';
import Link from 'next/link';
import { SchoolStepTags } from '@cometa/trpc/src/admissions/types';
import { RichTextLink } from '@cometa/recreo';
import { isVisible } from '@cometa/dynamic-forms';
import { MainStudentEntity } from '@cometa/trpc/src/students/types';
function ConsentmentsPage() {
  const router = useRouter();
  const { guardianHash } = router.query;
  const studentId = router.query.studentId as string;

  const { data: student } = api.students.getStudent.useQuery({ studentId }) as { data: MainStudentEntity };
  const { questions, answers } = useDynamicForm(student || undefined, SchoolStepTags.ConsentForm);

  const questionsFiltered = questions.filter((question) =>
    isVisible(question, { visibleConditionValue: student?.section?.level_id })
  );

  return (
    <main className="px-5 py-6 flex flex-col gap-6">
      <Link href={`/guardians/${guardianHash}/students/${studentId}`} className="flex gap-3 items-center">
        <BackButton arrowColor="#1C1C1D" circleColor="#F3F6FB" />
        <span className="text-sm font-semibold uppercase">Volver</span>
      </Link>

      <header className="flex flex-col gap-2">
        <h1 className="text-lg font-bold text-[#22222A]">Consentimientos y autorizaciones</h1>
        <p className="text-sm text-[#535765]">
          Revisa los consentimientos y autorizaciones aceptados o rechazados para este estudiante.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        {questionsFiltered.map((question) => {
          const questionName = question.entity_question?.name ?? question.name;
          const questionDescription = question.entity_question?.description ?? question.description;

          const answer = answers?.find((answer) => answer.question_id === question.id)?.answer;
          const statusLabel = (answer ?? '') as StatusLabel;
          const status = mapStatus(statusLabel);

          return (
            <CollapsibleCard
              key={question.id}
              title={
                <CardTitle className="border-none">
                  <span>{questionName}</span>
                  <Status variant={status.variant}>{status.label}</Status>
                </CardTitle>
              }
            >
              <RichTextLink className="text-sm text-gray-600 dark:text-gray-400" text={questionDescription as string} />
            </CollapsibleCard>
          );
        })}
      </section>
    </main>
  );
}

type StatusLabel = '' | 'Sí, acepto' | 'No acepto';

type StatusProps = {
  label: string;
  variant: 'info' | 'success' | 'error' | 'muted' | 'warning';
  borderColor: string;
};

const fallBackStatusKey = '';
const yesAcceptStatusKey = 'Sí, acepto';
const noAcceptStatusKey = 'No acepto';

const statuses: Record<StatusLabel, StatusProps> = {
  [fallBackStatusKey]: { label: 'Sin respuesta', variant: 'muted', borderColor: '#E6EBF5' },
  [yesAcceptStatusKey]: { label: 'Aceptado', variant: 'success', borderColor: '#229A16' },
  [noAcceptStatusKey]: { label: 'Rechazado', variant: 'error', borderColor: '#D32F2F' },
};

function mapStatus(answer: string | StatusLabel): StatusProps {
  if (answer in statuses) {
    return statuses[answer as StatusLabel];
  }

  // @TODO: this is a temporal fix to map the possible positive answer.
  // We need a explicit rule/logic to determine the status based on the answer.
  // This rule/logic must be defined from the backend.
  const possiblePositiveAnswers = ['sí, acepto', 'si, acepto', 'sí,', 'si,'];
  if (possiblePositiveAnswers.filter((pa) => answer.toLowerCase().includes(pa)).length > 0) {
    return statuses[yesAcceptStatusKey];
  }

  return statuses[''];
}

export function useDynamicForm(student?: MainStudentEntity, category?: string) {
  const schoolId = student?.school_id as string;
  const { data: form } = api.forms.getDynamicForm.useQuery({ createdBy: schoolId, category }, { enabled: !!schoolId });
  const { data: answers = [] } = api.forms.getAnswers.useQuery(
    { form_id: form?.id as string, answered_for: student?.id as StatusLabel },
    { enabled: !!form?.id && !!student?.id }
  );

  const sections = form?.layout || [];
  const questions =
    sections.flatMap((section) =>
      section.questions.flatMap((questionGroup) => questionGroup.flatMap((question) => question))
    ) || [];

  return { form, sections, questions, answers };
}

ConsentmentsPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Consentimientos y autorizaciones</title>
      </Head>

      <main className="max-w-sm mx-auto">{page}</main>
    </>
  );
};

ConsentmentsPage.auth = true;

export default ConsentmentsPage;
