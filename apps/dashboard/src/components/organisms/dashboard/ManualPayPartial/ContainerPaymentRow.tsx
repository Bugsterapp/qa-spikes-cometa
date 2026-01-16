import { cn } from '@cometa/utils';
import { FC, ReactNode } from 'react';

import Exclamation from '/public/assets/icons/ic_exclamation_solid.svg';
import { Tooltip } from '/src/components/atoms/Tooltip';
import { AmountTitle, Container } from '/src/components/payments/FulfillmentDetail';

type Props = {
  label: string | ReactNode;
  value: string;
  isLoading?: boolean;
  message?: string;
  lineThrough?: boolean;
  action?: ReactNode;
  labelExtra?: string;
  labelExtraTooltip?: string;
  showLineThroughInNumber?: boolean;
};

const ContainerPaymentRow: FC<Props> = ({
  label,
  value,
  isLoading,
  message,
  action,
  labelExtra,
  labelExtraTooltip,
  lineThrough = false,
  showLineThroughInNumber = false,
}) => (
  <Container className="grid grid-cols-2">
    <div className="flex items-center">
      <AmountTitle text={label} loading={isLoading} message={message} lineThrough={lineThrough} />
      {labelExtra && (
        <Tooltip message={labelExtraTooltip} className="flex gap-1 items-center pb-1">
          <span className="text-xs pl-2 text-slate-400">{labelExtra}</span>
          <Exclamation className="text-[#637381] w-3 h-3" />
        </Tooltip>
      )}
    </div>
    <div className="flex items-center w-full">
      <div className="flex-grow text-right pr-2">
        <label
          className={cn('text-sm font-normal', {
            'line-through': showLineThroughInNumber,
          })}
        >
          {value}
        </label>
      </div>
      <div className="w-5 flex justify-center items-center">{action}</div>
    </div>
  </Container>
);
export default ContainerPaymentRow;
