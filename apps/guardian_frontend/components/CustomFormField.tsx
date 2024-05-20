import React from 'react';
import { cn } from '~/lib/cn';
import AlertSmall from '~/public/icons/alert-small.svg';

interface FormFieldProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  label: string;
  htmlFor?: string;
  error?: React.ReactNode;
  helperText?: React.ReactNode;
  labelClassName?: string;
  hideHelperText?: boolean;
  keepTopLabel?: boolean;
  staticLabel?: boolean;
}

/**
 * FormField is a component that wraps a form field with a label floating on top of it, error message and helper text
 * @param children - the form field to be wrapped
 * @param label - the label of the form field
 * @param htmlFor - the id of the form field
 * @param error - the error message to be displayed
 * @param helperText - the helper text to be displayed
 * @param className - the class style of the form field
 * @param labelClassName - the class style of the label
 * @param hideHelperText - if true, the helper text will be hidden
 * @param keepTopLabel - if true, the label will be kept on top of the form field
 * @param staticLabel - if true, the label will be static
 **/

function FormField({
  children,
  label,
  htmlFor,
  error,
  className,
  helperText,
  labelClassName,
  hideHelperText,
  keepTopLabel,
  staticLabel,
}: FormFieldProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="relative flex flex-row group" data-error={!!error}>
        {children}
        <label
          htmlFor={htmlFor}
          className={cn(
            'absolute left-5 text-[16px] top-1/2 -translate-y-1/2 transition-all font-medium text-gray-200', //default
            'peer-disabled:text-[#A6A6A6]', //input is disabled
            'group-data-[error=true]:text-error', //error
            {
              'peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:top-[20%]': !staticLabel, //input has value
              'group-focus-within:text-[10px] group-focus-within:top-[20%]': !staticLabel, //focus
              'text-[10px] top-[20%]': keepTopLabel, //keep top label
            },
            labelClassName
          )}
        >
          {label}
        </label>
      </div>
      {error && !hideHelperText ? <HelperTextWithIcon isError>{error}</HelperTextWithIcon> : null}
      {helperText ? <HelperTextWithIcon>{helperText}</HelperTextWithIcon> : null}
    </div>
  );
}

interface HelperTextWithIconProps {
  children: React.ReactNode;
  className?: string;
  isError?: boolean;
  iconComponent?: JSX.Element;
}
/**
 *  HelperTextWithIcon is a component that wraps a text with an icon
 *	@param children - the text to be wrapped
 *	@param className - the class style of the text
 *	@param isError - if true, the text will be red
 *	@param iconComponent - the icon component to be wrapped in the text, if not provided, the default icon will be used
 */
export const HelperTextWithIcon = ({ children, className, isError, iconComponent }: HelperTextWithIconProps) => (
  <div
    className={cn('flex flex-row items-center gap-1 my-1 ml-3.5 text-xs text-gray-500', className, {
      'text-error': isError,
    })}
  >
    <span className="mr-1.5">{iconComponent || <AlertSmall />}</span>
    {children}
  </div>
);

export default FormField;
