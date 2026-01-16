import IcWarningCircle from 'public/assets/icons/ic_warning_circle.svg';

type DeclinedAlertProps = {
  message?: string;
  defaultMessage: string;
};

function DeclinedAlert({ message, defaultMessage }: DeclinedAlertProps) {
  return (
    <div className="bg-[#fff9e6] box-border content-stretch flex gap-3 items-center justify-start px-4 py-3 relative rounded-[8px] w-full">
      <div
        aria-hidden="true"
        className="absolute border border-[#b58905] border-solid inset-0 pointer-events-none rounded-[8px]"
      />
      <div className="basis-0 content-stretch flex gap-3 grow items-start justify-start min-h-px min-w-px relative shrink-0">
        <div className="box-border content-stretch flex items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0">
          <div className="relative shrink-0 size-4 flex items-center justify-center">
            <IcWarningCircle className="w-4 h-4 text-[#b58905]" />
          </div>
        </div>
        <div className="basis-0 content-stretch flex flex-col gap-1 grow items-start justify-center min-h-px min-w-px relative shrink-0">
          <div className="font-['Lota_Grotesque',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#b58905] text-[14px] w-full">
            <p className="leading-[20px] whitespace-normal">{message || defaultMessage}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeclinedAlert;
