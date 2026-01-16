import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@cometa/recreo/v2';
import { AlertTriangleIcon, XIcon, TrashIcon } from 'lucide-react';
import Sheet from '/src/components/atoms/Sheet';
import { api } from '/src/utils/api';
import * as Sentry from '@sentry/nextjs';
import useAlert from '/src/hooks/useAlert';
import { TEACHER_ROLE_KEY } from '/src/constants/memberships';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { TeacherProfileEntity } from '@cometa/trpc/src/students/types';
import { useRouter } from 'next/router';
import { Membership, MembershipPermissionsResponseDTO, UserDTO } from '@cometa/trpc';
import { UserResponse } from '@cometa/trpc/src/auth/types';

const newUserToAddId = 'new_user_to_add_id';

const teacherFormSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  email: z.string().email('Email inválido').min(1, 'El email es requerido'),
  role: z.string().min(1, 'El rol es requerido'),
  membershipId: z.string().default(newUserToAddId),
});

type TeacherFormData = z.infer<typeof teacherFormSchema>;

export const ROLE_OPTIONS = [
  { value: 'Titular' },
  { value: 'Suplente' },
  { value: 'Coordinador' },
  { value: 'Auxiliar' },
];

type TeacherDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherProfile?: TeacherProfileEntity;
  user?: UserDTO;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
  onSubmit?: (data: TeacherFormData) => void;
  isSubmitting?: boolean;
  additionalAction?: React.ReactNode;
};

export function NewTeacherDrawer({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const utils = api.useUtils();
  const { setAlertState } = useAlert();
  const router = useRouter();
  const userCreateMutation = api.auth.createUser.useMutation();
  const updateUserPermissionsMutation = api.schools.updateUserPermissions.useMutation();
  const teacherProfileCreateMutation = api.students.createTeacherProfile.useMutation({
    onSuccess: (teacher) => {
      setAlertState({
        open: true,
        severity: 'success',
        message: 'Maestro creado exitosamente',
      });
      utils.students.listTeacherProfiles.invalidate();
      utils.schools.getUsers.invalidate();
      onOpenChange(false);
      onSuccess?.();
      router.push(`/academic/teachers/${teacher?.id}`);
    },
  });
  const selectedSchool = useSelectedSchool();

  function getTeacherPermissions(defaultPermissions: Membership): Membership {
    // by default all permissions are false for new teachers
    const permissions: Membership = {};
    Object.keys(defaultPermissions)
      .filter((k) => k.startsWith('can_'))
      .forEach((k) => {
        permissions[k as keyof Membership] = false;
      });

    return permissions;
  }

  type CreateUserResult = {
    user: UserResponse;
    membership: MembershipPermissionsResponseDTO;
  };

  async function createNewUser(data: TeacherFormData): Promise<CreateUserResult | undefined> {
    const user = await userCreateMutation.mutateAsync({
      school_id: selectedSchool?.id as string,
      membership: TEACHER_ROLE_KEY,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
    });
    if (!user?.id) {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Error en la creación del usuario',
      });
      return;
    }
    data.membershipId = user.id;

    const membership = await utils.schools.getUserPermissions.fetch({
      school_id: selectedSchool?.id as string,
      user_id: user.id,
    });
    if (!membership) {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Error al obtener los permisos del usuario',
      });
      return;
    }

    await updateUserPermissionsMutation.mutateAsync({
      school_id: selectedSchool?.id as string,
      user_id: user.id,
      data: getTeacherPermissions(membership),
    });

    return {
      user,
      membership,
    };
  }

  async function handleSubmit(data: TeacherFormData) {
    if (!selectedSchool?.id) {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Colegio invalido',
      });
      return;
    }

    try {
      if (data.membershipId === newUserToAddId) {
        const result = await createNewUser(data);
        if (!result?.membership.id) {
          setAlertState({
            open: true,
            severity: 'error',
            message: 'Error en la creación de la nueva membresía',
          });
          return;
        }
        data.membershipId = result.membership.id;
      }

      await teacherProfileCreateMutation.mutateAsync({
        membership_id: data.membershipId,
        role: data.role,
      });
    } catch (error) {
      Sentry.captureException(error);
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Error en la creación del maestro',
      });
    }
  }

  return (
    <TeacherFormDrawer
      open={open}
      onOpenChange={onOpenChange}
      mode="create"
      onSubmit={handleSubmit}
      isSubmitting={teacherProfileCreateMutation.isPending || userCreateMutation.isPending}
    />
  );
}

function DeleteTeacherAction({ teacher }: { teacher?: TeacherProfileEntity }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const utils = api.useUtils();
  const { setAlertState } = useAlert();
  const router = useRouter();

  const { data: countResult } = api.students.countClassroomTeacherAssignments.useQuery(
    {
      membership_id: teacher?.membership_id,
    },
    { enabled: !!teacher?.membership_id }
  );
  const assignmentCount = countResult?.count ?? 0;
  const canDelete = assignmentCount === 0;
  const deleteTeacherMutation = api.students.deleteTeacher.useMutation({
    onSuccess: () => {
      setShowDeleteDialog(false);
      router.push('/academic/teachers').then(() => {
        utils.students.listTeacherProfiles.invalidate();
      });
      setAlertState({
        open: true,
        severity: 'success',
        message: 'Maestro eliminado correctamente',
      });
    },
    onError: () => {
      setShowDeleteDialog(false);
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Error al eliminar el maestro',
      });
    },
  });

  function handleDelete() {
    if (teacher?.id) {
      deleteTeacherMutation.mutate({
        id: teacher.id,
      });
    }
  }

  function DeleteContent() {
    return (
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Quieres eliminar este maestro?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará junto con toda su información asociada. Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
            Sí, eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    );
  }

  function DeletionNotAllowedContent() {
    return (
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>El maestro no puede ser eliminado</AlertDialogTitle>
          <AlertDialogDescription>
            El maestro cuenta con {assignmentCount} {assignmentCount > 1 ? 'clases asignadas' : 'clase asignada'}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cerrar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    );
  }

  return (
    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <TrashIcon size={14} />
          Eliminar maestro
        </Button>
      </AlertDialogTrigger>
      {canDelete ? <DeleteContent /> : <DeletionNotAllowedContent />}
    </AlertDialog>
  );
}

export function EditTeacherDrawer({
  open,
  onOpenChange,
  teacherProfile,
  user,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherProfile?: TeacherProfileEntity;
  user?: UserDTO;
  onSuccess?: () => void;
}) {
  const utils = api.useUtils();
  const { setAlertState } = useAlert();

  const updateTeacherMutation = api.students.updateTeacher.useMutation({
    onSuccess: () => {
      onOpenChange(false);
      utils.students.getTeacherProfile.invalidate();
      utils.students.listTeacherProfiles.invalidate();
      setAlertState({
        open: true,
        severity: 'success',
        message: 'Maestro actualizado exitosamente',
      });
      onSuccess?.();
    },
    onError: (error) => {
      Sentry.captureException(error);
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Error al actualizar el maestro',
      });
    },
  });

  function handleSubmit(data: TeacherFormData) {
    if (!teacherProfile?.id) {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Información inválida para actualizar el maestro',
      });
      return;
    }

    updateTeacherMutation.mutate({
      id: teacherProfile.id,
      role: data.role,
    });
  }

  return (
    <TeacherFormDrawer
      open={open}
      onOpenChange={onOpenChange}
      teacherProfile={teacherProfile}
      user={user}
      mode="edit"
      additionalAction={<DeleteTeacherAction teacher={teacherProfile} />}
      onSubmit={handleSubmit}
      isSubmitting={updateTeacherMutation.isPending}
    />
  );
}

function TeacherFormDrawer({
  open,
  onOpenChange,
  teacherProfile,
  user,
  mode,
  onSubmit,
  isSubmitting = false,
  additionalAction,
}: TeacherDrawerProps) {
  const isEditMode = mode === 'edit';
  const title = isEditMode ? 'Editar maestro' : 'Nuevo maestro';

  const defaultValues = useMemo(
    () => ({
      firstName: user?.first_name ?? '',
      lastName: user?.last_name ?? '',
      email: user?.email ?? '',
      role: teacherProfile?.role ?? '',
      membershipId: teacherProfile?.membership_id ?? '',
    }),
    [teacherProfile, user]
  );

  const form = useForm<TeacherFormData>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  const { reset } = form;

  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, reset, defaultValues]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.Content className="max-h-[calc(100vh-16px)] h-full m-2 rounded-2xl font-lota antialiased overflow-hidden shadow-[0px_20px_40px_-4px_rgba(145,158,171,0.16)]">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button onClick={() => onOpenChange(false)} className="text-gray-400 hover:text-gray-600">
              <XIcon size={20} />
            </button>
          </div>

          <FormProvider {...form}>
            <TeacherForm
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
              onCancel={() => onOpenChange(false)}
              isEditMode={isEditMode}
              additionalAction={additionalAction}
            />
          </FormProvider>
        </div>
      </Sheet.Content>
    </Sheet>
  );
}

function TeacherForm({
  onSubmit,
  isSubmitting,
  onCancel,
  isEditMode = false,
  additionalAction,
}: {
  onSubmit?: (data: TeacherFormData) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  isEditMode?: boolean;
  additionalAction?: React.ReactNode;
}) {
  const selectedSchool = useSelectedSchool();
  const {
    control,
    handleSubmit,
    formState: { errors, isValid: isFormValid },
    watch,
    setValue,
  } = useFormContext<TeacherFormData>();
  const watchedFields = watch();

  const {
    data: existingUser,
    refetch: refetchGetUserByEmail,
    isFetching: isGetUserByEmailFetching,
  } = api.schools.getUserByEmail.useQuery(
    {
      email: watchedFields.email,
      school_id: selectedSchool?.id as string,
    },
    {
      enabled: !isEditMode && !!selectedSchool?.id && !!watchedFields.email,
      retry: (_, err) => err.data?.httpStatus !== 404,
    }
  );

  const { data: existingMembership, refetch: refetchGetExistingMembership } = api.schools.getUserPermissions.useQuery(
    {
      school_id: selectedSchool?.id as string,
      user_id: existingUser?.id as string,
    },
    {
      enabled: !!existingUser?.id,
      retry: (_, err) => err.data?.httpStatus !== 404,
    }
  );

  const { data: teacherProfileList, isFetching: isExistingTeacherFetching } = api.students.listTeacherProfiles.useQuery(
    {
      membership_id: existingMembership?.id,
    },
    {
      enabled: !isEditMode && !!existingMembership?.id,
    }
  );
  const existingTeacherProfile = existingMembership ? teacherProfileList?.[0] : undefined;

  useEffect(() => {
    if (!isEditMode) {
      refetchGetUserByEmail();
    }
  }, [watchedFields.email, refetchGetUserByEmail, isEditMode]);

  useEffect(() => {
    if (!isEditMode) {
      refetchGetExistingMembership();
    }
  }, [existingMembership, refetchGetExistingMembership, isEditMode]);

  useEffect(() => {
    if (!isEditMode) {
      setValue('membershipId', existingMembership?.id ?? newUserToAddId);
    }
  }, [existingMembership, setValue, isEditMode]);

  function handleFormSubmit(data: TeacherFormData) {
    onSubmit?.(data);
  }

  const disabledByUserValidation =
    !isEditMode && (isGetUserByEmailFetching || isExistingTeacherFetching || !!existingTeacherProfile);
  const submitButtonText = isEditMode ? 'Guardar cambios' : 'Crear maestro';

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col flex-1">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-900 mb-2">Datos del maestro</h3>

        <div className="flex flex-col gap-1">
          <Label htmlFor="firstName">Nombres</Label>
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="firstName"
                placeholder="Nombres"
                disabled={isEditMode}
                className={errors.firstName ? 'border-red-500' : ''}
              />
            )}
          />
          {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="lastName">Apellidos</Label>
          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="lastName"
                placeholder="Apellidos"
                disabled={isEditMode}
                className={errors.lastName ? 'border-red-500' : ''}
              />
            )}
          />
          {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="email">Email</Label>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="email"
                type="email"
                placeholder="email@ejemplo.com"
                disabled={isEditMode}
                className={errors.email ? 'border-red-500' : ''}
              />
            )}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="role">Rol</Label>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="role" className={errors.role ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
        </div>

        {!isEditMode && existingTeacherProfile ? (
          <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangleIcon className="w-8 h-8 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-600">
                Ya existe un maestro con el mismo correo electrónico. Para crear otro maestro, por favor, ingresa un
                correo electrónico diferente.
              </span>
            </div>
          </div>
        ) : null}
        {additionalAction && <div>{additionalAction}</div>}
      </div>

      <div className="flex items-center justify-between gap-3 p-6">
        <div className="flex items-center gap-3 ml-auto">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="neutral" disabled={isSubmitting || !isFormValid || disabledByUserValidation}>
            {isSubmitting ? 'Procesando...' : submitButtonText}
          </Button>
        </div>
      </div>
    </form>
  );
}
