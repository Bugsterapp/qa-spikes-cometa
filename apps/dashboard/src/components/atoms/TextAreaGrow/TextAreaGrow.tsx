import { forwardRef } from 'react';

import { cn } from '/src/utils/cn';

type ITextArea = {
  errors: boolean;
  onChange: (a: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  id?: string;
  disabled?: boolean;
  name?: string;
  value?: string;
};

const TextAreaGrow = forwardRef<HTMLTextAreaElement, ITextArea>((props, ref) => (
  <textarea
    {...props}
    ref={ref}
    className={cn(
      'w-full h-[54px] border-[#919EAB52] resize-none py-3.5 placeholder-transparent focus:placeholder-gray-500 overflow-hidden focus:border-green outline-none text-base peer rounded-lg z-[2] bg-transparent ring-0 focus:ring-0',
      {
        'border-red-500 focus:border-red-500': props.errors,
      },
      props.className
    )}
    data-testid="specialOverchargeMotive-input"
    onChange={props.onChange}
  />
));

export default TextAreaGrow;
