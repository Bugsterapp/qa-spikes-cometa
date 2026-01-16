import { Button, Chip, DatePicker, Dialog, Input, Label, PhoneInput, Radio, Select, TextField } from '@cometa/recreo';
import { GuardianResponse, DashboardSchoolSection, SlimGuardian } from '@cometa/trpc/src/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useRef, useState } from 'react';
import {
  Control,
  Controller,
  FieldErrors,
  FieldValues,
  Path,
  useForm,
  UseFormClearErrors,
  UseFormWatch,
} from 'react-hook-form';
import { z } from 'zod';
import SidebarActions from '/src/components/atoms/SidebarActions';
import TextAreaGrow from '/src/components/atoms/TextAreaGrow/TextAreaGrow';
import SidebarHeader from '/src/components/molecules/dashboard/SidebarHeader';
import { format, parse } from 'date-fns';
import { GenderEnum } from '@cometa/trpc/src/admissions/types';
import { AssignGuardianTab } from '/src/components/organisms/dashboard/StudentCreation/AssignGuardianTab';
import Mail from '/public/assets/icons/studentDetail/mail.svg';
import Phone from '/public/assets/icons/studentDetail/phone.svg';
import Plus from '/public/assets/icons/studentDetail/plus.svg';
import { api, ServiceClient } from '/src/utils/api';
import { guardianRelationshipOptions } from '/src/constants/guardianRelationship';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import useAlert from '/src/hooks/useAlert';
import { validateZodStringDate } from '/src/utils/zod';

const REQUIRED_MESSAGE = 'Falta completar este campo.';

const schema = z.object({
  first_name: z.string().min(1, REQUIRED_MESSAGE),
  last_name: z.string().min(1, REQUIRED_MESSAGE),
  section_id: z.string().min(1, REQUIRED_MESSAGE),
  school_cycle_id: z.string().min(1, REQUIRED_MESSAGE),
  origin_school: z.string(),
  change_reason: z.string({ required_error: REQUIRED_MESSAGE }),
  comment: z.string().optional(),
  birthdate: z
    .string()
    .min(1, REQUIRED_MESSAGE)
    .refine((value) => validateZodStringDate(value, { disableFutureDates: true }), { message: 'Fecha inválida' }),
  gender: z.nativeEnum(GenderEnum, { required_error: REQUIRED_MESSAGE }),
  guardian_lead: z.object({
    first_name: z.string().min(1, REQUIRED_MESSAGE),
    last_name: z.string().min(1, REQUIRED_MESSAGE),
    email: z.string().min(1, REQUIRED_MESSAGE).email('Ingresa una direccion de correo válida'),
    phone: z.string({ required_error: REQUIRED_MESSAGE }),
    relationship: z.string().optional(),
  }),
  relationship: z.string().min(1, REQUIRED_MESSAGE),
});

type FormValues = z.infer<typeof schema>;

export type DialogState = {
  isOpen: boolean;
  selectedTab: 'create' | 'search';
};

export const initialDialogState: DialogState = {
  isOpen: false,
  selectedTab: 'create',
};

export function AdmissionForm({
  onClose,
  sections,
  onSuccess,
}: {
  onClose: () => void;
  sections: DashboardSchoolSection[];
  onSuccess: () => void;
}) {
  const utils = api.useUtils();
  const { setAlertState } = useAlert();

  const { data: session } = useSession();
  const user = session?.user;

  const selectedSchool = useSelectedSchool();
  const schoolId = selectedSchool?.id as string;

  const { data: schoolCycles } = api.schools.schoolsCycles.useQuery(
    { school_id: schoolId },
    { enabled: Boolean(schoolId) }
  );

  const createAdmission = api.admissions.createAdmission.useMutation({
    onSuccess: async () => {
      await utils.admissions.getAdmissions.invalidate();
      onSuccess();
    },
    onError: () => {
      setAlertState({
        open: true,
        severity: 'error',
        message:
          'Ha ocurrido un error al crear el prospecto. Intenta nuevamente o comunicate con nuestro equipo de soporte',
      });
    },
  });

  const {
    register,
    control,
    formState: { errors },
    clearErrors,
    handleSubmit,
    setValue,
    getValues,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      school_cycle_id: '',
      section_id: '',
      birthdate: '',
      guardian_lead: { relationship: '' },
      relationship: '',
    },
    resolver: zodResolver(schema),
    mode: 'onBlur',
  });

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const textarea = textAreaRef.current;

  const [dialogState, setDialogState] = useState<DialogState>(initialDialogState);
  const [guardian, setGuardian] = useState<GuardianResponse | SlimGuardian>();

  const phone = watch('guardian_lead.phone');
  const email = watch('guardian_lead.email');

  function setGuardianLead(guardian?: GuardianResponse | SlimGuardian) {
    if (!guardian) return;

    setValue('guardian_lead', {
      email: guardian.email,
      phone: guardian.phone as string,
      first_name: guardian.first_name,
      last_name: guardian.last_name as string,
    });
  }

  function unsetGuardianLead() {
    setValue('guardian_lead', {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      relationship: '',
    });
  }

  function verifyGuardian() {
    ServiceClient.apiV1DashboardSchoolsGuardiansList(schoolId, { email, phone } as any, {
      headers: {
        Authorization: `Token ${session?.token}`,
      },
    }).then((response) => {
      if (response.data.results?.length === 1) {
        const guardian = response.data.results[0];
        setDialogState({ ...dialogState, isOpen: true });
        setGuardian(guardian);
        setGuardianLead(guardian);
      }
    });
  }

  async function onSubmit(data: FormValues) {
    const { birthdate, ...rest } = data;

    const formattedBirthdate = format(parse(birthdate, 'dd/MM/yyyy', new Date()), 'yyyy-MM-dd');

    let payload = {
      ...rest,
      birthdate: formattedBirthdate,
      created_by: `${user?.first_name} ${user?.last_name}`,
      school_id: schoolId,
    };

    if (guardian) {
      payload = {
        ...payload,
        guardian_lead: {
          email: guardian.email,
          phone: guardian.phone as string,
          first_name: guardian.first_name,
          last_name: guardian.last_name as string,
          relationship: getValues('relationship') || '',
        },
      };
    } else {
      payload.guardian_lead.relationship = getValues('relationship') || '';
    }

    createAdmission.mutate(payload);
  }

  return (
    <div className="flex flex-col px-8 h-full">
      <SidebarHeader title="Nuevo prospecto" onClose={onClose} />

      <form className="mt-6 h-full justify-between flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-lg font-bold leading-5">Información del tutor</span>
              <span className="text-base font-normal text-[#637381] leading-6">
                Busca o registra la información del tutor quien está registrando el nuevo prospecto.
              </span>
            </div>

            <Radio.Group
              name="action"
              className="flex flex-row gap-4"
              value={dialogState.selectedTab}
              onValueChange={(value: 'create' | 'search') => setDialogState({ ...dialogState, selectedTab: value })}
            >
              <div className="cursor-pointer flex items-center gap-4 rounded-lg border border-[#DFE3E8] p-4">
                <Label htmlFor="create" className="text-base cursor-pointer">
                  Registrar un nuevo tutor
                </Label>
                <Radio.Item id="create" value="create" className="cursor-pointer" />
              </div>
              <div className="cursor-pointer flex items-center gap-4 rounded-lg border border-[#DFE3E8] p-4">
                <Label htmlFor="search" className="text-base cursor-pointer">
                  Buscar un tutor existente
                </Label>
                <Radio.Item id="search" value="search" className="cursor-pointer" />
              </div>
            </Radio.Group>

            {guardian ? (
              <>
                <GuardianCard
                  guardian={guardian}
                  unselectGuardian={() => {
                    setGuardian(undefined);
                    unsetGuardianLead();
                  }}
                />

                <RelationshipSelect
                  control={control}
                  name="relationship"
                  watch={watch}
                  clearErrors={clearErrors}
                  errors={errors}
                />
              </>
            ) : null}

            {dialogState.selectedTab === 'search' ? (
              <AssignGuardianTab<FormValues>
                guardian={guardian as GuardianResponse}
                setGuardian={(guardian) => {
                  setGuardian(guardian);
                  setGuardianLead(guardian);
                }}
                isStudent={false}
              />
            ) : null}

            {dialogState.selectedTab === 'create' && !guardian ? (
              <>
                <TextField
                  label="Nombre"
                  error={errors.guardian_lead?.first_name?.message}
                  value={watch('guardian_lead.first_name')}
                >
                  <Input {...register('guardian_lead.first_name')} type="text" data-testid="guardian-first-name-txt" />
                </TextField>
                <TextField
                  label="Apellidos"
                  error={errors.guardian_lead?.last_name?.message}
                  value={watch('guardian_lead.last_name')}
                >
                  <Input {...register('guardian_lead.last_name')} type="text" data-testid="guardian-last-name-txt" />
                </TextField>
                <TextField label="Correo electrónico" error={errors.guardian_lead?.email?.message} value={email}>
                  <Input
                    {...register('guardian_lead.email')}
                    type="text"
                    data-testid="guardian-email-txt"
                    onBlur={() => {
                      if (email && email.length > 3) {
                        verifyGuardian();
                      }
                    }}
                  />
                </TextField>
                <Controller
                  control={control}
                  name="guardian_lead"
                  render={({ field }) => (
                    <PhoneInput
                      onChange={({ number }) => {
                        clearErrors('guardian_lead.phone');
                        field.onChange({
                          ...watch('guardian_lead'),
                          phone: number,
                        });
                      }}
                      onBlur={() => {
                        if (phone && phone.length > 7) {
                          verifyGuardian();
                        }
                      }}
                      error={errors.guardian_lead?.phone?.message}
                    />
                  )}
                />

                <RelationshipSelect
                  control={control}
                  name="relationship"
                  watch={watch}
                  clearErrors={clearErrors}
                  errors={errors}
                />
              </>
            ) : null}

            <GuardianExists
              open={dialogState.isOpen}
              onClose={() => setDialogState({ ...dialogState, isOpen: false })}
              guardian={guardian}
              setGuardian={setGuardian}
              unsetGuardianLead={unsetGuardianLead}
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-lg font-bold leading-5">Información del estudiante</span>
              <span className="text-base font-normal text-[#637381] leading-6">
                Ingresa la información del prospecto que aplicará en este proceso.
              </span>
            </div>
            <TextField label="Nombre" error={errors.first_name?.message} value={watch('first_name')}>
              <Input {...register('first_name')} type="text" data-testid="prospect-first-name-txt" />
            </TextField>
            <TextField label="Apellidos" error={errors.last_name?.message} value={watch('last_name')}>
              <Input {...register('last_name')} type="text" data-testid="prospect-last-name-txt" />
            </TextField>
            <div className="flex flex-col gap-1">
              <Label htmlFor="birthdate">Fecha de nacimiento</Label>
              <Controller
                control={control}
                name="birthdate"
                render={({ field }) => (
                  <DatePicker {...field} showCalendarIcon={false} error={errors.birthdate?.message} />
                )}
              />
            </div>
            <div className="flex flex-col">
              <h5 className="text-xs font-bold">SEXO:</h5>
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <Radio.Group
                    value={field.value}
                    onValueChange={field.onChange}
                    error={errors.gender?.message}
                    className="mb-2"
                  >
                    <div className="flex gap-x-8 mt-2">
                      <div className="flex items-center gap-2">
                        <Radio.Item id="male" value="male" />
                        <Label htmlFor="male">Masculino</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Radio.Item id="female" value="female" />
                        <Label htmlFor="female">Femenino</Label>
                      </div>
                    </div>
                  </Radio.Group>
                )}
              />
            </div>
            <Controller
              control={control}
              name="section_id"
              render={({ field: { onChange, value } }) => (
                <Select
                  placeholder="Grado al que postula"
                  className="w-full outline-none min-h-[56px] h-full mb-1"
                  onValueChange={onChange}
                  value={value}
                  error={errors.section_id?.message}
                >
                  <Select.Content className="w-full outline-none">
                    {sections?.map((section) => (
                      <Select.Item className="w-full outline-none" value={section.id} key={section.id}>
                        <div className="flex gap-2">{section.name}</div>
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              )}
            />
            <Controller
              control={control}
              name="school_cycle_id"
              render={({ field: { onChange, value } }) => (
                <Select
                  placeholder="Ciclo escolar de ingreso"
                  className="w-full outline-none min-h-[56px] h-full mb-1"
                  onValueChange={onChange}
                  value={value}
                  error={errors.school_cycle_id?.message}
                >
                  <Select.Content className="w-full outline-none">
                    {schoolCycles?.map((cycle) => (
                      <Select.Item
                        className="w-full bg-gray-200 outline-none"
                        value={cycle.id as string}
                        key={cycle.id as string}
                      >
                        <div className="flex gap-2">
                          {cycle.name}
                          {cycle.is_active && <Chip variant="blue">Ciclo actual</Chip>}
                        </div>
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              )}
            />
            <TextField
              label="Escuela de procedencia (opcional)"
              error={errors.origin_school?.message}
              value={watch('origin_school')}
            >
              <Input {...register('origin_school')} type="text" />
            </TextField>
            <Controller
              control={control}
              name="change_reason"
              render={({ field: { onChange, value } }) => (
                <Select
                  placeholder="Motivo de cambio o postulación"
                  className="w-full outline-none min-h-[56px] h-full mb-1"
                  onValueChange={onChange}
                  value={value}
                  error={errors.change_reason?.message}
                >
                  <Select.Content className="w-full outline-none">
                    {changeReasons.map((changeReason) => (
                      <Select.Item
                        key={changeReason}
                        data-testid={`${changeReason}`}
                        className="w-full hover:bg-[#F5FAFF] outline-none"
                        value={changeReason}
                      >
                        <div className="flex gap-2">{changeReason}</div>
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              )}
            />
            <Controller
              control={control}
              name="comment"
              render={({ field }) => (
                <TextField label="Comentarios (opcional)" textareaGrow value={watch('comment')} className="mb-2">
                  <TextAreaGrow
                    {...field}
                    ref={textAreaRef}
                    id="comment"
                    className="border-none max-h-[200px] min-h-[140px] overflow-y-auto transition-all"
                    onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                      if (textarea && textarea?.scrollHeight > 140) {
                        const height = textarea?.scrollHeight;
                        textarea.style.height = `${height}px`;
                      }
                      setValue('comment', event.target.value);
                    }}
                    errors={false}
                  />
                </TextField>
              )}
            />
          </div>
        </div>
        <SidebarActions>
          <button
            type="button"
            className="bg-[#FAFBFF] px-20 py-3 text-green-400 hover:text-green-500 text-base font-bold disabled:bg-[#919EAB3D] disabled:text-[#919EABCC] rounded-lg"
            onClick={() => onClose()}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="text-white text-base font-bold px-20 py-3 rounded-lg bg-[#00AB55] hover:bg-green-500 disabled:bg-[#919EAB3D] disabled:text-[#919EABCC] whitespace-nowrap"
            disabled={createAdmission.isPending}
          >
            Continuar
          </button>
        </SidebarActions>
      </form>
    </div>
  );
}

export const changeReasons = [
  'Inicia sus estudios',
  'Cambio de ciudad',
  'Cambio de domicilio',
  'Cambio de nivel escolar',
  'Cercanía de casa o trabajo',
  'Inconformidad con escuela anterior',
  'Mejorar nivel académico',
  'Necesidad educativa especial',
  'Nuevas opciones',
  'Hermanos en el colegio',
  'Anterior escuela no tiene siguiente nivel',
  'Recomendación',
  'Regresa al colegio',
  'Otro',
];

function GuardianExists({
  open,
  onClose,
  guardian,
  setGuardian,
  unsetGuardianLead,
}: {
  open: boolean;
  onClose: () => void;
  guardian?: GuardianResponse | SlimGuardian;
  setGuardian: (_: GuardianResponse | SlimGuardian | undefined) => void;
  unsetGuardianLead: () => void;
}) {
  if (!guardian) {
    return null;
  }

  return (
    <Dialog.Root open={open} position="right" className="z-50">
      <Dialog.Title>¡Parece que ya existe un tutor con esos datos!</Dialog.Title>
      <Dialog.Description>
        No se pueden registrar 2 tutores con el mismo correo o número de teléfono.
      </Dialog.Description>
      <div className="rounded-lg border border-[#E4EBF6] bg-[#FBFCFD] py-5 px-5 items-start flex mb-6 flex-col">
        <h4 className="col-start-1 mb-4 font-bold text-left">
          {guardian.first_name} {guardian.last_name}
        </h4>
        <div className="flex flex-col items-start gap-4">
          <a className="flex items-center text-sm">
            <Mail className="w-4 mr-2 text-[#98A2B3]" />{' '}
            <span className="truncate max-w-[220px]">{guardian.email}</span>
          </a>
          <a className="flex items-center text-sm">
            <Phone className="w-4 mr-2 text-[#98A2B3]" />
            {guardian.phone}
          </a>
        </div>
      </div>
      <div className="flex justify-center gap-x-10">
        <Dialog.Close
          onClick={() => {
            setGuardian(undefined);
            unsetGuardianLead();
            onClose();
          }}
          className="text-[#637381] bg-transparent font-bold	py-2 px-8 text-sm	hover:opacity-90 whitespace-nowrap outline-none"
        >
          Volver
        </Dialog.Close>
        <Button
          className="text-white  font-bold	py-2 px-8 rounded-lg	text-sm	hover:opacity-90  whitespace-nowrap bg-green shadow-[0_8px_16px_#00AB553D]"
          onClick={() => {
            setGuardian(guardian);
            onClose();
          }}
        >
          Seleccionar tutor
        </Button>
      </div>
    </Dialog.Root>
  );
}

function GuardianCard({
  guardian,
  unselectGuardian,
}: {
  guardian: GuardianResponse | SlimGuardian;
  unselectGuardian: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 bg-[#FBFCFD] border border-[#E4EBF6] rounded-lg p-4">
      <div className="flex justify-between mb-1">
        <p className="font-semibold">
          {guardian.first_name} {guardian.last_name}
        </p>

        <span onClick={unselectGuardian} className="hover:cursor-pointer">
          <Plus className="rotate-45 text-[#212B36] w-4" />
        </span>
      </div>
      <div className="flex gap-2">
        <Mail className="w-4 mr-1 text-[#98A2B3]" /> {guardian.email}
      </div>
      <div className="flex gap-2">
        <Phone className="w-4 mr-1 text-[#98A2B3]" /> {guardian.phone}
      </div>
    </div>
  );
}

interface RelationshipSelectProps<TFormValues extends FieldValues> {
  readonly control: Control<TFormValues>;
  readonly name: Path<TFormValues>;
  readonly watch: UseFormWatch<TFormValues>;
  readonly clearErrors: UseFormClearErrors<TFormValues>;
  readonly errors: FieldErrors<TFormValues>;
}

function RelationshipSelect<TFormValues extends FieldValues>({
  control,
  name,
  watch,
  clearErrors,
  errors,
}: RelationshipSelectProps<TFormValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Select
          placeholder="Parentesco con el prospecto"
          className="w-full outline-none min-h-[56px] h-full mb-1"
          onValueChange={(value) => {
            clearErrors(name);
            field.onChange(value);
          }}
          value={watch(name) as string}
          error={errors[name]?.message as string | undefined}
        >
          <Select.Content className="w-full outline-none">
            {guardianRelationshipOptions.map((option) => (
              <Select.Item key={option.id} value={option.id} className="w-full hover:bg-[#F5FAFF] outline-none">
                {option.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      )}
    />
  );
}
