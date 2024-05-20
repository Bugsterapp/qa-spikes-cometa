import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import TextField from '/src/components/CustomFormTexField';
import CustomInput from '/src/components/CustomInput';
import * as RSelect from '@radix-ui/react-select';
import Chevron from '/public/assets/icons/studentDetail/chevron.svg';
import { useEffect, useRef, useState } from 'react';
import { api } from '../../../utils/api';
import { useSelectedSchool } from '../../../guards/AuthGuard';
import CAlert from '/src/components/atoms/CAlert';
import { RadioGroup, RadioGroupItem } from '../../ui/RadioGroup';
import { Label } from '../../ui/Label';
import { StepProps, FormValues1, schema } from './CreationConcepts';
import ConceptButton from './ConceptButton';
import { cn } from '/src/utils/cn';
import SelectChip from '../../atoms/SelectChip';
import useDebounce from '/src/hooks/useDebounce';

export type AlertToClose = {
  setAlertToCloseSheet: (a: boolean) => void;
  setFormIsDirty?: (isDirty: boolean) => void;
  setHasDueDate?: (has_due_date: string | undefined) => void;
};

export function Step1Form({
  setData,
  formData,
  onNext,
  onBack,
  setHasRecurringRevenue,
  setAlertToCloseSheet,
  setFormIsDirty,
  setHasDueDate,
}: StepProps<FormValues1> & { setHasRecurringRevenue: React.Dispatch<React.SetStateAction<any>> } & AlertToClose) {
  const school = useSelectedSchool();
  const paymentOnlyInDashboard = school?.config_dashboard?.payment_only_in_dashboard;
  const formStep1 = useForm<FormValues1>({
    defaultValues: {
      type: formData?.type,
      school_cycle: formData?.school_cycle,
      name: formData?.name,
      bank_account: formData?.bank_account,
      entity: formData?.entity,
      root_concept: formData?.root_concept,
      payment_only_in_dashboard: formData?.payment_only_in_dashboard || paymentOnlyInDashboard ? 'true' : 'false',
      recurrent_payment: formData?.recurrent_payment,
      has_due_date: formData?.has_due_date,
      has_months_to_pay: formData?.has_months_to_pay,
    },
    resolver: zodResolver(schema),
    mode: 'all',
    reValidateMode: 'onChange',
  });
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const selectedSchool = useSelectedSchool();
  const { data, isLoading } = api.schools.schoolFiscalEntities.useQuery(
    { school_id: selectedSchool?.id as string },
    { enabled: !!selectedSchool?.id }
  );

  const { errors, isDirty } = formStep1.formState;

  const { data: schoolCycles } = api.charge.schoolCycleList.useQuery(
    {
      schoolId: selectedSchool?.id as string,
    },
    {
      enabled: Boolean(selectedSchool),
    }
  );
  const { data: categories } = api.schools.schoolsConceptsFilters.useQuery({ school_id: selectedSchool?.id as string });

  const { data: bankAccounts } = api.schools.bankAccountList.useQuery(
    {
      school_id: selectedSchool?.id as string,
    },
    {
      enabled: Boolean(selectedSchool),
    }
  );
  const onSubmit = (data: FormValues1 & { inscription?: boolean }) => {
    if (data.type === 'INSCRIPTION' || data.type === 'REINSCRIPTION') {
      data.inscription = true;
    }

    setData(data);
    onNext();
  };

  const conceptType = formStep1.watch('type');
  useEffect(() => {
    if (showErrorAlert && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showErrorAlert]);
  useEffect(() => {
    // we should check if payment_only_in_dashboard and root_concept has errors and show an alert if so
    if (errors.payment_only_in_dashboard || errors.root_concept) {
      setShowErrorAlert(true);
    } else {
      setShowErrorAlert(false);
    }
  }, [errors.payment_only_in_dashboard, errors.root_concept]);
  // we should create an useEffect that checks if bank_account has an error and scroll to it
  useEffect(() => {
    if (errors.bank_account) {
      // scroll to bank_account by scrolling to the bottom
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [errors.bank_account]);
  useEffect(() => {
    setHasRecurringRevenue(formStep1.watch('has_months_to_pay') === 'true');
  }, [formStep1.watch('has_months_to_pay')]);
  const payment_only_in_dashboard = formStep1.watch('payment_only_in_dashboard');
  const root_concept = formStep1.watch('root_concept');
  const timeoutRef = useRef<NodeJS.Timeout | undefined>();
  useEffect(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (root_concept === 'required') {
        setHasDueDate?.('true');
      }
      if (root_concept === 'optional') {
        setHasDueDate?.('false');
        setHasRecurringRevenue(null);
      }
    }, 200);
    return () => clearTimeout(timeoutRef.current);
  }, [root_concept, setHasDueDate]);

  useEffect(() => setFormIsDirty?.(isDirty), [isDirty]);

  useEffect(() => {
    if (conceptType === 'MONTHLY_FEE' || conceptType === 'INSCRIPTION' || conceptType === 'REINSCRIPTION') {
      formStep1.setValue('root_concept', 'required');
      formStep1.setValue('payment_only_in_dashboard', 'false');
    } else {
      formStep1.setValue('root_concept', undefined);
      formStep1.setValue('payment_only_in_dashboard', 'false');
    }
  }, [conceptType]);
  const sortOrder = [
    'colegiatura / mensualidad',
    'inscripción',
    'reinscripción',
    'transporte',
    'deportes',
    'extracurriculares (no deportes)',
    'cafetería',
    'libros y materiales',
    'uniformes y otras mercancías',
    'exámenes y certificados',
    'deuda previa',
    'otro',
  ];

  const sortedCategories = [...(categories?.type || [])];

  sortedCategories.sort((a, b) => {
    let indexA = sortOrder.indexOf(a.name.toLowerCase());
    let indexB = sortOrder.indexOf(b.name.toLowerCase());

    if (indexA === -1) indexA = sortOrder.length;
    if (indexB === -1) indexB = sortOrder.length;

    return indexA - indexB;
  });
  const sortedSchoolCyclesByYearEnd = schoolCycles?.sort((a, b) => (b.year_end ?? 0) - (a.year_end ?? 0));
  const conceptName = useDebounce(formStep1.watch('name'), 1000);
  const selectedSchoolCycle = formStep1.watch('school_cycle');
  const { data: conceptsList } = api.schools.schoolsConceptsList.useQuery(
    {
      multiple_search: conceptName,
      school_id: selectedSchool?.id as string,
      school_cycles: selectedSchoolCycle ? [selectedSchoolCycle] : undefined,
    },
    {
      enabled: !!selectedSchool?.id && conceptName?.length > 1,
      staleTime: 10 * 1000,
    }
  );

  const { setError, clearErrors, watch } = formStep1;
  const conceptNameForm = watch('name');

  useEffect(() => {
    const conceptExists = conceptsList?.some((concept) => concept?.name === conceptNameForm.trim());
    if (conceptExists) {
      setError('name', { message: 'Ya existe un concepto con este nombre en este ciclo escolar.' });
    } else {
      // we should only clear the error if the form is the same as the conceptName
      if (conceptNameForm?.trim() === conceptName) {
        clearErrors('name');
      }
    }
  }, [conceptsList, conceptNameForm, selectedSchoolCycle, setError, clearErrors, conceptName]);
  return (
    <form ref={formRef} onSubmit={formStep1.handleSubmit(onSubmit)}>
      <>
        {showErrorAlert && (
          <CAlert className="mb-4" type="error" message="Debes completar todos los campos para poder continuar." />
        )}
        <div className="sticky top-0 z-20 pt-5 pb-6 bg-white">
          <div className="pb-6 border-b border-gray-300">
            <h1 className="text-xl font-bold text-black">Información general</h1>
            <span className="text-sm text-[#637381]">Ingresa la información del concepto que deseas crear.</span>
          </div>
        </div>
        <div className="min-h-[calc(69vh)] overflow-y-scrollable relative">
          <div className="flex flex-col gap-4 py-4 overflow-y-scrollable">
            {data && (
              <Controller
                control={formStep1.control}
                name="entity"
                defaultValue={data?.length === 1 ? data[0]?.id : undefined}
                render={({ field: { onChange, value, ref } }) => (
                  <RSelect.Root onValueChange={onChange} value={value} disabled={isLoading || data?.length === 1}>
                    <RSelect.Trigger
                      data-error={Boolean(errors.entity)}
                      ref={ref}
                      className="relative group appearance-none border border-[#919EAB52] data-[error=true]:border-[#FF4842] rounded-xl p-4 flex justify-between bg-transparent items-center w-full disabled:opacity-50 focus-within:border-green withe-space-nowrap"
                    >
                      <label className="absolute -top-2.5 left-3.5 bg-white text-[#919EAB] group-[[data-error=true]]:text-[#FF4842] text-xs group-focus-within:text-green">
                        Entidad fiscal
                      </label>
                      <RSelect.Value
                        placeholder="Selecciona tu entidad fiscal"
                        data-testid="selectFiscalEntity-combo"
                      />
                      <Chevron className="text-[#637381] w-3 ml-16" />
                    </RSelect.Trigger>
                    <RSelect.Portal>
                      <RSelect.Content
                        className="z-[9999] p-4 bg-white rounded-lg shadow-md min-w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)]"
                        position="popper"
                      >
                        <RSelect.Viewport className="max-h-[250px] space-y-2">
                          {data?.map((entity) => (
                            <RSelect.Item
                              className="data-[state=checked]:bg-gray-100 rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                              key={entity.id}
                              value={`${entity.id}`}
                            >
                              <RSelect.ItemText>
                                {entity.name}
                                {data.length > 1 ? ` (${entity.tax_id})` : ''}
                              </RSelect.ItemText>
                            </RSelect.Item>
                          ))}
                        </RSelect.Viewport>
                      </RSelect.Content>
                    </RSelect.Portal>
                  </RSelect.Root>
                )}
              />
            )}

            <Controller
              control={formStep1.control}
              name="type"
              render={({ field: { onChange, value, ref } }) => (
                <RSelect.Root onValueChange={onChange} value={value}>
                  <RSelect.Trigger
                    data-error={Boolean(errors.type)}
                    ref={ref}
                    className="relative group appearance-none border border-[#919EAB52] data-[error=true]:border-[#FF4842] rounded-xl p-4 flex justify-between bg-transparent items-center w-full focus-within:border-green"
                  >
                    <label className="absolute -top-2.5 left-3.5 bg-white text-[#919EAB] group-[[data-error=true]]:text-[#FF4842] text-xs group-focus-within:text-green">
                      Tipo de concepto
                    </label>
                    <RSelect.Value placeholder="Selecciona un tipo de concepto" data-testid="conceptType" />
                    <Chevron className="text-[#637381] w-3 ml-16" />
                  </RSelect.Trigger>
                  <RSelect.Portal>
                    <RSelect.Content
                      className="z-[9999] p-4 bg-white rounded-lg shadow-md min-w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)]"
                      position="popper"
                    >
                      <RSelect.Viewport className="max-h-[300px] space-y-2">
                        {sortedCategories?.map((category) => (
                          <RSelect.Item
                            className="data-[state=checked]:bg-gray-100 rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                            key={`${category.name}_${category.id}`}
                            data-testid={`${category.name}`}
                            value={category.id}
                          >
                            <RSelect.ItemText>{category.name}</RSelect.ItemText>
                          </RSelect.Item>
                        ))}
                      </RSelect.Viewport>
                    </RSelect.Content>
                  </RSelect.Portal>
                </RSelect.Root>
              )}
            />

            <Controller
              control={formStep1.control}
              name="school_cycle"
              render={({ field: { onChange, value, ref } }) => (
                <RSelect.Root onValueChange={onChange} value={value}>
                  <RSelect.Trigger
                    data-error={Boolean(errors.school_cycle)}
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
                      className="z-[9999] p-4 bg-white rounded-lg shadow-md min-w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)]"
                      position="popper"
                    >
                      <RSelect.Viewport className="max-h-[250px] space-y-2">
                        {sortedSchoolCyclesByYearEnd?.map((school_cycle) => (
                          <RSelect.Item
                            className="data-[state=checked]:bg-gray-100 rounded-lg p-4 cursor-pointer hover:bg-gray-50 flex gap-3"
                            key={`${school_cycle.name}_${school_cycle.id}`}
                            data-testid={`${school_cycle.name}`}
                            value={school_cycle.id}
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
            {/* todo fixear el */}
            <TextField
              label="Nombre del concepto"
              error={formStep1.formState.errors.name?.message}
              value={formStep1.watch('name')}
              className={cn('mb-[10px] focus-within:border-green', {
                'focus-within:border-red-500': formStep1.formState.errors.name,
              })}
            >
              <CustomInput
                {...formStep1.register('name')}
                type="text"
                className="group-focus-within:text-green"
                data-testid="Nombre del concepto input"
              />
            </TextField>
            {/* <Controller
              control={formStep1.control}
              name="recurrent_payment"
              render={({ field }) => (
                <RadioGroup onValueChange={field.onChange} value={field.value}>
                  <span className="text-base font-semibold">¿El concepto tendrá pagos recurrentes?</span>
                  <div className="flex flex-col gap-3 px-2">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="true" id="recurrent_payment_true" />
                      <Label htmlFor="recurrent_payment_true">Sí, tendrá pagos recurrentes</Label>
                    </div>
                    <div className="flex items-center gap-2 ">
                      <RadioGroupItem value="false" id="recurrent_payment_false" />
                      <Label htmlFor="recurrent_payment_false">No, tendrá un pago único</Label>
                    </div>
                  </div>
                </RadioGroup>
              )}
            /> */}
            {/* {recurrent_payment === 'false' && (
              <Controller
                control={formStep1.control}
                name="has_due_date"
                render={({ field }) => (
                  <RadioGroup onValueChange={field.onChange} value={field.value}>
                    <span className="text-base font-semibold">¿El concepto tendrá fecha de vencimiento?</span>
                    <div className="flex flex-row gap-4 px-2">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="true" id="has_due_date_true" error={Boolean(errors.has_due_date)} />
                        <Label htmlFor="has_due_date_true">Sí</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="false" id="has_due_date_false" error={Boolean(errors.has_due_date)} />
                        <Label htmlFor="has_due_date_false">No</Label>
                      </div>
                    </div>
                  </RadioGroup>
                )}
              />
                )} */}

            {conceptType &&
              conceptType !== 'MONTHLY_FEE' &&
              conceptType !== 'INSCRIPTION' &&
              conceptType !== 'REINSCRIPTION' && (
                <>
                  <Controller
                    control={formStep1.control}
                    name="root_concept"
                    render={({ field: { onChange, value } }) => (
                      <RadioGroup onValueChange={onChange} value={value}>
                        <span className="pb-2 text-base font-semibold">
                          ¿El concepto a crear es opcional u obligatorio?
                        </span>
                        <div className="flex flex-col items-start gap-3 px-2">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <RadioGroupItem
                                value="required"
                                id="type_required"
                                data-testid="required-radio"
                                error={Boolean(errors.root_concept)}
                              />
                              <Label htmlFor="type_required" className="text-[#212B36]">
                                Obligatorio
                              </Label>
                            </div>
                            <p className="ml-8 text-xs text-gray-500">
                              Los conceptos obligatorios generan deuda si es que no son pagados antes de su fecha de
                              vencimiento. Adicionalmente, solo pueden ser pagados una vez por estudiante.
                            </p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <RadioGroupItem
                                value="optional"
                                id="type_optional"
                                data-testid="optional-radio"
                                error={Boolean(errors.root_concept)}
                              />
                              <Label htmlFor="type_optional" className="text-[#212B36]">
                                Opcional
                              </Label>
                            </div>
                            <p className="ml-8 text-xs text-gray-500">
                              Estos conceptos únicamente generan una orden de pago cuando son asignados . Por ejemplo:
                              Cuotas anuales, certificados, exámenes o conceptos extraordinarios.
                            </p>
                          </div>
                        </div>
                      </RadioGroup>
                    )}
                  />
                  {formStep1.watch('payment_only_in_dashboard') !== 'false' &&
                    formStep1.watch('root_concept') !== undefined && (
                      <Controller
                        control={formStep1.control}
                        name="payment_only_in_dashboard"
                        render={({ field }) => (
                          <RadioGroup onValueChange={field.onChange} value={field.value}>
                            <span className="text-base font-semibold">¿En donde se podrá pagar este concepto?</span>
                            <div className="flex flex-col gap-3 px-2 pt-2">
                              <div className="flex items-center gap-[10px]">
                                <RadioGroupItem
                                  value="false"
                                  id="payment_only_false"
                                  error={Boolean(errors.payment_only_in_dashboard)}
                                />
                                <Label htmlFor="payment_only_false">En el portal de Cometa y directo al colegio</Label>
                              </div>
                              <div className="flex items-center gap-[10px] ">
                                <RadioGroupItem
                                  value="true"
                                  id="payment_only_true"
                                  error={Boolean(errors.payment_only_in_dashboard)}
                                />
                                <Label htmlFor="payment_only_true">Únicamente en el colegio</Label>
                              </div>
                            </div>
                          </RadioGroup>
                        )}
                      />
                    )}
                </>
              )}
            {formStep1.watch('root_concept') === 'required' && (
              <Controller
                control={formStep1.control}
                name="has_months_to_pay"
                render={({ field }) => (
                  <RadioGroup onValueChange={field.onChange} value={field.value}>
                    <span className="text-base font-semibold">¿El concepto tendrá pagos mensuales?</span>
                    <div className="flex flex-col gap-4 px-2">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <RadioGroupItem
                            value="true"
                            id="has_months_to_pay_true"
                            data-testid="yes-radio"
                            error={Boolean(errors.has_months_to_pay)}
                          />
                          <Label htmlFor="has_months_to_pay_true">Sí</Label>
                        </div>
                        <p className="ml-8 text-xs text-gray-500">
                          Estos conceptos deben pagarse de manera recurrente en diferentes meses del ciclo escolar. Por
                          ejemplo: Colegiaturas, academias y clases de idiomas.
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <RadioGroupItem
                            value="false"
                            id="has_months_to_pay_false"
                            data-testid="no-radio"
                            error={Boolean(errors.has_months_to_pay)}
                          />
                          <Label htmlFor="has_months_to_pay_false">No</Label>
                        </div>
                        <p className="ml-8 text-xs text-gray-500">
                          Estos conceptos únicamente generan una orden de pago cuando son asignados . Por ejemplo:
                          Cuotas anuales, certificados, exámenes o conceptos extraordinarios.
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                )}
              />
            )}
            {/* {has_due_date === 'true' && (
              <>
                <Controller
                  control={formStep1.control}
                  name="root_concept"
                  render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} value={field.value}>
                      <span className="text-base font-semibold">¿El concepto a crear es opcional u obligatorio?</span>
                      <div className="flex flex-col items-start gap-3 px-2">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="optional" id="type_optional" error={Boolean(errors.root_concept)} />
                            <Label htmlFor="type_optional" className="text-[#212B36]">
                              Opcional
                            </Label>
                          </div>
                          <p className="ml-6 text-xs text-gray-500">
                            Los padres de familia pueden elegir si pagar o no un concepto opcional desde el portal de
                            Cometa.
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="required" id="type_required" error={Boolean(errors.root_concept)} />
                            <Label htmlFor="type_required" className="text-[#212B36]">
                              Obligatorio
                            </Label>
                          </div>
                          <p className="ml-6 text-xs text-gray-500">
                            Los conceptos obligatorios siempre deben ser pagados por los padres de familia; de lo
                            contrario, generan deuda.
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  )}
                />
                <Controller
                  control={formStep1.control}
                  name="payment_only_in_dashboard"
                  render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} value={field.value}>
                      <span className="text-base font-semibold">¿En donde se podrá pagar este concepto?</span>
                      <div className="flex flex-col gap-3 px-2">
                        <div className="flex items-center gap-2">
                          <RadioGroupItem
                            value="false"
                            id="payment_only_false"
                            error={Boolean(errors.payment_only_in_dashboard)}
                          />
                          <Label htmlFor="payment_only_false">En el portal de Cometa y directo al colegio</Label>
                        </div>
                        <div className="flex items-center gap-2 ">
                          <RadioGroupItem
                            value="true"
                            id="payment_only_true"
                            error={Boolean(errors.payment_only_in_dashboard)}
                          />
                          <Label htmlFor="payment_only_true">Únicamente en el colegio</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  )}
                />
                {payment_only_in_dashboard === 'false' && (
                  <div className="flex flex-col gap-4 pt-2 pb-6">
                    <p className="font-bold">¿A qué cuenta bancaria se deberán depositar los pagos?</p>
                    <Controller
                      control={formStep1.control}
                      name="bank_account"
                      defaultValue={bankAccounts?.results?.length === 1 ? bankAccounts?.results[0].id : undefined}
                      render={({ field: { onChange, value, ref } }) => (
                        <RSelect.Root onValueChange={onChange} value={value}>
                          <RSelect.Trigger
                            data-error={Boolean(errors.bank_account)}
                            ref={ref}
                            className="relative group appearance-none border border-[#919EAB52] data-[error=true]:border-[#FF4842] rounded-xl p-4 flex justify-between bg-transparent items-center w-full"
                          >
                            <label className="absolute -top-2.5 left-3.5 bg-white text-[#919EAB] group-[[data-error=true]]:text-[#FF4842] text-xs">
                              Cuenta bancaria
                            </label>
                            <RSelect.Value placeholder="Selecciona una cuenta bancaria" />
                            <Chevron className="text-[#637381] w-3 ml-16" />
                          </RSelect.Trigger>
                          <RSelect.Portal className="z-[9999]">
                            <RSelect.Content
                              className="p-4 bg-white rounded-lg shadow-md min-w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)]"
                              position="popper"
                            >
                              <RSelect.Viewport className="max-h-[250px] space-y-2">
                                {bankAccounts?.results?.map((bank_account) => (
                                  <RSelect.Item
                                    className="data-[state=checked]:bg-gray-100 rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                                    key={`${bank_account.bank_name}_${bank_account.id}`}
                                    value={bank_account.id}
                                  >
                                    <RSelect.ItemText>{bank_account.bank_name}</RSelect.ItemText>
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
              </>
            )} */}

            {conceptType && payment_only_in_dashboard === 'false' && (
              <div className="flex flex-col gap-4 pt-2 pb-6">
                <p className="font-bold">¿A qué cuenta bancaria se deberán depositar los pagos?</p>

                <Controller
                  control={formStep1.control}
                  name="bank_account"
                  defaultValue={bankAccounts?.results?.length === 1 ? bankAccounts?.results[0].id : undefined}
                  render={({ field: { onChange, value, ref } }) => (
                    <RSelect.Root onValueChange={onChange} value={value} disabled={isLoading}>
                      <RSelect.Trigger
                        data-error={Boolean(errors.bank_account)}
                        ref={ref}
                        className="relative group appearance-none border border-[#919EAB52] data-[error=true]:border-[#FF4842] rounded-xl p-4 flex justify-between bg-transparent items-center w-full"
                      >
                        <label className="absolute -top-2.5 left-3.5 bg-white text-[#919EAB] group-[[data-error=true]]:text-[#FF4842] z-[50] text-xs">
                          Cuenta bancaria
                        </label>
                        <RSelect.Value placeholder="Selecciona una cuenta bancaria" />
                        <Chevron className="text-[#637381] w-3 ml-16" />
                      </RSelect.Trigger>
                      <RSelect.Portal>
                        <RSelect.Content
                          className="p-4 z-[9999] bg-white rounded-lg shadow-md min-w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)] text-elipsis overflow-hidden"
                          position="popper"
                        >
                          <RSelect.Viewport className="max-h-[250px] space-y-2">
                            {bankAccounts?.results?.map((bank_account) => (
                              <RSelect.Item
                                className="data-[state=checked]:bg-gray-100 rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                                key={`${bank_account.bank_name}_${bank_account.id}`}
                                value={bank_account.id}
                              >
                                <RSelect.ItemText>{bank_account.public_summary}</RSelect.ItemText>
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
        </div>
        <ConceptButton
          disabledNext={!formStep1.formState.isValid}
          textBack="Cancelar"
          onBack={() => {
            if (isDirty || Object.keys(formStep1.formState).length > 1) {
              setAlertToCloseSheet(true);
            } else {
              onBack();
            }
          }}
        />
      </>
    </form>
  );
}
