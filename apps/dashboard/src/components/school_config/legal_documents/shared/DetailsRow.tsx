type DetailsRowProps = {
  label: string;
  content: string;
};

export function DetailsRow({ label, content }: Readonly<DetailsRowProps>) {
  return (
    <div className="bg-white box-border content-stretch flex items-center px-6 py-4 relative shrink-0 w-full border-b border-[#eceff6]">
      <div className="font-lota leading-[0] not-italic relative shrink-0 text-[#697086] text-sm w-[148px]">
        <p className="leading-5">{label}</p>
      </div>
      <div className="font-lota leading-[0] not-italic relative shrink-0 text-[#22283a] text-base flex-1">
        <p className="leading-6 whitespace-pre">{content}</p>
      </div>
    </div>
  );
}
