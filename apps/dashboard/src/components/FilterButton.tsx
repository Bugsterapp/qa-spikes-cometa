import React from 'react';

type Props = Omit<React.ComponentProps<'button'>, 'className'>;

const FilterButton = React.forwardRef<HTMLButtonElement, Props>(({ children, ...props }, ref) => (
  <button
    ref={ref}
    {...props}
    className="inline-flex select-none items-center justify-center rounded-md p-4 w-[102px] gap-x-[10.5px] text-sm font-medium border border-blue-secondary-200 border-solid text-blue-secondary-200 hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75 bg-white"
    data-testid="filterBtn"
  >
    {children}
  </button>
));

FilterButton.displayName = 'FilterButton';
export default FilterButton;
