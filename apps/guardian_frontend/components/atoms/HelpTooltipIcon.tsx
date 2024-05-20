import IcHelpWhite from '~/public/icons/ic_help_white.svg';
import { Tooltip } from './guardians/Tooltips';
import { cn } from '~/lib/cn';

interface HelpTooltipIconProps {
  children: React.ReactNode;
  className?: string;
  iconComponent?: JSX.Element;
}
/**
 * HelpTooltipIcon is a component that wraps a tooltip around an icon component
 * @param children - the tooltip message
 * @param className - the class style of the icon
 * @param iconComponent - the icon component to be wrapped in the tooltip, if not provided, the default icon will be used
 */
export const HelpTooltipIcon = ({ children, className, iconComponent }: HelpTooltipIconProps) => (
  <Tooltip message={children} align="center">
    <span className={cn('ml-1.5', className)}>{iconComponent || <IcHelpWhite className="text-blue" />}</span>
  </Tooltip>
);
