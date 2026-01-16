import { Button, Label, PhoneInput, Radio } from '@cometa/recreo';
import Sheet from '/src/components/atoms/Sheet';
import { useToggle } from '@cometa/hooks';
import { useEffect, useState } from 'react';
import { XIcon, ChevronRightIcon, EditIcon } from 'lucide-react';
import { cn } from '@cometa/utils';
import { MedicalFormEntity, UpsertMedicalFormDto, GuardianLeadEntity } from '@cometa/trpc/src/admissions/types';
import { MedicalInfoEntity } from '@cometa/trpc/src/students/types';
import { Guardian } from '@cometa/trpc/src/types';
import { Card, CardContent, CardItem, CardTitle, ChipItems } from './Card';
import { useContentScroll } from '../DynamicForms';
import { Controller, useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput, FormLabel, FormMultiSelect, FormSelect, FormTextarea } from './Form';
import { DiscardChangesDialog } from './DiscardChanagesDialog';
import { api } from '/src/utils/api';
import { useSelectedSchool } from '/src/guards/AuthGuard';

type MedicalInfo = MedicalFormEntity | MedicalInfoEntity | null;
type EmergencyContact = {
  name: string | null | undefined;
  phone: string | null | undefined;
  relationship: string | null | undefined;
};
type GuardianInfo = Guardian | GuardianLeadEntity | null;

export type MedicalSectionCallbacks = {
  onSuccess: () => void;
  onError: () => void;
};

type MedicalSectionProps = {
  medicalInfo?: MedicalInfo;
  guardians: GuardianInfo[];
  emergencyContact: EmergencyContact;
  authorizeTransferLabel: string;
  upsertForm: (data: FormValues, callbacks: MedicalSectionCallbacks) => void;
};

export function MedicalSection({
  medicalInfo,
  guardians,
  emergencyContact,
  authorizeTransferLabel,
  upsertForm,
}: MedicalSectionProps) {
  const selectedSchool = useSelectedSchool();
  const { data: schoolConfig } = api.students.getSchoolConfig.useQuery(
    { school_id: selectedSchool?.id as string },
    {
      enabled: !!selectedSchool?.id,
    }
  );
  const hiddenFields = schoolConfig?.hidden_medical_form_fields?.split(',') ?? [];

  const { showShadow, targetRef } = useContentScroll();
  const { toggle: isOpenSheet, onOpen: onOpenSheet, onClose: onCloseSheet } = useToggle();
  const { toggle: isOpenDiscard, onOpen: onOpenDiscard, onClose: onCloseDiscard } = useToggle();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [closeSheet, setCloseSheet] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { family_history: [], personal_history: [], current_ailments: [], drugs: [] },
    mode: 'all',
    reValidateMode: 'onSubmit',
  });
  const {
    formState: { isDirty },
  } = form;

  function onSubmit(data: FormValues) {
    if (!isDirty) {
      setIsEditing(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    upsertForm(data, {
      onSuccess: () => {
        setIsEditing(false);
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
      },
    });
  }

  function handleDiscard() {
    if (isDirty) {
      onOpenDiscard();
    } else {
      setIsEditing(false);
    }
  }

  function handleDiscardSubmit() {
    onCloseDiscard();
    setIsEditing(false);

    if (closeSheet) {
      onCloseSheet();
      setCloseSheet(false);
    }
  }

  function handleCloseSheet() {
    setCloseSheet(true);

    if (isEditing && isDirty) {
      onOpenDiscard();
    } else {
      onCloseDiscard();
      setIsEditing(false);
      onCloseSheet();
    }
  }

  return (
    <>
      <div
        className="bg-white border border-[#E4EBF6] rounded-xl px-8 py-6 flex justify-between items-center hover:cursor-pointer"
        onClick={onOpenSheet}
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-[#1C1C1D] font-bold text-lg">Ficha médica</h2>
          <p className="text-#3E4559 text-sm">Consulta los detalles de salud registrados para el estudiante.</p>
        </div>

        <span className="text-[#00AB55] flex items-center gap-3 text-sm font-bold">
          Ver información <ChevronRightIcon className="w-5" />
        </span>
      </div>

      <Sheet open={isOpenSheet} onOpenChange={(open) => !open && onCloseSheet()}>
        <Sheet.Content className="max-h-[calc(100vh-16px)] h-full max-w-4xl w-full m-2 rounded-2xl font-lota antialiased overflow-hidden shadow-[0px_20px_40px_-4px_rgba(145,158,171,0.16)]">
          <div
            className={cn(
              'flex items-center justify-between bg-white border-b border-[#D5DEED] px-8 py-5 sticky top-0',
              { 'shadow-[0px_20px_40px_-4px_rgba(145,158,171,0.16)]': showShadow }
            )}
          >
            <h3 className="text-[#454D64] font-bold text-lg">Ficha médica</h3>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleDiscard} size="small" variant="outline" color="legacy" disabled={isLoading}>
                    Descartar
                  </Button>
                  <Button
                    onClick={form.handleSubmit(onSubmit)}
                    size="small"
                    color="legacy"
                    variant="solid"
                    disabled={isLoading}
                  >
                    Guardar
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} size="small" color="black" variant="solid-light">
                  <EditIcon className="h-4" />
                  Editar
                </Button>
              )}

              <div className="h-8 w-[1px] bg-[#919EAB]/24" />
              <span
                onClick={handleCloseSheet}
                className="px-2 py-1 hover:cursor-pointer hover:bg-[#F0F0F0] rounded-full"
              >
                <XIcon className="text-[#98A2B3] w-4" />
              </span>
            </div>
          </div>

          <div className="bg-[#FBFCFD] overflow-y-auto">
            <div className="h-1" ref={targetRef} />
            <div className="flex flex-col gap-6 px-8 py-7 relative">
              {isEditing ? (
                <>
                  <MedicalSectionForm
                    form={form}
                    medicalInfo={medicalInfo}
                    guardians={guardians}
                    hiddenFields={hiddenFields}
                  />
                  <DiscardChangesDialog
                    open={isOpenDiscard}
                    onSubmit={handleDiscardSubmit}
                    isLoading={isLoading}
                    onClose={onCloseDiscard}
                  />
                </>
              ) : (
                <MedicalSectionInfo
                  medicalInfo={medicalInfo}
                  emergencyContact={emergencyContact}
                  authorizeTransferLabel={authorizeTransferLabel}
                  hiddenFields={hiddenFields}
                />
              )}
            </div>
          </div>
        </Sheet.Content>
      </Sheet>
    </>
  );
}

type MedicalSectionInfoProps = {
  medicalInfo?: MedicalInfo;
  emergencyContact: EmergencyContact;
  authorizeTransferLabel: string;
  hiddenFields: string[];
};
function MedicalSectionInfo({
  medicalInfo,
  emergencyContact,
  authorizeTransferLabel,
  hiddenFields,
}: MedicalSectionInfoProps) {
  let bloodType;
  const isFromStudentLead = medicalInfo && 'blood_type' in medicalInfo;
  if (isFromStudentLead) {
    bloodType = medicalInfo?.blood_type;
  }

  const isFromStudent = medicalInfo && 'blood_type_code' in medicalInfo;
  if (isFromStudent) {
    bloodType = medicalInfo?.blood_type_code;
  }

  const familyHistory = medicalInfo?.family_history === '' ? [] : medicalInfo?.family_history?.split(', ');
  const personalHistory = medicalInfo?.personal_history === '' ? [] : medicalInfo?.personal_history?.split(', ');
  const currentAilments = medicalInfo?.current_ailments === '' ? [] : medicalInfo?.current_ailments?.split(', ');
  const drugs = medicalInfo?.drugs === '' ? [] : medicalInfo?.drugs?.split(', ');

  return (
    <>
      <Card className={cn({ hidden: isSectionHidden(sectionFields.emergencyContact, hiddenFields) })}>
        <CardTitle className="py-4">Contacto de emergencia</CardTitle>
        <CardContent>
          <CardItem label="Nombre" value={emergencyContact.name} isHidden={isHidden('name', hiddenFields)} />
          <CardItem label="Teléfono" value={emergencyContact.phone} isHidden={isHidden('phone', hiddenFields)} />
          <CardItem
            label="Parentesco con el estudiante"
            value={emergencyContact.relationship}
            isHidden={isHidden('relationship', hiddenFields)}
          />
        </CardContent>
      </Card>

      <Card className={cn({ hidden: isSectionHidden(sectionFields.generalInfo, hiddenFields) })}>
        <CardTitle className="py-4">Información general</CardTitle>
        <CardContent>
          <CardItem label="Tipo de sangre" value={bloodType} isHidden={isHidden('blood_type', hiddenFields)} />
          <CardItem label="Talla (cm)" value={medicalInfo?.height} isHidden={isHidden('height', hiddenFields)} />
          <CardItem label="Peso" value={medicalInfo?.weight} isHidden={isHidden('weight', hiddenFields)} />
          <CardItem
            label="Lateralidad"
            value={medicalInfo?.laterality}
            isHidden={isHidden('laterality', hiddenFields)}
          />
        </CardContent>
      </Card>

      <Card className={cn({ hidden: isSectionHidden(sectionFields.background, hiddenFields) })}>
        <CardTitle className="py-4">Antecedentes</CardTitle>
        <CardContent>
          <CardItem
            label="Antecedentes familiares"
            value={<ChipItems items={familyHistory} />}
            isHidden={isHidden('family_history', hiddenFields)}
          />
          <CardItem
            label="Antecedentes personales"
            value={<ChipItems items={personalHistory} />}
            isHidden={isHidden('personal_history', hiddenFields)}
          />
          <CardItem
            label="Padecimientos actuales"
            value={<ChipItems items={currentAilments} />}
            isHidden={isHidden('current_ailments', hiddenFields)}
          />
          <CardItem
            label="Otros padecimientos"
            value={medicalInfo?.other_history}
            isHidden={isHidden('other_history', hiddenFields)}
          />
          <CardItem
            label="Intervenciones quirúrgicas o fracturas"
            value={medicalInfo?.recent_interventions}
            isHidden={isHidden('recent_interventions', hiddenFields)}
          />
        </CardContent>
      </Card>

      <Card className={cn({ hidden: isSectionHidden(sectionFields.medicalAuthorization, hiddenFields) })}>
        <CardTitle className="py-4">Autorizaciones médicas</CardTitle>
        <CardContent>
          <CardItem
            label="Medicamentos autorizados a suministrar"
            value={<ChipItems items={drugs} />}
            isHidden={isHidden('drugs', hiddenFields)}
          />
          <CardItem
            label="Autorización de traslado a la sala de urgencias"
            value={authorizeTransferLabel}
            isHidden={isHidden('authorize_emergency_transfer', hiddenFields)}
          />
        </CardContent>
      </Card>

      <Card className={cn({ hidden: isSectionHidden(sectionFields.allergies, hiddenFields) })}>
        <CardTitle className="py-4">Alergias</CardTitle>
        <CardContent>
          <CardItem
            label="Alergia a medicamentos"
            value={medicalInfo?.drug_allergies?.split(', ')}
            isHidden={isHidden('drug_allergies', hiddenFields)}
          />
          <CardItem
            label="Alergias a alimentos"
            value={medicalInfo?.food_allergies?.split(', ')}
            isHidden={isHidden('food_allergies', hiddenFields)}
          />
          <CardItem
            label="Alergias a plantas o animales"
            value={medicalInfo?.plant_allergies?.split(', ')}
            isHidden={isHidden('plant_allergies', hiddenFields)}
          />
          <CardItem
            label="Otras alergias"
            value={medicalInfo?.other_allergies}
            isHidden={isHidden('other_allergies', hiddenFields)}
          />
          <CardItem
            label="Restricciones alimentarias"
            value={medicalInfo?.dietary_restrictions}
            isHidden={isHidden('dietary_restrictions', hiddenFields)}
          />
        </CardContent>
      </Card>

      <Card className={cn({ hidden: isHidden('has_private_doctor', hiddenFields) })}>
        <CardTitle className="py-4">Médico</CardTitle>
        <CardContent>
          <CardItem label="Nombre" value={medicalInfo?.doctor_name} isHidden={isHidden('doctor_name', hiddenFields)} />
          <CardItem
            label="Teléfono"
            value={medicalInfo?.doctor_phone}
            isHidden={isHidden('doctor_phone', hiddenFields)}
          />
          <CardItem
            label="Clínica"
            value={medicalInfo?.doctor_clinic}
            isHidden={isHidden('doctor_clinic', hiddenFields)}
          />
        </CardContent>
      </Card>

      <Card className={cn({ hidden: isSectionHidden(sectionFields.additionalComments, hiddenFields) })}>
        <CardTitle className="py-4">Observaciones adicionales</CardTitle>
        <CardContent>
          <CardItem
            label="Vacunas"
            value={medicalInfo?.pending_vaccines}
            isHidden={isHidden('pending_vaccines', hiddenFields)}
          />
          <CardItem
            label="Comentarios adicionales"
            value={medicalInfo?.comments}
            isHidden={isHidden('comments', hiddenFields)}
          />
        </CardContent>
      </Card>
    </>
  );
}

const REQUIRED_MESSAGE = 'Debes completar este campo para continuar.';

const schema = z
  .object({
    emergency_contact_id: z.string({ required_error: 'Debes seleccionar un contacto de emergencia.' }),
    emergency_contact_name: z.string().optional().nullable(),
    emergency_contact_phone: z.string().optional().nullable(),
    emergency_contact_relationship: z.string().optional().nullable(),
    blood_type: z.string().optional(),
    weight: z.coerce.number({ invalid_type_error: 'Debes ingresar un número válido.' }).optional(),
    height: z.coerce.number({ invalid_type_error: 'Debes ingresar un número válido.' }).optional(),
    laterality: z.string().optional(),
    family_history: z.array(z.string()).optional(),
    personal_history: z.array(z.string()).optional(),
    current_ailments: z.array(z.string()).optional(),
    recent_interventions: z.string().optional(),
    other_history: z.string().optional(),
    drugs: z.array(z.string()).optional(),
    authorize_emergency_transfer: z.string().optional(),
    drug_allergies: z.string().optional(),
    food_allergies: z.string().optional(),
    plant_allergies: z.string().optional(),
    other_allergies: z.string().optional(),
    dietary_restrictions: z.string().optional(),
    has_private_doctor: z.string().optional(),
    doctor_name: z.string().optional(),
    doctor_phone: z.string().optional(),
    doctor_clinic: z.string().optional(),
    has_all_vaccines: z.string().optional(),
    pending_vaccines: z.string().optional(),
    comments: z.string().optional(),
  })
  .superRefine((data, ctx) => {
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
    if (data.has_all_vaccines === 'No') {
      if (!data.pending_vaccines) {
        ctx.addIssue({
          path: ['pending_vaccines'],
          code: z.ZodIssueCode.custom,
          message: REQUIRED_MESSAGE,
        });
      }
    }
  });

export type FormValues = z.infer<typeof schema>;

type MedicalSectionFormProps = {
  form: UseFormReturn<FormValues>;
  medicalInfo?: MedicalInfo;
  guardians: GuardianInfo[];
  hiddenFields: string[];
};
function MedicalSectionForm({ form, medicalInfo, guardians, hiddenFields }: MedicalSectionFormProps) {
  const {
    clearErrors,
    control,
    formState: { errors },
    register,
    reset,
    setValue,
    watch,
  } = form;

  const hasOtherEmergencyContact = watch('emergency_contact_id') === 'Otro';

  useEffect(() => {
    if (!medicalInfo) return;

    let bloodType;
    const isFromStudentLead = medicalInfo && 'blood_type' in medicalInfo;
    if (isFromStudentLead) {
      bloodType = medicalInfo?.blood_type;
    }

    const isFromStudent = medicalInfo && 'blood_type_code' in medicalInfo;
    if (isFromStudent) {
      bloodType = medicalInfo?.blood_type_code;
    }

    const familyHistory = medicalInfo.family_history === '' ? [] : medicalInfo.family_history?.split(', ');
    const personalHistory = medicalInfo.personal_history === '' ? [] : medicalInfo.personal_history?.split(', ');
    const currentAilments = medicalInfo.current_ailments === '' ? [] : medicalInfo.current_ailments?.split(', ');
    const drugs = medicalInfo.drugs === '' ? [] : medicalInfo.drugs?.split(', ');

    const emergencyContactId = medicalInfo.emergency_contact_id;
    const isGuardianContact = guardians?.some((guardian) => guardian?.id === emergencyContactId);
    const finalEmergencyContactId = isGuardianContact ? emergencyContactId : 'Otro';

    reset({
      emergency_contact_id: finalEmergencyContactId ?? 'Otro',
      emergency_contact_name: medicalInfo.emergency_contact_name ?? '',
      emergency_contact_phone: medicalInfo.emergency_contact_phone ?? '',
      emergency_contact_relationship: medicalInfo.emergency_contact_relationship ?? '',
      blood_type: bloodType ?? '',
      height: medicalInfo.height ?? undefined,
      weight: medicalInfo.weight ?? undefined,
      laterality: medicalInfo.laterality ?? '',
      family_history: familyHistory,
      personal_history: personalHistory,
      current_ailments: currentAilments,
      recent_interventions: medicalInfo.recent_interventions ?? '',
      other_history: medicalInfo.other_history ?? '',
      drugs,
      authorize_emergency_transfer: medicalInfo?.authorize_emergency_transfer ? 'Sí' : 'No',
      drug_allergies: medicalInfo.drug_allergies ?? '',
      food_allergies: medicalInfo.food_allergies ?? '',
      plant_allergies: medicalInfo.plant_allergies ?? '',
      other_allergies: medicalInfo.other_allergies ?? '',
      dietary_restrictions: medicalInfo.dietary_restrictions ?? '',
      has_private_doctor: medicalInfo.has_private_doctor ? 'Sí' : 'No',
      doctor_name: medicalInfo.doctor_name ?? '',
      doctor_phone: medicalInfo.doctor_phone ?? '',
      doctor_clinic: medicalInfo.doctor_clinic ?? '',
      has_all_vaccines: medicalInfo.has_all_vaccines ? 'Sí' : 'No',
      pending_vaccines: medicalInfo.pending_vaccines ?? '',
      comments: medicalInfo.comments ?? '',
    });
  }, [reset, medicalInfo, guardians]);

  const hasPrivateDoctor = watch('has_private_doctor') === 'Sí';
  const hasNoAllVaccines = watch('has_all_vaccines') === 'No';

  return (
    <form className="flex flex-col gap-4">
      <Card className={cn({ hidden: isSectionHidden(sectionFields.emergencyContact, hiddenFields) })}>
        <CardTitle className="py-4">Contacto de emergencia</CardTitle>
        <CardContent singleColumn>
          <div className="flex flex-col lg:flex-row gap-6 w-full">
            <div
              className={cn('', {
                hidden: isHidden('emergency_contact_id', hiddenFields),
                'lg:w-1/2': hasOtherEmergencyContact && !isHidden('emergency_contact_id', hiddenFields),
                'w-full': !hasOtherEmergencyContact || isHidden('emergency_contact_id', hiddenFields),
              })}
            >
              <Controller
                control={control}
                name="emergency_contact_id"
                render={({ field }) => (
                  <Radio.Group
                    value={field.value}
                    onValueChange={field.onChange}
                    error={errors.emergency_contact_id?.message}
                  >
                    <div className="flex flex-col gap-3">
                      {guardians?.map((guardian) => {
                        const id = guardian?.id as string;
                        const fullName = `${guardian?.first_name} ${guardian?.last_name}`;

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
                        <Radio.Item id="no" value="Otro" onClick={() => setValue('emergency_contact_id', 'Otro')} />
                        <Label htmlFor="no">Otro</Label>
                      </div>
                    </div>
                  </Radio.Group>
                )}
              />
            </div>
            {hasOtherEmergencyContact && !isHidden('emergency_contact_id', hiddenFields) ? (
              <div className="w-full lg:w-1/2 flex flex-col gap-4">
                <FormInput
                  label="Nombre"
                  name="emergency_contact_name"
                  register={register}
                  errors={errors}
                  isHidden={isHidden('emergency_contact_name', hiddenFields)}
                />
                <Controller
                  control={control}
                  name="emergency_contact_phone"
                  render={({ field }) => (
                    <div className="h-[48px]">
                      <PhoneInput
                        key={watch('emergency_contact_phone')}
                        initialValue={watch('emergency_contact_phone') ?? ''}
                        onChange={({ number }) => {
                          clearErrors('emergency_contact_phone');
                          field.onChange(number);
                        }}
                        error={errors.emergency_contact_phone?.message}
                        className="h-full [&_button]:!h-full [&_div.flex-1]:!h-full [&_input]:!h-full [&_label]:!h-full"
                      />
                    </div>
                  )}
                />
                <FormSelect
                  label="Parentesco con el estudiante"
                  name="emergency_contact_relationship"
                  control={control}
                  errors={errors}
                  options={guardianRelationshipOptions}
                  isHidden={isHidden('emergency_contact_relationship', hiddenFields)}
                />
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
      <Card className={cn({ hidden: isSectionHidden(sectionFields.generalInfo, hiddenFields) })}>
        <CardTitle className="py-4">Información general</CardTitle>
        <CardContent>
          <FormSelect
            label="Tipo de sangre"
            name="blood_type"
            control={control}
            errors={errors}
            options={bloodTypeOptions}
            isHidden={isHidden('blood_type', hiddenFields)}
          />
          <FormInput
            label="Talla (cm)"
            name="height"
            register={register}
            errors={errors}
            isHidden={isHidden('height', hiddenFields)}
          />
          <FormInput
            label="Peso"
            name="weight"
            register={register}
            errors={errors}
            isHidden={isHidden('weight', hiddenFields)}
          />
          <FormSelect
            label="Lateralidad"
            name="laterality"
            control={control}
            errors={errors}
            options={lateralityOptions}
            isHidden={isHidden('laterality', hiddenFields)}
          />
        </CardContent>
      </Card>

      <Card className={cn({ hidden: isSectionHidden(sectionFields.background, hiddenFields) })}>
        <CardTitle className="py-4">Antecedentes</CardTitle>
        <CardContent>
          <FormMultiSelect
            label="Antecedentes familiares"
            name="family_history"
            control={control}
            errors={errors}
            options={familyHistoryOptions}
            isHidden={isHidden('family_history', hiddenFields)}
          />
          <FormMultiSelect
            label="Antecedentes personales"
            name="personal_history"
            control={control}
            errors={errors}
            options={personalHistoryOptions}
            isHidden={isHidden('personal_history', hiddenFields)}
          />
          <FormMultiSelect
            label="Padecimientos actuales"
            name="current_ailments"
            control={control}
            errors={errors}
            options={currentAilmentsOptions}
            isHidden={isHidden('current_ailments', hiddenFields)}
          />
          <FormInput
            label="Intervenciones quirúrgicas o fracturas"
            name="recent_interventions"
            register={register}
            errors={errors}
            isHidden={isHidden('recent_interventions', hiddenFields)}
          />
          <FormTextarea
            label="Otros padecimientos"
            name="other_history"
            control={control}
            errors={errors}
            isHidden={isHidden('other_history', hiddenFields)}
          />
        </CardContent>
      </Card>

      <Card className={cn({ hidden: isSectionHidden(sectionFields.medicalAuthorization, hiddenFields) })}>
        <CardTitle className="py-4">Autorizaciones médicas</CardTitle>
        <CardContent>
          <FormMultiSelect
            label="Medicamentos autorizados a suministrar"
            name="drugs"
            control={control}
            errors={errors}
            options={drugOptions}
            isHidden={isHidden('drugs', hiddenFields)}
          />
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
                <p>Autorización de traslado a la sala de urgencias</p>

                <div className="flex gap-x-8 mt-2">
                  <div className="flex items-center gap-2">
                    <Radio.Item id="yes" value="Sí" />
                    <FormLabel name="yes">Sí</FormLabel>
                  </div>
                  <div className="flex items-center gap-2">
                    <Radio.Item id="no" value="No" />
                    <FormLabel name="no">No</FormLabel>
                  </div>
                </div>
              </Radio.Group>
            )}
          />
        </CardContent>
      </Card>

      <Card className={cn({ hidden: isSectionHidden(sectionFields.allergies, hiddenFields) })}>
        <CardTitle className="py-4">Alergias</CardTitle>
        <CardContent>
          <FormInput
            label="Alergia a medicamentos"
            name="drug_allergies"
            register={register}
            errors={errors}
            isHidden={isHidden('drug_allergies', hiddenFields)}
          />
          <FormInput
            label="Alergias a alimentos"
            name="food_allergies"
            register={register}
            errors={errors}
            isHidden={isHidden('food_allergies', hiddenFields)}
          />
          <FormInput
            label="Alergias a plantas o animales"
            name="plant_allergies"
            register={register}
            errors={errors}
            isHidden={isHidden('plant_allergies', hiddenFields)}
          />
          <FormInput
            label="Otras alergias"
            name="other_allergies"
            register={register}
            errors={errors}
            isHidden={isHidden('other_allergies', hiddenFields)}
          />
          <FormTextarea
            label="Restricciones alimentarias"
            name="dietary_restrictions"
            control={control}
            errors={errors}
            isHidden={isHidden('dietary_restrictions', hiddenFields)}
          />
        </CardContent>
      </Card>

      <Card className={cn({ hidden: isHidden('has_private_doctor', hiddenFields) })}>
        <CardTitle className="py-4">Médico y seguro particular</CardTitle>
        <CardContent>
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
                    <FormLabel name="yes">Sí</FormLabel>
                  </div>
                  <div className="flex items-center gap-2">
                    <Radio.Item id="no" value="No" />
                    <FormLabel name="no">No</FormLabel>
                  </div>
                </div>
              </Radio.Group>
            )}
          />

          {hasPrivateDoctor && !isHidden('has_private_doctor', hiddenFields) ? (
            <>
              <FormInput
                label="Nombre del médico"
                name="doctor_name"
                register={register}
                errors={errors}
                isHidden={isHidden('doctor_name', hiddenFields)}
              />
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
                    error={errors.doctor_phone?.message}
                  />
                )}
              />
              <FormInput
                label="Clínica de preferencia"
                name="doctor_clinic"
                register={register}
                errors={errors}
                isHidden={isHidden('doctor_clinic', hiddenFields)}
              />
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card className={cn({ hidden: isSectionHidden(sectionFields.additionalComments, hiddenFields) })}>
        <CardTitle className="py-4">Observaciones adicionales</CardTitle>
        <CardContent>
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
                    <FormLabel name="yes">Sí</FormLabel>
                  </div>
                  <div className="flex items-center gap-2">
                    <Radio.Item id="no" value="No" />
                    <FormLabel name="no">No</FormLabel>
                  </div>
                </div>
              </Radio.Group>
            )}
          />
          {hasNoAllVaccines && !isHidden('has_all_vaccines', hiddenFields) ? (
            <FormTextarea
              label="Vacunas"
              name="pending_vaccines"
              control={control}
              errors={errors}
              isHidden={isHidden('pending_vaccines', hiddenFields)}
            />
          ) : null}
          <FormTextarea
            label="Comentarios adicionales"
            name="comments"
            control={control}
            errors={errors}
            isHidden={isHidden('comments', hiddenFields)}
          />
        </CardContent>
      </Card>
    </form>
  );
}

function isHidden(field: string, hiddenFields: string[]) {
  return hiddenFields?.includes(field) ?? false;
}

function isSectionHidden(fields: string[], hiddenFields: string[]) {
  return fields.every((field) => hiddenFields?.includes(field));
}

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

type SectionField =
  | 'emergencyContact'
  | 'generalInfo'
  | 'background'
  | 'medicalAuthorization'
  | 'allergies'
  | 'doctor'
  | 'additionalComments';

export type MedicalFormField = keyof UpsertMedicalFormDto;

const sectionFields: Record<SectionField, MedicalFormField[]> = {
  emergencyContact: ['emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'],
  generalInfo: ['blood_type', 'height', 'weight', 'laterality'],
  background: ['family_history', 'personal_history', 'current_ailments', 'other_history', 'recent_interventions'],
  medicalAuthorization: ['drugs', 'authorize_emergency_transfer'],
  allergies: ['drug_allergies', 'food_allergies', 'plant_allergies', 'other_allergies', 'dietary_restrictions'],
  doctor: ['doctor_name', 'doctor_phone', 'doctor_clinic'],
  additionalComments: ['has_all_vaccines', 'comments'],
};

const guardianRelationshipOptions = ['Padre', 'Madre', 'Tío/a', 'Abuelo/a', 'Hermano/a', 'Otro'];
