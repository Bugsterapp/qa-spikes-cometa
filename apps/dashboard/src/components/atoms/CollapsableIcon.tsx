import React from 'react';
import { cn } from '/src/utils/cn';

interface CollapsableIconProps {
  isExpanded: boolean;
  className?: string;
}

const CollapsableIcon = ({ isExpanded, className }: CollapsableIconProps) => (
  <svg viewBox="0 0 16 20" fill="none" className={cn('w-4 h-5', className)} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M1.00006 12.9998C0.999598 12.7662 1.08097 12.5397 1.23005 12.3598C1.3996 12.1553 1.64356 12.0267 1.90808 12.0023C2.17261 11.9779 2.43597 12.0598 2.64006 12.2298L8.00006 16.7098L13.3701 12.3898C13.5766 12.222 13.8416 12.1435 14.1062 12.1717C14.3709 12.1998 14.6134 12.3323 14.7801 12.5398C14.9641 12.749 15.0525 13.0254 15.0241 13.3026C14.9956 13.5797 14.8528 13.8324 14.6301 13.9998L8.63006 18.8298C8.26105 19.1331 7.72906 19.1331 7.36006 18.8298L1.36005 13.8298C1.11461 13.6263 0.980887 13.318 1.00006 12.9998Z"
      fill="#3366FF"
      className={cn('transition-transform origin-center', {
        'rotate-0 -translate-y-2.5': isExpanded,
        'rotate-180': !isExpanded,
      })}
    />
    <path
      d="M1.00006 7.05585C0.999598 7.28951 1.08097 7.51594 1.23005 7.69585C1.3996 7.90036 1.64356 8.029 1.90808 8.05339C2.17261 8.07778 2.43597 7.99591 2.64006 7.82585L8.00006 3.34585L13.3701 7.66585C13.5766 7.83362 13.8416 7.91212 14.1062 7.88397C14.3709 7.85582 14.6134 7.23333 14.7801 7.51585C14.9641 7.30669 15.0525 7.03023 15.0241 6.75308C14.9956 6.47593 14.8528 6.22323 14.6301 6.05585L8.63006 1.22585C8.26105 0.922537 7.72906 0.922537 7.36006 1.22585L1.36005 6.22585C1.11461 6.42932 0.980887 6.73762 1.00006 7.05585Z"
      fill="#3366FF"
      className={cn('transition-transform origin-center', {
        'rotate-0 translate-y-2.5': isExpanded,
        'rotate-180': !isExpanded,
      })}
    />
  </svg>
);

export default CollapsableIcon;
