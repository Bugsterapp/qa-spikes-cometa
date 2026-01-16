import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@cometa/recreo/v2';
import { PlusIcon } from 'lucide-react';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { debounce } from 'lodash';
import { GlobalSearch } from '/src/components/atoms/GlobalSearch';
import MultipleFilters, { formFilterDataToParams, MultipleFiltersChips } from '/src/components/MultipleFilters';
import { useFilters } from '/src/hooks/useFilters';
import { useGetMembership } from '/src/guards/AuthGuard';
import { canManageAcademicActions } from '/src/components/academic/utils';
import { AttendanceContextTypeEnum } from '@cometa/trpc/src/students/types';
import { useAttendanceSessions } from '../hooks/use-attendance-sessions';
import { groupSessionsByDate } from '../utils';
import { AttendanceGroup } from '../components/attendance-group';
import { AttendanceListSkeleton } from '../components/attendance-skeleton';
import { TakeAttendanceDrawer } from '../components/take-attendance-drawer';
import Image from 'next/image';

function AttendanceEmptyState({ onNewRecord }: { onNewRecord: () => void }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center justify-center py-48 px-4">
        <Image
          src="/assets/attendance/sessions-placeholder.png"
          alt="Sessions Empty State"
          width={100}
          height={100}
          className="mx-auto mb-4"
        />
        <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Registra tu primera inasistencia</h3>
        <p className="text-gray-600 text-center max-w-sm">
          Comienza registrando quién faltó hoy. Cada toma queda guardada automáticamente en tu historial.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
            Aprende más
          </Button>
          <Button variant="neutral" onClick={onNewRecord}>
            Nuevo registro
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl p-0 gap-0">
          <div
            className="w-full py-12 px-16 flex items-center justify-center rounded-t-lg"
            style={{
              background: 'linear-gradient(90deg, #E4FAFF 0%, #DDE1FF 100%)',
            }}
          >
            <Image
              src="/assets/attendance/help-placeholder.png"
              alt="Registra inasistencias"
              width={200}
              height={200}
            />
          </div>
          <div className="px-6 pb-6 pt-4">
            <DialogHeader>
              <DialogTitle className="text-center text-xl">Registra inasistencias en segundos</DialogTitle>
              <DialogDescription className="text-center text-base px-8">
                Selecciona el nivel y entra al grupo o clase. Marca quién faltó y guarda el registro. Cometa mantiene el
                total actualizado en todo momento y te mostrará el acumulado final al cierre del ciclo escolar.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center mt-4">
              <Button
                variant="neutral"
                onClick={() => {
                  setIsDialogOpen(false);
                  onNewRecord();
                }}
              >
                Comenzar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function AttendanceSessionsList() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debouncedSetSearch = useMemo(() => debounce(setDebouncedSearch, 300), []);
  const membership = useGetMembership();
  const canTakeAttendance = canManageAcademicActions(membership);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { attendanceSessionId } = router.query;

  const { formFilterData, handleFilter, handleChangeChipFilter, handleClearFilter, itemsCount, setItemsCount } =
    useFilters();
  const params = useMemo(() => formFilterDataToParams(formFilterData), [formFilterData]);

  const { data: sessions, isLoading } = useAttendanceSessions();
  const groupedSessions = useMemo(() => {
    if (!sessions || sessions.length === 0) return new Map();
    return groupSessionsByDate(sessions);
  }, [sessions]);

  function handleOpenAttendanceSession(sessionId: string) {
    router.push({ query: { ...router.query, attendanceSessionId: sessionId } }, undefined, { shallow: true });
  }

  function handleCloseDrawer() {
    router.push({ query: { ...router.query, attendanceSessionId: undefined } }, undefined, { shallow: true });
    setIsDrawerOpen(false);
  }

  const filterItems = [
    {
      header: 'Tipo',
      watchKey: 'context_type',
      contents: [
        {
          id: AttendanceContextTypeEnum.Group,
          name: 'Grupo',
        },
        {
          id: AttendanceContextTypeEnum.Classroom,
          name: 'Clase',
        },
      ],
    },
    {
      header: 'Estado',
      watchKey: 'is_closed',
      contents: [
        {
          id: 'false',
          name: 'Abierto',
        },
        {
          id: 'true',
          name: 'Cerrado',
        },
      ],
    },
  ];

  return (
    <div className="h-full relative w-full font-lota antialiased">
      <div className="w-full">
        <div className="flex flex-col py-4 gap-1 border-b px-8">
          <h1 className="text-[#212B36] text-2xl font-bold">Asistencia</h1>
          <p className="text-sm text-gray-500">Toma la asistencia de tu clase y accede a los registros recientes.</p>
        </div>

        <div className="my-4 px-8">
          <h2 className="text-[#212B36] text-lg font-semibold">Registros recientes</h2>
        </div>

        <div className="flex items-center justify-between mt-2 px-8">
          <div className="flex items-center gap-2">
            <MultipleFilters
              filterItems={filterItems}
              handleFilter={handleFilter}
              onClearFilter={handleClearFilter}
              itemsCount={itemsCount}
              setItemsCount={setItemsCount}
              isLegacy={false}
            />
            <GlobalSearch
              placeholder="Buscar grupo o materia"
              search={search}
              setSearch={(value) => {
                setSearch(value);
                debouncedSetSearch(value);
              }}
              className="focus:ring-primary focus:border-primary mb-1"
            />
          </div>

          {canTakeAttendance ? (
            <Button
              onClick={() => {
                setIsDrawerOpen(true);
              }}
              variant="neutral"
            >
              <PlusIcon size={14} />
              Nuevo registro
            </Button>
          ) : null}
        </div>
      </div>

      <MultipleFiltersChips
        onChange={handleChangeChipFilter}
        formFilterData={formFilterData}
        itemsCount={itemsCount}
        setItemsCount={setItemsCount}
        className="ml-2"
      />

      <div className="w-full mt-4 px-8">
        {isLoading ? (
          <AttendanceListSkeleton />
        ) : sessions?.length === 0 && (!!debouncedSearch || Object.keys(params).length > 0) ? (
          <div className="flex justify-center items-center py-24">
            <p className="text-gray-500 text-sm">No se encontraron registros con los filtros aplicados</p>
          </div>
        ) : !sessions || sessions.length === 0 ? (
          <AttendanceEmptyState onNewRecord={() => setIsDrawerOpen(true)} />
        ) : (
          <div className="flex flex-col gap-4">
            {Array.from(groupedSessions.entries()).map(([date, dateSessions]) => (
              <AttendanceGroup
                key={date}
                date={date}
                sessions={dateSessions}
                onSessionClick={(session) => handleOpenAttendanceSession(session.id)}
              />
            ))}
          </div>
        )}
      </div>

      <TakeAttendanceDrawer
        open={!!attendanceSessionId || isDrawerOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseDrawer();
          } else {
            setIsDrawerOpen(open);
          }
        }}
        attendanceSessionId={attendanceSessionId as string | undefined}
      />
    </div>
  );
}
