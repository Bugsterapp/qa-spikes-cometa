'use client';

import * as React from 'react';
import { DayPicker } from 'react-day-picker';

import { es } from 'date-fns/locale';
import { cn } from '@cometa/utils';
import { useWindowSize } from 'usehooks-ts';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, ...props }: CalendarProps) {
  const { height } = useWindowSize();
  const smallVariant = height < 800;
  // today + 1 day
  const today = new Date();
  today.setDate(today.getDate() + 1);
  return (
    <DayPicker
      locale={es}
      className={cn(
        'z-[52] rounded-full',
        smallVariant ? 'min-w-[235px] pb-4 pt-1' : 'min-w-[320px] pb-7 pt-2',
        className
      )}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 justify-center',
        month: 'space-y-4',
        caption: 'flex justify-between pt-1 relative items-center',
        caption_label: cn('text-sm font-medium', smallVariant && 'text-xs'),
        nav: 'space-x-4 flex items-center',
        nav_button: cn('h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100', smallVariant && 'h-6 w-6'),
        nav_button_previous: 'left-1',
        nav_button_next: 'right-1',
        table: 'w-full border-collapse space-y-1',
        head_cell: cn(
          'text-muted-foreground rounded-full font-normal',
          smallVariant ? 'w-7 text-[0.7rem]' : 'w-9 text-[0.8rem]'
        ),
        row: cn('mt-2 p-0.5', {
          'mt-1': smallVariant,
        }),
        cell: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
        day: cn(
          'p-0 font-normal aria-selected:opacity-100 hover:bg-[#EDEFF2] rounded-full hover:border hover:border-[#919EAB3D]',
          smallVariant ? 'h-7 w-7 text-xs' : 'h-9 w-9'
        ),
        day_selected:
          'bg-green text-white hover:bg-primary hover:text-white focus:bg-green focus:text-primary-foreground rounded-full',
        day_today: 'bg-accent text-accent-foreground',
        day_outside: 'text-muted-foreground opacity-50',
        day_disabled: 'text-muted-foreground opacity-50 cursor-not-allowed',
        day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_hidden: 'invisible',
        ...classNames,
      }}
      formatters={{
        formatWeekdayName: (day) => day.toLocaleString('es-ES', { weekday: 'short' }).charAt(0).toUpperCase(),
        formatCaption: (props) => (
          <p className="font-bold">
            {props.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).charAt(0).toUpperCase() +
              props.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).slice(1).toLowerCase()}
          </p>
        ),
      }}
      components={{
        IconLeft: () => (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10.3723 14.251C10.1453 14.2517 9.93023 14.1497 9.78726 13.9735L6.16476 9.47346C5.93727 9.1967 5.93727 8.79771 6.16476 8.52096L9.91476 4.02096C10.1799 3.70201 10.6533 3.65836 10.9723 3.92346C11.2912 4.18855 11.3349 4.66201 11.0698 4.98096L7.71726 9.00096L10.9573 13.021C11.1445 13.2457 11.184 13.5589 11.0583 13.8231C10.9327 14.0874 10.6648 14.2544 10.3723 14.251Z"
              fill="#637381"
            />
          </svg>
        ),
        IconRight: () => (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M7.50035 14.2485C7.32511 14.2488 7.15528 14.1878 7.02035 14.076C6.86697 13.9488 6.77048 13.7659 6.75219 13.5675C6.7339 13.3691 6.7953 13.1716 6.92285 13.0185L10.2828 8.99849L7.04285 4.97099C6.91702 4.81605 6.85814 4.61734 6.87926 4.41886C6.90037 4.22038 6.99974 4.0385 7.15535 3.91349C7.31222 3.77546 7.51957 3.70914 7.72743 3.73049C7.93529 3.75185 8.12481 3.85895 8.25035 4.02599L11.8728 8.52599C12.1003 8.80274 12.1003 9.20174 11.8728 9.47849L8.12285 13.9785C7.97025 14.1626 7.73902 14.2629 7.50035 14.2485Z"
              fill="#637381"
            />
          </svg>
        ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
