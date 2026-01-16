import { AvailableScholarshipDetail, DashboardStudent } from '@cometa/trpc/src/types';
import { SchoolCycleEntity } from '@cometa/trpc/src/students/types-mapping';
import { zodResolver } from '@hookform/resolvers/zod';
import * as RSelect from '@radix-ui/react-select';
import { format, isDate, parseISO, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import IcPlus from '/public/assets/icons/ic_plus.svg';
import Chevron from '/public/assets/icons/studentDetail/chevron.svg';
import TrashIcon from '/public/assets/icons/trash_outline.svg';
import SelectChip from '/src/components/atoms/SelectChip';
import SidebarActions from '/src/components/atoms/SidebarActions';
import { Switch } from '/src/components/atoms/Switch';
import CAutocomplete from '/src/components/molecules/dashboard/NCometaSingleSelect';
import { ScholarshipResumeDetail } from '/src/components/molecules/dashboard/ScholarshipResumeDetail';
import Button from '/src/components/organisms/dashboard/Button';
import { FormValuesScholarship, ScholarshipSchema } from '/src/components/organisms/dashboard/TabsTablesScholarships';
import { Popover, PopoverContent, PopoverTrigger } from '/src/components/ui/Popover';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { api } from '/src/utils/api';
import { cn } from '/src/utils/cn';
import { Calendar } from '@cometa/recreo';

interface SchoolarShipAssignFormProps<T> {
  scholarship?: AvailableScholarshipDetail;
  formData?: FormValuesScholarship;
  unselectScholarship?: () => void;
  onClose?: () => void;
  setData?: (data: T) => void;
  student?: DashboardStudent;
  currentScholarship?: any;
  scholarships?: any;
  setCurrentScholarship: (arg0: string | null) => void;
}

export function StudentScholarshipAssignForm({
  scholarship,
  unselectScholarship,
  onClose,
  student,
  setData,
  currentScholarship,
  scholarships,
  setCurrentScholarship,
  formData,
}: SchoolarShipAssignFormProps<FormValuesScholarship>) {
  const [cycles, setCycles] = useState<SchoolCycleEntity[]>([]);
  const [showAddNewCycle, setShowAddNewCycle] = useState(false);
  const selectedSchool = useSelectedSchool();
  const formStep = useForm<FormValuesScholarship>({
    resolver: zodResolver(ScholarshipSchema),
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues: formData
      ? formData
      : {
          cycles: [
            {
              school_cycle: '',
              school_cycle_name: '',
              dates: [],
              needRanges: false,
              inserted: true,
            },
          ],
        },
  });

  const { remove } = useFieldArray({
    control: formStep.control,
    name: 'cycles',
  });

  // const { errors } = formStep.formState;
  const { data: schoolCycles } = api.charge.schoolCycleList.useQuery(
    {
      schoolId: selectedSchool?.id as string,
    },
    {
      enabled: Boolean(selectedSchool),
    }
  );

  useEffect(() => {
    if (schoolCycles && formData) {
      const cycles = schoolCycles.filter((cycle) => formData.cycles.some((c) => c.school_cycle === cycle.id));
      setCycles(cycles);
    }
  }, [schoolCycles, formData]);

  const sortedSchoolCyclesByYearEnd = schoolCycles?.sort((a, b) => (b.year_end ?? 0) - (a.year_end ?? 0));

  const handleSelectSchoolCycle = (id: string, index: number) => {
    const selectedSchoolCycle = schoolCycles?.find((school) => school.id === id);
    if (selectedSchoolCycle) {
      setCycles((prev) => [...prev, selectedSchoolCycle]);
      formStep.setValue(`cycles.${index}.school_cycle`, id);
      formStep.setValue(`cycles.${index}.school_cycle_name`, selectedSchoolCycle.name);
    }
    setShowAddNewCycle(false);
  };

  const handleAddNewCycle = () => {
    setShowAddNewCycle(true);
    formStep.setValue('cycles', [
      ...formStep.getValues('cycles'),
      {
        school_cycle: '',
        school_cycle_name: '',
        dates: [],
        needRanges: false,
        inserted: true,
      },
    ]);
  };

  const cyclesForm = formStep.watch('cycles');

  const removeCycle = (id: string, index: number) => {
    setCycles((prev) => prev.filter((cycle) => cycle.id !== id));
    if (cyclesForm.length === 1) {
      formStep.setValue(`cycles.${index}`, {
        school_cycle: '',
        school_cycle_name: '',
        dates: [],
        needRanges: false,
        inserted: true,
      });
    } else {
      remove(index);
    }
    setShowAddNewCycle(false);
  };

  const handleAddRanges = (index: number) => {
    const cycle = cyclesForm[index];
    if (cycle.needRanges) {
      const cycleStartDate = cycles?.find((c) => c.id === cycle.school_cycle)?.year_start;
      const cycleEndDate = cycles?.find((c) => c.id === cycle.school_cycle)?.year_end;
      formStep.setValue(`cycles.${index}.dates`, [
        ...cycle.dates,
        {
          date_start: new Date(cycleStartDate ?? 1, 0),
          date_end: new Date(cycleEndDate ?? 1, 0),
        },
      ]);
    } else {
      formStep.setValue(`cycles.${index}.dates`, []);
    }
  };

  useEffect(() => {
    const cycles = formStep.getValues('cycles');
    if (cycles.length > 1) {
      const newCycles = cycles.filter((cycle) => cycle.inserted);
      formStep.setValue('cycles', newCycles);
    }
  }, [cyclesForm.length]);

  const handleRemoveRange = (index: number, cycleIndex: number) => {
    const dates = cyclesForm[cycleIndex].dates;
    const newDates = dates.filter((_, i) => i !== index);
    formStep.setValue(`cycles.${cycleIndex}.dates`, newDates);
  };

  const cycleInformation = (id: string) => schoolCycles?.find((school) => school.id === id);

  const onSubmit = (data: FormValuesScholarship) => {
    setData?.(data);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-3">
        <label className="text-[#454D64] text-base font-semibold">Beca o descuento a asignar</label>
      </div>
      {!currentScholarship && (
        <CAutocomplete
          setSelected={setCurrentScholarship}
          data={scholarships || []}
          placeholder="Selecciona una beca"
          currentValue={currentScholarship}
        />
      )}
      {currentScholarship && (
        <div className="flex flex-col gap-8 h-full">
          <ScholarshipResumeDetail scholarship={scholarship} student={student} onClose={unselectScholarship} />
          <form className="h-full justify-between flex flex-col" onSubmit={formStep.handleSubmit(onSubmit)}>
            <div className="flex flex-col">
              <span className="font-semibold text-base text-[#454D64]">Ciclo escolar y duración</span>
              <span className="text-sm text-[#454D64]">
                Esta beca únicamente afectará a conceptos de los ciclos seleccionados.
              </span>
              <div className="mt-6">
                {cyclesForm &&
                  cyclesForm.map((cycle, index_cycle) => (
                    <div key={`${cycle.school_cycle}_${index_cycle}`} className="flex flex-col w-full gap-3">
                      {cycle.school_cycle && (
                        <div className="w-full">
                          <div className="border border-[#DFE3E8] p-4 rounded-lg gap-3 my-4">
                            <div className="flex text-base font-semibold justify-between">
                              <div className="flex gap-3">
                                {cycleInformation(cycle.school_cycle)?.name}
                                {cycleInformation(cycle.school_cycle)?.is_active && (
                                  <SelectChip theme="green">Ciclo actual</SelectChip>
                                )}
                              </div>
                              <button onClick={() => removeCycle(cycle.school_cycle, index_cycle)}>
                                <TrashIcon className={cn('w-5 cursor-pointer text-red-500')} />
                              </button>
                            </div>
                            <div className="border-t my-4 border-[#919EAB3D]" />
                            <div className="flex gap-3 items-center text-sm font-normal text-[#1C1C1D]">
                              <Controller
                                control={formStep.control}
                                name={`cycles.${index_cycle}.needRanges`}
                                render={({ field: { onChange, value } }) => (
                                  <div className="flex gap-3 items-center text-sm font-normal text-[#1C1C1D]">
                                    <Switch
                                      id="waive-surcharge"
                                      checked={value}
                                      onCheckedChange={(e) => {
                                        onChange(e);
                                        handleAddRanges(index_cycle);
                                      }}
                                    />
                                    Aplicar beca a un rango de fechas específicas
                                  </div>
                                )}
                              />
                            </div>
                            {cycle.needRanges &&
                              cycle.dates?.map((date, index_dates) => (
                                <div
                                  key={`${cycle.school_cycle}_date_start_${index_dates}`}
                                  className="flex flex-row gap-3 items-center mt-3"
                                >
                                  <div className="flex flex-row gap-3 items-center w-[90%]">
                                    <Controller
                                      control={formStep.control}
                                      defaultValue={date.date_start}
                                      name={`cycles.${index_cycle}.dates.${index_dates}.date_start`}
                                      render={({ field }) => (
                                        <Popover>
                                          <PopoverTrigger type="button" asChild>
                                            <Button
                                              variant="outline"
                                              type="button"
                                              className={`w-full relative justify-between text-left font-normal rounded-md border-gray-300 mt-2 border h-10 ${
                                                !field.value && 'text-muted-foreground'
                                              }`}
                                            >
                                              {field.value && (
                                                <p className="absolute bottom-[30px] bg-white text-[#9DA9B4] text-xs">
                                                  Desde
                                                </p>
                                              )}
                                              <span className="text-base text-[#212B36]">
                                                {field.value ? (
                                                  format(
                                                    isDate(field.value) ? field.value : parseISO(String(field.value)),
                                                    'dd / MM / yyyy',
                                                    {
                                                      locale: es,
                                                    }
                                                  )
                                                ) : (
                                                  <span className="text-[#919EAB] text-base">Desde</span>
                                                )}
                                              </span>
                                              <CalendarIcon className="w-4 h-4 mr-2 text-[#637381]" />
                                            </Button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-auto p-0 bg-white">
                                            <Calendar
                                              mode="single"
                                              selected={field.value}
                                              onSelect={field.onChange}
                                              initialFocus
                                              defaultMonth={startOfMonth(
                                                new Date(cycles?.[index_cycle]?.year_start ?? 1, 0)
                                              )}
                                              fromYear={cycles?.[index_cycle]?.year_start ?? 1}
                                              toYear={cycles?.[index_cycle]?.year_end ?? 1}
                                              // toMonth={endOfMonth(new Date(order.due))}
                                              showOutsideDays
                                              fixedWeeks={false}
                                            />
                                          </PopoverContent>
                                        </Popover>
                                      )}
                                    />
                                    <Controller
                                      control={formStep.control}
                                      defaultValue={date.date_end}
                                      name={`cycles.${index_cycle}.dates.${index_dates}.date_end`}
                                      render={({ field }) => (
                                        <Popover>
                                          <PopoverTrigger type="button" asChild>
                                            <Button
                                              variant="outline"
                                              type="button"
                                              className={`w-full justify-between relative text-left font-normal rounded-md border-gray-300 mt-2 border h-10 ${
                                                !field.value && 'text-muted-foreground'
                                              }`}
                                            >
                                              {field.value && (
                                                <p className="absolute bottom-[30px] bg-white text-[#9DA9B4] text-xs">
                                                  Hasta
                                                </p>
                                              )}
                                              <span className="text-base text-[#212B36]">
                                                {field.value ? (
                                                  format(
                                                    isDate(field.value) ? field.value : parseISO(String(field.value)),
                                                    'dd / MM / yyyy',
                                                    {
                                                      locale: es,
                                                    }
                                                  )
                                                ) : (
                                                  <span className="text-[#919EAB] text-base">Hasta</span>
                                                )}
                                              </span>
                                              <CalendarIcon className="w-4 h-4 mr-2 text-[#637381]" />
                                            </Button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-auto p-0 bg-white">
                                            <Calendar
                                              mode="single"
                                              selected={field.value}
                                              onSelect={field.onChange}
                                              initialFocus
                                              defaultMonth={startOfMonth(
                                                new Date(cycles?.[index_cycle]?.year_end ?? 1, 0)
                                              )}
                                              fromDate={cyclesForm[index_cycle].dates[index_dates].date_start}
                                              toYear={cycles?.[index_cycle]?.year_end ?? 1}
                                              fixedWeeks={false}
                                            />
                                          </PopoverContent>
                                        </Popover>
                                      )}
                                    />
                                  </div>
                                  {index_dates > 0 && (
                                    <button onClick={() => handleRemoveRange(index_dates, index_cycle)}>
                                      <TrashIcon className={cn('w-5 cursor-pointer text-[#637381]')} />
                                    </button>
                                  )}
                                </div>
                              ))}
                            {cycle.needRanges && (
                              <button
                                onClick={() => handleAddRanges(index_cycle)}
                                type="button"
                                className="text-[#637381] flex gap-3 py-2 text-sm font-bold items-center disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <IcPlus fill="currentColor" />
                                Agregar rango de fechas
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                      {!cycle.school_cycle && (
                        <div
                          className={cn('flex', {
                            'p-4 gap-5 border border-[#919EAB52] rounded-lg': index_cycle > 0,
                          })}
                        >
                          <Controller
                            control={formStep.control}
                            name={`cycles.${index_cycle}.school_cycle`}
                            render={({ field: { onChange, value, ref } }) => (
                              <RSelect.Root
                                onValueChange={(e) => {
                                  handleSelectSchoolCycle(e, index_cycle);
                                  onChange(e);
                                }}
                                value={value}
                              >
                                <RSelect.Trigger
                                  // data-error={Boolean(errors.school_cycle)}
                                  ref={ref}
                                  className="relative group appearance-none border border-[#919EAB52] data-[error=true]:border-[#FF4842] rounded-xl p-4 flex justify-between bg-transparent items-center w-full focus-within:border-green"
                                >
                                  <label className="absolute -top-2.5 left-3.5 bg-white text-[#919EAB] group-[[data-error=true]]:text-[#FF4842] text-xs group-focus-within:text-green">
                                    Ciclo escolar
                                  </label>
                                  <RSelect.Value
                                    placeholder="Selecciona un ciclo escolar"
                                    data-testid="Selecciona un ciclo escolar"
                                  />
                                  <Chevron className="text-[#637381] w-3 ml-16" />
                                </RSelect.Trigger>
                                <RSelect.Portal>
                                  <RSelect.Content
                                    className="z-[99] p-4 bg-white rounded-lg shadow-md min-w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)]"
                                    position="popper"
                                  >
                                    <RSelect.Viewport className="max-h-[250px] space-y-2">
                                      {sortedSchoolCyclesByYearEnd?.map((school_cycle) => (
                                        <RSelect.Item
                                          className={cn(
                                            'data-[state=checked]:bg-gray-100 rounded-lg p-4 cursor-pointer hover:bg-gray-50 flex gap-3',
                                            {
                                              'cursor-not-allowed opacity-50': cycles.some(
                                                (cycle) => cycle.id === school_cycle.id
                                              ),
                                            }
                                          )}
                                          key={`${school_cycle.name}_${school_cycle.id}`}
                                          data-testid={`${school_cycle.name}`}
                                          value={school_cycle.id as string}
                                          disabled={cycles.some((cycle) => cycle.id === school_cycle.id)}
                                        >
                                          <RSelect.ItemText>{school_cycle.name}</RSelect.ItemText>
                                          {school_cycle.is_active && <SelectChip theme="blue">Ciclo actual</SelectChip>}
                                        </RSelect.Item>
                                      ))}
                                    </RSelect.Viewport>
                                  </RSelect.Content>
                                </RSelect.Portal>
                              </RSelect.Root>
                            )}
                          />
                          {index_cycle > 0 && (
                            <button onClick={() => removeCycle(cycle.school_cycle, index_cycle)}>
                              <TrashIcon className={cn('w-5 cursor-pointer text-red-500')} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                {!showAddNewCycle && cycles?.length > 0 && (
                  <button
                    onClick={handleAddNewCycle}
                    type="button"
                    className="text-[#00AB55] flex gap-3 p-4 text-base font-bold items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={cycles.length === schoolCycles?.length}
                  >
                    <IcPlus fill="currentColor" />
                    Agregar otro ciclo escolar
                  </button>
                )}
              </div>
            </div>
            <SidebarActions>
              <button
                className="bg-[#FAFBFF] px-20 py-3 text-green-400 hover:text-green-500 text-base font-bold disabled:bg-[#919EAB3D] disabled:text-[#919EABCC] rounded-lg"
                onClick={() => {
                  onClose?.();
                }}
              >
                Cancelar
              </button>
              <button className="text-white text-base font-bold px-20 py-3 rounded-lg bg-[#00AB55] hover:bg-green-500 disabled:bg-[#919EAB3D] disabled:text-[#919EABCC] whitespace-nowrap">
                Continuar
              </button>
            </SidebarActions>
          </form>
        </div>
      )}
    </div>
  );
}
