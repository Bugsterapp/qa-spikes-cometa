import InvoiceChip from '/src/components/atoms/Chip';
import { Button } from '@getcometa/recreo/v2';

interface IHeaderProps {
  title: string;
  button?: string;
  clickOnButton?: () => void;
  subtitle?: string;
  label?: string;
  disabled?: boolean;
  buttonTooltipMessage?: string;
}

const Header = ({ title, button, clickOnButton, subtitle, label, disabled, buttonTooltipMessage }: IHeaderProps) => (
  <div className="flex justify-between items-center">
    <div className="flex flex-col py-6 gap-2">
      <span className="text-2xl font-bold">{title}</span>
      <span className="text-sm font-normal text-[#637381]">{subtitle}</span>
    </div>
    {label && (
      <div className="ml-4 mb-2">
        <InvoiceChip intent="darkInfo">{label}</InvoiceChip>
      </div>
    )}
    {button && (
      <Button
        variant="legacy"
        onClick={clickOnButton}
        disabled={disabled}
        tooltipMessage={buttonTooltipMessage}
        tooltipSide="top"
      >
        <span className="font-bold">{button}</span>
      </Button>
    )}
  </div>
);

export default Header;
