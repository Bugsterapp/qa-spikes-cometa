'use client';

import * as React from 'react';
import { cn } from '@cometa/utils';
import { RadioGroupItem } from './radio-group';
import { Label } from './label';

/**
 * Props for the RadioCard component
 */
export interface RadioCardProps extends React.ComponentPropsWithoutRef<typeof RadioGroupItem> {
  /** Value for the radio option - required */
  value: string;
  /** Main title of the radio card */
  title: string;
  /** Optional description below the title */
  description?: string;
  /** Additional CSS classes for the title */
  titleClassName?: string;
  /** Additional CSS classes for the description */
  descriptionClassName?: string;
  /** Additional CSS classes for the card container */
  cardClassName?: string;
}

/**
 * RadioCard - A component that combines a radio button with a card-like design
 *
 * Includes title, optional description, and interactive styles for hover and checked states.
 * Must be used within a RadioGroup component. Ideal for forms with multiple options that need more visual context.
 *
 * @example
 * ```tsx
 * <RadioGroup defaultValue="standard">
 *   <RadioCard
 *     value="free"
 *     id="free-plan"
 *     title="Plan Gratuito"
 *     description="Perfecto para empezar"
 *   />
 *   <RadioCard
 *     value="standard"
 *     id="standard-plan"
 *     title="Plan Estándar"
 *     description="Para equipos pequeños"
 *   />
 * </RadioGroup>
 * ```
 */
const RadioCard = React.forwardRef<React.ElementRef<typeof RadioGroupItem>, RadioCardProps>(
  (
    { className, value, title, description, titleClassName, descriptionClassName, cardClassName, id, ...props },
    ref
  ) => (
    <Label
      htmlFor={id}
      className={cn(
        'cursor-pointer flex items-start gap-2 rounded-lg border p-4 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:border-2 has-[[data-state=checked]]:p-[15px] has-[[data-state=checked]]:bg-primary/10 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 has-[:disabled]:hover:bg-white has-[[data-state=checked]]:has-[:disabled]:hover:bg-primary/10 hover:bg-gray-50',
        cardClassName
      )}
    >
      <RadioGroupItem
        id={id}
        value={value}
        ref={ref}
        className={cn(
          'data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground [&_svg]:data-[state=checked]:fill-white',
          className
        )}
        {...props}
      />
      <div className="grid gap-1.5 font-normal">
        <p className={cn('text-base leading-none font-medium', titleClassName)}>{title}</p>
        {description && <p className={cn('text-muted-foreground text-sm', descriptionClassName)}>{description}</p>}
      </div>
    </Label>
  )
);
RadioCard.displayName = 'RadioCard';

export { RadioCard };
