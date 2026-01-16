import Lottie from 'lottie-react';
import logoAnimation from 'public/logo/logo.json';

type LoadingScreenProps = {
  title: string;
  description: string;
};

export function LoadingScreen({ title, description }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16">
            <Lottie animationData={logoAnimation} loop autoplay className="w-full h-full" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-neutral-900 mb-4">{title}</h1>

        <p className="text-neutral-700 text-balance">{description}</p>
      </div>
    </div>
  );
}
