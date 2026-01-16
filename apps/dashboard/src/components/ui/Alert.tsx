import React from 'react';
import { cn } from '../../utils/cn';
import IcInfo from 'public/assets/icons/ic_info.svg';
import IcWarning from 'public/assets/icons/ic_warning.svg';
import IcError from 'public/assets/icons/ic_circle_error.svg';

interface AlertProps {
  message: string;
  variant?: 'warning' | 'info' | 'error';
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ message, variant = 'warning', className }) => {
  const bgColor = variant === 'warning' ? 'bg-[#FFF7CD]' : variant === 'error' ? 'bg-[#FFE7D9]' : 'bg-[#D0F2FF]';
  const textColor =
    variant === 'warning' ? 'text-[#7A4F01]' : variant === 'error' ? 'text-[#7A0C2E]' : 'text-[#003768]';
  const Icon = variant === 'warning' ? IcWarning : variant === 'error' ? IcError : IcInfo;

  return (
    <div className={cn(bgColor, 'rounded-lg py-3 px-4 flex items-center gap-3', className)}>
      <div>
        <Icon className="w-6 h-6" />
      </div>
      <p className={cn('text-sm', textColor, 'text-left py-2')}>{message}</p>
    </div>
  );
};

export default Alert;
