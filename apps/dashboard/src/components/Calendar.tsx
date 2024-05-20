import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import {
  DatePickerStateProvider,
  useContextCalendars,
  useContextDays,
  DatePickerProviderProps,
  DPCalendar as CalendarType,
  useContextDaysPropGetters,
  DPDay,
  useContextDatePickerOffsetPropGetters,
} from '@rehookify/datepicker';
import { cn } from '../utils/cn';
import Chevron from '/public/assets/icons/chevron.svg';

/**
 * Hook to use inside Calendar Component
 * @returns formatedDates array [startDate, endDate]
 */
export const useCalendarDates = () => {
  const { formattedDates } = useContextDays();

  return formattedDates;
};

interface CalendarContextValue {
  triggers?: ReturnType<typeof Trigger>[];
  open: boolean;
  footerHeight: number;
  maxLength: number;
}

type Action =
  | {
      type: 'setOpen';
      payload: CalendarContextValue['open'];
    }
  | { type: 'setTriggers'; payload: CalendarContextValue['triggers'] }
  | { type: 'setFooterHeight'; payload: CalendarContextValue['footerHeight'] };

type Dispatch = (action: Action) => void;

interface CalendarProps extends React.PropsWithChildren<object> {
  config: DatePickerProviderProps['config'];
}

const CalendarContext = React.createContext<{ state: CalendarContextValue; dispatch: Dispatch } | undefined>(undefined);

function CalendarReducer(state: CalendarContextValue, action: Action) {
  switch (action.type) {
    case 'setOpen':
      return { ...state, open: action.payload };
    case 'setTriggers':
      return { ...state, triggers: action.payload };
    case 'setFooterHeight':
      return { ...state, footerHeight: action.payload };
    default:
      return state;
  }
}

export const Calendar = ({ children, config }: CalendarProps) => {
  const [state, dispatch] = React.useReducer(CalendarReducer, {
    triggers: [],
    open: false,
    footerHeight: 0,
    maxLength: config?.dates?.mode === 'range' ? 2 : 1,
  });

  return (
    <CalendarContext.Provider value={{ state, dispatch }}>
      <DatePickerStateProvider
        config={{
          ...config,
          onDatesChange: (dates) => {
            if (config?.dates?.mode === 'range' && dates.length === state.maxLength) {
              dispatch({ type: 'setOpen', payload: false });
            } else if (config?.dates?.mode !== 'range' && dates.length === state.maxLength) {
              dispatch({ type: 'setOpen', payload: false });
            }
            if (config && config.onDatesChange) {
              config.onDatesChange(dates);
            }
          },
        }}
      >
        {children}
      </DatePickerStateProvider>
    </CalendarContext.Provider>
  );
};

function useCalendar() {
  const context = React.useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar should be used inside CalendarContext');
  }
  return context;
}

export const Triggers = ({ children }: { children: ReturnType<typeof Trigger>[] | ReturnType<typeof Trigger> }) => {
  const { dispatch } = useCalendar();
  React.useEffect(() => {
    dispatch({ type: 'setTriggers', payload: Array.isArray(children) ? children : [children] });
  }, [children, dispatch]);

  return null;
};

Calendar.Triggers = Triggers;

type TriggerProps = {
  children(value: string): JSX.Element;
} & (
  | {
      date: 'start' | 'end';
      value?: never;
    }
  | {
      date: never;
      value?: string;
    }
);
export const Trigger = ({ value, children, date }: TriggerProps) => {
  const dates = useCalendarDates();

  const inputValue = value ? value : date === 'start' ? dates[0] : dates[1];

  return children(inputValue);
};

Calendar.Trigger = Trigger;

type ContentProps = {
  children(calendars: CalendarType[]): React.ReactNode;
};

const Content = ({ children }: ContentProps) => {
  const {
    state: { triggers, open, footerHeight },
    dispatch,
  } = useCalendar();
  const { calendars } = useContextCalendars();

  const close = () => dispatch({ type: 'setOpen', payload: false });

  return (
    <Popover.Root open={open}>
      <Popover.Anchor asChild>
        <div
          className="flex gap-4 items-between w-fit"
          onFocusCapture={() => {
            dispatch({ type: 'setOpen', payload: true });
          }}
        >
          {React.Children.map(triggers, (Trigger) => (
            <Popover.Trigger asChild key={Trigger?.key}>
              <div className="group">{Trigger}</div>
            </Popover.Trigger>
          ))}
        </div>
      </Popover.Anchor>

      <Popover.Portal>
        <Popover.Content
          align="center"
          className="relative z-10 flex pb-[calc(var(--footer-height)_+_2px)] overflow-hidden transition-transform bg-white divide-x rounded-lg shadow-md data-[state=open]:data-[side=bottom]:animate-slideUpAndFade will-change-[transform,opacity] justify-around"
          onEscapeKeyDown={close}
          onPointerDownOutside={close}
          onInteractOutside={close}
          style={{ '--footer-height': `${footerHeight}px` } as React.CSSProperties}
        >
          {children(calendars)}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

Calendar.Content = Content;

type CalendarItemProps = {
  calendar: CalendarType;
  showControls?: 'prev' | 'next' | 'both';
};

const CalendarItem = ({ calendar, showControls }: CalendarItemProps) => {
  const { weekDays } = useContextCalendars();
  const { dayButton } = useContextDaysPropGetters();
  const { days, month, year } = calendar;
  const { addOffset, subtractOffset } = useContextDatePickerOffsetPropGetters();

  return (
    <section className="mx-4 w-[264px] [&:not(:first-child)]:pl-4 [&:not(:first-child)]:ml-0 [&:not(:first-child)]:w-[calc(264px_+_1rem)]">
      <div className="grid items-center grid-cols-3 mt-3 mb-2">
        {showControls === 'prev' || showControls === 'both' ? (
          <button
            className="bg-transparent text-[#637381] rotate-90 justify-self-start p-1  h-7 w-7 rounded-full hover:backdrop-brightness-95"
            data-testid="previusMonth-button"
            {...subtractOffset({ months: 1 })}
          >
            <Chevron className="w-5 h-4 m-auto" />
          </button>
        ) : null}
        <p className="col-start-2 text-base font-semibold text-center text-black whitespace-nowrap first-letter:capitalize">
          {month} {year}
        </p>
        {showControls === 'next' || showControls === 'both' ? (
          <button
            className="bg-transparent text-[#637381] -rotate-90 justify-self-end p-1  h-7 w-7 rounded-full hover:backdrop-brightness-95"
            {...addOffset({ months: 1 })}
          >
            <Chevron className="w-5 h-4 m-auto" />
          </button>
        ) : null}
      </div>
      <div className="grid items-center h-8 grid-cols-7 mb-2 gap-y-2 justify-items-center text-[#919EAB]">
        {weekDays.map((d) => (
          <p className="block w-6 h-6 text-xs text-center" key={d}>
            {d}
          </p>
        ))}
      </div>
      <main className="grid grid-cols-7 gap-y-2 justify-items-center">
        {days.map((d) => (
          <button key={d.$date.toString()} className={cn(getDayClassName('text-sm', d))} {...dayButton(d)}>
            {d.day}
          </button>
        ))}
      </main>
    </section>
  );
};

Calendar.Item = CalendarItem;

const Footer = ({ className, children }: React.PropsWithChildren<{ className?: string }>) => {
  const { dispatch } = useCalendar();
  const footerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    dispatch({ type: 'setFooterHeight', payload: footerRef.current?.clientHeight || 0 });
  }, []);

  return (
    <div
      ref={footerRef}
      id="recss-datepicker-footer"
      className={cn('rounded-b-lg bg-[#F9F9F9] px-4 py-2 w-full absolute bottom-0', className)}
    >
      {children}
    </div>
  );
};

Calendar.Footer = Footer;

export const getDayClassName = (className: string, { selected, disabled, inCurrentMonth, now, range }: DPDay) =>
  cn('rounded-full w-9 h-9 bg-transparent hover:bg-slate-200 transition-colors', range, className, {
    'border border-solid border-slate-500': now,
    'bg-green outline-0 text-white hover:bg-green-700': selected,
    'opacity-25 cursor-not-allowed': disabled,
    'opacity-0': !inCurrentMonth,
    'border-y-[2px] border-dashed border-slate-200':
      range === 'will-be-in-range' || range === 'will-be-range-end' || range === 'will-be-range-start',
    'rounded-none [&:nth-child(7n)]:rounded-r-full [&:nth-child(7n)]:border-r-[2px] [&:nth-child(7n+1)]:rounded-l-full [&:nth-child(7n+1)]:border-l-[2px]':
      range === 'will-be-in-range' || range === 'in-range',
    'border-solid border-[#919EAB3D] bg-[#919EAB29] border-2 hover:bg-[#919EAB29] text-black':
      range === 'will-be-range-start',
    'rounded-none rounded-r-full': range === 'will-be-range-end',
    'bg-green-200': range === 'in-range',
    'rounded-l-none': range === 'range-end',
    'rounded-r-none': range === 'range-start',
  });
