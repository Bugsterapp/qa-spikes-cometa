import React, { useEffect, useState, useRef, useCallback } from 'react';
import 'react-circular-progressbar/dist/styles.css';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { Button } from '@cometa/recreo/components/ui/Button';
import { type SrcSchoolsApiDomainEntitiesLevelEntity } from '@cometa/trpc/src/students/types';
import { cn } from '@cometa/utils';

import IcAlertCircle from 'public/assets/icons/levels_grades_groups/ic_alert_circle.svg';
import IcPlus from 'public/assets/icons/levels_grades_groups/ic_plus.svg';

import { Accordion } from '../../components/ui/Accordion';
import Sheet from '../../components/atoms/Sheet';
import Layout from '../../components/layouts';
import { LevelItem } from '../../components/levels_grades_groups/LevelItem';
import { LevelsGradesGroupsForm, type LevelFormDTO } from '../../components/levels_grades_groups/LevelForm';
import { useSelectedSchool } from '../../guards/AuthGuard';
import useAlert from '../../hooks/useAlert';
import useSendPageViewedEvent from '../../hooks/useSendPageViewedEvent';
import useSendTrackEventWithUserName from '../../hooks/useSendTrackEventWithUserName';
import { useLevelsGradeGroups } from '../../hooks/useLevelsGradesGroups';
import { api } from '../../utils/api';

export default function LevelsGradesGroupsPage() {
  const selectedSchool = useSelectedSchool();

  useSendPageViewedEvent('Estructura de niveles', selectedSchool);

  return <LevelsGradesGroupsAccordion />;
}

LevelsGradesGroupsPage.getLayout = function getLayout(page: JSX.Element) {
  return (
    <Layout title="Estructura de niveles" dashboardVariant="stretch">
      {page}
    </Layout>
  );
};

LevelsGradesGroupsPage.auth = true;

const DraggableLevelList = ({ levels }: { levels: SrcSchoolsApiDomainEntitiesLevelEntity[] }) => {
  const sortByOrder = useCallback(
    (levels: SrcSchoolsApiDomainEntitiesLevelEntity[]) => [...levels].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    []
  );

  const [items, setItems] = useState(() => sortByOrder(levels));
  const [expandedLevels, setExpandedLevels] = useState<string[]>([]);
  const { refetch } = useLevelsGradeGroups();

  const trackEvent = useSendTrackEventWithUserName();
  const selectedSchool = useSelectedSchool();
  const { setAlertState } = useAlert();

  useEffect(() => {
    setItems(sortByOrder(levels));
  }, [levels, sortByOrder]);

  const updateLevel = api.students.updateLevel.useMutation({
    onSuccess: () => {
      setAlertState({
        severity: 'success',
        open: true,
        message: '¡Orden de niveles actualizado!',
      });
      refetch();
    },
    onError: () => {
      setAlertState({
        severity: 'error',
        open: true,
        message: 'Error al actualizar el orden de niveles',
      });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        const updatedLevels = newItems.map((level, index) => ({
          ...level,
          order: index + 1,
        }));

        onSave(updatedLevels);
        return updatedLevels;
      });
    }
  };

  const onSave = (updatedLevels: SrcSchoolsApiDomainEntitiesLevelEntity[]) => {
    if (!selectedSchool?.id) return;

    updatedLevels.forEach((level) => {
      updateLevel.mutate({
        schoolId: selectedSchool?.id ?? '',
        levelId: level.id ?? '',
        order: level.order,
      });
    });

    trackEvent('dashboard: reorder levels');
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={() => setExpandedLevels([])}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((level) => level.id as string)} strategy={verticalListSortingStrategy}>
        <Accordion
          type="multiple"
          className="w-full space-y-4"
          value={expandedLevels}
          onValueChange={setExpandedLevels}
        >
          {items.map((level) => (
            <LevelItem key={level.id} level={level} />
          ))}
        </Accordion>
      </SortableContext>
    </DndContext>
  );
};

const Levels = ({
  isLoadingLevels,
  levelsData,
}: {
  isLoadingLevels: boolean;
  levelsData: SrcSchoolsApiDomainEntitiesLevelEntity[] | undefined;
}) => {
  const [onCreateLevel, setOnCreateLevel] = useState(false);
  const { setAlertState } = useAlert();
  const trackEvent = useSendTrackEventWithUserName();
  const { refetch, canEdit } = useLevelsGradeGroups();
  const selectedSchool = useSelectedSchool();

  const createLevel = api.students.createLevel.useMutation({
    onSuccess: () => {
      setAlertState({
        severity: 'success',
        open: true,
        message: '¡Nivel creado!',
      });
      refetch();
    },
    onError: () => {
      setAlertState({
        severity: 'error',
        open: true,
        message: 'Error al crear el nivel',
      });
    },
  });

  const handleCreateLevel = (data: LevelFormDTO) => {
    createLevel.mutate({
      schoolId: selectedSchool?.id ?? '',
      name: data.name,
      type: data.type,
    });

    trackEvent('dashboard: create level');
    setOnCreateLevel(false);
  };

  if (isLoadingLevels) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[calc(100vh-300px)] flex-col">
        <img src="/assets/loading.svg" alt="loading" data-state="show" className="mx-auto w-10 h-10" />
      </div>
    );
  }

  if (!levelsData || levelsData.length === 0) {
    return (
      <div className="flex flex-col w-full">
        <div className="w-full h-full flex items-center justify-center min-h-[calc(100vh-300px)] flex-col">
          <div className="max-w-lg flex flex-col items-center text-center px-8">
            <div className="space-y-4 mb-8">
              <h2 className="text-2xl font-bold text-[#212B36] leading-tight">¡Aún no tienes niveles creados!</h2>
              <p className="text-[#637381] text-base leading-relaxed max-w-sm">
                Crea tu primer nivel para comenzar a organizar la estructura académica de tu institución.
              </p>
            </div>

            {canEdit && (
              <Button
                color="black"
                variant="solid"
                className="flex justify-center items-center py-3 px-6 gap-2 text-sm font-medium rounded-lg transition-all hover:shadow-lg"
                onClick={() => {
                  setOnCreateLevel(true);
                }}
                aria-label="agregar nivel"
                leftIcon={
                  <div className="text-white [&>svg>path]:fill-white [&>svg]:fill-white">
                    <IcPlus width="16" height="16" />
                  </div>
                }
              >
                Crear mi primer nivel
              </Button>
            )}
          </div>
        </div>

        <Sheet open={onCreateLevel}>
          <Sheet.Content className="max-h-[calc(100vh-16px)] h-full max-w-[500px] w-full m-2 rounded-2xl  antialiased overflow-hidden shadow-[0px_20px_40px_-4px_rgba(145,158,171,0.16)]">
            <LevelsGradesGroupsForm
              onClose={() => setOnCreateLevel(false)}
              onSave={handleCreateLevel}
              isLoading={createLevel.isPending}
            />
          </Sheet.Content>
        </Sheet>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <DraggableLevelList levels={levelsData || []} />
      {canEdit && (
        <div className="mt-[8px]">
          <Button
            color="black"
            variant="solid-light"
            className="flex justify-center items-center py-[6px] px-[16px] gap-[4px] text-[13px]"
            onClick={() => {
              setOnCreateLevel(true);
            }}
            aria-label="agregar nivel"
            leftIcon={<IcPlus width="14" height="14" />}
          >
            Agregar nivel
          </Button>
        </div>
      )}
      <Sheet open={onCreateLevel}>
        <Sheet.Content className="max-h-[calc(100vh-16px)] h-full max-w-[500px] w-full m-2 rounded-2xl  antialiased overflow-hidden shadow-[0px_20px_40px_-4px_rgba(145,158,171,0.16)]">
          <LevelsGradesGroupsForm
            onClose={() => setOnCreateLevel(false)}
            onSave={handleCreateLevel}
            isLoading={createLevel.isPending}
          />
        </Sheet.Content>
      </Sheet>
    </div>
  );
};

function LevelsGradesGroupsAccordion() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const { levels, isLoading } = useLevelsGradeGroups();

  const gradesWithoutNextGrade =
    levels?.flatMap((level) => (level.grades ?? []).filter((grade) => !grade.is_last && !grade.next_id)) ?? [];

  const hasGradesWithoutNextGrade = gradesWithoutNextGrade.length > 0;

  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY);

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="relative w-full h-full ">
      <div
        className={cn('w-full top-0 sticky z-10 bg-white', {
          static: offset > 500,
        })}
      >
        <div className="flex items-center h-[72px] px-[32px] pt-[24px] pb-[8px] gap-[24px] transition-all transform-gpu bg-white w-full">
          <h1 className="text-[#212B36] text-2xl font-bold mr-auto">Estructura de niveles</h1>
        </div>
      </div>

      {hasGradesWithoutNextGrade && (
        <div className="flex p-[12px_12px_12px_16px] items-center mx-[32px] mt-[16px] gap-[12px] self-stretch rounded-lg bg-[var(--States-Error-error-50,#FFEFEF)]">
          <div className="flex-shrink-0 text-[#FF4842]">
            <IcAlertCircle />
          </div>
          <p className="text-[#E65959] text-base font-normal leading-6 ">
            Algunos grados no tienen configurado un siguiente grado
          </p>
        </div>
      )}

      <div
        ref={contentRef}
        className="flex flex-col items-start p-8 flex-1 w-full bg-white rounded-xl shadow-none mb-28"
      >
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center min-h-[calc(100vh-300px)] flex-col">
            <img src="/assets/loading.svg" alt="loading" data-state="show" className="mx-auto w-10 h-10" />
          </div>
        ) : (
          <Levels key={`levels-${levels?.length}`} isLoadingLevels={false} levelsData={levels ?? []} />
        )}
      </div>
    </div>
  );
}
