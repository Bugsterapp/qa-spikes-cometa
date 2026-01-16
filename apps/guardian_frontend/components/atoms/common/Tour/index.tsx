import type { ElementType } from 'react';
import type { CallBackProps, Step, TooltipRenderProps, Styles, Props } from 'react-joyride';
import dynamic from 'next/dynamic';

const ReactJoyride = dynamic(() => import('react-joyride'), { ssr: false });
export interface TourProps extends Props {
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
    styles={
      {
        options: {
          arrowColor: '#2B2D30',
          overlayColor: 'rgba(43, 45, 48, 0.25)',
        },
      } as Styles
    }
    {...props}
  />
);

export default Tour;
