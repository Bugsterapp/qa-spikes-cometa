import Step from '~/components/atoms/guardians/Step';
import { Fragment, HTMLAttributes } from 'react';

interface StepsToPayProps extends HTMLAttributes<HTMLDivElement> {
  steps: string[] | undefined;
}

export default function StepsToPay({ steps, className }: StepsToPayProps) {
  return (
    <div className={className}>
      {steps?.map((step, index) => (
        <Fragment key={`step-${index}-${step}`}>
          <Step number={index + 1} description={step} />
          &nbsp;
        </Fragment>
      ))}
    </div>
  );
}
