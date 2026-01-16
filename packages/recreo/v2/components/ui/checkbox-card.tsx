'use client';

import * as React from 'react';
import { cn } from '@cometa/utils';
import { Checkbox } from './checkbox';
import { Label } from './label';

/**
 * Props for the CheckboxCard component
 */
export interface CheckboxCardProps extends React.ComponentPropsWithoutRef<typeof Checkbox> {
  /** Main title of the checkbox card */
  title: string;
  /** Optional description below the title */
  description?: string;
  /** Custom badge content to display */
  badge?: React.ReactNode;
  /** Additional CSS classes for the title */
  titleClassName?: string;
  /** Additional CSS classes for the description */
  descriptionClassName?: string;
  /** Additional CSS classes for the card container */
  cardClassName?: string;
}

/**
 * CheckboxCard - A component that combines a checkbox with a card-like design
 *
 * Includes title, optional description, and interactive styles for hover and checked states.
 * Ideal for forms with multiple options that need more visual context.
 *
 * @example
 * ```tsx
 * <CheckboxCard
 *   id="notifications"
 *   title="Receive notifications"
 *   description="We'll send you important updates"
 *   defaultChecked
 * />
 * ```
 */
const CheckboxCard = React.forwardRef<React.ElementRef<typeof Checkbox>, CheckboxCardProps>(
  (
    { className, title, description, badge, titleClassName, descriptionClassName, cardClassName, id, ...props },
    ref
  ) => (
    <Label
      htmlFor={id}
      className={cn(
        'cursor-pointer flex items-start gap-2 rounded-lg border p-4 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:border-2 has-[[data-state=checked]]:p-[15px] has-[[data-state=checked]]:bg-primary/10 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 has-[:disabled]:hover:bg-white has-[[data-state=checked]]:has-[:disabled]:hover:bg-primary/10 hover:bg-gray-50',
        cardClassName
      )}
    >
      <Checkbox
        id={id}
        ref={ref}
        className={cn(
          'data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
          className
        )}
        {...props}
      />
      <div className="flex-1 grid gap-1.5 font-normal">
        <div className="flex items-center gap-2">
          <p className={cn('text-base leading-none font-medium', titleClassName)}>{title}</p>
          {badge}
        </div>
        {description && <p className={cn('text-muted-foreground text-sm', descriptionClassName)}>{description}</p>}
      </div>
    </Label>
  )
);
CheckboxCard.displayName = 'CheckboxCard';

export { CheckboxCard };
