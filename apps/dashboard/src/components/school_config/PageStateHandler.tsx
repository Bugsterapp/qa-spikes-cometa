import React from 'react';

type PageStateHandlerProps = {
  canViewPage: boolean;
  isLoading?: boolean;
  selectedSchool?: unknown;
  accessDeniedTitle?: string;
  accessDeniedMessage?: string;
  children: React.ReactNode;
};

export function PageStateHandler({
  canViewPage,
  isLoading = false,
  selectedSchool,
  accessDeniedTitle = 'Acceso Denegado',
  accessDeniedMessage = 'No tienes permisos para acceder a esta página.',
  children,
}: Readonly<PageStateHandlerProps>) {
  if (!selectedSchool || isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[calc(100vh-300px)] flex-col">
        <img src="/assets/loading.svg" alt="loading" data-state="show" className="mx-auto w-10 h-10" />
      </div>
    );
  }

  if (!canViewPage) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[calc(100vh-300px)]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2 font-lota">{accessDeniedTitle}</h2>
          <p className="text-gray-600 font-lota">{accessDeniedMessage}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
