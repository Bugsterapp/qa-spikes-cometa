import { useState, useEffect } from 'react';
import { useFormContext, Controller, Control, FieldValues } from 'react-hook-form';
import { DatePicker } from '@cometa/recreo/v2/components/date-picker';
import { RadioCard, RadioGroup } from '@cometa/recreo/v2';
import { Switch } from '/src/components/ui/switch/switch';
import { parse, isValid, format, isBefore, parseISO } from 'date-fns';
import { Input } from '@cometa/recreo/v2/components/ui/input';
import { useSendEvent } from '/src/hooks/useSendEvent';
import { TrackEvents } from '/src/constants/events';

interface ConfigurationSendStepProps {
  formControl: Control<FieldValues>;
  isEditMode?: boolean;
}

const ConfigurationSendStep = ({ formControl, isEditMode = false }: ConfigurationSendStepProps) => {
  const [sendType, setSendType] = useState('now');
  const {
    register,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext();
  const sendEvent = useSendEvent();

  const watchedValues = watch([
    'response_deadline_accepted',
    'response_date',
    'response_time_part',
    'execution_date',
    'execution_time_part',
    'communication_status',
    'execution_time',
    'response_deadline',
    'question',
  ]);

  const [
    responseDeadlineAccepted,
    date_response,
    time_response,
    execution_date,
    execution_time_part,
    communication_status,
    execution_time,
    response_deadline,
    questions,
  ] = watchedValues;

  const hasQuestions = questions && Array.isArray(questions) && questions.length > 0;

  const extractDateTimeFromISO = (isoString: string | Date | null) => {
    if (!isoString) return { date: '', time: '' };

    const date = typeof isoString === 'string' ? new Date(isoString) : isoString;
    if (!isValid(date)) return { date: '', time: '' };

    return {
      date: format(date, 'yyyy-MM-dd'),
      time: format(date, 'HH:mm'),
    };
  };

  useEffect(() => {
    if (communication_status === 'completed') {
      setSendType('now');
    } else if (communication_status === 'draft') {
      setSendType('now');
    } else if (communication_status === 'active' || communication_status === 'executing') {
      if ((execution_date && execution_time_part) || execution_time) {
        setSendType('schedule');
      }
    }

    if (execution_time && !execution_date && !execution_time_part) {
      const { date, time } = extractDateTimeFromISO(execution_time);
      if (date && time) {
        setValue('execution_date', date);
        setValue('execution_time_part', time);
      }
    }

    if (isEditMode && response_deadline && !date_response && !time_response) {
      const { date, time } = extractDateTimeFromISO(response_deadline);
      if (date && time) {
        setValue('response_date', date);
        setValue('response_time_part', time);
        setValue('response_deadline_accepted', true);
      }
    }
  }, [
    communication_status,
    execution_time,
    response_deadline,
    execution_date,
    execution_time_part,
    date_response,
    time_response,
    setValue,
    isEditMode,
  ]);

  useEffect(() => {
    if (communication_status === 'active' && execution_time && isEditMode) {
      setSendType('schedule');
    }
  }, [execution_time, communication_status, isEditMode]);

  const handleScheduleSend = () => {
    setSendType('schedule');
    setValue('communication_status', 'active');
  };

  const handleSendNow = () => {
    setSendType('now');
    setValue('communication_status', 'active');
    setValue('execution_time', null);
    setValue('execution_date', '');
    setValue('execution_time_part', '');
  };

  const createISOString = (dateStr: string, timeStr: string): string | null => {
    try {
      const isDDMMFormat = dateStr.includes('/');
      const dateFormat = isDDMMFormat ? 'dd/MM/yyyy' : 'yyyy-MM-dd';

      if (timeStr.includes('AM') || timeStr.includes('PM')) {
        const dateTime = parse(`${dateStr} ${timeStr}`, `${dateFormat} h:mm a`, new Date());
        return isValid(dateTime) ? format(dateTime, "yyyy-MM-dd'T'HH:mm:ss") : null;
      }

      const dateTime = parse(`${dateStr} ${timeStr}`, `${dateFormat} HH:mm`, new Date());
      return isValid(dateTime) ? format(dateTime, "yyyy-MM-dd'T'HH:mm:ss") : null;
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    if (date_response && time_response) {
      const isoString = createISOString(date_response, time_response);
      if (isoString) {
        setValue('response_deadline', isoString);
      }
    }
  }, [date_response, time_response, setValue]);

  useEffect(() => {
    if (sendType === 'schedule' && execution_date && execution_time_part) {
      const isoString = createISOString(execution_date, execution_time_part);
      if (isoString) {
        setValue('execution_time', isoString);
      }
    }
  }, [execution_date, execution_time_part, setValue, sendType]);

  // Validation effect to check if execution date is before response deadline
  useEffect(() => {
    const validateDates = () => {
      // Clear previous validation error
      clearErrors('execution_date');
      clearErrors('response_date');

      // Only validate if both scheduled send and response deadline are enabled
      if (sendType === 'schedule' && responseDeadlineAccepted) {
        // Check if we have both execution and response dates with times
        if (execution_date && execution_time_part && date_response && time_response) {
          const executionDateTime = createISOString(execution_date, execution_time_part);
          const responseDateTime = createISOString(date_response, time_response);

          if (executionDateTime && responseDateTime) {
            const executionDate = parseISO(executionDateTime);
            const responseDate = parseISO(responseDateTime);

            // Check if execution date is after response deadline
            if (!isBefore(executionDate, responseDate)) {
              const errorMessage = 'La fecha de envío programado debe ser anterior a la fecha máxima de respuesta';

              setError('execution_date', {
                type: 'manual',
                message: errorMessage,
              });
            }
          }
        }
      }
    };

    validateDates();
  }, [
    sendType,
    responseDeadlineAccepted,
    execution_date,
    execution_time_part,
    date_response,
    time_response,
    setError,
    clearErrors,
  ]);

  return (
    <main className="px-[8.625rem]">
      <h2 className="text-neutral-950 text-lg font-semibold mb-[5px]">Configuración</h2>
      <p className="text-[#454D64] text-sm  mb-[30px]">
        Programa el mensaje, solicita firma obligatoria, permite respuesta.
      </p>
      <section className="rounded-[10px]">
        <div className="space-y-4">
          {/* Send Date */}
          <div className="bg-white border border-gray-200 rounded-xl">
            <div className="py-[20px] px-[30px]">
              <h4 className="text-sm font-semibold text-gray-800">Fecha de envío</h4>
            </div>
            <div className="border-t border-gray-200 mb-[1rem]" />
            <div className="px-[30px] pb-[20px]">
              <RadioGroup
                value={sendType}
                onValueChange={(value) => {
                  if (value === 'now') {
                    sendEvent(TrackEvents.announcements.configSendNowSelected);
                    handleSendNow();
                  } else if (value === 'schedule') {
                    sendEvent(TrackEvents.announcements.configScheduleSelected);
                    handleScheduleSend();
                  }
                }}
                className="flex gap-4"
              >
                <RadioCard value="now" title="Enviar ahora" cardClassName="flex-1" />
                <RadioCard value="schedule" title="Programar envío" cardClassName="flex-1" />
              </RadioGroup>
            </div>
            {sendType === 'schedule' && (
              <div className="py-[20px] px-[30px]">
                <p className="text-[#454D64] text-sm  mb-[30px]">
                  Selecciona la fecha y hora en la que deseas programar el envió automático del mensaje
                </p>
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                    <Controller
                      name="execution_date"
                      control={formControl}
                      defaultValue=""
                      render={({ field, fieldState }) => (
                        <DatePicker
                          value={field.value}
                          onChange={(date) => {
                            sendEvent(TrackEvents.announcements.configSendDateSet);
                            field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                          }}
                          minDate={new Date()}
                          error={fieldState.error?.message}
                          placeholder="Fecha"
                        />
                      )}
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                    <Input
                      type="time"
                      id="execution_time_part"
                      {...register('execution_time_part')}
                      className="h-14 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    />
                    {errors.execution_time_part && (
                      <p className="mt-2 text-xs text-red-500">{String(errors?.execution_time_part?.message)}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Answer Config - Only show if there are questions */}
          {hasQuestions ? (
            <div className="bg-white border border-gray-200 rounded-xl">
              <div className="py-[20px] px-[30px]">
                <h4 className="text-sm font-semibold text-gray-800">Configuraciones de respuesta</h4>
              </div>
              <div className="border-t border-gray-200 mb-[1rem]" />
              <div className="flex items-center justify-between text-sm text-gray-800 p-4 px-[30px]">
                <span>Respuesta obligatoria</span>

                <label className="inline-flex items-center cursor-pointer">
                  <Controller
                    name="requires_response"
                    control={formControl}
                    defaultValue={false}
                    render={({ field }) => (
                      <div className="flex items-center gap-2">
                        <Switch
                          id="required-response"
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            sendEvent(
                              checked
                                ? TrackEvents.announcements.configRequiredResponseEnabled
                                : TrackEvents.announcements.configRequiredResponseDisabled
                            );
                            field.onChange(checked);
                          }}
                        />
                      </div>
                    )}
                  />
                </label>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-800 p-4 px-[30px]">
                <span>Fecha máxima de respuesta</span>
                <label className="inline-flex items-center cursor-pointer">
                  <Controller
                    name="response_deadline_accepted"
                    control={formControl}
                    defaultValue={false}
                    render={({ field }) => (
                      <div className="flex items-center gap-2">
                        <Switch
                          id="required-response_deadline_accepted"
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            sendEvent(
                              checked
                                ? TrackEvents.announcements.configMaxResponseDateEnabled
                                : TrackEvents.announcements.configMaxResponseDateDisabled
                            );
                            field.onChange(checked);
                          }}
                        />
                      </div>
                    )}
                  />
                </label>
              </div>
              {responseDeadlineAccepted ? (
                <div className="py-[20px] px-[30px]">
                  <div className="flex gap-4">
                    <div className="w-1/2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                      <Controller
                        name="response_date"
                        control={formControl}
                        defaultValue=""
                        render={({ field, fieldState }) => (
                          <DatePicker
                            value={field.value}
                            onChange={(date) => {
                              sendEvent(TrackEvents.announcements.configMaxResponseDateSet);
                              field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                            }}
                            error={fieldState.error?.message}
                            placeholder="Fecha"
                          />
                        )}
                      />
                      {errors.response_date ? (
                        <p className="mt-2 text-xs text-red-500">{String(errors.response_date?.message)}</p>
                      ) : null}
                    </div>
                    <div className="w-1/2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                      <Input
                        type="time"
                        id="response_time_part"
                        {...register('response_time_part')}
                        className="h-14 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                      />
                      {errors.response_time_part ? (
                        <p className="mt-2 text-xs text-red-500">{String(errors.response_time_part?.message)}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
};

export default ConfigurationSendStep;
