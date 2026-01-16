import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Lottie from 'lottie-react';
import { useAdmissionSetup } from '../context/admission-setup-context';
import logoAnimation from 'public/logo/logo.json';

export function PublishingStep() {
  const router = useRouter();
  const { showPublishing } = useAdmissionSetup();

  useEffect(() => {
    if (!showPublishing) return;

    const timeout = setTimeout(() => {
      router.push('/admissions');
    }, 5000);

    return () => clearTimeout(timeout);
  }, [showPublishing, router]);

  if (!showPublishing) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16">
            <Lottie animationData={logoAnimation} loop autoplay className="w-full h-full" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-neutral-900 mb-4">Publicando tu proceso de admisión...</h1>

        <p className="text-neutral-700 text-balance">
          Estamos dejando todo listo para que tu proceso esté activo y disponible para las familias.
        </p>
      </div>
    </div>
  );
}
