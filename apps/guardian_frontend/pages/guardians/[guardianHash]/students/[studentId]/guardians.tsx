'use client';

import Head from 'next/head';
import { BackButton } from '~/components/BackButton';
import { CardContent, CardTitle, Card } from '~/components/Card';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { api } from '~/utils/api';

function GuardiansPage() {
  const router = useRouter();
  const { guardianHash } = router.query;
  const studentId = router.query.studentId as string;

  const { data: guardians } = api.students.getStudentGuardians.useQuery({ studentId });

  return (
    <main className="px-5 py-6 flex flex-col gap-6">
      <Link href={`/guardians/${guardianHash}/students/${studentId}`} className="flex gap-3 items-center">
        <BackButton arrowColor="#1C1C1D" circleColor="#F3F6FB" />
        <span className="text-sm font-semibold uppercase">Volver</span>
      </Link>

      <header className="flex flex-col gap-2">
        <h1 className="text-lg font-bold text-[#22222A]">Tutores registrados</h1>
        <p className="text-sm text-[#535765]">
          En un mundo lleno de oportunidades, los tutores registrados son la clave para el éxito académico.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        {guardians?.map((guardian) => (
          <Card key={guardian.id}>
            <CardTitle className="border-b-0 pb-0">
              {guardian.first_name} {guardian.last_name}
            </CardTitle>
            <CardContent className="pt-1">{guardian.email}</CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}

GuardiansPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Tutores</title>
      </Head>

      <main className="max-w-sm mx-auto">{page}</main>
    </>
  );
};

GuardiansPage.auth = true;

export default GuardiansPage;
