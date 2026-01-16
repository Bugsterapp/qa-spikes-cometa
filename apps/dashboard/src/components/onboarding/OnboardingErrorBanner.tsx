type OnboardingErrorBannerProps = {
  errorCount: number;
};

export function OnboardingErrorBanner({ errorCount }: OnboardingErrorBannerProps) {
  if (errorCount === 0) return null;

  const errorText =
    errorCount === 1
      ? 'Tienes 1 campo con información incorrecta.'
      : `Tienes ${errorCount} campos con información incorrecta.`;

  return (
    <div className="bg-[#ffefef] box-border flex gap-3 items-center justify-start px-4 py-3 rounded-[8px] w-full">
      <div className="flex gap-3 items-start justify-start flex-1">
        <div className="flex flex-col gap-1 items-start justify-center text-[#e65959] flex-1">
          <div className="font-semibold text-[16px] leading-[24px] overflow-ellipsis overflow-hidden text-nowrap w-full">
            {errorText}
          </div>
          <div className="font-normal text-[14px] leading-[22px] w-full">
            Por favor corrige los datos indicados y vuelve a "Finalizar" el proceso para poder revisar los datos
            nuevamente.
          </div>
        </div>
      </div>
    </div>
  );
}
