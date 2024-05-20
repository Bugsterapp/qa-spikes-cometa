import { Calendar } from './Calendar';
import CustomInput from './CustomInput';
import TrashOutline from '/public/assets/icons/trash_outline.svg';
import CalendarOutline from '/public/assets/icons/calendar_outline.svg';

type DateRangeProps = {
  selectedDates: Date[];
  onDatesChange(dates: Date[]): void;
};

export const transformDates = (dates: Date[]) => dates.map((date) => new Date(date).toISOString().split('T')[0]);

export default function DateRange({ selectedDates, onDatesChange }: DateRangeProps) {
  return (
    <Calendar
      config={{
        selectedDates,
        onDatesChange,
        dates: {
          mode: 'range',
          selectSameDate: true,
        },
        calendar: {
          offsets: [1],
          mode: 'fluid',
          startDay: 0,
        },
        locale: {
          locale: 'es-MX',
          weekday: 'narrow',
        },
      }}
    >
      <Calendar.Triggers>
        <Calendar.Trigger date="start">
          {(value) => (
            <div className="border-[#919EAB52] border-radius-lg rounded-md border-solid border relative hover:border-black max-w-[200px]">
              <CustomInput
                className="px-2 py-4 peer min-h-[56px]"
                data-testid="startDate-datePicker"
                placeholder=" "
                value={value ? value : ''}
              />
              <CalendarOutline className="w-5 h-5 text-[#374957] absolute right-4 inset-y-0 m-auto" />
              <label className='origin-left peer-[:not(:placeholder-shown)]:-translate-y-7 peer-[:not(:placeholder-shown)]:scale-75 left-2 group-[[data-state="open"]]:group-focus-within:-translate-y-7 peer-[:not(:placeholder-shown)]:left-2 group-[[data-state="open"]]:group-focus-within:left-2 bg-white text-[rgba(145,158,171,1)] group-[[data-state="open"]]:group-focus-within:scale-75 inset-y-0 my-auto h-fit absolute transition-transform'>
                Desde
              </label>
            </div>
          )}
        </Calendar.Trigger>
        <Calendar.Trigger date="end">
          {(value) => (
            <div className="border-[#919EAB52] border-radius-lg rounded-md border-solid border relative hover:border-black max-w-[200px]">
              <CustomInput
                className="px-2 py-4 peer min-h-[56px]"
                data-testid="endDate-datePicker"
                placeholder=" "
                value={value ? value : ''}
              />
              <CalendarOutline className="w-5 h-5 text-[#374957] absolute right-4 inset-y-0 m-auto" />
              <label className='origin-left peer-[:not(:placeholder-shown)]:-translate-y-7 peer-[:not(:placeholder-shown)]:scale-75 left-2 peer-[:not(:placeholder-shown)]:left-2 group-[[data-state="open"]]:group-focus-within:left-2 group-[[data-state="open"]]:group-focus-within:-translate-y-7 bg-white text-[rgba(145,158,171,1)] group-[[data-state="open"]]:group-focus-within:scale-75 inset-y-0 my-auto h-fit absolute transition-transform'>
                Hasta
              </label>
            </div>
          )}
        </Calendar.Trigger>
      </Calendar.Triggers>
      <Calendar.Content>
        {(calendars) => (
          <>
            {calendars.map((calendar, index) => (
              <Calendar.Item
                key={calendar.month}
                calendar={calendar}
                showControls={calendars.length === index + 1 ? 'next' : 'prev'}
              />
            ))}{' '}
            <Calendar.Footer>
              <button
                className="flex items-center gap-2 p-2 text-sm font-bold text-black transition-all bg-transparent rounded-md hover:backdrop-brightness-95"
                onClick={() => onDatesChange([])}
              >
                <TrashOutline className="w-5 h-5" /> Limpiar filtros
              </button>
            </Calendar.Footer>{' '}
          </>
        )}
      </Calendar.Content>
    </Calendar>
  );
}
