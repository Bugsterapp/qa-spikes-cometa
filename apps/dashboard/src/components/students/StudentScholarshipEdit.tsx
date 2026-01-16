import { Calendar } from '@cometa/recreo';
import { StudentScholarshipDateRange, StudentScholarshipRetrieve } from '@cometa/trpc/src/types';
import { SchoolCycleEntity } from '@cometa/trpc/src/students/types-mapping';
import { zodResolver } from '@hookform/resolvers/zod';
import * as RSelect from '@radix-ui/react-select';
import { format, isDate, parseISO, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { forwardRef, useEffect, useState } from 'react';
import { Controller, FormProvider, useFieldArray, useForm, useFormContext, useWatch } from 'react-hook-form';
import { z } from 'zod';

import IcActivate from '/public/assets/icons/ic_activate.svg';
import IcPlus from '/public/assets/icons/ic_plus.svg';
import Chevron from '/public/assets/icons/studentDetail/chevron.svg';
import TrashIcon from '/public/assets/icons/trash_outline.svg';
import SelectChip from '/src/components/atoms/SelectChip';
import { Switch } from '/src/components/atoms/Switch';
import { Tooltip } from '/src/components/atoms/Tooltip';
import Button from '/src/components/organisms/dashboard/Button';
import { Popover, PopoverContent, PopoverTrigger } from '/src/components/ui/Popover';
import ScholarshipValidationDialog from '/src/components/students/ScholarshipValidationDialog';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import useAlert from '/src/hooks/useAlert';
import { api } from '/src/utils/api';
import { cn } from '/src/utils/cn';

const FormSchema = z.object({
  assignments: z.array(
    z.object({
      id: z.string().optional(),
      schoolCycle: z.object({
        id: z.string(),
        name: z.string(),
        is_active: z.boolean().optional(),
        yearStart: z.number().nullish(),
        yearEnd: z.number().nullish(),
      }),
      student: z.object({
        id: z.string(),
      }),
      hasDateRanges: z.boolean(),
      dateRanges: z.array(
        z.object({
          id: z.number().nullish(),
          dateStart: z.date().nullish(),
          dateEnd: z.date().nullish(),
        })
      ),
      scholarship: z.object({
        id: z.string(),
      }),
      inserted: z.boolean(),
      is_active: z.boolean(),
      is_new: z.boolean(),
    })
  ),
});

type FormValues = z.infer<typeof FormSchema>;

type StudentScholarshipEditProps = {
  studentScholarships: StudentScholarshipRetrieve[] | undefined;
  deleteScholarship: (scholarship: ScholarshipCycleDelete) => void;
  activateScholarship: (scholarship: ScholarshipCycleDelete) => void;
  setIsSubmitting: (newValue: boolean) => void;
  setIsFormValid: (isValid: boolean) => void;
  closeEdit?: () => void;
};

const StudentScholarshipEdit = forwardRef<HTMLFormElement, StudentScholarshipEditProps>(
  (
    { studentScholarships, deleteScholarship, activateScholarship, setIsSubmitting, setIsFormValid, closeEdit },
    ref
  ) => {
    const school = useSelectedSchool();
    const utils = api.useUtils();
    const { setAlertState } = useAlert();
    const { data: cycles } = api.charge.schoolCycleList.useQuery(
      {
        schoolId: school?.id as string,
      },
      {
        enabled: Boolean(school?.id),
        refetchOnMount: false,
      }
    );
    const schoolCycles = cycles?.sort((a, b) => (b.year_end ?? 0) - (a.year_end ?? 0)) || [];
    const [showAddNewCycle, setShowAddNewCycle] = useState(schoolCycles.length !== (studentScholarships?.length || 0));
    const [deletedAssignments, setDeletedAssignments] = useState<ScholarshipCycleDelete[]>([]);
    const [showValidationDialog, setShowValidationDialog] = useState(false);
    const [validationData, setValidationData] = useState<any>(null);
    const [pendingNewCycles, setPendingNewCycles] = useState<any>(null);

    const scholarshipToAssignment = (scholarship: StudentScholarshipRetrieve) => ({
      id: scholarship.id,
      schoolCycle: {
        id: scholarship.school_cycle?.id,
        name: scholarship.school_cycle?.name,
        is_active: scholarship.school_cycle?.is_active ?? false,
      },
      student: {
        id: scholarship.student?.id,
      },
      scholarship: {
        id: scholarship.scholarship?.id,
      },
      hasDateRanges: Array.isArray(scholarship.date_ranges) && scholarship.date_ranges.length > 0,
      dateRanges: Array.isArray(scholarship.date_ranges)
        ? scholarship.date_ranges.map((range: StudentScholarshipDateRange) => ({
            id: range.id,
            dateStart: range.start_date ? new Date(range.start_date) : null,
            dateEnd: range.end_date ? new Date(range.end_date) : null,
          }))
        : [],
      inserted: true,
      is_active: scholarship.is_active ?? false,
      is_new: false,
      isDeletable: scholarship.is_deletable,
    });

    const form = useForm<FormValues>({
      resolver: zodResolver(FormSchema),
      mode: 'all',
      reValidateMode: 'onChange',
      defaultValues: {
        assignments: studentScholarships?.map((scholarship) => scholarshipToAssignment(scholarship)) ?? [],
      },
    });

    const { remove, append, replace } = useFieldArray({
      control: form.control,
      name: 'assignments',
    });

    useEffect(() => {
      if (studentScholarships) {
        const currentAssignments = form.getValues('assignments');
        const studentScholarshipsIds = studentScholarships.map((scholarship) => scholarship.id);
        const deletedAssignments = currentAssignments?.filter(
          (assignment) => assignment?.id && !studentScholarshipsIds.includes(assignment?.id)
        );

        setDeletedAssignments(deletedAssignments as unknown as ScholarshipCycleDelete[]);

        const newAssignments =
          currentAssignments && currentAssignments.length > 0
            ? currentAssignments
                ?.map((assignment) => {
                  const scholarship = studentScholarships?.find((scholarship) => scholarship.id === assignment.id);
                  return scholarship ? scholarshipToAssignment(scholarship) : { ...assignment };
                })
                .filter((assignment) => !assignment.id || studentScholarshipsIds.includes(assignment.id))
            : studentScholarships?.map((scholarship) => scholarshipToAssignment(scholarship));

        replace(newAssignments);

        setShowAddNewCycle(schoolCycles.length !== newAssignments.length);
      }
    }, [studentScholarships, replace]);

    const assignments = useWatch({
      control: form.control,
      name: 'assignments',
      defaultValue: [],
    });

    useEffect(() => {
      if (setIsFormValid) {
        const isValid = assignments.every((assignment) => assignment.schoolCycle && assignment.schoolCycle.id);
        setIsFormValid(isValid);
      }
    }, [assignments, setIsFormValid]);

    const addNewCycle = () => {
      setShowAddNewCycle(false);
      append({
        id: '',
        schoolCycle: {
          id: '',
          name: '',
          is_active: false,
        },
        student: {
          id: '',
        },
        scholarship: {
          id: '',
        },
        hasDateRanges: false,
        dateRanges: [],
        inserted: true,
        is_active: true,
        is_new: true,
      });
    };

    const removeSchoolCycle = (idx: number) => {
      remove(idx);
    };

    const updateMutation = api.students.studentScholarshipUpdate.useMutation();
    const createMutation = api.students.studentScholarshipAssignV2.useMutation({
      onSuccess: async () => {
        setShowValidationDialog(false);
        setValidationData(null);
        setPendingNewCycles(null);
        await utils.students.studentScholarships.invalidate();
        await utils.students.studentsScholarshipList.invalidate();
        setIsSubmitting(false);
        closeEdit?.();
      },
      onError: (err) => {
        const sponsoredData = err.data?.customData?.sponsoredPayment || (err.data?.cause as any);

        if (err.data?.httpStatus === 409 && sponsoredData?.error === 'sponsored_payment_risk') {
          setValidationData(sponsoredData);
          setShowValidationDialog(true);
          return;
        }

        setAlertState({
          open: true,
          severity: 'error',
          message: 'Ocurrió un error inesperado, por favor intenta de nuevo.',
        });
        setIsSubmitting(false);
      },
    });
    const deleteMutation = api.students.studentScholarshipDelete.useMutation();

    const submitForm = async (data: FormValues) => {
      const validAssignments = data.assignments.filter((assignment) => assignment?.schoolCycle?.id);

      if (deletedAssignments.length == 0 && validAssignments.length === 0) {
        setAlertState({ open: true, severity: 'error', message: 'La información es incorrecta.' });
        return;
      }

      const scholarship = validAssignments.find((assignment) => assignment?.scholarship?.id);
      const student = validAssignments.find((assignment) => assignment?.student?.id);
      const updatedCycles = validAssignments.filter((assignment) => !assignment.is_new);
      const newCycles = validAssignments.filter((assignment) => assignment.is_new);

      try {
        if (deletedAssignments.length > 0) {
          await deleteMutation.mutateAsync({
            studentId: deletedAssignments[0].student.id,
            scholarship_ids: deletedAssignments.map((assignments) => assignments.id) as string[],
          });
        }

        if (scholarship && student && updatedCycles.length > 0) {
          await updateMutation.mutateAsync({
            scholarshipId: scholarship.scholarship.id,
            studentId: student.student.id,
            data: updatedCycles.map((cycle) => ({
              scholarship_id: scholarship.scholarship.id,
              id: Number(cycle.id),
              student_id: student.student.id,
              school_cycle_id: cycle.schoolCycle.id,
              is_active: cycle.is_active ?? false,
              school_id: school?.id ?? '',
              date_ranges: cycle.dateRanges.map((range) => ({
                id: range.id || undefined,
                start_date: range.dateStart?.toISOString() || '',
                end_date: range.dateEnd?.toISOString() || '',
              })),
            })),
          });
        }

        if (scholarship && student && newCycles.length > 0) {
          const newCyclesPayload = {
            studentId: student.student.id,
            data: newCycles.map((cycle) => ({
              scholarship_id: scholarship.scholarship.id,
              orders_to_skip: [],
              student_id: student.student.id,
              school_cycle_id: cycle.schoolCycle.id,
              is_active: true,
              school_id: school?.id ?? '',
              date_ranges: cycle.dateRanges.map((range) => ({
                id: range.id || undefined,
                start_date: range.dateStart?.toISOString() || '',
                end_date: range.dateEnd?.toISOString() || '',
              })),
            })),
          };

          setPendingNewCycles(newCyclesPayload);

          createMutation.mutate(newCyclesPayload);
          return;
        }

        await utils.students.studentScholarships.invalidate();
        await utils.students.studentsScholarshipList.invalidate();
        closeEdit?.();
      } catch (err) {
        setAlertState({
          open: true,
          severity: 'error',
          message: 'Ocurrió un error inesperado, por favor intenta de nuevo.',
        });
        await utils.students.studentScholarships.invalidate();
        await utils.students.studentsScholarshipList.invalidate();
      }

      setIsSubmitting(false);
    };

    const handleConfirmValidation = () => {
      if (!pendingNewCycles) return;

      setShowValidationDialog(false);

      createMutation.mutate({
        ...pendingNewCycles,
        confirmSponsoredPayment: true,
      });
    };

    const handleCancelValidation = () => {
      setShowValidationDialog(false);
      setValidationData(null);
      setPendingNewCycles(null);
      setIsSubmitting(false);
    };

    return (
      <>
        <div className="justify-between flex self-stretch gap-6 mt-8 mb-5">
          <h3 className="font-semibold text-base text-[#454D64]">Ciclo escolar y duración</h3>
          <div className="ml-auto">
            <Tooltip
              message="No es posible agregar más ciclos escolares."
              disableHover={showAddNewCycle}
              delayDuration={600}
            >
              <Button
                variant="outline"
                onClick={addNewCycle}
                disabled={!showAddNewCycle}
                data-testid="addSchoolCycle-btn"
                leftIcon={<IcPlus fill="currentColor" />}
                className="py-[6px] h-9 text-sm/[24px] flex gap-2 justify-content text-[#00AB55] hover:text-[#00AB55] border-[#00AB55]"
              >
                <span>Agregar otro ciclo escolar</span>
              </Button>
            </Tooltip>
          </div>
        </div>
        {studentScholarships && (
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(submitForm)} ref={ref}>
              {form.getValues('assignments').map((_, index: number) => (
                <SchoolCycleForm
                  key={`assignments.${index}`}
                  index={index}
                  schoolCycles={schoolCycles}
                  deleteScholarship={deleteScholarship}
                  activateScholarship={activateScholarship}
                  removeSchoolCycle={(idx: number) => removeSchoolCycle(idx)}
                  setShowAddNewCycle={setShowAddNewCycle}
                  deletedAssignments={deletedAssignments}
                />
              ))}
            </form>
          </FormProvider>
        )}

        <ScholarshipValidationDialog
          isOpen={showValidationDialog}
          onClose={handleCancelValidation}
          onConfirm={handleConfirmValidation}
          sponsoredOrders={validationData?.sample_details || []}
          validationData={validationData}
          isLoading={createMutation.isPending}
        />
      </>
    );
  }
);

export interface ScholarshipCycleDelete {
  schoolCycle: SchoolCycleEntity;
  is_active: boolean;
  hasDateRanges: boolean;
  is_new: boolean;
  dateRanges: {
    id?: number | undefined | null;
    dateStart?: Date | null;
    dateEnd?: Date | null;
  }[];
  inserted: boolean;
  id?: string | undefined;
  student: {
    id: string;
  };
  scholarship: {
    id: string;
  };
  isDeletable: boolean;
}

const SchoolCycleForm = ({
  index,
  schoolCycles,
  deleteScholarship,
  activateScholarship,
  removeSchoolCycle,
  setShowAddNewCycle,
  deletedAssignments,
}: {
  index: number;
  schoolCycles: SchoolCycleEntity[];
  removeSchoolCycle: (idx: number) => void;
  deleteScholarship: (scholarship: ScholarshipCycleDelete) => void;
  activateScholarship: (scholarship: ScholarshipCycleDelete) => void;
  setShowAddNewCycle: (newValue: boolean) => void;
  deletedAssignments: ScholarshipCycleDelete[];
}) => {
  const form = useFormContext<FormValues>();
  const [refreshKey, setRefreshKey] = useState(0);

  const values = form.getValues(`assignments.${index}`) as unknown as ScholarshipCycleDelete;

  const schoolCycle = schoolCycles.find((schoolCycle: SchoolCycleEntity) => schoolCycle.id === values.schoolCycle?.id);

  const { append, remove } = useFieldArray({
    control: form.control,
    name: `assignments.${index}.dateRanges`,
  });

  const addDateRange = () => {
    if (values.hasDateRanges) {
      append({ id: undefined, dateStart: new Date(), dateEnd: new Date() });
    } else {
      remove();
    }
  };

  const removeDateRange = (idx: number) => {
    remove(idx);
    setRefreshKey((prev) => prev + 1);
  };

  const handleSelectSchoolCycle = (e: string) => {
    const assignment = deletedAssignments.find((assignment) => assignment.schoolCycle.id == e);
    if (assignment) {
      form.setValue(`assignments.${index}`, {
        ...assignment,
        schoolCycle: {
          ...assignment.schoolCycle,
          id: assignment.schoolCycle.id as string,
          name: assignment.schoolCycle.name,
        },
      });
    } else {
      const schoolCycle = schoolCycles.find((cycle) => cycle.id === e);
      if (schoolCycle) {
        form.setValue(`assignments.${index}.schoolCycle`, {
          id: schoolCycle.id as string,
          name: schoolCycle.name,
          is_active: schoolCycle.is_active ?? false,
          yearStart: schoolCycle.year_start,
          yearEnd: schoolCycle.year_end,
        });
      }
    }
    setShowAddNewCycle(schoolCycles.length !== alreadySelectedCycleIds.length);
  };

  const alreadySelectedCycleIds = form.watch('assignments').map((assignment) => assignment.schoolCycle?.id);

  return (
    <div className="w-full">
      {values && values?.schoolCycle?.id && (
        <div className="border border-[#DFE3E8] p-4 rounded-lg gap-3 my-4">
          <div className="flex text-base font-semibold justify-between">
            <div className="flex gap-3">
              <span
                className={cn('', {
                  'text-[#919EAB]': !values.is_active,
                })}
              >
                {values.schoolCycle.name}
              </span>
              {values.schoolCycle.is_active && <SelectChip theme="green">Ciclo actual</SelectChip>}
            </div>
            {values.is_new ? (
              <button
                type="button"
                onClick={() => {
                  setShowAddNewCycle(true);
                  removeSchoolCycle(index);
                }}
              >
                <TrashIcon className="w-5 cursor-pointer text-red-500" />
              </button>
            ) : values.is_active ? (
              <button type="button" onClick={() => deleteScholarship(values)}>
                <TrashIcon className="w-5 cursor-pointer text-red-500" />
              </button>
            ) : (
              <Tooltip message="Reactivar beca o descuento en el ciclo escolar">
                <button type="button" onClick={() => activateScholarship(values)}>
                  <IcActivate />
                </button>
              </Tooltip>
            )}
          </div>
          {values.is_active && (
            <>
              <div className="border-t my-4 border-[#919EAB3D]" />
              <div className="flex gap-3 items-center text-sm font-normal text-[#1C1C1D]">
                <Controller
                  control={form.control}
                  name={`assignments.${index}.hasDateRanges`}
                  render={({ field: { onChange, value } }) => (
                    <div className="flex gap-3 items-center text-sm font-normal text-[#1C1C1D]">
                      <Switch
                        id="waive-surcharge"
                        checked={value}
                        onCheckedChange={(e) => {
                          onChange(e);
                          addDateRange();
                        }}
                      />
                      Aplicar beca a un rango de fechas específicas
                    </div>
                  )}
                />
              </div>
              <div key={refreshKey}>
                {values.hasDateRanges &&
                  values.dateRanges?.map((_, subIndex: number) => (
                    <DateRangeForm
                      key={`date-range-${subIndex}`}
                      path={`assignments.${index}.dateRanges.${subIndex}`}
                      schoolCycle={schoolCycle}
                      displayDelete={subIndex > 0}
                      removeDateRange={() => removeDateRange(subIndex)}
                    />
                  ))}
              </div>
              {values.hasDateRanges && (
                <button
                  onClick={addDateRange}
                  type="button"
                  className="text-[#637381] flex gap-3 py-2 text-sm font-bold items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <IcPlus fill="currentColor" />
                  Agregar rango de fechas
                </button>
              )}
            </>
          )}
        </div>
      )}
      {!values?.schoolCycle?.id && (
        <div
          className={cn('flex', {
            'p-4 gap-5 border border-[#919EAB52] rounded-lg': index > 0,
          })}
        >
          <Controller
            control={form.control}
            name={`assignments.${index}.schoolCycle.id`}
            render={({ field: { onChange, value, ref } }) => (
              <RSelect.Root
                onValueChange={(e) => {
                  handleSelectSchoolCycle(e);
                  onChange(e);
                }}
                value={value}
              >
                <RSelect.Trigger
                  ref={ref}
                  className="relative group appearance-none border border-[#919EAB52] data-[error=true]:border-[#FF4842] rounded-xl p-4 flex justify-between bg-transparent items-center w-full focus-within:border-green"
                >
                  <label className="absolute -top-2.5 left-3.5 bg-white text-[#919EAB] group-[[data-error=true]]:text-[#FF4842] text-xs group-focus-within:text-green">
                    Ciclo escolar
                  </label>
                  <RSelect.Value placeholder="Selecciona un ciclo escolar" data-testid="Selecciona un ciclo escolar" />
                  <Chevron className="text-[#637381] w-3 ml-16" />
                </RSelect.Trigger>
                <RSelect.Portal>
                  <RSelect.Content
                    className="z-[99] p-4 bg-white rounded-lg shadow-md min-w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)]"
                    position="popper"
                  >
                    <RSelect.Viewport className="max-h-[250px] space-y-2">
                      {schoolCycles?.map((schoolCycle) => (
                        <RSelect.Item
                          className={cn(
                            'data-[state=checked]:bg-gray-100 rounded-lg p-4 cursor-pointer hover:bg-gray-50 flex gap-3',
                            {
                              'cursor-not-allowed opacity-50': alreadySelectedCycleIds.includes(
                                schoolCycle.id as string
                              ),
                            }
                          )}
                          key={`${schoolCycle.name}_${schoolCycle.id as string}`}
                          data-testid={`${schoolCycle.name}`}
                          value={schoolCycle.id as string}
                          disabled={alreadySelectedCycleIds.includes(schoolCycle.id as string)} // Esto desactiva los elementos ya seleccionados
                        >
                          <RSelect.ItemText>{schoolCycle.name}</RSelect.ItemText>
                          {schoolCycle.is_active && <SelectChip theme="blue">Ciclo actual</SelectChip>}
                        </RSelect.Item>
                      ))}
                    </RSelect.Viewport>
                  </RSelect.Content>
                </RSelect.Portal>
              </RSelect.Root>
            )}
          />
        </div>
      )}
    </div>
  );
};

const DateRangeForm = ({
  path,
  schoolCycle,
  displayDelete,
  removeDateRange,
}: {
  path: string;
  schoolCycle: SchoolCycleEntity | undefined;
  displayDelete: boolean;
  removeDateRange: () => void;
}) => {
  const form = useFormContext();
  const values = form.getValues(path);
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-row gap-3 items-center mt-3">
      <div className="flex flex-row gap-3 items-center w-[90%]">
        <Controller
          control={form.control}
          defaultValue={values.dateStart}
          name={`${path}.dateStart`}
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
                  {field.value && <p className="absolute bottom-[30px] bg-white text-[#9DA9B4] text-xs">Desde</p>}
                  <span className="text-base text-[#212B36]">
                    {field.value ? (
                      format(isDate(field.value) ? field.value : parseISO(String(field.value)), 'dd / MM / yyyy', {
                        locale: es,
                      })
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
                  defaultMonth={startOfMonth(new Date(schoolCycle?.year_start ?? currentYear, 0))}
                  fromYear={schoolCycle?.year_start ?? currentYear}
                  toYear={schoolCycle?.year_end ?? currentYear}
                  showOutsideDays
                  fixedWeeks={false}
                />
              </PopoverContent>
            </Popover>
          )}
        />
        <Controller
          control={form.control}
          defaultValue={values.dateEnd}
          name={`${path}.dateEnd`}
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
                  {field.value && <p className="absolute bottom-[30px] bg-white text-[#9DA9B4] text-xs">Hasta</p>}
                  <span className="text-base text-[#212B36]">
                    {field.value ? (
                      format(isDate(field.value) ? field.value : parseISO(String(field.value)), 'dd / MM / yyyy', {
                        locale: es,
                      })
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
                  defaultMonth={startOfMonth(new Date(schoolCycle?.year_end ?? currentYear, 0))}
                  fromYear={schoolCycle?.year_start ?? currentYear}
                  toYear={schoolCycle?.year_end ?? currentYear}
                  fixedWeeks={false}
                />
              </PopoverContent>
            </Popover>
          )}
        />
      </div>
      {displayDelete && (
        <button type="button" onClick={(_e) => removeDateRange()}>
          <TrashIcon className={cn('w-5 cursor-pointer text-[#637381]')} />
        </button>
      )}
    </div>
  );
};

export default StudentScholarshipEdit;
