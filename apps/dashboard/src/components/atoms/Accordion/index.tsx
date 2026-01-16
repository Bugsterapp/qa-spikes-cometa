import { ReactNode, useState } from 'react';
import { cn } from '@cometa/utils';

interface AccordionProps {
  header: ReactNode;
  children: ReactNode;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onChange?: (event: React.SyntheticEvent, isExpanded: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const Accordion = ({
  header,
  children,
  defaultExpanded = false,
  expanded: controlledExpanded,
  onChange,
  disabled = false,
  className = '',
}: AccordionProps) => {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);

  // Use controlled expanded if provided, otherwise use internal state
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const handleToggle = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;

    const newExpanded = !isExpanded;

    // If controlled, call onChange
    if (controlledExpanded !== undefined && onChange) {
      onChange(event, newExpanded);
    } else {
      // Otherwise use internal state
      setInternalExpanded(newExpanded);
    }
  };

  return (
    <div className={`bg-transparent shadow-none ${className}`}>
      {/* Accordion Summary */}
      <div
        onClick={handleToggle}
        className={cn(
          'flex items-center justify-between',
          'p-2 rounded-lg cursor-pointer',
          'hover:bg-gray-200 transition-colors',
          'min-h-0',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        role="button"
        aria-expanded={isExpanded}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle(e as any);
          }
        }}
      >
        <div className="flex-1 m-0">{header}</div>
        {/* Expand Icon */}
        <svg
          className={cn(
            'w-6 h-6 transition-transform duration-200 ease-in-out',
            isExpanded ? 'rotate-180' : 'rotate-0'
          )}
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
        </svg>
      </div>

      {/* Accordion Details */}
      {isExpanded && <div className="px-0 pb-0 pt-5 shadow-none">{children}</div>}
    </div>
  );
};

export default Accordion;
