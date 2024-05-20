import { DatePicker as DatePickerMUI, LocalizationProvider, esES } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers-pro/AdapterDateFns';
import { useEffect } from 'react';
import es from 'date-fns/locale/es';

interface Props {
  label: string;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  sx?: any;
  reset?: boolean;
  minDate?: Date;
}

export default function DatePicker(props: Props) {
  const { label, selectedDate, setSelectedDate, sx, reset, minDate } = props;

  const now = new Date();

  now.setHours(0, 0, 0);

  const today = now.toISOString();

  const onChangePayDate = (event: Date | null) => {
    const textPayDate = event ? event.toISOString() : null;
    setSelectedDate(textPayDate || today);
  };

  useEffect(() => {
    setSelectedDate(today);
  }, [reset]);

  const date = new Date(selectedDate);

  return (
    <LocalizationProvider
      dateAdapter={AdapterDateFns}
      localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}
      adapterLocale={es}
    >
      <DatePickerMUI
        label={label}
        format="dd/MM/yy"
        value={date}
        onChange={onChangePayDate}
        maxDate={now}
        minDate={minDate ? new Date(minDate) : undefined}
        disableFuture
        slotProps={{
          textField: {
            inputProps: { autoComplete: 'off' },
            sx: {
              ...sx,

              height: '52px',
              maxHeight: '52px',
              input: {
                minHeight: '39px',
                border: 'none',
                '&:focus': {
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                },
              },
            },
          },
        }}
      />
    </LocalizationProvider>
  );
}
