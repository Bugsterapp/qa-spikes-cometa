import { forwardRef } from 'react';

import CheckBox from '/src/components/atoms/CheckBox';

export interface CheckboxCardProps extends React.InputHTMLAttributes<HTMLInputElement> {
  title: string;
  text?: string;
}

const CheckboxCard = forwardRef<HTMLTextAreaElement, CheckboxCardProps>(({ title, text, ...props }) => (
  <div className="flex flex-row p-4 my-2 border border-solid border-primary hover:border-secondary rounded-lg">
    <div className="flex-auto">
      <div>
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <div>
        <span className="text-xs text-foreground">{text}</span>
      </div>
    </div>
    <div className="flex-none w-6">
      <CheckBox {...props} />
    </div>
  </div>
));
CheckboxCard.displayName = 'CheckboxCard';

export default CheckboxCard;
