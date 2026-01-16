import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Button,
  Input,
  Label,
  ContainerError,
  Dialog,
  SelectInput,
  SelectInputTrigger,
  SelectInputValue,
  SelectInputContent,
  SelectInputItem,
} from '@cometa/recreo';
import { zodResolver } from '@hookform/resolvers/zod';
import type {
  SrcSchoolsApiDomainEntitiesLevelEntity,
  SrcSchoolsApiDomainEntitiesGradeEntity,
  UpdateGradeAndGroupDTO,
  CreateGradeAndGroupsDTO,
} from '@cometa/trpc/src/students/types';

import IcPlus from 'public/assets/icons/levels_grades_groups/ic_plus.svg';
import IcTrash from 'public/assets/icons/levels_grades_groups/ic_trash.svg';

import CAlert from '../atoms/CAlert';
import SidebarActions from '../atoms/SidebarActions';
import SidebarHeader from '../molecules/dashboard/SidebarHeader';
import { useSelectedSchool } from '../../guards/AuthGuard';
import useAlert from '../../hooks/useAlert';
import { useLevelsGradeGroups } from '../../hooks/useLevelsGradesGroups';
import useSendTrackEventWithUserName from '../../hooks/useSendTrackEventWithUserName';
import { Events } from '../../constants/events';
import { api } from '../../utils/api';

type GroupsEditorProps = {
  readonly grade?: SrcSchoolsApiDomainEntitiesGradeEntity;
  readonly groupInputs: { id?: string | null; name: string }[];
  readonly setGroupInputs: (groupInputs: { id?: string | null; name: string }[]) => void;
};

function GroupsEditor({ grade, groupInputs, setGroupInputs }: GroupsEditorProps) {
  const { setAlertState } = useAlert();
  const selectedSchool = useSelectedSchool();
  const [onDeleteGroup, setOnDeleteGroup] = useState<{ id: string; index: number } | undefined>();
  const { refetch } = useLevelsGradeGroups();

  const deleteGroup = api.students.deleteGroup.useMutation({
    onSuccess: () => {
      setAlertState({
        severity: 'success',
        open: true,
        message: '¡Grupo eliminado!',
      });
      refetch();
    },
    onError: () => {
      setAlertState({
        severity: 'error',
        open: true,
        message: 'Error al eliminar el grupo',
      });
    },
  });

  const updateGroupInput = (index: number, value: string) => {
    const newInputs = [...groupInputs];
    newInputs[index] = { ...newInputs[index], name: value };
    setGroupInputs(newInputs);
  };

  const handleRemoveGroupInput = (index: number) => {
    const group = groupInputs[index];

    if (group.id) {
      setOnDeleteGroup({ id: group.id, index });
    } else {
      setGroupInputs(groupInputs.filter((_, i) => i !== index));
    }
  };

  const handleConfirmDeleteGroup = () => {
    if (!onDeleteGroup || !selectedSchool?.id || !grade?.level_id || !grade?.id) return;

    const { id, index } = onDeleteGroup;

    deleteGroup.mutate(
      {
        schoolId: selectedSchool.id,
        levelId: grade.level_id,
        gradeId: grade.id,
        groupId: id,
      },
      {
        onSuccess: () => {
          const newInputs = [...groupInputs];
          newInputs.splice(index, 1);
          setGroupInputs(newInputs);
          setOnDeleteGroup(undefined);
        },
        onError: () => {
          setOnDeleteGroup(undefined);
        },
      }
    );
  };

  return (
    <>
      <div className="flex flex-col gap-1">
        <span className="text-lg font-bold leading-5">Grupos</span>
        <span className="text-base font-normal text-[#637381] leading-6">
          Registra los grupos que estarán disponibles en este grado.
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {groupInputs.map((group, index) => (
          <div key={group.id ?? `new-group-${index}-${group.name}`} className="flex items-center gap-2">
            <Input
              id={`group-${index}`}
              type="text"
              placeholder={`Grupo ${index + 1}`}
              value={group.name}
              onChange={(e) => updateGroupInput(index, e.target.value)}
              className="w-full h-12 px-4 py-3 rounded-lg border border-[#E4EBF6]"
              isLegacy={false}
            />

            <button
              type="button"
              onClick={() => handleRemoveGroupInput(index)}
              className="p-2 text-[#637381] hover:text-red-700 focus:outline-none"
              aria-label={`Eliminar grupo ${index + 1}`}
            >
              <IcTrash width="14" height="14" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setGroupInputs([...groupInputs, { name: '' }])}
        className="mt-2 flex items-center gap-2 text-[#1C1C1D] hover:text-[#454D64] focus:outline-none text-sm font-semibold self-start px-4 py-2 bg-gray-50 rounded-lg"
      >
        <IcPlus width="14" height="14" />
        Agregar grupo
      </button>

      <CAlert type="info" message="Los grupos te permitirán organizar a los estudiantes dentro de cada grado." />

      <Dialog.Root open={onDeleteGroup !== undefined}>
        <Dialog.Title>¿Quieres eliminar este grupo?</Dialog.Title>
        <div className="flex justify-between max-w-[calc(433px_-_(48px_*_2))] mx-auto gap-2 mt-8">
          <Dialog.Close onClick={() => setOnDeleteGroup(undefined)} asChild>
            <Button className="w-full" variant="text" color="black">
              No, volver
            </Button>
          </Dialog.Close>
          <Button className="w-full bg-[#FF4842] hover:bg-[#c73833] text-white" onClick={handleConfirmDeleteGroup}>
            Si, eliminar
          </Button>
        </div>
      </Dialog.Root>
    </>
  );
}

type GradeFormProps = {
  readonly onClose: () => void;
  readonly onSave: (data: UpdateGradeAndGroupDTO | CreateGradeAndGroupsDTO) => void;
  readonly isLoading?: boolean;
  readonly grade?: SrcSchoolsApiDomainEntitiesGradeEntity;
  readonly levels?: Array<SrcSchoolsApiDomainEntitiesLevelEntity>;
};

const schema = z.object({
  name: z.string().min(1, 'Nombre es requerido'),
  level_id: z.string().min(1, 'Nivel es requerido'),
  is_last: z.boolean().default(false),
  next_id: z.string().nullable(),
});

type FormValues = z.infer<typeof schema>;

export function GradeForm({ onClose, onSave, grade, isLoading }: GradeFormProps) {
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const { levels, isLoading: levelsIsLoading } = useLevelsGradeGroups();

  const [groupInputs, setGroupInputs] = useState<{ id?: string | null; name: string }[]>(
    grade?.groups?.map((group) => ({ id: group.id, name: group.name })) ?? [{ name: '' }]
  );
  const [availableGrades, setAvailableGrades] = useState<Array<{ id: string; name: string }>>([]);
  const [levelHasLastGrade, setLevelHasLastGrade] = useState(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
    setValue,
  } = useForm<FormValues>({
    defaultValues: {
      name: grade?.name ?? '',
      level_id: grade?.level_id ?? '',
      is_last: grade?.is_last ?? false,
      next_id: grade?.next_id ?? null,
    },
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const isFormLoading = isLoading || levelsIsLoading;
  const isEditing = !!grade?.id;

  const findLevelNameForGrade = useCallback(
    (gradeId: string | null | undefined) => {
      if (!gradeId) return '';
      const level = levels?.find((l) => l.grades?.some((gr) => gr?.id === gradeId));
      return level?.name ?? '';
    },
    [levels]
  );

  const watchedLevelId = watch('level_id');

  useEffect(() => {
    if (watchedLevelId && !isFormLoading && levels) {
      const currentLevel = levels.find((level) => level.id === watchedLevelId);
      if (!currentLevel) {
        setAvailableGrades([]);
        setLevelHasLastGrade(false);
        return;
      }

      const hasLastGrade = currentLevel.grades?.some((g) => g.is_last && g.id !== grade?.id) ?? false;
      setLevelHasLastGrade(hasLastGrade);

      const currentLevelIndex = levels.findIndex((level) => level.id === watchedLevelId);

      const eligibleGrades = levels
        .filter((level, index) => index >= currentLevelIndex && level.id)
        .flatMap((level) => level.grades ?? [])
        .filter((g) => g?.id !== grade?.id)
        .map((g) => ({
          id: g?.id ?? '',
          name: `${g?.name ?? ''} | ${findLevelNameForGrade(g?.id)}`,
        }))
        .filter((g) => g.id);

      setAvailableGrades(eligibleGrades);
    } else {
      setAvailableGrades([]);
      setLevelHasLastGrade(false);
    }
  }, [watchedLevelId, levels, grade?.id, isFormLoading, findLevelNameForGrade]);

  const handleFormSubmit = (data: FormValues) => {
    const validGroups = groupInputs.filter((g) => g.name.trim() !== '');

    onSave({
      grade: {
        id: grade?.id,
        name: data.name,
        level_id: data.level_id,
        is_last: data.is_last ?? false,
        ...(!(data.is_last ?? false) && { next_id: data.next_id }),
      },
      groups: validGroups,
    });

    onClose();
  };

  const canSubmit = () => {
    if (isFormLoading) return false;

    if (!watch('name') || !watch('level_id')) return false;

    if (isEditing) {
      if (watch('is_last') === true) return true;

      const nextId = watch('next_id');
      return typeof nextId === 'string' && nextId !== 'none' && nextId !== '';
    }

    return true;
  };

  const handleGradeSelection = (value: string) => {
    const validateOption = { shouldValidate: true };

    switch (value) {
      case 'last':
        setValue('is_last', true, validateOption);
        setValue('next_id', null, validateOption);
        break;
      case 'none':
        setValue('is_last', false, validateOption);
        setValue('next_id', null, validateOption);
        break;
      default:
        setValue('is_last', false, validateOption);
        setValue('next_id', value, validateOption);
    }
  };

  return (
    <>
      <SidebarHeader
        title={isEditing ? 'Editar grado' : 'Crear grado'}
        onClose={onClose}
        boxClassName="border-b border-neutral-200 px-8"
      />
      <div className="flex flex-col px-8 h-full overflow-y-auto pt-6">
        <form className="mt-6 h-full justify-between flex flex-col" onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="flex flex-col gap-8 mb-6">
            {isFormLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#1C1C1D]" />
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-lg font-bold leading-5">Información del grado</span>
                    <span className="text-base font-normal text-[#637381] leading-6">
                      Proporciona la información básica del grado educativo.
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-[#637381] text-sm font-normal" isError={!!errors.name?.message}>
                      Nombre del grado
                    </Label>
                    <Input
                      {...register('name')}
                      id="name"
                      type="text"
                      error={errors.name?.message}
                      isLegacy={false}
                      placeholder="1"
                      className="px-4 py-3 rounded-lg text-[#1C1C1D] h-12"
                    />
                    <ContainerError error={errors.name?.message as string} />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-[#637381] text-sm font-normal" isError={!!errors.level_id?.message}>
                      Nivel al que pertenece
                    </Label>
                    <SelectInput
                      onValueChange={(value: string) => {
                        setValue('level_id', value, { shouldValidate: true });
                        setValue('next_id', null);
                      }}
                      value={watch('level_id')}
                    >
                      <SelectInputTrigger className="w-full outline-none rounded-lg h-12">
                        <SelectInputValue placeholder="Selecciona un nivel" />
                      </SelectInputTrigger>
                      <SelectInputContent className="w-full outline-none">
                        {levels
                          ?.filter((level): level is typeof level & { id: string } => !!level.id)
                          ?.map((level) => (
                            <SelectInputItem
                              key={level.id}
                              value={level.id}
                              className="w-full hover:bg-[#F5FAFF] outline-none"
                            >
                              {level.name}
                            </SelectInputItem>
                          ))}
                      </SelectInputContent>
                    </SelectInput>
                    <ContainerError error={errors.level_id?.message as string} />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-[#637381] text-sm font-normal">Grado siguiente</Label>
                    <SelectInput
                      onValueChange={handleGradeSelection}
                      disabled={!watch('level_id')}
                      value={(() => {
                        if (watch('is_last')) return 'last';
                        const nextId = watch('next_id');
                        return nextId ?? 'none';
                      })()}
                    >
                      <SelectInputTrigger className="w-full outline-none rounded-lg h-12">
                        <SelectInputValue placeholder="Selecciona el grado siguiente" />
                      </SelectInputTrigger>
                      <SelectInputContent className="w-full outline-none">
                        {!watch('level_id') ? (
                          <SelectInputItem
                            value="none"
                            className="w-full hover:bg-[#F5FAFF] outline-none text-gray-400"
                          >
                            Selecciona un nivel primero
                          </SelectInputItem>
                        ) : (
                          <>
                            {!isEditing && (
                              <SelectInputItem value="none" className="w-full hover:bg-[#F5FAFF] outline-none">
                                Sin grado siguiente
                              </SelectInputItem>
                            )}

                            {availableGrades.map((grade) => (
                              <SelectInputItem
                                key={grade.id}
                                value={grade.id}
                                className="w-full hover:bg-[#F5FAFF] outline-none"
                              >
                                {grade.name}
                              </SelectInputItem>
                            ))}
                            {!levelHasLastGrade && (
                              <SelectInputItem value="last" className="w-full hover:bg-[#F5FAFF] outline-none">
                                Último grado
                              </SelectInputItem>
                            )}
                          </>
                        )}
                      </SelectInputContent>
                    </SelectInput>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <GroupsEditor grade={grade} groupInputs={groupInputs} setGroupInputs={setGroupInputs} />
                </div>
              </>
            )}
          </div>

          <SidebarActions className="justify-end px-0 shadow-none">
            <Button
              type="button"
              color="black"
              variant="text"
              onClick={() => {
                sendTrackEventWithUserName(Events.grade_edit_click_cancel);
                onClose();
              }}
              disabled={isFormLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" color="black" variant="solid" disabled={!canSubmit()}>
              {isEditing ? 'Actualizar' : 'Crear'}
            </Button>
          </SidebarActions>
        </form>
      </div>
    </>
  );
}
