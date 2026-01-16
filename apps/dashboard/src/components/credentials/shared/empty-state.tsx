import { Button } from '@cometa/recreo/v2';

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description: string;
  buttonText?: string;
  onButtonClick?: () => void;
  className?: string;
};

export function EmptyState({ icon, title, description, buttonText, onButtonClick, className = '' }: EmptyStateProps) {
  return (
    <div className={`bg-[#f8f9fb] rounded-[16px] flex items-center justify-center px-[36px] py-[24px] ${className}`}>
      <div className="flex flex-col gap-[36px] items-center justify-center w-[439px]">
        <div className="flex flex-col gap-[13px] items-center justify-center w-full">
          {icon ? <div className="w-[83px] h-[83px]">{icon}</div> : null}
          <p className="font-semibold leading-[24px] text-[16px] text-[#22283a] text-center whitespace-nowrap">
            {title}
          </p>
          <p className="font-normal leading-[20px] text-[14px] text-[#444c60] text-center w-full">{description}</p>
        </div>
        {buttonText && onButtonClick ? (
          <Button
            onClick={onButtonClick}
            variant="ghost"
            className="bg-[#f3ebff] px-[20px] py-[10px] rounded-[100px] text-[#7b35e8] text-[14px] font-semibold leading-[20px]"
          >
            {buttonText}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function EmptyCredentialIcon() {
  return <img src="/assets/credentials.png" alt="Credencial vacía" className="w-[83px] h-[83px]" />;
}
