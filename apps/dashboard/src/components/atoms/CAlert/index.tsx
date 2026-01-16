import React, { forwardRef } from 'react';
import ICInfo from 'public/assets/icons/ic_info.svg';
import ICSuccess from 'public/assets/icons/ic_success.svg';
import ICWarning from 'public/assets/icons/ic_warning.svg';
import ICError from 'public/assets/icons/ic_error.svg';
import { cn } from '/src/utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';

const variants = cva(
  'flex flex-row items-center p-4 min-h-[50px] rounded-lg text-sm font-normal relative min-w-fit-content break-words',
  {
    variants: {
      type: {
        success: 'bg-green-200 text-green-700',
        error: 'bg-[#FFE7D9] text-[#7A0C2E]',
        warning: 'bg-yellow-200 text-yellow-700',
        info: 'bg-blue-200 text-blue-700',
        darkInfo: 'bg-blue-custom text-blue-700',
      },
    },
  }
);

type IAlertProps = {
  message?: string | React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
} & VariantProps<typeof variants>;

const CAlert: React.FC<IAlertProps> = forwardRef<HTMLDivElement, IAlertProps>((props, ref) => {
  const { message = '', type = 'info', className = 'flex gap-2', title } = props;

  const iconType = {
    success: <ICSuccess fill="#54D62C" />,
    error: <ICError fill="#FF4842" />,
    warning: <ICWarning />,
    info: <ICInfo className="w-6 h-6" />,
    darkInfo: <ICInfo className="w-6 h-6" />,
  };

  return (
    <div className={cn(variants({ type }), className)} role="alert" ref={ref}>
      {type ? <span>{iconType[type]}</span> : null}
      <div className="flex flex-col pl-4">
        <p
          className={cn({
            'whitespace-nowrap': !props.action,
          })}
        >
          {title ? <strong>{title}&nbsp;</strong> : ''}
        </p>
        <span>{message}</span>
      </div>
      {props.action && <div className="ml-4">{props.action}</div>}
    </div>
  );
});

CAlert.displayName = 'CAlert';

export default CAlert;
