import { TooltipRenderProps } from 'react-joyride';
import { Button } from './Button';
import Cross from '~/public/icons/cross.svg';
import { cn } from '@cometa/utils';

const JoyrideTooltip = ({ continuous, step, closeProps, primaryProps, tooltipProps }: TooltipRenderProps) => {
  const buttonProps = continuous ? primaryProps : closeProps;
  return (
    <div
      className="bg-[#2B2D30] text-white py-3.5 px-[22px] rounded-[20px] max-w-xs space-y-2.5"
      data-testid="joyride-tooltip"
      {...tooltipProps}
    >
      <div className="flex flex-row justify-between content-stretch gap-x-1">
        {step.title && <h6 className="font-bold">{step.title}</h6>}
        <Button
          {...buttonProps}
          variant="transparent"
          className={cn('self-start', {
            'ml-auto': !step.title,
          })}
        >
          <Cross className="w-5 h-5 text-white" />
        </Button>
      </div>
      {step.content && <div className="font-lota">{step?.content}</div>}
      {!step.spotlightClicks && (
        <div className="flex flex-row justify-end">
          <Button
            className="px-2 py-0.5 bg-white text-[#2B2D30] font-semibold hover:bg-transparent hover:text-white active:bg-white active:text-[#2B2D30]"
            data-testid="btn-joyrdide-understood"
            {...buttonProps}
          >
            Entendido
          </Button>
        </div>
      )}
    </div>
  );
};

export default JoyrideTooltip;
