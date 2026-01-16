import { Button, Chip, DatePicker, Drawer, Input, Label, Radio, Select, TextArea, TextField } from '@cometa/recreo';
import { useToggle } from '@cometa/hooks';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { changeReasons, meetReasons } from '~/constants/admissions';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '~/utils/api';
import { Session } from 'next-auth';
import { useSession } from 'next-auth/react';
import { GenderEnum } from '@cometa/trpc/src/admissions/types';
import { validateZodStringDate } from '~/utils/zod';

const REQUIRED_MESSAGE = 'Debes completar este campo para continuar.';

const schema = z.object({
  first_name: z.string().min(1, REQUIRED_MESSAGE),
  last_name: z.string().min(1, REQUIRED_MESSAGE),
  section_id: z.string().min(1, REQUIRED_MESSAGE),
  school_cycle_id: z.string().min(1, REQUIRED_MESSAGE),
  origin_school: z.string(),
  change_reason: z.string({ required_error: REQUIRED_MESSAGE }),
  meet_reason: z.string({ required_error: REQUIRED_MESSAGE }),
  comment: z.string().optional(),
  birthdate: z
    .string()
    .min(1, REQUIRED_MESSAGE)
    .refine((value) => validateZodStringDate(value, { disableFutureDates: true }), { message: 'Fecha inválida' }),
  gender: z.nativeEnum(GenderEnum, { required_error: REQUIRED_MESSAGE }),
  //relationship: z.string({ required_error: REQUIRED_MESSAGE }),
});

type FormValues = z.infer<typeof schema>;

// const guardianRelationshipOptions = [
//   { id: 'Padre', label: 'Padre' },
//   { id: 'Madre', label: 'Madre' },
//   { id: 'Tío/a', label: 'Tío/a' },
//   { id: 'Abuelo/a', label: 'Abuelo/a' },
//   { id: 'Hermano/a', label: 'Hermano/a' },
//   { id: 'Otro', label: 'Otro' },
// ];

export function AdmissionForm({ schoolId, guardian }: { schoolId: string; guardian?: Session['user'] }) {
  const { data: session } = useSession();
  const user = session?.user;

  const { toggle: open, onOpen, onClose } = useToggle(false);

  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
    reset,
    watch,
  } = useForm<FormValues>({
    defaultValues: { school_cycle_id: '', section_id: '' },
    resolver: zodResolver(schema),
    mode: 'onBlur',
  });

  const createAdmission = api.admissions.createAdmission.useMutation();

  const utils = api.useUtils();

  function onSubmit(data: FormValues) {
    const { birthdate, ...rest } = data;
    const [day, month, year] = birthdate.split('/');
    const formattedBirthdate = `${year}-${month}-${day}`;

    const payload = {
      ...rest,
      birthdate: formattedBirthdate,
      created_by: `${user?.first_name} ${user?.last_name}`,
      school_id: schoolId,
      guardian_lead: {
        first_name: guardian?.first_name as string,
        last_name: guardian?.last_name as string,
        email: guardian?.email as string,
        phone: guardian?.phone as string,
      },
    };
    createAdmission.mutate(payload, {
      onSuccess: () => {
        utils.admissions.getAdmissions.invalidate();
        reset();
        onClose();
      },
    });
  }

  const { data: schoolCycles } = api.schools.getSchoolsCycles.useQuery(
    { school_id: schoolId },
    { enabled: !!schoolId }
  );
  const { data: sections } = api.schools.getSectionsByToken.useQuery({ school_id: schoolId }, { enabled: !!schoolId });

  return (
    <>
      <Button
        size="small"
        color="black"
        variant="solid-light"
        className="py-3 px-6 flex gap-2 items-center"
        onClick={onOpen}
      >
        <AddIcon /> Nueva admisión
      </Button>

      <Drawer.Root open={open} className="max-h-full sm:max-h-[92%] rounded-t-2xl">
        <div className="flex justify-between item border-b border-[#919eab3d] pb-0">
          <Drawer.Title className="text-lg">Nuevo proceso de admisión</Drawer.Title>
          <CloseIcon onClick={onClose} className="hover:cursor-pointer mt-1" />
        </div>

        <form
          className="flex flex-col justify-between h-full overflow-auto pt-4 pr-4 -mr-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-[#1c1c1d]">Información del estudiante</span>
              <span className="text-[#637381]">Ingresa la información del estudiante a postular.</span>
            </div>

            <TextField label="Nombre" error={errors.first_name?.message} value={watch('first_name')}>
              <Input {...register('first_name')} type="text" />
            </TextField>
            <TextField label="Apellidos" error={errors.last_name?.message} value={watch('last_name')}>
              <Input {...register('last_name')} type="text" />
            </TextField>

            <div className="flex flex-col gap-1">
              <h5 className="text-xs font-bold mb-2">FECHA DE NACIMIENTO:</h5>
              <Controller
                control={control}
                name="birthdate"
                render={({ field }) => (
                  <DatePicker {...field} error={errors.birthdate?.message} showCalendarIcon={false} />
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

            {/* <Controller
              control={control}
              name="relationship"
              render={({ field }) => (
                <Select
                  placeholder="Parentesco con el postulante"
                  className="w-full outline-none min-h-[56px] h-full mb-1"
                  onValueChange={field.onChange}
                  value={field.value}
                  error={errors.relationship?.message}
                >
                  <Select.Content className="w-full outline-none">
                    {guardianRelationshipOptions?.map((option) => (
                      <Select.Item key={option.id} value={option.id} className="w-full hover:bg-[#F5FAFF] outline-none">
                        {option.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              )}
            /> */}

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
                        className="w-full hover:bg-[#F5FAFF] outline-none"
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
                      <Select.Item
                        key={section.id}
                        className="w-full hover:bg-[#F5FAFF] outline-none"
                        value={section.id}
                      >
                        <div className="flex gap-2">
                          {section.grade} - {section.level}
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
              name="meet_reason"
              render={({ field: { onChange, value } }) => (
                <Select
                  placeholder="¿Cómo conociste el colegio?"
                  className="w-full outline-none min-h-[56px] h-full mb-1"
                  onValueChange={onChange}
                  value={value}
                  error={errors.meet_reason?.message}
                >
                  <Select.Content className="w-full outline-none">
                    {meetReasons.map((meetReason) => (
                      <Select.Item
                        key={meetReason}
                        className="w-full hover:bg-[#F5FAFF] outline-none"
                        value={meetReason}
                      >
                        <div className="flex gap-2">{meetReason}</div>
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
                  <TextArea
                    {...field}
                    id="comment"
                    className="border-none max-h-[200px] min-h-[140px] transition-all resize-none"
                  />
                </TextField>
              )}
            />
          </div>

          <Button
            type="submit"
            variant="solid"
            color="black"
            size="medium"
            className="w-full"
            disabled={createAdmission.isPending}
          >
            Guardar
          </Button>
        </form>
      </Drawer.Root>
    </>
  );
}

function AddIcon({ className }: { className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M11 5H7V1C7 0.734784 6.89464 0.48043 6.70711 0.292893C6.51957 0.105357 6.26522 0 6 0C5.73478 0 5.48043 0.105357 5.29289 0.292893C5.10536 0.48043 5 0.734784 5 1V5H1C0.734784 5 0.48043 5.10536 0.292893 5.29289C0.105357 5.48043 0 5.73478 0 6C0 6.26522 0.105357 6.51957 0.292893 6.70711C0.48043 6.89464 0.734784 7 1 7H5V11C5 11.2652 5.10536 11.5196 5.29289 11.7071C5.48043 11.8946 5.73478 12 6 12C6.26522 12 6.51957 11.8946 6.70711 11.7071C6.89464 11.5196 7 11.2652 7 11V7H11C11.2652 7 11.5196 6.89464 11.7071 6.70711C11.8946 6.51957 12 6.26522 12 6C12 5.73478 11.8946 5.48043 11.7071 5.29289C11.5196 5.10536 11.2652 5 11 5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CloseIcon({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.7071 1.70711C14.0976 1.31658 14.0976 0.683418 13.7071 0.292893C13.3166 -0.0976311 12.6834 -0.0976311 12.2929 0.292893L7 5.58579L1.70711 0.292893C1.31658 -0.097631 0.683418 -0.097631 0.292893 0.292893C-0.097631 0.683418 -0.097631 1.31658 0.292893 1.70711L5.58579 7L0.292893 12.2929C-0.097631 12.6834 -0.097631 13.3166 0.292893 13.7071C0.683418 14.0976 1.31658 14.0976 1.70711 13.7071L7 8.41421L12.2929 13.7071C12.6834 14.0976 13.3166 14.0976 13.7071 13.7071C14.0976 13.3166 14.0976 12.6834 13.7071 12.2929L8.41421 7L13.7071 1.70711Z"
        fill="#A2ABB9"
      />
    </svg>
  );
}
