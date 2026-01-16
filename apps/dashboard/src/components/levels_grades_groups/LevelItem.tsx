import { Dialog } from '@cometa/recreo';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { AccordionContent, AccordionItem, AccordionTriggerVariants } from '../ui/Accordion';
import { cn } from '@cometa/utils';
import Sheet from '../atoms/Sheet';
import { useState } from 'react';
import 'react-circular-progressbar/dist/styles.css';

import { useSelectedSchool } from '../../guards/AuthGuard';
import useAlert from '../../hooks/useAlert';
import useSendTrackEventWithUserName from '../../hooks/useSendTrackEventWithUserName';
import { LevelsGradesGroupsForm, LevelFormDTO } from './LevelForm';
import { GradeForm } from './GradeForm';
import IcPlus from 'public/assets/icons/levels_grades_groups/ic_plus.svg';
import IcDragHandle from 'public/assets/icons/levels_grades_groups/ic_drag_handle.svg';
import IcElipse from 'public/assets/icons/levels_grades_groups/ic_elipse.svg';
import IcChevronUp from 'public/assets/icons/levels_grades_groups/ic_chevron_up.svg';
import IcDivider from 'public/assets/icons/levels_grades_groups/ic_divider.svg';
import IcAlert from 'public/assets/icons/ic_alert.svg';
import { Tooltip } from '../atoms/Tooltip';
import { Button } from '@cometa/recreo/v2/components/ui/button';
import IcEdit from 'public/assets/icons/levels_grades_groups/ic_edit.svg';
import IcTrash from 'public/assets/icons/levels_grades_groups/ic_trash.svg';
import { useLevelsGradeGroups } from '../../hooks/useLevelsGradesGroups';

import { api } from '../../utils/api';

import {
  UpdateGradeAndGroupDTO,
  UpdateGroupDTO,
  UpdateGradeDTO,
  CreateGradeAndGroupsDTO,
  CreateGroupDTO,
  CreateGradeDTO,
  SrcSchoolsApiDomainEntitiesGradeEntity,
  SrcSchoolsApiDomainEntitiesLevelEntity,
} from '@cometa/trpc/src/students/types';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function toSentenceCase(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function NextGrade({
  grade,
}: Readonly<{
  grade: SrcSchoolsApiDomainEntitiesGradeEntity;
}>) {
  const { levels } = useLevelsGradeGroups();
  const selectedSchool = useSelectedSchool();
  const isSchoolOnboarding = selectedSchool?.status === 'onboarding';

  if (grade.is_last) {
    return (
      <Tooltip message="Último grado disponible en el colegio. No tiene un siguiente grado asignado.">
        <span className="overflow-hidden text-amber-800 bg-amber-100 px-2 py-1 rounded-full text-ellipsis whitespace-nowrap font-['Lota_Grotesque'] text-sm font-normal leading-[22px] cursor-help">
          Último grado
        </span>
      </Tooltip>
    );
  }

  if (grade.next_id && levels?.length) {
    const allGrades = levels?.flatMap((level) => level.grades) ?? [];
    const nextGrade = allGrades.find((g) => g?.id === grade.next_id);

    if (nextGrade) {
      const nextGradeLevel = levels?.find((level) => level.grades?.some((g) => g.id === nextGrade.id));
      const nextGradeLevelName = nextGradeLevel ? '| ' + toSentenceCase(nextGradeLevel.name) : '';

      return (
        <span className="overflow-hidden text-[#535765] text-ellipsis whitespace-nowrap font-['Lota_Grotesque'] text-sm font-normal leading-[22px]">
          {`${nextGrade.name} ${nextGradeLevelName}`}
        </span>
      );
    }
  }

  return (
    <div className="flex h-[46px] flex-col justify-center items-start">
      <div className="flex items-center gap-2">
        <Tooltip
          message={
            isSchoolOnboarding
              ? 'Es necesario asignar un siguiente grado donde se moverán a los estudiantes al finalizar el ciclo.'
              : 'Contacta al equipo de soporte para configurar el siguiente grado.'
          }
        >
          <div className="flex items-center gap-2 cursor-help">
            <span
              className="overflow-hidden text-[#FD6262] text-ellipsis font-['Lota_Grotesque'] text-[14px] font-normal leading-[22px] whitespace-nowrap"
              style={{
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 1,
              }}
            >
              Sin asignar
            </span>
            <IcAlert />
          </div>
        </Tooltip>
      </div>
    </div>
  );
}

function GradeItem({
  grade,
}: Readonly<{
  grade: SrcSchoolsApiDomainEntitiesGradeEntity;
}>) {
  const { setAlertState } = useAlert();
  const trackEvent = useSendTrackEventWithUserName();
  const { levels, refetch, canEdit } = useLevelsGradeGroups();
  const selectedSchool = useSelectedSchool();

  const currentLevel = levels?.find((level) => level.id === grade.level_id);
  const levelName = currentLevel?.name ? toSentenceCase(currentLevel.name) : '';

  const [onEditGrade, setOnEditGrade] = useState<SrcSchoolsApiDomainEntitiesGradeEntity | undefined>();
  const [onDeleteGrade, setOnDeleteGrade] = useState<string | undefined>();

  const patchGroupsGrades = api.students.patchGroupsGrades.useMutation({
    onSuccess: () => {
      setAlertState({
        severity: 'success',
        open: true,
        message: '¡Grado y grupos actualizados!',
      });
      refetch();
    },
    onError: () => {
      setAlertState({
        severity: 'error',
        open: true,
        message: 'Error al actualizar el grado y grupos',
      });
    },
  });

  const deleteGrade = api.students.deleteGrade.useMutation({
    onSuccess: () => {
      setAlertState({
        severity: 'success',
        open: true,
        message: '¡Grado eliminado!',
      });
      refetch();
    },
    onError: () => {
      setAlertState({
        severity: 'error',
        open: true,
        message: 'Error al eliminar el grado',
      });
    },
  });

  const handleUpdateGrade = (grade: UpdateGradeDTO, groups: UpdateGroupDTO[] | null) => {
    if (!onEditGrade) return;

    trackEvent('dashboard: update grade');

    patchGroupsGrades.mutate({
      schoolId: selectedSchool?.id ?? '',
      levelId: onEditGrade.level_id as string,
      grade: grade,
      groups: groups,
    });

    setOnEditGrade(undefined);
  };

  const handleConfirmDeleteGradeClick = () => {
    trackEvent('dashboard: confirm delete grade');

    if (!onDeleteGrade) {
      setOnDeleteGrade(undefined);
      return;
    }

    if (!grade.id || !selectedSchool?.id || !grade.level_id) {
      setAlertState({
        severity: 'error',
        open: true,
        message: 'Error al eliminar el grado: información incompleta',
      });
      return;
    }

    deleteGrade.mutate({
      schoolId: selectedSchool.id,
      levelId: grade.level_id,
      gradeId: onDeleteGrade,
    });

    setOnDeleteGrade(undefined);
  };

  return (
    <div
      key={grade.id}
      className="flex flex-row min-h-[52px] items-center border-b border-gray-100 hover:bg-gray-50 w-full bg-white"
    >
      <div className="flex-shrink-0 w-[30%] md:w-[25%] lg:w-[268px] px-6 py-3 min-w-[200px]">
        <span className="text-[#1C1C1D] font-['Lota_Grotesque'] text-sm font-normal leading-[22px] overflow-hidden text-ellipsis whitespace-nowrap">
          {grade.name} | {levelName}
        </span>
      </div>

      <div className="flex-shrink-0 w-[30%] md:w-[25%] lg:w-[268px] px-6 py-3 min-w-[200px]">
        <NextGrade grade={grade} />
      </div>

      <div className="flex-grow px-6 py-3 min-w-0 overflow-hidden">
        <div className="flex gap-2 flex-wrap items-center">
          {grade.groups?.map((group, index) => (
            <div
              key={`group-${group.name}-${index}`}
              className="rounded-full bg-[#EDF0F6] text-[#22222A] font-['Lota_Grotesque'] text-[14px] font-semibold leading-[25px] tracking-[0.07px] min-w-[32px] m-0 flex justify-center items-center gap-[5px] p-[0px_12px]"
            >
              <span className="text-center">{group.name}</span>
            </div>
          ))}
          {(!grade.groups || grade.groups.length === 0) && (
            <span className="text-sm text-[#919EAB] italic">Sin grupos</span>
          )}
        </div>
      </div>

      {canEdit && (
        <div className="flex flex-shrink-0 items-center gap-2 px-4">
          <Tooltip message="Editar grado">
            <div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Editar grado"
                onClick={() => setOnEditGrade(grade)}
                className="w-8 h-8 text-[#9CA3AF] hover:bg-gray-100"
              >
                <IcEdit width="16" height="16" />
              </Button>
            </div>
          </Tooltip>
          <Tooltip message={grade.groups?.length ? 'No se puede eliminar un grado que tiene grupos' : 'Eliminar grado'}>
            <div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Eliminar grado"
                onClick={() => setOnDeleteGrade(grade.id ?? '')}
                disabled={!!grade.groups?.length}
                className="w-8 h-8 text-[#9CA3AF] hover:bg-gray-100 disabled:text-[#DDD] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <IcTrash width="16" height="16" />
              </Button>
            </div>
          </Tooltip>
        </div>
      )}

      <Sheet open={onEditGrade !== undefined}>
        <Sheet.Content className="max-h-[calc(100vh-16px)] h-full max-w-[500px] w-full m-2 rounded-2xl font-lota antialiased overflow-hidden shadow-[0px_20px_40px_-4px_rgba(145,158,171,0.16)]">
          <GradeForm
            grade={onEditGrade}
            onClose={() => setOnEditGrade(undefined)}
            onSave={(data: UpdateGradeAndGroupDTO | CreateGradeAndGroupsDTO) => {
              const { grade, groups } = data;
              if (onEditGrade) {
                handleUpdateGrade(grade as UpdateGradeDTO, groups as UpdateGroupDTO[] | null);
              }
            }}
            isLoading={patchGroupsGrades.isPending}
          />
        </Sheet.Content>
      </Sheet>

      <Dialog.Root open={onDeleteGrade !== undefined}>
        <Dialog.Title>¿Quieres eliminar este grado?</Dialog.Title>
        <div className="flex justify-between max-w-[calc(433px_-_(48px_*_2))] mx-auto gap-2 mt-8">
          <Dialog.Close
            onClick={() => {
              trackEvent('dashboard: leave delete grade');
              setOnDeleteGrade(undefined);
            }}
            asChild
          >
            <Button className="w-full" variant="ghost">
              No, volver
            </Button>
          </Dialog.Close>
          <Button className="w-full bg-[#FF4842] hover:bg-[#c73833] text-white" onClick={handleConfirmDeleteGradeClick}>
            Si, eliminar
          </Button>
        </div>
      </Dialog.Root>
    </div>
  );
}

export function LevelItem({ level }: Readonly<{ level: SrcSchoolsApiDomainEntitiesLevelEntity }>) {
  const levelGrades = level.grades ?? [];
  const { setAlertState } = useAlert();
  const trackEvent = useSendTrackEventWithUserName();
  const selectedSchool = useSelectedSchool();
  const { refetch, canEdit } = useLevelsGradeGroups();

  const [onEditLevel, setOnEditLevel] = useState<SrcSchoolsApiDomainEntitiesLevelEntity | undefined>();
  const [onDeleteLevel, setOnDeleteLevel] = useState<string | undefined>();
  const [onCreateGrade, setOnCreateGrade] = useState(false);
  const [selectedLevelId, setSelectedLevelId] = useState<string | undefined>();

  const hasGradesWithoutNextGrade = levelGrades.some((grade) => !grade.is_last && !grade.next_id);

  const updateLevel = api.students.updateLevel.useMutation({
    onSuccess: () => {
      setAlertState({
        severity: 'success',
        open: true,
        message: '¡Nivel actualizado!',
      });
      refetch();
    },
    onError: () => {
      setAlertState({
        severity: 'error',
        open: true,
        message: 'Error al actualizar el nivel',
      });
    },
  });

  const deleteLevel = api.students.deleteLevel.useMutation({
    onSuccess: () => {
      setAlertState({
        severity: 'success',
        open: true,
        message: '¡Nivel eliminado!',
      });
      refetch();
    },
    onError: () => {
      setAlertState({
        severity: 'error',
        open: true,
        message: 'Error al eliminar el nivel',
      });
    },
  });

  const createGradeAndGroups = api.students.createGradeAndGroups.useMutation({
    onSuccess: () => {
      setAlertState({
        severity: 'success',
        open: true,
        message: '¡Grado y grupos creados!',
      });
      refetch();
    },
    onError: () => {
      setAlertState({
        severity: 'error',
        open: true,
        message: 'Error al crear el grado y grupos',
      });
    },
  });

  const handleUpdateLevel = (data: LevelFormDTO) => {
    if (!onEditLevel) return;

    updateLevel.mutate({
      schoolId: selectedSchool?.id ?? '',
      levelId: onEditLevel.id as string,
      name: data.name,
      type: data.type,
    });

    trackEvent('dashboard: update level');
    setOnEditLevel(undefined);
  };

  const handleConfirmDeleteLevelClick = () => {
    trackEvent('dashboard: confirm delete level');
    if (onDeleteLevel) {
      deleteLevel.mutate({
        schoolId: selectedSchool?.id ?? '',
        levelId: onDeleteLevel,
      });
    }
    setOnDeleteLevel(undefined);
  };

  const handleCreateGrade = (grade: CreateGradeDTO, groups: CreateGroupDTO[] | null) => {
    if (!selectedLevelId) return;

    createGradeAndGroups.mutate({
      schoolId: selectedSchool?.id ?? '',
      levelId: selectedLevelId,
      grade: grade,
      groups: groups,
    });

    setOnCreateGrade(false);
    setSelectedLevelId(undefined);

    trackEvent('dashboard: create grade');
  };

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: level.id as string,
  });

  const style = transform
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
      }
    : undefined;

  if (isDragging) {
    return (
      <div
        ref={(node) => setNodeRef(node)}
        style={style}
        {...attributes}
        {...listeners}
        className="bg-[#F8F9FC] border border-[#F0F3F9] rounded-xl overflow-hidden flex items-center h-[56px] px-4"
      >
        <div className="flex items-center gap-3">
          <div className="text-gray-400 cursor-grab">
            <div className="flex-none">
              <IcDragHandle width="14" height="14" />
            </div>
          </div>
          <span className="font-bold text-sm text-[#212B36] font-['Lota_Grotesque'] leading-5 cursor-default">
            {toSentenceCase(level.name)}
          </span>
          <span className="text-[#637381] font-['Public_Sans'] text-xs font-normal leading-[18px] cursor-default">
            {levelGrades.length} {levelGrades.length === 1 ? 'grado' : 'grados'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div ref={(node) => setNodeRef(node)} style={style}>
      <AccordionItem
        value={level.id ?? ''}
        variant="card"
        className="bg-[#F8F9FC] border border-[#F0F3F9] rounded-xl overflow-hidden flex flex-col items-start gap-[16px] self-stretch py-[8px] px-0"
      >
        <AccordionPrimitive.Header className="flex h-[40px] items-center gap-[20px] self-stretch px-4">
          <AccordionPrimitive.Trigger
            className={cn(
              AccordionTriggerVariants({ variant: 'card' }),
              'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:no-underline px-0 group cursor-pointer'
            )}
          >
            <div className="flex items-center gap-2 flex-1">
              {canEdit && (
                <button
                  type="button"
                  className="text-gray-400 cursor-grab p-0 border-0 bg-transparent"
                  {...attributes}
                  {...listeners}
                  data-testid="drag-handle"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Reordenar nivel"
                >
                  <div className="flex-none">
                    <IcDragHandle width="14" height="14" />
                  </div>
                </button>
              )}
              <div className="flex pr-[149px] items-center gap-[16px] flex-[1_0_0]">
                <span className="font-bold text-sm text-[#212B36] font-['Lota_Grotesque'] leading-5 flex flex-col items-start">
                  {toSentenceCase(level.name)}
                </span>
                <span className="text-[#637381] font-['Public_Sans'] text-xs font-normal leading-[18px]">
                  {levelGrades.length} grados
                </span>
                {hasGradesWithoutNextGrade && (
                  <Tooltip message="Este nivel tiene grados sin un siguiente grado asignado.">
                    <div className="cursor-help flex items-center ml-2">
                      <IcAlert />
                    </div>
                  </Tooltip>
                )}
              </div>
            </div>
            {canEdit && (
              <div className="flex gap-2 mr-8">
                <Tooltip message="Editar nivel">
                  <div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Editar nivel"
                      onClick={() => setOnEditLevel(level)}
                      className="w-8 h-8 text-[#9CA3AF] hover:bg-gray-100"
                    >
                      <IcEdit width="16" height="16" />
                    </Button>
                  </div>
                </Tooltip>
                <Tooltip
                  message={level.grades?.length ? 'No se puede eliminar un nivel que tiene grados' : 'Eliminar nivel'}
                >
                  <div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Eliminar nivel"
                      onClick={() => setOnDeleteLevel(level.id ?? '')}
                      disabled={!!level.grades?.length}
                      className="w-8 h-8 text-[#9CA3AF] hover:bg-gray-100 disabled:text-[#DDD] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <IcTrash width="16" height="16" />
                    </Button>
                  </div>
                </Tooltip>
              </div>
            )}
            <div className="flex w-[40px] h-[40px] p-[8px] justify-center items-center accordion-arrow cursor-pointer">
              <div className="w-[24px] h-[24px] relative flex-shrink-0">
                <IcElipse width="24" height="24" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <IcChevronUp
                    width="20"
                    height="20"
                    className="transition-transform duration-300 group-data-[state=closed]:rotate-180"
                    style={{ width: '20px', height: '20px', flexShrink: 0 }}
                  />
                </div>
              </div>
            </div>
          </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
        <AccordionContent variant="card" className="px-4 pb-4 w-full">
          <div className="bg-white rounded-lg border border-[#E9EEF7] w-full overflow-hidden">
            {levelGrades.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 w-full">
                <p className="text-[#637381] font-medium mb-1">No hay grados en este nivel</p>
                <p className="text-[#637381] text-sm">Agrega grados para organizar los grupos de estudiantes</p>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-0 self-stretch bg-white rounded-xl overflow-hidden w-full">
                <div className="hidden md:flex h-[44px] px-0 items-center self-stretch text-sm text-[#637381] relative bg-[#FBFCFD] w-full">
                  <div className="flex-shrink-0 w-[30%] md:w-[25%] lg:w-[268px] px-6 py-3">
                    <span className="text-[#637381] font-['Lota_Grotesque'] text-sm font-semibold leading-5">
                      Grado
                    </span>
                  </div>
                  <IcDivider width="1" height="24" style={{ opacity: 0.24 }} />
                  <div className="flex-shrink-0 w-[30%] md:w-[25%] lg:w-[268px] px-6 py-3">
                    <span className="text-[#637381] font-['Lota_Grotesque'] text-sm font-semibold leading-5">
                      Siguiente grado
                    </span>
                  </div>
                  <IcDivider width="1" height="24" style={{ opacity: 0.24 }} />
                  <div className="flex-grow px-6 py-3">
                    <span className="text-[#637381] font-['Lota_Grotesque'] text-sm font-semibold leading-5">
                      Grupos
                    </span>
                  </div>
                  <div className="flex-shrink-0 w-[88px]" />
                </div>

                <div className="w-full min-w-0 overflow-x-auto">
                  {levelGrades.map((grade) => (
                    <GradeItem key={grade.id} grade={grade} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {canEdit && (
            <div className="flex justify-start mt-[12px] ml-[4px]">
              <Button
                variant="ghost"
                className="flex justify-center items-center gap-1 px-4"
                onClick={() => {
                  setSelectedLevelId(level.id ?? '');
                  setOnCreateGrade(true);
                }}
                aria-label="Agregar grado"
              >
                <IcPlus width="14" height="14" />
                <span>Agregar grado</span>
              </Button>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
      <Sheet
        open={onEditLevel !== undefined}
        onOpenChange={(open) => {
          if (!open) {
            setOnEditLevel(undefined);
          }
        }}
      >
        <Sheet.Content className="max-h-[calc(100vh-16px)] h-full max-w-[500px] w-full m-2 rounded-2xl font-lota antialiased overflow-hidden shadow-[0px_20px_40px_-4px_rgba(145,158,171,0.16)]">
          <LevelsGradesGroupsForm
            level={onEditLevel}
            onClose={() => setOnEditLevel(undefined)}
            onSave={handleUpdateLevel}
            isLoading={updateLevel.isPending}
          />
        </Sheet.Content>
      </Sheet>

      <Dialog.Root open={onDeleteLevel !== undefined}>
        <Dialog.Title>¿Quieres eliminar este nivel?</Dialog.Title>
        <div className="flex justify-between max-w-[calc(433px_-_(48px_*_2))] mx-auto gap-2 mt-8">
          <Dialog.Close
            onClick={() => {
              trackEvent('dashboard: leave delete level');
              setOnDeleteLevel(undefined);
            }}
            asChild
          >
            <Button className="w-full" variant="ghost">
              No, volver
            </Button>
          </Dialog.Close>
          <Button className="w-full bg-[#FF4842] hover:bg-[#c73833] text-white" onClick={handleConfirmDeleteLevelClick}>
            Si, eliminar
          </Button>
        </div>
      </Dialog.Root>

      <Sheet open={onCreateGrade}>
        <Sheet.Content className="max-h-[calc(100vh-16px)] h-full max-w-[500px] w-full m-2 rounded-2xl font-lota antialiased overflow-hidden shadow-[0px_20px_40px_-4px_rgba(145,158,171,0.16)]">
          {(() => {
            const gradeFormData = {
              id: null,
              name: '',
              is_last: false,
              level_id: selectedLevelId,
              groups: [],
            };

            return (
              <GradeForm
                grade={gradeFormData}
                onClose={() => setOnCreateGrade(false)}
                onSave={(data: CreateGradeAndGroupsDTO | UpdateGradeAndGroupDTO) => {
                  const { grade, groups } = data;
                  handleCreateGrade(grade as CreateGradeDTO, groups as CreateGroupDTO[] | null);
                }}
                isLoading={createGradeAndGroups.isPending}
              />
            );
          })()}
        </Sheet.Content>
      </Sheet>
    </div>
  );
}
