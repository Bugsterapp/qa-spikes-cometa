import React from 'react';
import { cn } from '~/lib/cn';

type LoadingFabProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading: boolean;
  label: string;
  className?: string;
};

export default function LoadingFab({ loading, label, className, type = 'button', ...others }: LoadingFabProps) {
  return (
    <button
      {...others}
      type={type}
      className={cn(
        'w-full mx-auto px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {label}
    </button>
  );
}
