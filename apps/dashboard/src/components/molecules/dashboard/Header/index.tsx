import InvoiceChip from '/src/components/atoms/Chip';

interface IHeaderProps {
  title: string;
  button?: string;
  clickOnButton?: () => void;
  subtitle?: string;
  label?: string;
}

const Header = ({ title, button, clickOnButton, subtitle, label }: IHeaderProps) => (
  <div className="flex justify-between items-center">
    <div className="flex flex-col py-6 gap-2">
      <span className="text-xl font-bold">{title}</span>
      <span className="text-sm font-normal text-[#637381]">{subtitle}</span>
    </div>
    {label && (
      <div className="ml-4 mb-2">
        <InvoiceChip intent="darkInfo">{label}</InvoiceChip>
      </div>
    )}
    {clickOnButton && (
      <button
        className="inline-flex select-none items-center justify-center rounded-lg py-1.5 px-4 text-sm font-medium border text-white bg-green hover:bg-green-800 focus:outline-none focus-visible:ring focus-visible:ring-green-700 focus-visible:ring-opacity-75 h-12 "
        onClick={clickOnButton}
      >
        <span className="font-bold">{button}</span>
      </button>
    )}
  </div>
);

export default Header;
