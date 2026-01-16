import { Button } from '@cometa/recreo/v2';
import { useRouter } from 'next/router';

export function SelfSetup({ hasSchoolSteps }: { hasSchoolSteps: boolean }) {
  const router = useRouter();

  function handleCreateProcess() {
    router.push('/admissions/setup');
  }

  let title = 'Comienza tu proceso de admisión';
  let description =
    'Crea en minutos los pasos que seguirán las familias para postular a tu colegio. Te ayudamos a ordenarlos y personalizarlos según tus necesidades.';
  let buttonText = 'Crear proceso de admisión';

  if (hasSchoolSteps) {
    title = 'Continúa tu proceso de admisión';
    description =
      'Has comenzado a crear tu proceso de admisión, pero todavía no está listo para publicarse. Completa los pasos pendientes para activarlo.';
    buttonText = 'Completar configuración';
  }

  return (
    <div className="min-h-screen flex flex-col font-lota antialiased">
      <header className="px-8 py-4">
        <h1 className="text-lg font-bold text-neutral-900">Admisiones</h1>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-sm space-y-6">
          <div className="space-y-2.5">
            <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
            <p className="text-neutral-700 text-sm text-balance">{description}</p>
          </div>

          <div className="pt-5">
            <Button onClick={handleCreateProcess}>{buttonText}</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
