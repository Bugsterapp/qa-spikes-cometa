import type { ElementType } from 'react';
import ReactJoyride, {
  type CallBackProps,
  type Step,
  type TooltipRenderProps,
  type Styles,
  type Props,
} from 'react-joyride';

interface TourProps extends Props {
  steps: Step[];
  callback: (data: CallBackProps) => void;
  tooltipComponent: ElementType<TooltipRenderProps>;
  styles?: Styles;
}

const Tour = (props: TourProps) => (
  <ReactJoyride
    disableCloseOnEsc
    disableOverlayClose
    disableScrolling
    disableScrollParentFix
    scrollToFirstStep={false}
    continuous
    {...props}
  />
);

export default Tour;
