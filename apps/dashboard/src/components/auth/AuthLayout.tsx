import Image from 'next/image';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex font-lota antialiased">
      {/* Left side - Cover */}
      <div className="flex-1 relative overflow-hidden hidden lg:block">
        <div className="absolute inset-0">
          <Image src="/assets/auth/background.svg" alt="Background" fill className="object-cover" priority />
        </div>

        <div
          className="relative z-10 h-full flex flex-col items-center justify-center"
          style={{ paddingBottom: '30px' }}
        >
          <div className="w-[400px]">
            <div className="mb-8">
              <Image src="/logo/logo_cometa_transp.svg" alt="Cometa Logo" width={150} height={72} priority />
            </div>
            <h1 className="text-[36px] text-gray-900 leading-tight text-left font-lota">
              <span className="font-normal">Gestiona tu colegio</span>
              <br />
              <span className="font-bold">desde un solo lugar.</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-0 bg-white min-h-screen lg:min-h-0">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <Image src="/logo/logo_cometa_transp.svg" alt="Cometa Logo" width={120} height={58} priority />
          </div>
          {title && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 font-lota">{title}</h2>
              {subtitle && <p className="text-sm text-gray-600 font-lota">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
