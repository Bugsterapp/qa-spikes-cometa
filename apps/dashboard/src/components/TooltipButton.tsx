import { Button } from '@cometa/recreo/components/ui/Button';
import { Tooltip } from '/src/components/atoms/Tooltip';

interface TooltipButtonProps {
  onClick: () => void;
  tooltipMessage: string;
  disabled?: boolean;
  buttonText: string;
  leftIcon?: React.ReactNode;
  className?: string;
  color?: 'galaxy' | 'black' | 'legacy';
  variant?: 'solid' | 'outline' | 'solid-light' | 'text';
  size?: 'large' | 'medium' | 'small';
}

export const TooltipButton: React.FC<TooltipButtonProps> = ({
  onClick,
  tooltipMessage,
  disabled = false,
  buttonText,
  leftIcon,
  className,
  color,
  variant,
  size,
}) => {
  const button = (
    <Button
      onClick={onClick}
      leftIcon={leftIcon}
      className={className}
      disabled={disabled}
      color={color}
      variant={variant}
      size={size}
    >
      <span>{buttonText}</span>
    </Button>
  );

  return disabled && tooltipMessage ? (
    <Tooltip message={tooltipMessage} className="w-full">
      {button}
    </Tooltip>
  ) : (
    button
  );
};
