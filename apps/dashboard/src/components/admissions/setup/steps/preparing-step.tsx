import { useEffect } from 'react';
import Lottie from 'lottie-react';
import { useAdmissionSetup } from '../context/admission-setup-context';
import logoAnimation from 'public/logo/logo.json';

export function PreparingStep() {
  const { showLoading, finishSetup } = useAdmissionSetup();

  useEffect(() => {
    if (!showLoading) return;

    const timeout = setTimeout(() => {
      finishSetup();
    }, 5000);

    return () => clearTimeout(timeout);
  }, [showLoading, finishSetup]);

  if (!showLoading) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16">
            <Lottie animationData={logoAnimation} loop autoplay className="w-full h-full" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-neutral-900 mb-4">Preparando tu proceso de admisión...</h1>

        <p className="text-neutral-700 text-balance">
          En unos segundos podrás revisar y ajustar cada paso antes de activar el proceso para las familias.
        </p>
      </div>
    </div>
  );
}
