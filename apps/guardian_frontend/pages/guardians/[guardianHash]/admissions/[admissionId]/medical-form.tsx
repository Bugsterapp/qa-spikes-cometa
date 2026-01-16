'use client';

import {
  Button,
  CheckBox,
  Input,
  Label,
  MultiSelect,
  PhoneInput,
  Radio,
  Select,
  TextArea,
  TextField,
} from '@cometa/recreo';
import Head from 'next/head';
import { UTMLink as Link } from '~/components/UtmNavigation';
import { useUTMRouter as useRouter } from '~/components/UtmNavigation';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '~/utils/api';
import { ReactNode, useEffect, useState } from 'react';
import { BackButton } from '~/components/BackButton';
import { cn } from '@cometa/utils';
import { useSession } from 'next-auth/react';
import { UpsertMedicalFormDto } from '@cometa/trpc/src/admissions/types';
import { useConditionalSchema } from '~/hooks/useConditionalSchema';

const REQUIRED_MESSAGE = 'Debes completar este campo para continuar.';
const REQUIRED_RADIO_MESSAGE = 'Debes completar esta pregunta para continuar.';

function splitValues(value?: string): string[] {
  if (!value) return [];
  return value.split(', ');
}

const baseSchema = z.object({
  blood_type: z.string({ required_error: REQUIRED_MESSAGE }),
  weight: z.coerce.number({ invalid_type_error: 'Debes ingresar un número válido.' }).min(1, REQUIRED_MESSAGE),
  height: z.coerce.number({ invalid_type_error: 'Debes ingresar un número válido.' }).min(1, REQUIRED_MESSAGE),
  laterality: z.string({ required_error: REQUIRED_MESSAGE }),
  family_history: z.array(z.string()).min(1, REQUIRED_MESSAGE),
  personal_history: z.array(z.string()).min(1, REQUIRED_MESSAGE),
  current_ailments: z.array(z.string()).min(1, REQUIRED_MESSAGE),
  recent_interventions: z.string().optional(),
  other_history: z.string().optional(),
  has_allergies: z.string({ required_error: REQUIRED_RADIO_MESSAGE }),
  drug_allergies: z.string().optional(),
  food_allergies: z.string().optional(),
  plant_allergies: z.string().optional(),
  other_allergies: z.string().optional(),
  dietary_restrictions: z.string().optional(),
  require_drugs: z.string({ required_error: REQUIRED_RADIO_MESSAGE }),
  drugs: z.array(z.string()).optional(),
  authorize_emergency_transfer: z.string({ required_error: REQUIRED_RADIO_MESSAGE }),
  authorize_physical_activity: z.string({ required_error: REQUIRED_RADIO_MESSAGE }),
  emergency_contact_id: z.string({ required_error: 'Debes seleccionar un contacto de emergencia.' }),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_relationship: z.string().optional(),
  has_private_doctor: z.string().optional(),
  doctor_name: z.string().optional(),
  doctor_phone: z.string().optional(),
  doctor_clinic: z.string().optional(),
  has_private_insurance: z.string().optional(),
  has_all_vaccines: z.string().optional(),
  pending_vaccines: z.string().optional(),
  comments: z.string().optional(),
  accept_truthfulness: z
    .boolean({ required_error: REQUIRED_MESSAGE })
    .refine((value) => value === true, { message: REQUIRED_MESSAGE }),
});

type FormValues = z.infer<typeof baseSchema>;

function MedicalFormPage() {
  const router = useRouter();
  const { guardianHash, admissionId } = router.query;
  const [isLoading, setLoading] = useState(false);
  const { data: session } = useSession();
  const guardianId = session?.user.id as string;

  const { data: studentLead } = api.admissions.getAdmission.useQuery(
    { id: admissionId as string },
    {
      enabled: !!admissionId,
    }
  );
  const admissionStep = studentLead?.admission_steps?.find(
    (admissionStep) => (admissionStep?.school_step?.tag as string) === 'medical_form'
  );
  const stepName = admissionStep?.school_step?.name;

  const { data: medicalForm } = api.admissions.getMedicalForm.useQuery(
    { studentLeadId: admissionId as string },
    {
      enabled: !!admissionId,
    }
  );

  const { data: schoolConfig } = api.students.getSchoolConfig.useQuery(
    { school_id: studentLead?.school_id as string },
    {
      enabled: !!studentLead?.school_id,
    }
  );
  const hiddenFields = schoolConfig?.hidden_medical_form_fields?.split(',') ?? [];

  const schema = useConditionalSchema(baseSchema, {
    shouldMakeOptional: (fieldName) => hiddenFields.includes(fieldName),
    shouldValidate: (fieldName) => !hiddenFields.includes(fieldName),
    refinement: (data, ctx, shouldValidate) => {
      if (data.require_drugs === 'Sí' && shouldValidate('drugs', data)) {
        if (data.drugs?.length === 0) {
          ctx.addIssue({
            path: ['drugs'],
            code: z.ZodIssueCode.custom,
            message: REQUIRED_MESSAGE,
          });
        }
      }
      if (data.emergency_contact_id === 'Otro') {
        if (!data.emergency_contact_name) {
          ctx.addIssue({
            path: ['emergency_contact_name'],
            code: z.ZodIssueCode.custom,
            message: REQUIRED_MESSAGE,
          });
        }
        if (!data.emergency_contact_phone) {
          ctx.addIssue({
            path: ['emergency_contact_phone'],
            code: z.ZodIssueCode.custom,
            message: REQUIRED_MESSAGE,
          });
        }
        if (!data.emergency_contact_relationship) {
          ctx.addIssue({
            path: ['emergency_contact_relationship'],
            code: z.ZodIssueCode.custom,
            message: REQUIRED_MESSAGE,
          });
        }
      }
      if (data.has_private_doctor === 'Sí') {
        if (!data.doctor_name) {
          ctx.addIssue({
            path: ['doctor_name'],
            code: z.ZodIssueCode.custom,
            message: REQUIRED_MESSAGE,
          });
        }
        if (!data.doctor_phone) {
          ctx.addIssue({
            path: ['doctor_phone'],
            code: z.ZodIssueCode.custom,
            message: REQUIRED_MESSAGE,
          });
        }
      }
      if (data.has_all_vaccines === 'No' && shouldValidate('pending_vaccines', data)) {
        if (!data.pending_vaccines) {
          ctx.addIssue({
            path: ['pending_vaccines'],
            code: z.ZodIssueCode.custom,
            message: REQUIRED_MESSAGE,
          });
        }
      }
    },
  });

  const {
    clearErrors,
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { family_history: [], personal_history: [], current_ailments: [], drugs: [] },
    mode: 'all',
    reValidateMode: 'onSubmit',
  });

  useEffect(() => {
    if (medicalForm) {
      const { emergency_contact_id, emergency_contact_name } = medicalForm;

      reset({
        ...Object.fromEntries(Object.entries(medicalForm).map(([k, v]) => [k, v === null ? undefined : v])),
        family_history: splitValues(medicalForm.family_history ?? ''),
        personal_history: splitValues(medicalForm.personal_history ?? ''),
        current_ailments: splitValues(medicalForm.current_ailments ?? ''),
        recent_interventions: medicalForm.recent_interventions ?? '',
        other_history: medicalForm.other_history ?? '',
        has_allergies: medicalForm.has_allergies ? 'Sí' : 'No',
        drug_allergies: medicalForm.drug_allergies ?? '',
        food_allergies: medicalForm.food_allergies ?? '',
        plant_allergies: medicalForm.plant_allergies ?? '',
        other_allergies: medicalForm.other_allergies ?? '',
        dietary_restrictions: medicalForm.dietary_restrictions ?? '',
        require_drugs: medicalForm.require_drugs ? 'Sí' : 'No',
        drugs: splitValues(medicalForm.drugs ?? ''),
        authorize_emergency_transfer: medicalForm.authorize_emergency_transfer ? 'Sí' : 'No',
        authorize_physical_activity: medicalForm.authorize_physical_activity ? 'Sí' : 'No',
        emergency_contact_id: emergency_contact_id ? emergency_contact_id : emergency_contact_name !== '' ? 'Otro' : '',
        emergency_contact_name: emergency_contact_name ?? '',
        emergency_contact_phone: medicalForm.emergency_contact_phone ?? '',
        emergency_contact_relationship: medicalForm.emergency_contact_relationship ?? '',
        has_private_doctor: medicalForm.has_private_doctor ? 'Sí' : 'No',
        doctor_name: medicalForm.doctor_name ?? '',
        doctor_phone: medicalForm.doctor_phone ?? '',
        doctor_clinic: medicalForm.doctor_clinic ?? '',
        has_private_insurance: medicalForm.has_private_insurance ? 'Sí' : 'No',
        has_all_vaccines: medicalForm.has_all_vaccines ? 'Sí' : 'No',
        pending_vaccines: medicalForm.pending_vaccines ?? '',
        comments: medicalForm.comments ?? '',
        accept_truthfulness: medicalForm.accept_truthfulness ?? false,
      });
    }
  }, [reset, medicalForm]);

  const utils = api.useUtils();

  const upsertMedicalForm = api.admissions.upsertMedicalForm.useMutation({
    onSuccess: async () => {
      await utils.admissions.getAdmission.invalidate({ id: admissionId as string });
      await utils.admissions.getMedicalForm.invalidate({ studentLeadId: admissionId as string });

      router.push(`/guardians/${guardianHash}/admissions/${admissionId}`);
    },
  });

  const hasAllergies = watch('has_allergies') === 'Sí';
  const requireDrugs = watch('require_drugs') === 'Sí';
  const authorizeEmergencyTransfer = watch('authorize_emergency_transfer') === 'Sí';
  const authorizePhysicalActivity = watch('authorize_physical_activity') === 'Sí';
  const hasOtherEmergencyContact = watch('emergency_contact_id') === 'Otro';
  const hasPrivateDoctor = watch('has_private_doctor') === 'Sí';
  const hasPrivateInsurance = watch('has_private_insurance') === 'Sí';
  const hasAllVaccines = watch('has_all_vaccines') === 'Sí';

  function onSubmit(data: FormValues) {
    setLoading(true);

    upsertMedicalForm.mutate({
      ...data,
      laterality: data.laterality ?? '',
      family_history: data.family_history.join(', '),
      personal_history: data.personal_history.join(', '),
      current_ailments: data.current_ailments.join(', '),
      has_allergies: hasAllergies,
      require_drugs: requireDrugs,
      drugs: data.drugs?.join(', '),
      authorize_emergency_transfer: authorizeEmergencyTransfer,
      authorize_physical_activity: authorizePhysicalActivity,
      emergency_contact_id: data.emergency_contact_name !== '' ? null : data.emergency_contact_id,
      has_private_doctor: hasPrivateDoctor,
      has_private_insurance: hasPrivateInsurance,
      has_all_vaccines: hasAllVaccines,
      student_lead_id: admissionId as string,
      changed_by: guardianId,
    });
  }

  return (
    <div className="font-lota antialiased">
      <header className="p-6 text-[#1c1c1d]">
        <Link href={`/guardians/${guardianHash}/admissions/${admissionId}`} className="flex gap-3 items-center">
          <BackButton arrowColor="#686F87" circleColor="#F3F6FB" />
          <span className="text-sm font-semibold">VOLVER</span>
        </Link>

        <h2 className="text-2xl font-bold my-4">{stepName}</h2>
        <p>
          Registra la información médica relevante del postulante, como antecedentes, tratamientos o condiciones
          especiales.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-6 pb-10">
        <Section
          title="Información general"
          className={cn({ hidden: isSectionHidden(sectionFields.generalInfo, hiddenFields) })}
        >
          <Controller
            control={control}
            name="blood_type"
            render={({ field }) => (
              <Select
                placeholder="Tipo de sangre"
                className={cn('w-full outline-none min-h-[56px] h-full mb-1', {
                  hidden: isHidden('blood_type', hiddenFields),
                })}
                onValueChange={field.onChange}
                value={field.value}
                error={errors.blood_type?.message}
              >
                <Select.Content className="w-full outline-none">
                  {bloodTypeOptions?.map((option) => (
                    <Select.Item key={option} value={option} className="w-full hover:bg-[#F5FAFF] outline-none">
                      {option}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            )}
          />
          <TextField
            label="Peso (kg)"
            error={errors.weight?.message}
            value={watch('weight')}
            className={cn({ hidden: isHidden('weight', hiddenFields) })}
          >
            <Input {...register('weight')} type="tel" />
          </TextField>
          <TextField
            label="Talla (cm)"
            error={errors.height?.message}
            value={watch('height')}
            className={cn({ hidden: isHidden('height', hiddenFields) })}
          >
            <Input {...register('height')} type="tel" />
          </TextField>
          <Controller
            control={control}
            name="laterality"
            render={({ field }) => (
              <Select
                placeholder="Lateralidad"
                className={cn('w-full outline-none min-h-[56px] h-full mb-1', {
                  hidden: isHidden('laterality', hiddenFields),
                })}
                onValueChange={field.onChange}
                value={field.value}
                error={errors.laterality?.message}
              >
                <Select.Content className="w-full outline-none">
                  {lateralityOptions?.map((option) => (
                    <Select.Item key={option} value={option} className="w-full hover:bg-[#F5FAFF] outline-none">
                      {option}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            )}
          />
        </Section>

        <Section
          title="Antecedentes"
          className={cn({ hidden: isSectionHidden(sectionFields.background, hiddenFields) })}
        >
          <Controller
            control={control}
            name="family_history"
            render={({ field }) => (
              <MultiSelect
                options={familyHistoryOptions.map((option) => ({ label: option, value: option }))}
                onValueChange={field.onChange}
                defaultValue={field.value}
                placeholder="Antecedentes familiares"
                error={errors.family_history?.message}
                className={cn({ hidden: isHidden('family_history', hiddenFields) })}
              />
            )}
          />
          <Controller
            control={control}
            name="personal_history"
            render={({ field }) => (
              <MultiSelect
                options={personalHistoryOptions.map((option) => ({ label: option, value: option }))}
                onValueChange={field.onChange}
                defaultValue={field.value}
                placeholder="Antecedentes personales"
                error={errors.personal_history?.message}
                className={cn({ hidden: isHidden('personal_history', hiddenFields) })}
              />
            )}
          />
          <Controller
            control={control}
            name="current_ailments"
            render={({ field }) => (
              <MultiSelect
                options={currentAilmentsOptions.map((option) => ({ label: option, value: option }))}
                onValueChange={field.onChange}
                defaultValue={field.value}
                placeholder="Padecimientos actuales"
                error={errors.current_ailments?.message}
                className={cn({ hidden: isHidden('current_ailments', hiddenFields) })}
              />
            )}
          />
          <Controller
            control={control}
            name="recent_interventions"
            render={({ field }) => (
              <TextField
                label="Intervenciones quirúrgicas, traumas o fracturas recientes (opcional)"
                value={watch('recent_interventions')}
                className={cn('mb-2', { hidden: isHidden('recent_interventions', hiddenFields) })}
                error={errors.recent_interventions?.message}
              >
                <TextArea {...field} id="recent_interventions" className="border-none transition-all resize-none" />
              </TextField>
            )}
          />
          <Controller
            control={control}
            name="other_history"
            render={({ field }) => (
              <TextField
                label="Otros antecedentes (opcional)"
                value={watch('other_history')}
                className={cn('mb-2', { hidden: isHidden('other_history', hiddenFields) })}
                error={errors.other_allergies?.message}
              >
                <TextArea {...field} id="other_history" className="border-none transition-all resize-none" />
              </TextField>
            )}
          />
        </Section>

        <Section title="Alergias" className={cn({ hidden: isSectionHidden(sectionFields.allergies, hiddenFields) })}>
          <Controller
            control={control}
            name="has_allergies"
            render={({ field }) => (
              <Radio.Group
                value={field.value}
                onValueChange={field.onChange}
                error={errors.has_allergies?.message}
                className={cn({ hidden: isHidden('has_allergies', hiddenFields) })}
              >
                <p>¿Tiene alergias a medicamentos, alimentos, plantas, animales u otros?</p>

                <div className="flex gap-x-8 mt-2">
                  <div className="flex items-center gap-2">
                    <Radio.Item id="yes" value="Sí" />
                    <Label htmlFor="yes">Sí</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Radio.Item id="no" value="No" />
                    <Label htmlFor="no">No</Label>
                  </div>
                </div>
              </Radio.Group>
            )}
          />
          {hasAllergies && !isHidden('has_allergies', hiddenFields) ? (
            <>
              <Controller
                control={control}
                name="drug_allergies"
                render={({ field }) => (
                  <TextField
                    label="Alergias a medicamentos (opcional)"
                    value={watch('drug_allergies')}
                    className={cn('mb-2', { hidden: isHidden('drug_allergies', hiddenFields) })}
                    error={errors.drug_allergies?.message}
                  >
                    <TextArea {...field} id="other_history" className="border-none transition-all resize-none" />
                  </TextField>
                )}
              />
              <Controller
                control={control}
                name="food_allergies"
                render={({ field }) => (
                  <TextField
                    label="Alergias a alimentos (opcional)"
                    value={watch('food_allergies')}
                    className={cn('mb-2', { hidden: isHidden('food_allergies', hiddenFields) })}
                    error={errors.food_allergies?.message}
                  >
                    <TextArea {...field} id="other_history" className="border-none transition-all resize-none" />
                  </TextField>
                )}
              />
              <Controller
                control={control}
                name="plant_allergies"
                render={({ field }) => (
                  <TextField
                    label="Alergias a plantas o animales (opcional)"
                    value={watch('plant_allergies')}
                    className={cn('mb-2', { hidden: isHidden('plant_allergies', hiddenFields) })}
                    error={errors.plant_allergies?.message}
                  >
                    <TextArea {...field} id="other_history" className="border-none transition-all resize-none" />
                  </TextField>
                )}
              />
              <Controller
                control={control}
                name="other_allergies"
                render={({ field }) => (
                  <TextField
                    label="Otras alergias (opcional)"
                    value={watch('other_allergies')}
                    className={cn('mb-2', { hidden: isHidden('other_allergies', hiddenFields) })}
                    error={errors.other_allergies?.message}
                  >
                    <TextArea {...field} id="other_history" className="border-none transition-all resize-none" />
                  </TextField>
                )}
              />
              <Controller
                control={control}
                name="dietary_restrictions"
                render={({ field }) => (
                  <TextField
                    label="Restricciones alimentarias (opcional)"
                    value={watch('dietary_restrictions')}
                    className={cn('mb-2', { hidden: isHidden('dietary_restrictions', hiddenFields) })}
                    error={errors.dietary_restrictions?.message}
                  >
                    <TextArea {...field} id="dietary_restrictions" className="border-none transition-all resize-none" />
                  </TextField>
                )}
              />
            </>
          ) : null}
        </Section>

        <Section
          title="Autorizaciones"
          className={cn({ hidden: isSectionHidden(sectionFields.medicalAuthorization, hiddenFields) })}
        >
          <Controller
            control={control}
            name="require_drugs"
            render={({ field }) => (
              <Radio.Group
                value={field.value}
                onValueChange={field.onChange}
                error={errors.require_drugs?.message}
                className={cn({ hidden: isHidden('require_drugs', hiddenFields) })}
              >
                <p>Autorizo que el colegio suministre medicamentos:</p>

                <div className="flex gap-x-8 mt-2">
                  <div className="flex items-center gap-2">
                    <Radio.Item id="yes" value="Sí" />
                    <Label htmlFor="yes">Sí</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Radio.Item id="no" value="No" />
                    <Label htmlFor="no">No</Label>
                  </div>
                </div>
              </Radio.Group>
            )}
          />
          {requireDrugs && !isHidden('require_drugs', hiddenFields) ? (
            <Controller
              control={control}
              name="drugs"
              render={({ field }) => (
                <MultiSelect
                  options={drugOptions.map((option) => ({ label: option, value: option }))}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  placeholder="Medicamentos autorizados"
                  error={errors.drugs?.message}
                />
              )}
            />
          ) : null}
          <Controller
            control={control}
            name="authorize_emergency_transfer"
            render={({ field }) => (
              <Radio.Group
                value={field.value}
                onValueChange={field.onChange}
                error={errors.authorize_emergency_transfer?.message}
                className={cn({ hidden: isHidden('authorize_emergency_transfer', hiddenFields) })}
              >
                <p>Autorizo el traslado a la sala de urgencias:</p>
                <p
                  className={cn('text-sm text-[#3e4559]', {
                    hidden: isHidden('authorize_emergency_transfer', hiddenFields),
                  })}
                >
                  (Los gastos de emergencia corren a cuenta de los padres de familia)
                </p>

                <div className="flex gap-x-8 mt-2">
                  <div className="flex items-center gap-2">
                    <Radio.Item id="yes" value="Sí" />
                    <Label htmlFor="yes">Sí</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Radio.Item id="no" value="No" />
                    <Label htmlFor="no">No</Label>
                  </div>
                </div>
              </Radio.Group>
            )}
          />
          <Controller
            control={control}
            name="authorize_physical_activity"
            render={({ field }) => (
              <Radio.Group
                value={field.value}
                onValueChange={field.onChange}
                error={errors.authorize_physical_activity?.message}
                className={cn({ hidden: isHidden('authorize_physical_activity', hiddenFields) })}
              >
                <p>Autorizo que realice actividad física:</p>

                <div className="flex gap-x-8 mt-2">
                  <div className="flex items-center gap-2">
                    <Radio.Item id="yes" value="Sí" />
                    <Label htmlFor="yes">Sí</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Radio.Item id="no" value="No" />
                    <Label htmlFor="no">No</Label>
                  </div>
                </div>
              </Radio.Group>
            )}
          />
        </Section>

        <Section
          title="Contacto de emergencia"
          className={cn({ hidden: isSectionHidden(sectionFields.emergencyContact, hiddenFields) })}
        >
          <Controller
            control={control}
            name="emergency_contact_id"
            render={({ field }) => (
              <Radio.Group
                value={field.value}
                onValueChange={field.onChange}
                error={errors.emergency_contact_id?.message}
                className={cn({ hidden: isHidden('emergency_contact_id', hiddenFields) })}
              >
                <div className="flex flex-col gap-4">
                  {studentLead?.guardian_leads?.map((guardianLead) => {
                    const id = guardianLead.external_id as string;
                    const fullName = `${guardianLead.first_name} ${guardianLead.last_name}`;

                    return (
                      <div key={id} className="flex items-center gap-2">
                        <Radio.Item
                          id={id}
                          value={id}
                          onClick={() => {
                            setValue('emergency_contact_name', '');
                            setValue('emergency_contact_phone', '');
                            setValue('emergency_contact_relationship', '');
                          }}
                        />
                        <Label htmlFor={id}>{fullName}</Label>
                      </div>
                    );
                  })}
                  <div className="flex items-center gap-2">
                    <Radio.Item id="no" value="Otro" onClick={() => setValue('emergency_contact_id', '')} />
                    <Label htmlFor="no">Otro</Label>
                  </div>
                </div>
              </Radio.Group>
            )}
          />
          {hasOtherEmergencyContact && !isHidden('emergency_contact_id', hiddenFields) ? (
            <>
              <TextField
                label="Nombre"
                error={errors.emergency_contact_name?.message}
                value={watch('emergency_contact_name')}
                className={cn({ hidden: isHidden('emergency_contact_name', hiddenFields) })}
              >
                <Input {...register('emergency_contact_name')} type="text" />
              </TextField>
              <Controller
                control={control}
                name="emergency_contact_phone"
                render={({ field }) => (
                  <PhoneInput
                    key={watch('emergency_contact_phone')}
                    initialValue={watch('emergency_contact_phone')}
                    onChange={({ number }) => {
                      clearErrors('emergency_contact_phone');
                      field.onChange(number);
                    }}
                    error={errors.emergency_contact_phone?.message}
                    className={cn({ hidden: isHidden('emergency_contact_phone', hiddenFields) })}
                  />
                )}
              />
              <Controller
                control={control}
                name="emergency_contact_relationship"
                render={({ field }) => (
                  <Select
                    placeholder="Parentesco con el postulante"
                    className={cn('w-full outline-none min-h-[56px] h-full mb-1', {
                      hidden: isHidden('emergency_contact_relationship', hiddenFields),
                    })}
                    onValueChange={field.onChange}
                    value={field.value}
                    error={errors.emergency_contact_relationship?.message}
                  >
                    <Select.Content className="w-full outline-none">
                      {relationshipOptions?.map((option) => (
                        <Select.Item key={option} value={option} className="w-full hover:bg-[#F5FAFF] outline-none">
                          {option}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                )}
              />
            </>
          ) : null}
        </Section>

        <Section
          title="Médico y seguro particular"
          className={cn({ hidden: isHidden('has_private_doctor', hiddenFields) })}
        >
          <Controller
            control={control}
            name="has_private_doctor"
            render={({ field }) => (
              <Radio.Group
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  if (value === 'No') {
                    setValue('doctor_name', '');
                    setValue('doctor_phone', '');
                    setValue('doctor_clinic', '');
                  }
                }}
                error={errors.has_private_doctor?.message}
                className={cn({ hidden: isHidden('has_private_doctor', hiddenFields) })}
              >
                <p>¿Quieres registrar la información de algún médico particular?</p>

                <div className="flex gap-x-8 mt-2">
                  <div className="flex items-center gap-2">
                    <Radio.Item id="yes" value="Sí" />
                    <Label htmlFor="yes">Sí</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Radio.Item id="no" value="No" />
                    <Label htmlFor="no">No</Label>
                  </div>
                </div>
              </Radio.Group>
            )}
          />
          {hasPrivateDoctor && !isHidden('has_private_doctor', hiddenFields) ? (
            <>
              <TextField label="Nombre del médico" error={errors.doctor_name?.message} value={watch('doctor_name')}>
                <Input {...register('doctor_name')} type="text" />
              </TextField>
              <Controller
                control={control}
                name="doctor_phone"
                render={({ field }) => (
                  <PhoneInput
                    key={watch('doctor_phone')}
                    initialValue={watch('doctor_phone')}
                    onChange={({ number }) => {
                      clearErrors('doctor_phone');
                      field.onChange(number);
                    }}
                    error={errors.emergency_contact_phone?.message}
                    className={cn({ hidden: isHidden('doctor_phone', hiddenFields) })}
                  />
                )}
              />
              <TextField
                label="Clínica de preferencia"
                error={errors.doctor_clinic?.message}
                value={watch('doctor_clinic')}
                className={cn({ hidden: isHidden('doctor_clinic', hiddenFields) })}
              >
                <Input {...register('doctor_clinic')} type="text" />
              </TextField>
            </>
          ) : null}
          <Controller
            control={control}
            name="has_private_insurance"
            render={({ field }) => (
              <Radio.Group
                value={field.value}
                onValueChange={field.onChange}
                error={errors.has_private_insurance?.message}
                className={cn({ hidden: isHidden('has_private_insurance', hiddenFields) })}
              >
                <p>¿Cuenta con seguro médico particular?</p>

                <div className="flex gap-x-8 mt-2">
                  <div className="flex items-center gap-2">
                    <Radio.Item id="yes" value="Sí" />
                    <Label htmlFor="yes">Sí</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Radio.Item id="no" value="No" />
                    <Label htmlFor="no">No</Label>
                  </div>
                </div>
              </Radio.Group>
            )}
          />
        </Section>

        <Section
          title="Observaciones adicionales"
          className={cn({ hidden: isSectionHidden(sectionFields.additionalComments, hiddenFields) })}
        >
          <Controller
            control={control}
            name="has_all_vaccines"
            render={({ field }) => (
              <Radio.Group
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  if (value === 'Sí') {
                    setValue('pending_vaccines', '');
                  }
                }}
                error={errors.has_all_vaccines?.message}
                className={cn({ hidden: isHidden('has_all_vaccines', hiddenFields) })}
              >
                <p>¿Se encuentra al día con todas sus vacunas?</p>

                <div className="flex gap-x-8 mt-2">
                  <div className="flex items-center gap-2">
                    <Radio.Item id="yes" value="Sí" />
                    <Label htmlFor="yes">Sí</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Radio.Item id="no" value="No" />
                    <Label htmlFor="no">No</Label>
                  </div>
                </div>
              </Radio.Group>
            )}
          />
          {!hasAllVaccines ? (
            <Controller
              control={control}
              name="pending_vaccines"
              render={({ field }) => (
                <TextField
                  label="Vacunas pendientes (opcional)"
                  value={watch('pending_vaccines')}
                  className={cn('mb-2', { hidden: isHidden('pending_vaccines', hiddenFields) })}
                  error={errors.pending_vaccines?.message}
                >
                  <TextArea {...field} id="other_history" className="border-none transition-all resize-none" />
                </TextField>
              )}
            />
          ) : null}
          <Controller
            control={control}
            name="comments"
            render={({ field }) => (
              <TextField
                label="Comentarios (opcional)"
                value={watch('comments')}
                className={cn('mb-2', { hidden: isHidden('comments', hiddenFields) })}
                error={errors.comments?.message}
              >
                <TextArea {...field} id="other_history" className="border-none transition-all resize-none" />
              </TextField>
            )}
          />
          <CheckBox.Group error={errors.accept_truthfulness?.message}>
            <div className="flex items-center gap-2">
              <CheckBox.Item
                id="accept_truthfulness"
                name="accept_truthfulness"
                checked={watch('accept_truthfulness')}
                onCheckedChange={(value) => setValue('accept_truthfulness', Boolean(value))}
                className="w-9 hover:cursor-pointer"
              />
              <Label htmlFor="accept_truthfulness" className="font-normal hover:cursor-pointer">
                Declaro que la información ingresada en este formulario es correcta y verdadera.
              </Label>
            </div>
          </CheckBox.Group>
        </Section>

        <Button className="w-full mt-2" size="medium" variant="solid" color="black" type="submit" disabled={isLoading}>
          Guardar
        </Button>
      </form>
    </div>
  );
}

function Section({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn('bg-[#fbfcfd] border border-[#e4ebf6] rounded-lg p-6', className)}>
      <h3 className="text-[#1c1c1d] font-semibold mb-4">{title}</h3>

      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

export function isHidden(field: string, hiddenFields: string[]) {
  return hiddenFields?.includes(field) ?? false;
}

export function isSectionHidden(fields: string[], hiddenFields: string[]) {
  return fields.every((field) => hiddenFields?.includes(field));
}

type SectionField =
  | 'emergencyContact'
  | 'generalInfo'
  | 'background'
  | 'medicalAuthorization'
  | 'allergies'
  | 'doctor'
  | 'additionalComments';

export type MedicalFormField = keyof UpsertMedicalFormDto;

export const sectionFields: Record<SectionField, MedicalFormField[]> = {
  emergencyContact: ['emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'],
  generalInfo: ['blood_type', 'height', 'weight', 'laterality'],
  background: ['family_history', 'personal_history', 'current_ailments', 'other_history', 'recent_interventions'],
  medicalAuthorization: ['drugs', 'authorize_emergency_transfer'],
  allergies: ['drug_allergies', 'food_allergies', 'plant_allergies', 'other_allergies', 'dietary_restrictions'],
  doctor: ['has_private_doctor', 'doctor_name', 'doctor_phone', 'doctor_clinic', 'has_private_insurance'],
  additionalComments: ['has_all_vaccines', 'comments'],
};

const bloodTypeOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const lateralityOptions = ['Zurdo', 'Diestro', 'Ambos'];

const familyHistoryOptions = [
  'Ninguno',
  'Cáncer',
  'Diabetes',
  'Tumoraciones',
  'Hipertensión',
  'Anemia',
  'Epilepsia',
  'Obesidad',
  'Migraña',
  'Problemas visuales',
  'Problemas auditivos',
  'Fiebre reumática',
];

const personalHistoryOptions = [
  'Ninguno',
  'Hepatitis',
  'Varicela',
  'Sarampión',
  'Tosferina',
  'Tifoidea',
  'Paratosis',
  'Poliomielitis',
  'Paperas',
  'Artritis',
  'Paludismo',
  'Crisis convulsiva',
  'Otitis',
  'Neumonía',
];

const currentAilmentsOptions = [
  'Ninguno',
  'Asma',
  'Problemas visuales',
  'Problemas del corazón',
  'Enfermedades contagiosas',
  'Problemas auditivos',
  'Diabetes',
  'Migraña',
  'Problemas respiratorios',
];

const drugOptions = [
  'Paracetamol',
  'Ibuprofeno',
  'Loratadina',
  'Betametasona',
  'Pepto bismol',
  'Syncol',
  'Diclofenaco',
  'Tums',
  'Naproxeno',
  'Ketorolaco',
  'Metoclopramida',
  'Clorfenamina',
  'Clorhidrato pargeverina',
  'Butilescopolamina',
];

const relationshipOptions = ['Padre', 'Madre', 'Tío/a', 'Abuelo/a', 'Hermano/a', 'Otro'];

MedicalFormPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Ficha médica</title>
      </Head>

      <main className="max-w-md mx-auto">{page}</main>
    </>
  );
};

MedicalFormPage.auth = true;

export default MedicalFormPage;
