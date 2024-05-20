import React, { useEffect } from 'react';
import { cn } from '/src/utils/cn';

interface CheckBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  indeterminate?: boolean;
}

const CheckBox = React.forwardRef<HTMLInputElement, CheckBoxProps>((props, ref) => {
  const { className, indeterminate, ...otherProps } = props;

  useEffect(() => {
    if (ref && 'current' in ref && ref.current) {
      ref.current.indeterminate = indeterminate ?? false;
    }
  }, [indeterminate, ref]);

  return (
    <div className="relative inline-block">
      <input
        ref={ref}
        className={cn(
          'form-checkbox border-2 border-gray-500 rounded-sm text-[#01AB55] focus:border-green-300 focus:ring focus:ring-offset-0 focus:ring-green-200 focus:ring-opacity-50 cursor-pointer',
          className,
          {
            'bg-[#01AB55] focus:ring-red-700': indeterminate,
          }
        )}
        data-testid="checkbox"
        type="checkbox"
        {...otherProps}
      />
      {indeterminate && (
        <span className="absolute left-1/2 top-[55%] transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-0.5 bg-white" />
      )}
    </div>
  );
});

export default CheckBox;
