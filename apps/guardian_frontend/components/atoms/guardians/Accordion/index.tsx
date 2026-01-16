import { useState } from 'react';
import { cn } from '../../../../lib/cn';

const ExpandMoreIcon = ({ isExpanded }: { isExpanded: boolean }) => (
  <svg
    className={`w-6 h-6 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

interface AccordionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  onClick?: () => void;
  className?: string;
}

const Accordion = ({ title, onClick, children, defaultExpanded = false, className }: AccordionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (onClick) {
      onClick();
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleToggle}
        className={cn('flex items-center justify-between w-full text-left focus:outline-none', className)}
        aria-expanded={isExpanded}
      >
        <div className="flex-1">{title}</div>
        <ExpandMoreIcon isExpanded={isExpanded} />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isExpanded ? 'max-h-[2000px] opacity-100 pt-2.5' : 'max-h-0 opacity-0'
        )}
      >
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Accordion;
