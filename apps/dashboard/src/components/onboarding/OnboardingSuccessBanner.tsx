export function OnboardingSuccessBanner() {
  return (
    <div className="bg-[#edffeb] box-border flex gap-6 items-center justify-center p-6 rounded-[16px] w-full">
      <div className="flex flex-col gap-6 items-start justify-center flex-1">
        <div className="flex flex-col gap-4 items-start justify-center w-full">
          <div className="flex flex-col gap-2 items-start justify-center w-full">
            <div className="font-semibold text-[16px] leading-[24px] text-[#1e8e30]">
              Completaste el proceso de Onboarding
            </div>
            <div className="font-normal text-[14px] leading-[20px] text-[#444c60]">
              Te notificaremos cuando tu información haya sido revisada por el equipo de Cometa.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
