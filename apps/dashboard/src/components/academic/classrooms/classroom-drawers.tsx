import { useState, useEffect, ReactNode, useMemo } from 'react';
import { useRouter } from 'next/router';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxInput,
  ComboboxList,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
  RadioGroup,
  RadioCard,
  Input,
} from '@cometa/recreo/v2';
import { XIcon, TrashIcon, AlertTriangleIcon } from 'lucide-react';
import Sheet from '/src/components/atoms/Sheet';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { api } from '/src/utils/api';
import { ClassroomEntity, CourseEntity } from '@cometa/trpc/src/students/types';
import { GradeEntity, GroupEntity } from '@cometa/trpc/src/students/types-mapping';
import { useSchoolCycleSelector } from '../../organisms/dashboard/SchoolCycleSelector';
import useAlert from '/src/hooks/useAlert';
import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';
import { useGetTeacherProfiles } from '../hooks';

enum ClassroomFormStepEnum {
  ClassroomTypeSelection = 'classroom_type_selection',
  FillForm = 'fill_form',
}

enum ClassroomTypeEnum {
  Group = 'group',
  Level = 'level',
  MultiLevel = 'multi_level',
}

const newCourseToAddId = 'new_course_to_add';

const classroomFormSchema = z
  .object({
    courseGroupId: z.string().min(1, 'El campo formativo es requerido'),
    courseId: z.string().min(1, 'La materia es requerido'),
    levelId: z.string().min(1, 'El nivel es requerido'),
    gradeId: z.string(),
    groupId: z.string(),
    type: z.nativeEnum(ClassroomTypeEnum).default(ClassroomTypeEnum.Group),
    variant: z.string().optional(),
    membershipId: z.string().optional(),
  })
  .superRefine((payload, ctx) => {
    if (payload.type === ClassroomTypeEnum.Group) {
      if (!payload.gradeId || payload.gradeId.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'El grado es requerido',
          path: ['gradeId'],
        });
      }
      if (!payload.groupId || payload.groupId.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'El grupo es requerido',
          path: ['groupId'],
        });
      }
    }
  });

type ClassroomFormData = z.infer<typeof classroomFormSchema>;

type NewClassroomDataType = ClassroomFormData & { newCourseName?: string };

type ClassroomDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classroom?: ClassroomEntity;
  mode: 'create' | 'edit';
  additionalAction?: ReactNode;
  onSubmit?: (data: NewClassroomDataType) => void;
  isSubmitting?: boolean;
  initialStepFrom?: ClassroomFormStepEnum;
};

function prettifyCourseName(name: string) {
  return name
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function DeleteClassroomAction({
  classroom,
  assignmentCount,
}: {
  classroom?: ClassroomEntity;
  assignmentCount: number;
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const utils = api.useUtils();
  const { setAlertState } = useAlert();
  const router = useRouter();
  const canDelete = assignmentCount === 0;

  const deleteClassroomMutation = api.students.deleteClassroom.useMutation({
    onSuccess: () => {
      setShowDeleteDialog(false);
      router.push('/academic/classrooms').then(() => {
        utils.students.listClassrooms.invalidate();
      });
      setAlertState({
        message: 'Clase eliminada',
        open: true,
        severity: 'success',
      });
    },
    onError: () => {
      setShowDeleteDialog(false);
      setAlertState({
        message: 'Error al eliminar la clase',
        open: true,
        severity: 'error',
      });
    },
  });

  function handleDelete() {
    if (classroom?.id) {
      deleteClassroomMutation.mutate({
        classroom_id: classroom.id,
      });
    }
  }

  function DeleteContent() {
    return (
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Quieres eliminar esta clase?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará junto con toda su información asociada, incluidas calificaciones y registros de estudiantes.
            Esta acción no se puede deshacer.
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
          <AlertDialogTitle>La clase no puede ser eliminada</AlertDialogTitle>
          <AlertDialogDescription>
            Esta clase cuenta con {assignmentCount}{' '}
            {assignmentCount > 1 ? 'estudiantes asignados' : 'estudiante asignado'}.
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
          Eliminar clase
        </Button>
      </AlertDialogTrigger>
      {canDelete ? <DeleteContent /> : <DeletionNotAllowedContent />}
    </AlertDialog>
  );
}

export function NewClassroomDrawer({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const { setAlertState } = useAlert();
  const { activeCycle } = useSchoolCycleSelector();
  const router = useRouter();
  const createClassroomMutation = api.students.createClassroom.useMutation({
    onSuccess: (classroom) => {
      onOpenChange(false);
      router.push(`/academic/classrooms/${classroom?.id}`);
      onSuccess?.();
    },
  });
  const createCourseMutation = api.students.createCourse.useMutation();
  const createTeacherAssignmentMutation = api.students.createClassroomTeacherAssignment.useMutation();

  async function handleSubmit(data: NewClassroomDataType) {
    if (!activeCycle?.id) {
      setAlertState({
        message: 'Ciclo escolar invalido',
        open: true,
        severity: 'error',
      });
      return;
    }

    try {
      if (data.courseId === newCourseToAddId) {
        if (!data.newCourseName) {
          setAlertState({
            open: true,
            severity: 'error',
            message: 'Información invalida para crear la nueva materia',
          });
          return;
        }

        const createdCourse = await createCourseMutation.mutateAsync({
          course_group_id: data.courseGroupId,
          name: data.newCourseName,
        });
        data.courseId = createdCourse?.id as string;
      }

      const classroom = await createClassroomMutation.mutateAsync({
        course_id: data.courseId,
        group_id: data.groupId || undefined,
        level_id: data.groupId ? undefined : data.levelId,
        school_cycle_id: activeCycle.id,
        variant: data.variant,
      });

      if (!classroom?.id) {
        setAlertState({
          open: true,
          severity: 'error',
          message: 'Error al crear la clase. El maestro no pudo ser asignado',
        });
        return;
      }

      if (data.membershipId) {
        await createTeacherAssignmentMutation.mutateAsync({
          classroom_id: classroom.id,
          membership_id: data.membershipId,
        });
      }

      setAlertState({
        message: 'Clase creada exitosamente',
        open: true,
        severity: 'success',
      });
    } catch (error) {
      Sentry.captureException(error);
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Error al crear la nueva clase',
      });
    }

    onOpenChange(false);
  }

  return (
    <FormClassroomDrawer
      open={open}
      onOpenChange={onOpenChange}
      mode="create"
      onSubmit={handleSubmit}
      isSubmitting={createClassroomMutation.isPending}
    />
  );
}

export function EditClassroomDrawer({
  open,
  onOpenChange,
  classroom,
  assignmentCount,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classroom?: ClassroomEntity;
  assignmentCount: number;
}) {
  const utils = api.useUtils();
  const { setAlertState } = useAlert();
  const { data: teacherAssignments = [] } = api.students.listClassroomTeacherAssignments.useQuery(
    {
      classroom_id: classroom?.id as string,
    },
    {
      enabled: !!classroom?.id,
    }
  );
  const { mutateAsync: updateClassroomMutation, isPending: isUpdatingClassroom } =
    api.students.updateClassroom.useMutation({
      onError: (error) => {
        Sentry.captureException(error);
        setAlertState({
          open: true,
          severity: 'error',
          message: 'Error al actualizar la clase',
        });
      },
    });
  const { mutateAsync: deleteTeacherAssignmentMutation, isPending: isDeletingAssignment } =
    api.students.deleteClassroomTeacherAssignment.useMutation({
      onError: (error) => {
        onOpenChange(false);
        Sentry.captureException(error);
        setAlertState({
          open: true,
          severity: 'error',
          message: 'Error al eliminar la asignación de maestro',
        });
      },
    });
  const { mutateAsync: createTeacherAssignmentMutation, isPending: isCreatingAssignment } =
    api.students.createClassroomTeacherAssignment.useMutation({
      onError: (error) => {
        onOpenChange(false);
        Sentry.captureException(error);
        setAlertState({
          open: true,
          severity: 'error',
          message: 'Error al crear la asignación de maestro',
        });
      },
    });

  async function handleSubmit(data: ClassroomFormData) {
    if (!classroom?.id) {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Información inválida para actualizar la clase',
      });
      return;
    }

    await updateClassroomMutation({
      id: classroom.id,
      variant: data.variant,
    });

    const assignmentsToDelete = teacherAssignments.filter(
      (assignment) => assignment.membership_id !== data.membershipId
    );
    await Promise.all(assignmentsToDelete.map((a) => deleteTeacherAssignmentMutation({ id: a.id })));

    const assignedTeacherIds = teacherAssignments.map((assignment) => assignment.membership_id);
    if (data.membershipId && !assignedTeacherIds.includes(data.membershipId)) {
      await createTeacherAssignmentMutation({
        classroom_id: classroom.id,
        membership_id: data.membershipId,
      });
    }

    onOpenChange(false);
    utils.students.getClassroomById.invalidate();
    utils.students.listClassroomTeacherAssignments.invalidate();

    setAlertState({
      open: true,
      severity: 'success',
      message: 'Clase actualizada exitosamente',
    });
  }

  const isSubmitting = isUpdatingClassroom || isDeletingAssignment || isCreatingAssignment;

  return (
    <FormClassroomDrawer
      open={open}
      onOpenChange={onOpenChange}
      classroom={classroom}
      mode="edit"
      additionalAction={<DeleteClassroomAction classroom={classroom} assignmentCount={assignmentCount} />}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}

function ClassroomTypeSelection({ onNext, onCancel }: { onNext: () => void; onCancel: () => void }) {
  const { control } = useFormContext<ClassroomFormData>();

  return (
    <>
      <div className="flex flex-col gap-4 p-6 flex-1">
        <h1 className="font-semibold">Selecciona cómo se impartirá esta clase</h1>
        <p>¿Quieres crear la clase para un grupo específico, para todo un nivel, o compartirla entre varios niveles?</p>

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <RadioGroup value={field.value} className="gap-3" onValueChange={field.onChange}>
              <RadioCard
                value={ClassroomTypeEnum.Group}
                title="Clase por grupo"
                description="Se dicta en un grupo específico de un nivel y grado. Ej.: Matemáticas con 1ºC de Secundaria."
              />

              <RadioCard
                value={ClassroomTypeEnum.Level}
                title="Clase de todo un nivel"
                description="Reúne en una misma clase a estudiantes de distintos grados y/o grupos de un mismo nivel. Ej.: Taller aplicado para todos los grupos de 2º de Secundaria."
              />

              <RadioCard
                disabled
                value={ClassroomTypeEnum.MultiLevel}
                title="Clase multinivel"
                description="Reúne en una misma clase a estudiantes de distintos niveles. Ej.: Coro escolar con estudiantes de Primaria y Secundaria."
              />
            </RadioGroup>
          )}
        />
      </div>

      <div className="flex justify-end gap-3 p-6">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={onNext} variant="neutral">
          Siguiente
        </Button>
      </div>
    </>
  );
}

function ClassroomForm({
  classroom,
  isEditMode,
  additionalAction,
  isSubmitting,
  backButtonText,
  submitButtonText,
  onBack,
  onSubmit,
}: {
  classroom?: ClassroomEntity;
  isEditMode: boolean;
  additionalAction?: ReactNode;
  isSubmitting: boolean;
  backButtonText: string;
  submitButtonText: string;
  onBack: () => void;
  onSubmit?: (data: NewClassroomDataType) => void;
}) {
  const {
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isValid: isFormValid },
  } = useFormContext<ClassroomFormData>();

  const selectedSchool = useSelectedSchool();
  const { activeCycle } = useSchoolCycleSelector();
  const watchedFields = watch();
  const isSelectedCourseIsNew = watchedFields.courseId === newCourseToAddId;
  const { data: userTeacherProfiles } = useGetTeacherProfiles();

  const [courses, setCourses] = useState<CourseEntity[]>([]);
  const [availableGrades, setAvailableGrades] = useState<GradeEntity[]>([]);
  const [availableGroups, setAvailableGroups] = useState<GroupEntity[]>([]);
  const [newCourseName, setNewCourseName] = useState('');
  const [comboboxKey, setComboboxKey] = useState(0);

  const { data: courseGroups } = api.students.listCourseGroups.useQuery(
    { school_id: selectedSchool?.id as string },
    { enabled: !!selectedSchool?.id }
  );

  const { data: fetchedCourses } = api.students.listCourses.useQuery(
    { school_id: selectedSchool?.id },
    { enabled: !!selectedSchool?.id }
  );

  const {
    data: existingClassrooms,
    refetch: refetchExistingClassrooms,
    isLoading: existingClassroomsLoading,
  } = api.students.listClassrooms.useQuery(
    {
      schoolId: selectedSchool?.id as string,
      query: {
        school_cycle_id: activeCycle?.id,
        course_id: watchedFields.courseId,
        grade_id: watchedFields.gradeId || null,
        group_id: watchedFields.groupId || null,
        level_id: watchedFields.levelId,
        variant: watchedFields.variant ?? '',
      },
    },
    {
      enabled: isFormValid && !isSelectedCourseIsNew,
    }
  );
  const existingClassroom = useMemo(
    () => (isSelectedCourseIsNew ? undefined : existingClassrooms?.results?.[0]),
    [existingClassrooms, isSelectedCourseIsNew]
  );

  useEffect(() => {
    if (isFormValid && !isSelectedCourseIsNew) {
      refetchExistingClassrooms();
    }
  }, [isFormValid, isSelectedCourseIsNew]);

  useEffect(() => {
    setCourses(fetchedCourses ?? []);
  }, [fetchedCourses]);

  const { data: levels } = api.students.getLevelsGroupsGrades.useQuery(
    { schoolId: selectedSchool?.id as string },
    { enabled: !!selectedSchool?.id }
  );

  useEffect(() => {
    if (watchedFields.levelId && levels) {
      const selectedLevel = levels.find((level) => level.id === watchedFields.levelId);
      setAvailableGrades(selectedLevel?.grades ?? []);
      if (!isEditMode) {
        setValue('gradeId', '');
        setValue('groupId', '');
      }
      setAvailableGroups([]);
    }
  }, [watchedFields.levelId, levels, setValue]);

  useEffect(() => {
    if (watchedFields.gradeId && availableGrades.length > 0) {
      const selectedGrade = availableGrades.find((grade) => grade.id === watchedFields.gradeId);
      setAvailableGroups(selectedGrade?.groups?.sort((a, b) => a.name.localeCompare(b.name)) ?? []);
      if (!isEditMode) {
        setValue('groupId', '');
      }
    }
  }, [watchedFields.gradeId, availableGrades, setValue]);

  useEffect(() => {
    if (watchedFields.courseId) {
      const course = courses?.find((course) => course.id === watchedFields.courseId);
      if (!isEditMode) {
        setValue('courseGroupId', course?.course_group_id ?? '');
      }
    }
  }, [watchedFields.courseId, courses, setValue]);

  function handleAddNewCourse() {
    const newCourse = {
      id: newCourseToAddId,
      name: prettifyCourseName(newCourseName),
      course_group_id: '',
    };
    setCourses((prev) => [newCourse, ...prev]);
    setComboboxKey((prev) => prev + 1);
    setValue('courseId', newCourse.id);
  }

  function handleFormSubmit(data: ClassroomFormData) {
    const newCourse = courses.find((course) => course.id === newCourseToAddId);
    onSubmit?.({ ...data, newCourseName: newCourse?.name });
  }

  const selectedCourseName = courses?.find((course) => course.id === watchedFields.courseId)?.name;
  const disabledByExistingClassroomValidation = isSelectedCourseIsNew
    ? false
    : (existingClassroom && existingClassroom.id !== classroom?.id) || existingClassroomsLoading;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col flex-1 overflow-y-auto">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-900 mb-2">Datos de la materia</h3>

        <div className="flex flex-col gap-2">
          <Label htmlFor="courseId">Materia</Label>
          <Controller
            name="courseId"
            control={control}
            render={({ field }) => (
              <Combobox key={comboboxKey} value={field.value} onValueChange={field.onChange}>
                <ComboboxTrigger placeholder="Selecciona una materia" disabled={isEditMode}>
                  {selectedCourseName || classroom?.course?.name}
                </ComboboxTrigger>
                <ComboboxContent>
                  <ComboboxInput placeholder="Buscar materia..." onValueChange={setNewCourseName} />
                  <ComboboxList>
                    <ComboboxEmpty>
                      <button
                        className="hover:bg-accent px-3 py-2 cursor-pointer w-full text-left"
                        onClick={handleAddNewCourse}
                      >
                        <span className="text-primary font-semibold mr-1">Crear</span>
                        <span>{prettifyCourseName(newCourseName)}</span>
                      </button>
                    </ComboboxEmpty>
                    <ComboboxGroup>
                      {courses?.map((course) => (
                        <ComboboxItem key={course.id} value={course.id} keywords={course.name.split(' ')}>
                          {course.name}
                        </ComboboxItem>
                      ))}
                    </ComboboxGroup>
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            )}
          />
          {errors.courseId ? <p className="mt-1 text-sm text-red-600">{errors.courseId.message}</p> : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="variant">Variante (opcional)</Label>
          <Controller name="variant" control={control} render={({ field }) => <Input id="variant" {...field} />} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="courseGroupId">Campo formativo</Label>
          <Controller
            name="courseGroupId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={watchedFields.courseId !== newCourseToAddId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={classroom?.course?.course_group?.name || 'Selecciona un campo formativo'} />
                </SelectTrigger>
                <SelectContent>
                  {courseGroups?.map((courseGroup) => (
                    <SelectItem key={courseGroup.id} value={courseGroup.id}>
                      {courseGroup.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.courseGroupId ? <p className="mt-1 text-sm text-red-600">{errors.courseGroupId.message}</p> : null}
        </div>

        <h3 className="text-base font-semibold text-gray-900 mb-4">Datos de clase</h3>

        <div className="flex flex-col gap-2">
          <Label htmlFor="levelId">Nivel</Label>
          <Controller
            name="levelId"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={isEditMode}>
                <SelectTrigger>
                  <SelectValue placeholder={classroom?.level?.name || 'Selecciona un nivel'} />
                </SelectTrigger>
                <SelectContent>
                  {levels?.map((level) => (
                    <SelectItem key={level.id} value={level.id as string}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.levelId ? <p className="mt-1 text-sm text-red-600">{errors.levelId.message}</p> : null}
        </div>

        {watchedFields.type === ClassroomTypeEnum.Group ? (
          <>
            <div className="flex flex-col gap-2">
              <Label htmlFor="gradeId">Grado</Label>
              <Controller
                name="gradeId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!watchedFields.levelId || isEditMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={classroom?.grade?.name || 'Selecciona un grado'} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableGrades?.map((grade) => (
                        <SelectItem key={grade.id} value={grade.id as string}>
                          {grade.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.gradeId ? <p className="mt-1 text-sm text-red-600">{errors.gradeId.message}</p> : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="groupId">Grupo</Label>
              <Controller
                name="groupId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!watchedFields.gradeId || isEditMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={classroom?.group?.name || 'Selecciona un grupo'} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableGroups?.map((group) => (
                        <SelectItem key={group.id} value={group.id as string}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.groupId ? <p className="mt-1 text-sm text-red-600">{errors.groupId.message}</p> : null}
            </div>
          </>
        ) : null}

        <div className="flex flex-col gap-2">
          <Label htmlFor="membershipId">Maestro asignado</Label>
          <Controller
            name="membershipId"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un maestro" />
                </SelectTrigger>
                <SelectContent>
                  {userTeacherProfiles?.map((utp) => (
                    <SelectItem key={utp.teacherProfile.membership_id} value={utp.teacherProfile.membership_id}>
                      {utp.user?.first_name} {utp.user?.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.membershipId ? <p className="mt-1 text-sm text-red-600">{errors.membershipId.message}</p> : null}
        </div>

        {additionalAction ? <div className="pt-4">{additionalAction}</div> : null}
      </div>

      {existingClassroom && existingClassroom?.id !== classroom?.id ? (
        <div className="px-6">
          <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangleIcon className="w-8 h-8 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-600">
                Ya existe una clase{' '}
                <Link href={`/academic/classrooms/${existingClassroom.id}`} target="_blank" className="underline">
                  <strong>
                    {selectedCourseName} {watchedFields.variant}
                  </strong>
                </Link>{' '}
                para el {watchedFields.type === ClassroomTypeEnum.Group ? 'grupo' : 'nivel'} seleccionado. Puedes elegir
                otro {watchedFields.type === ClassroomTypeEnum.Group ? 'grupo' : 'nivel'} o cambiar la variante para
                crear la nueva clase.
              </span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex justify-end gap-3 p-6">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          {backButtonText}
        </Button>
        <Button
          disabled={isSubmitting || !isFormValid || disabledByExistingClassroomValidation}
          variant="neutral"
          type="submit"
        >
          {isSubmitting ? 'Procesando...' : submitButtonText}
        </Button>
      </div>
    </form>
  );
}

export function FormClassroomDrawer({
  open,
  onOpenChange,
  classroom,
  mode,
  additionalAction,
  onSubmit,
  isSubmitting = false,
}: ClassroomDrawerProps) {
  const isEditMode = mode === 'edit';
  const title = isEditMode ? 'Editar clase' : 'Nueva clase de materia';
  const submitButtonText = isEditMode ? 'Guardar' : 'Crear clase';
  const backButtonText = isEditMode ? 'Cancelar' : 'Volver';
  const defaultFromStep = isEditMode ? ClassroomFormStepEnum.FillForm : ClassroomFormStepEnum.ClassroomTypeSelection;
  const [formStep, setFormStep] = useState<ClassroomFormStepEnum>(defaultFromStep);
  const defaultClassroomType = classroom?.group_id ? ClassroomTypeEnum.Group : ClassroomTypeEnum.Level;
  const { data: teacherAssignments = [] } = api.students.listClassroomTeacherAssignments.useQuery(
    {
      classroom_id: classroom?.id as string,
    },
    {
      enabled: !!classroom?.id,
    }
  );
  const membershipId = useMemo(() => teacherAssignments[0]?.membership_id ?? '', [teacherAssignments]);
  const defaultValues = useMemo(
    () => ({
      courseGroupId: classroom?.course?.course_group_id ?? '',
      courseId: classroom?.course_id ?? '',
      levelId: classroom?.level_id ?? '',
      gradeId: classroom?.grade_id ?? '',
      groupId: classroom?.group_id ?? '',
      type: classroom ? defaultClassroomType : ClassroomTypeEnum.Group,
      variant: classroom?.variant ?? '',
      membershipId,
    }),
    [classroom, defaultClassroomType, membershipId]
  );

  const form = useForm<ClassroomFormData>({
    resolver: zodResolver(classroomFormSchema),
    defaultValues,
  });

  const { reset } = form;

  useEffect(() => {
    reset(defaultValues);
  }, [open, classroom, reset, defaultValues]);

  useEffect(() => {
    if (!open) {
      setFormStep(defaultFromStep);
    }
  }, [open]);

  function handleBack() {
    if (isEditMode) onOpenChange(false);
    else setFormStep(ClassroomFormStepEnum.ClassroomTypeSelection);
  }

  const fromStepsMap = {
    [ClassroomFormStepEnum.ClassroomTypeSelection]: (
      <ClassroomTypeSelection
        onNext={() => setFormStep(ClassroomFormStepEnum.FillForm)}
        onCancel={() => onOpenChange(false)}
      />
    ),
    [ClassroomFormStepEnum.FillForm]: (
      <ClassroomForm
        classroom={classroom}
        isEditMode={isEditMode}
        additionalAction={additionalAction}
        isSubmitting={isSubmitting}
        submitButtonText={submitButtonText}
        onBack={handleBack}
        onSubmit={onSubmit}
        backButtonText={backButtonText}
      />
    ),
  };

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

          <FormProvider {...form}>{fromStepsMap[formStep]}</FormProvider>
        </div>
      </Sheet.Content>
    </Sheet>
  );
}
