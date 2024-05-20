import { forwardRef, useEffect, useRef, useState } from 'react';
import { create } from 'zustand';
import TextField from '/src/components/CustomFormTexField';
import CustomInput from '/src/components/CustomInput';
import * as z from 'zod';
import { useForm, Controller } from 'react-hook-form';
import * as RSelect from '@radix-ui/react-select';
import Chevron from '/public/assets/icons/studentDetail/chevron.svg';
import { countries } from '/src/constants/countries';
import { zodResolver } from '@hookform/resolvers/zod';
import Dialog from '/src/components/atoms/Dialog';
import { useSession } from 'next-auth/react';
import ApiClient from '../services/ApiClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Transition } from '@headlessui/react';
import Plus from '/public/assets/icons/studentDetail/plus.svg';
import Sheet from '/src/components/atoms/Sheet';
import Mail from '/public/assets/icons/studentDetail/mail.svg';
import Phone from '/public/assets/icons/studentDetail/phone.svg';
import { GuardianQuery } from '../hooks/useSearch';
import { useRouter } from 'next/router';
import * as Sentry from '@sentry/nextjs';
import { useSelectedSchool, useSelectedSchoolId } from '../guards/AuthGuard';
import ErrorToast from './ErrorToast';
import Combobox from './molecules/dashboard/Combobox';
import Person from 'public/assets/images/person.svg';
import SearchIcon from '/public/assets/icons/ic_search.svg';
import { cn } from '../utils/cn';
import Skeleton from './molecules/dashboard/Skeleton';
import { AssignGuardianAPI } from '../services/Api';
import { useSendTrackEvent } from '@cometa/utils';

interface DrawerState {
  isOpen: boolean;
  selectedTab: 'search' | 'create' | null;
  guardian: Partial<Guardian.Guardian> | null;
  disabled: boolean;
  guardianFound: boolean;
  studentGuardians: Partial<Guardian.Guardian>[] | null;
}

interface DrawerStore extends DrawerState {
  setState: (state: Partial<DrawerState>) => void;
  setDisabled: (state: boolean) => void;
  setGuardian: (guardian: Partial<Guardian.Guardian> | null) => void;
  setOpen: (state: boolean) => void;
}

const InitialDrawerState: DrawerState = {
  isOpen: false,
  selectedTab: null,
  guardian: null,
  disabled: true,
  guardianFound: false,
  studentGuardians: null,
};

export const useDrawerStore = create<DrawerStore>((set) => ({
  ...InitialDrawerState,
  setState: (state) => set(state),
  setDisabled: (state) => set({ disabled: state }),
  setGuardian: (guardian) => set({ guardian }),
  setOpen: (state) => set({ isOpen: state }),
}));

const useSetDisabled = () => useDrawerStore((state) => state.setDisabled);
export const useGuardian = () =>
  useDrawerStore((state) => [state.guardian, state.setGuardian]) as [
    DrawerState['guardian'],
    DrawerStore['setGuardian']
  ];
export const useSetOpen = () => useDrawerStore((state) => state.setOpen);
export const useSetDrawerState = () => useDrawerStore((state) => state.setState);
const useStudentGuardians = () => useDrawerStore((state) => state.studentGuardians);

type CreateGuardianViewProps = {
  onSubmit: (data: any) => void;
};

const schema = z.object({
  firstName: z.string().min(1, 'Falta completar este campo'),
  lastName: z.string().min(1, 'Falta completar este campo'),
  email: z.string({ required_error: 'Falta completar este campo' }).email('Ingresa una direccion de correo válida'),
  countryCode: z.string(),
  phone: z.string().min(8, 'Falta completar este campo').max(10, 'Ingresa un número de teléfono válido'),
  gender: z.string(),
});

export type FormValues = z.infer<typeof schema>;

let errorsTriggered = false;

const CreateGuardianView = forwardRef<HTMLFormElement, CreateGuardianViewProps>(({ onSubmit }, ref) => {
  const setDisabled = useSetDisabled();
  const {
    register,
    control,
    formState: { isValid, errors },
    handleSubmit,
    watch,
  } = useForm<FormValues>({
    defaultValues: { countryCode: '52' },
    resolver: zodResolver(schema),
    mode: 'all',
    reValidateMode: 'onChange',
  });

  if (!isValid && !errorsTriggered) {
    setDisabled(true);
    errorsTriggered = true;
  } else if (errorsTriggered && isValid) {
    setDisabled(false);
    errorsTriggered = false;
  }

  return (
    <form className="col-span-2 space-y-8" ref={ref} onSubmit={handleSubmit(onSubmit)}>
      <TextField label="Nombre" error={errors.firstName?.message} value={watch('firstName')}>
        <CustomInput {...register('firstName')} type="text" />
      </TextField>
      <TextField label="Apellidos" error={errors.lastName?.message} value={watch('lastName')}>
        <CustomInput {...register('lastName')} type="text" />
      </TextField>
      <TextField label="Correo electrónico" error={errors.email?.message} value={watch('email')}>
        <CustomInput {...register('email')} type="text" />
      </TextField>
      <div className="flex">
        <Controller
          control={control}
          name="countryCode"
          render={({ field: { onChange, value, ref } }) => (
            <RSelect.Root onValueChange={onChange} value={value} defaultValue="52">
              <RSelect.Trigger
                data-error={Boolean(errors.phone)}
                ref={ref}
                className="relative group appearance-none border border-[#919EAB52] data-[error=true]:border-[#FF4842] rounded-l-xl p-4 flex justify-between bg-transparent items-center"
              >
                <label className="absolute -top-2.5 left-3.5 bg-white text-[#919EAB] group-[[data-error=true]]:text-[#FF4842] text-xs">
                  País
                </label>
                <RSelect.Value>+{value}</RSelect.Value>
                <Chevron className="text-[#637381] w-3 ml-16" />
              </RSelect.Trigger>
              <RSelect.Portal>
                <RSelect.Content className="p-4 z-[9999] bg-white rounded-lg shadow-md">
                  <RSelect.Viewport className="space-y-2">
                    {countries.map((country) => (
                      <RSelect.Item
                        className="data-[state=checked]:bg-gray-100 rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                        key={`${country.label}_${country.code}`}
                        value={country.phone}
                      >
                        <RSelect.ItemText>{country.phone}</RSelect.ItemText>
                      </RSelect.Item>
                    ))}
                  </RSelect.Viewport>
                </RSelect.Content>
              </RSelect.Portal>
            </RSelect.Root>
          )}
        />

        <TextField
          error={errors.phone?.message}
          label="Teléfono"
          className="flex-1 rounded-l-none"
          value={watch('phone')}
          errorClassNames="-left-1/3"
        >
          <CustomInput {...register('phone')} type="number" />
        </TextField>
      </div>
      <div className="flex flex-col space-y-5">
        <h5 className="text-sm font-bold">Sexo:</h5>
        <label className="flex items-center text-sm">
          <input
            {...register('gender')}
            type="radio"
            value="m"
            className="mr-2 w-5 h-5 appearance-none rounded-full transition-colors p-0.5 border-[#212B36] border-2 checked:before:rounded-full checked:border-green checked:before:block checked:before:content-[''] checked:before:w-full checked:before:h-full checked:before:bg-green focus:ring-0"
          />
          Masculino
        </label>
        <label className="flex items-center text-sm">
          <input
            {...register('gender')}
            type="radio"
            value="f"
            className="mr-2 w-5 h-5 appearance-none rounded-full transition-colors p-0.5 border-[#212B36] border-2 checked:before:rounded-full checked:border-green checked:before:block checked:before:content-[''] checked:before:w-full checked:before:h-full checked:before:bg-green focus:ring-0"
          />
          Femenino
        </label>
      </div>
    </form>
  );
});

const AssignGuardianView = () => {
  const [guardian, setGuardian] = useGuardian();
  const studentGuardians = useStudentGuardians();
  const setDisabled = useSetDisabled();
  const { data: session } = useSession();
  const selectedSchoolId = useSelectedSchoolId();

  const onSelectGuardian = (selectedGuardian: GuardianQuery['results'][number]) => {
    setDisabled(false);
    setGuardian(selectedGuardian);
  };

  const [query, setQuery] = useState('');

  const getPayersOnSchool = async (search: string) => {
    const guardiansOnSchool = await ApiClient.getGuardiansOnSchool(session?.token, selectedSchoolId, search);
    if (studentGuardians) {
      return guardiansOnSchool?.data?.results.filter(
        (item: Record<string, any>) => !studentGuardians.find((el) => el.id === item.id)
      ) as GuardianQuery['results'];
    }
    return guardiansOnSchool?.data?.results as GuardianQuery['results'];
  };

  const { data: comboboxData, isFetching } = useQuery<GuardianQuery['results']>(
    ['guardians_on_school', selectedSchoolId, query],
    () => getPayersOnSchool(query),
    {
      keepPreviousData: true,
    }
  );

  const { data, isLoading, isError } = useQuery<Guardian.Guardian>({
    queryFn: async () => {
      const req = await ApiClient.getGuardian(session?.token, selectedSchoolId, guardian?.id);
      return req.data;
    },
    queryKey: ['guardian_students', guardian?.id],
    enabled: Boolean(guardian),
  });

  const students = data?.dependents;

  return (
    <Sentry.ErrorBoundary
      beforeCapture={(scope) => {
        scope.setContext('state', {
          students,
          guardian,
          session,
          selectedSchoolId,
        });
      }}
    >
      <ErrorToast message="Ocurrió un error inesperado, por favor intenta de nuevo." show={isError} />
      <div className="col-span-2">
        {!guardian && (
          <Transition
            appear
            show={Boolean(!guardian)}
            enter="transition-opacity duration-75"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Combobox.Root
              classNames="relative flex flex-row items-center w-full outline-none border border-[#919EAB52] rounded-lg"
              icon={<SearchIcon />}
            >
              <>
                <Combobox.Input
                  classNames="py-4 border-none text-base placeholder:text-[#919EAB] rounded-r-lg w-full active:outline-none focus:outline-none peer focus:ring-0"
                  placeholder="Nombre o apellido"
                  onChange={(e) => setQuery(e.target.value)}
                />
                <Combobox.Options classNames="absolute z-10 flex flex-col w-full px-3 py-4 mt-1 text-base list-none bg-white rounded-md shadow-lg top-full max-h-60 focus:outline-none sm:text-sm">
                  <div className="overflow-y-scroll">
                    {comboboxData ? (
                      <>
                        {comboboxData?.map((element: GuardianQuery['results'][number]) => (
                          <>
                            <Combobox.Option value={element}>
                              <li
                                className={cn(
                                  'grid grid-cols-[85%_1fr] gap-2 items-center justify-between w-full p-2 bg-white border-none rounded-lg outline-none hover:bg-gray-200 cursor-pointer active:bg-[#919EAB29]'
                                )}
                                onClick={() => onSelectGuardian(element)}
                              >
                                <div className="flex flex-col items-start font-normal">
                                  <span className="text-base whitespace-nowrap overflow-hidden text-ellipsis max-w-[220px]">
                                    {element.first_name} {element.last_name}
                                  </span>
                                  <span className="text-xs text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis max-w-[220px]">
                                    {element.email}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center bg-[#919EAB29] bg-opacity-[16%] max-w-[56px] rounded-full p-2">
                                  <Person />
                                  <span className="mr-1 text-sm">{element.dependents_count}</span>
                                </div>
                              </li>
                            </Combobox.Option>
                          </>
                        ))}
                      </>
                    ) : (
                      <div className="flex flex-col gap-2 align-center justify-center w-full text-gray-600 h-fit bg-white border-none rounded-lg outline-none hover:bg-gray-200 cursor-pointer active:bg-[#919EAB29]">
                        <Skeleton />
                        <Skeleton />
                      </div>
                    )}
                    {comboboxData?.length === 0 && (
                      <div className="flex flex-col items-start gap-1 p-1 font-normal text-gray-600">
                        <span className="text-base">No se encontraron resultados</span>
                      </div>
                    )}
                    {isFetching ? (
                      <div className="flex py-2 pr-4">
                        <div className="flex flex-col gap-2 align-center justify-center w-full text-gray-600 h-fit bg-white border-none rounded-lg outline-none cursor-pointer active:bg-[#919EAB29]">
                          <Skeleton className="max-w-[250px]" />
                          <Skeleton className="max-w-[250px]" />
                        </div>
                        <div className="h-10 w-14 rounded-full bg-gradient-to-r from-[#DFDFDF3D] to-[#AFAFAF52] transition-colors animate-pulse" />
                      </div>
                    ) : (
                      <div className="min-h-[40px]" />
                    )}
                  </div>
                </Combobox.Options>
              </>
            </Combobox.Root>
          </Transition>
        )}
        {guardian && (
          <Transition
            appear
            show={Boolean(guardian)}
            enter="transition-opacity duration-75"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="rounded-lg border border-[#3366FF] py-5 px-9 items-start grid grid-cols-[1fr_auto] mb-6">
              <h4 className="col-start-1 mb-2 text-sm font-bold">
                {guardian?.first_name} {guardian?.last_name}
              </h4>
              <div className="col-span-1 col-start-1 flex items-center divide-x divide-[#DFE3E8]">
                <a className="flex items-center pr-4 text-xs">
                  <Mail className="w-4 mr-2 text-[#98A2B3]" /> {guardian?.email}
                </a>
                <a className="flex items-center pl-4 text-xs">
                  <Phone className="w-4 mr-2 text-[#98A2B3]" />
                  {guardian?.phone}
                </a>
              </div>
              <button
                className="col-start-2 row-start-1 bg-transparent justify-self-end"
                onClick={() => {
                  setGuardian(null);
                  setDisabled(true);
                }}
              >
                <Plus className="rotate-45 text-[#212B36] w-4" />
              </button>
            </div>

            {!isLoading && (
              <div className="rounded-lg bg-[#3366FF] bg-opacity-8 py-5 px-6">
                <h4 className="text-[#637381] font-bold mb-4">Alumnos asignados</h4>
                <ul className="space-y-2">
                  {students?.map((student) => (
                    <li className="text-sm text-[#212B36] flex items-center" key={student.id}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-2 h-2 mr-1" fill="none" viewBox="0 0 8 9">
                        <circle cx="4" cy="4.00977" r="4" fill="#36F" />
                      </svg>
                      {student.first_name} {student.last_name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Transition>
        )}
      </div>
    </Sentry.ErrorBoundary>
  );
};

interface GuardianDrawerProps {
  sendGuardianData?: any;
  onClose?: (exit?: boolean) => void;
  student?: any;
  onCancel?: () => void;
  handleCreateStudent?: (guardianId: string | null) => Promise<void>;
  studentId?: string | null;
  isMutating?: boolean;
}

const GuardianDrawer = ({ sendGuardianData }: GuardianDrawerProps) => {
  const { isOpen, setState } = useDrawerStore();

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) setState(InitialDrawerState);
      }}
    >
      <Sheet.Content>
        <DrawerView sendGuardianData={sendGuardianData} />
      </Sheet.Content>
    </Sheet>
  );
};

export const DrawerView = ({
  onClose,
  student,
  onCancel,
  handleCreateStudent,
  studentId,
  isMutating,
}: GuardianDrawerProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const { data: session } = useSession();
  const { setState, selectedTab, guardianFound, guardian, disabled } = useDrawerStore();
  const router = useRouter();
  const selectedSchool = useSelectedSchool();
  const queryClient = useQueryClient();
  const setDrawerState = useSetDrawerState();
  const sendTrackEvent = useSendTrackEvent();

  const assignGuardianEventHandler = () => {
    sendTrackEvent('dashboard: New Student Parent Assigned', session);
  };

  const assignGuardianMutation = useMutation({
    mutationFn: ({ guardianId, studentId }: any) =>
      ApiClient.assignGuardianToStudent(session?.token, studentId, guardianId),
    onSuccess: () => {
      if (student) {
        setTimeout(() => {
          if (onClose) onClose(true);
        }, 3000);
        router.push(`/student/detail/${studentId}`);
      }
      assignGuardianEventHandler();
      queryClient.invalidateQueries({ queryKey: ['student_detail'] });
      setState({
        isOpen: false,
        guardian: null,
        guardianFound: false,
      });
    },
    onMutate: () => {
      setState({ disabled: true });
    },
    onError: (err) => {
      Sentry.captureException(err);
      setState({ guardian: null, disabled: false, guardianFound: false });
    },
  });

  const CreateTutorMutation = useMutation({
    mutationFn: (parsedValues: {
      phone: string;
      first_name: string;
      last_name: string;
      email: string;
      gender: string;
      studentId?: string | null;
    }) => {
      const studentId = parsedValues.studentId;
      delete parsedValues.studentId;
      return AssignGuardianAPI.createAndAssignGuardian(
        session?.token ?? '',
        selectedSchool?.id ?? '',
        studentId ?? '',
        parsedValues
      );
    },
    onSuccess: (res: any) => {
      if (res === 'GUARDIAN_CREATED') {
        setTimeout(() => {
          onClose?.();
        }, 3000);
        assignGuardianEventHandler();
        queryClient.invalidateQueries({ queryKey: ['student_detail'] });
        setDrawerState({
          isOpen: false,
          guardian: null,
          selectedTab: null,
          disabled: true,
        });
        if (student) router.push(`/student/detail/${studentId}`);
      } else {
        setDrawerState({
          guardian: {
            id: res.id,
            first_name: res.first_name,
            last_name: res.last_name,
            email: res.email,
            phone: res.phone,
          },
          guardianFound: true,
          // disabled: res.dependents.find((d) => d.id === studentId) ? true : false,
        });
      }
    },
  });

  const schema = z.object({
    firstName: z.string().min(1, 'Falta completar este campo'),
    lastName: z.string().min(1, 'Falta completar este campo'),
    email: z.string({ required_error: 'Falta completar este campo' }).email('Ingresa una direccion de correo válida'),
    countryCode: z.string(),
    phone: z.string().min(8, 'Falta completar este campo').max(10, 'Ingresa un número de teléfono válido'),
    gender: z.string(),
    studentId: z.string(),
  });
  type FormValues = z.infer<typeof schema>;

  const sendGuardianData = (data: FormValues) => {
    const parsedValues = {
      phone: `+${data.countryCode}${data.phone}`,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      gender: data.gender,
      studentId: studentId ?? router.query.studentId?.toString() ?? '',
    };
    CreateTutorMutation.mutate(parsedValues);
  };

  const submitDrawer = async () => {
    if (selectedTab === 'search') {
      if (router.query.studentId) {
        await assignGuardianMutation.mutateAsync({
          guardianId: guardian?.id,
          studentId: router.query.studentId?.toString(),
        });
      } else {
        await handleCreateStudent?.(guardian?.id || null);
      }
    } else {
      await handleCreateStudent?.(null);
      formRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };

  useEffect(() => {
    if (studentId) {
      formRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  }, [studentId]);

  return (
    <section className="flex flex-col flex-1">
      <Sentry.ErrorBoundary
        beforeCapture={(scope) => {
          scope.setContext('state', {
            guardianFound,
            guardian,
            disabled,
            studentId,
            session,
            formRef,
          });
        }}
      >
        <ErrorToast
          message="Ocurrió un error inesperado, por favor intenta de nuevo."
          show={assignGuardianMutation.isError}
          onClose={() => setState({ ...InitialDrawerState, isOpen: true })}
        />
        <div className="flex-1 p-8 grid grid-cols-[1fr_.3fr] items-center gap-6 auto-rows-min">
          <h4 className="text-[#212B36] text-xl col-start-1 font-bold">Asignar tutor</h4>

          {onClose ? (
            <button className="col-start-2 bg-transparent justify-self-end" onClick={() => onClose?.()}>
              <Plus className="rotate-45 text-[#637381] w-4" />
            </button>
          ) : (
            <Dialog.Close className="col-start-2 bg-transparent justify-self-end">
              <Plus className="rotate-45 text-[#637381] w-4" />
            </Dialog.Close>
          )}

          <div className="grid grid-cols-2 col-span-2 gap-6">
            <span className="col-span-2 text-[#637381] text-sm">¿Cómo quieres asignar el tutor?</span>
            <label
              className="select-none cursor-pointer hover:bg-gray-100 transition-colors flex items-center rounded-lg data-[selected=true]:border-green border border-[#DFE3E8] p-4"
              data-selected={selectedTab === 'search'}
            >
              Buscar un tutor existente
              <input
                type="radio"
                className="ml-6 w-5 h-5 appearance-none rounded-full transition-colors p-0.5 border-[#212B36] border-2 checked:before:rounded-full checked:border-green checked:before:block checked:before:content-[''] checked:before:w-full checked:before:h-full checked:before:bg-green focus:ring-0"
                checked={selectedTab === 'search'}
                onChange={() => {
                  setState({ selectedTab: 'search', disabled: !disabled ? true : disabled });
                }}
              />
            </label>
            <label
              className="select-none cursor-pointer hover:bg-gray-100 transition-colors flex items-center rounded-lg data-[selected=true]:border-green border border-[#DFE3E8] p-4"
              data-selected={selectedTab === 'create'}
            >
              Registrar un nuevo tutor
              <input
                type="radio"
                className="ml-6 w-5 h-5 appearance-none rounded-full transition-colors p-0.5 border-[#212B36] border-2 checked:before:rounded-full checked:border-green checked:before:block checked:before:content-[''] checked:before:w-full checked:before:h-full checked:before:bg-green focus:ring-0"
                data-testid="createGuardianRadio"
                checked={selectedTab === 'create'}
                onChange={() => {
                  setState({ selectedTab: 'create', disabled: !disabled ? true : disabled });
                }}
              />
            </label>
          </div>

          <Dialog.Root
            open={guardianFound}
            position="right"
            onOpenChange={(state) => setState({ guardianFound: state })}
          >
            <Dialog.Title>¡Parece que ya existe un tutor con esos datos!</Dialog.Title>
            <Dialog.Description>
              No se pueden registrar 2 tutores con el mismo correo o número de teléfono.
            </Dialog.Description>
            <div className="rounded-lg border bg-[#1890FF14] py-5 px-6 items-start grid grid-cols-[1fr_auto] mb-6">
              <h4 className="col-start-1 mb-2 font-bold text-left">
                {guardian?.first_name} {guardian?.last_name}
              </h4>
              <div className="flex items-center col-span-1 col-start-1 space-x-6">
                <a className="flex items-center text-sm">
                  <Mail className="w-4 mr-2 text-[#98A2B3]" /> {guardian?.email}
                </a>
                <a className="flex items-center text-sm">
                  <Phone className="w-4 mr-2 text-[#98A2B3]" />
                  {guardian?.phone}
                </a>
              </div>
            </div>
            <div className="flex justify-center gap-x-10">
              <Dialog.Close className="text-[#637381] bg-transparent font-bold	py-2 px-8 text-sm	hover:opacity-90 whitespace-nowrap">
                Atrás
              </Dialog.Close>
              <button
                className="text-white  font-bold	py-2 px-8 rounded-lg	text-sm	hover:opacity-90  whitespace-nowrap bg-green shadow-[0_8px_16px_#00AB553D]"
                onClick={() => setState({ selectedTab: 'search', guardianFound: false })}
              >
                Ver tutor
              </button>
            </div>
          </Dialog.Root>
          {selectedTab === 'create' && <CreateGuardianView onSubmit={sendGuardianData} ref={formRef} />}
          {selectedTab === 'search' && <AssignGuardianView />}
        </div>
        <div className="p-8 border-t-[#919EAB3D] border grid grid-cols-2 gap-5">
          {onCancel ? (
            <button
              className="p-3 font-bold bg-transparent rounded-lg text-green"
              onClick={() => {
                onCancel?.();
              }}
            >
              Atrás
            </button>
          ) : (
            <Dialog.Close className="p-3 font-bold bg-transparent rounded-lg text-green">Atrás</Dialog.Close>
          )}
          <button
            disabled={disabled || isMutating}
            onClick={submitDrawer}
            className="bg-green hover:bg-[#007B55] p-3 text-white rounded-lg disabled:text-[#919EABCC] disabled:bg-[#919EAB3D]"
          >
            {selectedTab === 'create' ? 'Crear y Asignar' : 'Asignar'}
          </button>
        </div>
      </Sentry.ErrorBoundary>
    </section>
  );
};

export default GuardianDrawer;
