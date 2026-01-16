import InfoCircleIcon from 'public/assets/icons/ic_info_circle_outline.svg';

type InfoAlertProps = {
  children: React.ReactNode;
};

export function InfoAlert({ children }: Readonly<InfoAlertProps>) {
  return (
    <div className="bg-[#f8f9fb] border border-[#d0d8e9] rounded-lg px-4 py-3 flex items-center gap-3">
      <div className="flex-shrink-0">
        <InfoCircleIcon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-[#22283a] leading-5">{children}</p>
      </div>
    </div>
  );
}
