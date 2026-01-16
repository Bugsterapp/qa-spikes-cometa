import React from 'react';
import { cn } from '~/lib/cn';
import IcInfo from 'public/icons/ic_info.svg';
import IcWarning from 'public/icons/ic_warning.svg';

interface AlertProps {
  message: string;
  variant?: 'warning' | 'info';
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ message, variant = 'warning', className }) => {
  const bgColor = variant === 'warning' ? 'bg-[#FFF7CD]' : 'bg-[#D0F2FF]';
  const textColor = variant === 'warning' ? 'text-[#7A4F01]' : 'text-[#003768]';
  const Icon = variant === 'warning' ? IcWarning : IcInfo;

  return (
    <div className={cn(bgColor, 'rounded-lg py-3 px-4 flex items-start gap-3', className)}>
      <div className="flex-shrink-0">
        <Icon className="w-6 h-6" />
      </div>
      <p className={cn('text-sm', textColor, 'text-left leading-relaxed')}>{message}</p>
    </div>
  );
};

export default Alert;
