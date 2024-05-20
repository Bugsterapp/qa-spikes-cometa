import * as React from 'react';
import { cn } from '~/lib/cn';

export default function Button({
  className,
  ...props
}: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'py-4 px-6 appearance-none bg-blue-100 rounded-full text-white text-base font-normal outline-none shadow-[6px_6px_20px_rgba(85,112,255,0.3)] cursor-pointer hover:bg-[#364AFD] transition-colors hover:shadow-[6px_6px_35px_rgba(85, 112, 255, 0.42)] active:bg-blue-100',
        'disabled:shadow-none disabled:bg-[#EBEBEB] disabled:text-[#A6A6A6]',
        className
      )}
      {...props}
    />
  );
}
