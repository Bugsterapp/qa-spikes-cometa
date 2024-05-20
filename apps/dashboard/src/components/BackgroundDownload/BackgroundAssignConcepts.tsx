import * as Portal from '@radix-ui/react-portal';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useSession } from 'next-auth/react';
import { ButtonHTMLAttributes, forwardRef, useEffect } from 'react';
import cx from 'classnames';
import IcClose from '/public/assets/icons/ic_close.svg';
import IcDownload from '/public/assets/icons/ic_download.svg';
import * as Sentry from '@sentry/nextjs';
import { MassiveConceptAssignmentHistoryStatusEnum } from '@cometa/trpc/src/types';
import { cn } from '/src/utils/cn';
import { api } from '/src/utils/api';
import { useSelectedSchoolId } from '/src/guards/AuthGuard';
import { AnimatedCounter } from '../atoms/AnimatedCounter';

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export default function BackgroundConceptAssign({
  className,
  isCollapse,
}: {
  className?: string;
  isCollapse?: boolean;
}) {
  const {
    status,
    setToIdle,
    setToSuccess,
    removeFromQueue,
    setToPartialSuccess,
    setToError,
    setToDeassigning,
    setToSuccessDesassigning,
    addToQueue,
  } = useBackgroundConceptAssignStore();
  const setToStartingPoint = useRemoveAllFromQueue();

  const { data: session } = useSession();
  const isWorking = status === 'working';
  const isSuccess = status === 'success';
  const isPartialSuccess = status === 'partialSuccess';
  const isDesassigning = status === 'desassigning';
  const isDesassigned = status === 'desassigned';

  const isError = status === 'error';
  const isIdle = status === 'idle';
  const item = useIdsToDownload();
  const utils = api.useContext();

  const selectedSchoolId = useSelectedSchoolId();

  const { data: assignStatus } = api.concepts.conceptsGetAssignStatus.useQuery(
    { id: item as string, schoolId: selectedSchoolId as string },
    {
      enabled: !!item,
      onSuccess: async (data) => {
        if (data?.status === MassiveConceptAssignmentHistoryStatusEnum.PARTIAL_SUCCESS) {
          setToPartialSuccess();
          await utils.schools.schoolsStudentsByLevelList.invalidate();
          await utils.schools.schoolsStudentsByLevelList.invalidate();
          await utils.schools.schoolsConceptsStudentsAssignedList.invalidate();
          await utils.schools.schoolsConceptsStudentsAssignedIdsList.invalidate();
          setTimeout(() => {
            setToIdle();
            removeFromQueue();
          }, 15000);
        }
        if (data?.status === MassiveConceptAssignmentHistoryStatusEnum.SUCCESS) {
          setToSuccess();
          await utils.schools.schoolsStudentsByLevelList.invalidate();
          await utils.schools.schoolsConceptsStudentsAssignedList.invalidate();
          await utils.schools.schoolsConceptsStudentsAssignedIdsList.invalidate();
          setTimeout(() => {
            setToIdle();
            removeFromQueue();
          }, 15000);
        }
        if (data?.status === MassiveConceptAssignmentHistoryStatusEnum.PENDING) {
          await sleep(2000);
          await utils.concepts.conceptsGetAssignStatus.invalidate();
        }
        if (data?.status === MassiveConceptAssignmentHistoryStatusEnum.FINISHED) {
          await utils.schools.schoolsStudentsByLevelList.invalidate();
          await utils.schools.schoolsConceptsStudentsAssignedList.invalidate();
          await utils.schools.schoolsConceptsStudentsAssignedIdsList.invalidate();
          // finished
        }
        if (data?.status === MassiveConceptAssignmentHistoryStatusEnum.FAILED) {
          Sentry.captureException(new Error('failed to assign concepts'), (scope) => {
            scope.setContext('state', {
              session,
              status,
              data,
            });
            return scope;
          });
          setToError();
        }
        if (data?.status === MassiveConceptAssignmentHistoryStatusEnum.CANCELED) {
          // canceled
        }
        if (data?.status === MassiveConceptAssignmentHistoryStatusEnum.FAILED_AND_CANCELED) {
          // failed and canceled
        }
        if (data?.status === MassiveConceptAssignmentHistoryStatusEnum.STARTED) {
          await utils.concepts.conceptsGetAssignStatus.invalidate();
        }
        await utils.schools.schoolsStudentsByLevelList.invalidate();
      },
    }
  );

  const deleteConceptAssignment = api.concepts.conceptsDeleteAssign.useMutation({
    onSuccess: async () => {
      await utils.schools.schoolsStudentsByLevelList.invalidate();
      await utils.schools.schoolsConceptsStudentsAssignedList.invalidate();
      await utils.schools.schoolsConceptsStudentsAssignedIdsList.invalidate();
      addToQueue(item as string);
      setToSuccessDesassigning();
      setTimeout(() => {
        setToIdle();
        removeFromQueue();
      }, 5000);
    },
    onError: (error) => {
      Sentry.captureException(new Error('failed to delete concept assignment'), (scope) => {
        scope.setContext('state', {
          session,
          status,
          error,
        });
        return scope;
      });
      setToError();
    },
  });

  useEffect(() => {
    if (!session) {
      setToStartingPoint();
    }
    return () => {
      setToStartingPoint();
    };
  }, [session, setToStartingPoint]);
  const handleCancelAssign = async () => {
    await deleteConceptAssignment.mutate({ id: item as string, schoolId: selectedSchoolId as string });
    setToDeassigning();
  };
  const handleClose = () => {
    setToStartingPoint();
    setToIdle();
    removeFromQueue();
  };
  return (
    <Portal.Root>
      <Sentry.ErrorBoundary
        beforeCapture={(scope) => {
          scope.setContext('state', {
            session,
            status,
            // items,
          });
        }}
      >
        <div
          className={cn(
            'fixed bottom-0 right-0 w-full h-20 transition-transform bg-white shadow-backgroundDownload background-element z-[11]',
            className
          )}
          key={`${status}`}
          data-state={!isIdle ? 'open' : 'idle'}
        >
          <div className="flex justify-between h-full">
            <div className="flex">
              <div
                className={cn('py-2 px-4 h-full grid place-items-center ml-36 xl:ml-[300px]', {
                  'ml-32 xl:ml-[150px]': isCollapse,
                })}
              >
                <img
                  src="/assets/loading.svg"
                  alt="loading"
                  data-state={isWorking || isDesassigning ? 'show' : 'hide'}
                  className="grid-area"
                />
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 30 30"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  data-state={isPartialSuccess || isSuccess || isDesassigned ? 'show' : 'hide'}
                  className="grid-area"
                >
                  <path
                    d="M9.13672 15L13.2289 20.0016C13.4356 20.2542 13.825 20.2443 14.0185 19.9814L20.999 10.5"
                    stroke="#00AB55"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="fPvpbRVO_0"
                    data-state={isPartialSuccess || isSuccess || isDesassigned ? 'running' : 'paused'}
                  />
                  <path
                    d="M28.75 15C28.75 22.5939 22.5939 28.75 15 28.75C7.40608 28.75 1.25 22.5939 1.25 15C1.25 7.40608 7.40608 1.25 15 1.25C22.5939 1.25 28.75 7.40608 28.75 15Z"
                    stroke="#00AB55"
                    strokeWidth="2.5"
                    className="fPvpbRVO_1"
                    data-state={isPartialSuccess || isSuccess || isDesassigned ? 'running' : 'paused'}
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="35"
                  height="35"
                  fill="none"
                  className="grid-area"
                  date-state={isError ? 'show' : 'hide'}
                >
                  <path
                    stroke="red"
                    strokeWidth="3.5"
                    d="M2.6000000000000014,17.6A15,15 0,1,1 32.6,17.6A15,15 0,1,1 2.6000000000000014,17.6"
                    className="FHGIIeCe_2"
                    data-state={isError ? 'running' : 'paused'}
                  />
                  <path
                    stroke="red"
                    strokeLinecap="round"
                    strokeWidth="2.8"
                    d="M11.5 11.5 24 24"
                    className="FHGIIeCe_3"
                    data-state={isError ? 'running' : 'paused'}
                  />
                  <path
                    stroke="red"
                    strokeLinecap="round"
                    strokeWidth="2.8"
                    d="M11.5 24 24 11.5"
                    className="FHGIIeCe_4"
                    data-state={isError ? 'running' : 'paused'}
                  />
                </svg>
                {/* i should add an element in those cases that it is transitioning between elements so it doesnt flicker */}
                <div className="grid-area w-[40px] h-[40px]" />
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-lg font-bold">
                  {isWorking && (
                    <>
                      Asignando estudiantes{' '}
                      {assignStatus &&
                      typeof assignStatus.student_processed === 'number' &&
                      assignStatus.student_processed > 1 ? (
                        <div className="w-42 h-6 px-2 py-px bg-gray-400 bg-opacity-20 rounded-3xl justify-start items-center inline-flex">
                          <div className="text-center text-gray-800 text-sm font-bold">
                            <AnimatedCounter duration={2500} from={0} to={assignStatus.student_processed} /> de{' '}
                            {assignStatus.student_quantity} estudiantes{' '}
                          </div>
                        </div>
                      ) : null}
                    </>
                  )}
                  {(isPartialSuccess || isSuccess) &&
                    `Se asignaron ${assignStatus?.student_processed || 'todos los'} estudiantes exitosamente`}
                  {isError && 'Ha ocurrido un problema con la asignación'}
                  {isDesassigning && 'Cancelando asignación'}
                  {isDesassigned && 'Asignación cancelada'}
                </div>
                <p>
                  {isWorking &&
                    'Este proceso puede tardar algunos minutos. Puedes seguir usando la plataforma mientras terminamos la asignación.'}
                  {(isPartialSuccess || isSuccess) &&
                    'Ahora puedes registrar pagos para estos estudiantes sin ningún problema.'}
                  {isError && 'Intenta nuevamente o solicita ayuda al equipo de soporte de Cometa.'}
                  {isDesassigning &&
                    'Este proceso puede tardar algunos minutos. Puedes seguir usando la plataforma mientras terminamos de cancelar la asignación.'}
                </p>
              </div>
            </div>
            <div className="flex items-center px-4 gap-4">
              {(isPartialSuccess || isSuccess) && (
                <button className="text-[#FF4842] bg-transparent font-bold" onClick={handleCancelAssign}>
                  Desasignar
                </button>
              )}
              {(isError || isDesassigned || isPartialSuccess || isSuccess) && (
                <button className="text-gray-400 bg-transparent font-bold" onClick={handleClose}>
                  <IcClose fill="#212B36" />
                </button>
              )}
            </div>
          </div>
        </div>
      </Sentry.ErrorBoundary>
    </Portal.Root>
  );
}

interface MyState {
  status: 'idle' | 'working' | 'success' | 'error' | 'desassigning' | 'desassigned' | 'partialSuccess';
  backgroundQueue: string | null;
  setIsWorking: () => void;
  setToIdle: () => void;
  setToSuccess: () => void;
  setToPartialSuccess: () => void;
  setToError: () => void;
  setToDeassigning: () => void;
  setToSuccessDesassigning: () => void;
  addToQueue: (id: string) => void;
  removeFromQueue: () => void;
  removeAllFromQueue: () => void;
}

export const useBackgroundConceptAssignStore = create<MyState>()(
  devtools(
    immer(
      persist(
        (set) => ({
          status: 'idle',
          backgroundQueue: null,
          setIsWorking: () =>
            set((state) => {
              state.status = 'working';
            }),
          setToIdle: () =>
            set((state) => {
              state.status = 'idle';
            }),
          setToSuccess: () =>
            set((state) => {
              state.status = 'success';
            }),
          setToPartialSuccess: () =>
            set((state) => {
              state.status = 'partialSuccess';
            }),
          setToSuccessDesassigning: () =>
            set((state) => {
              state.status = 'desassigned';
            }),
          setToError: () =>
            set((state) => {
              state.status = 'error';
            }),
          setToDeassigning: () =>
            set((state) => {
              state.status = 'desassigning';
            }),
          addToQueue: (id: string) =>
            set((state) => {
              state.backgroundQueue = id;
            }),
          removeFromQueue: () =>
            set((state) => {
              // remove an item from state.backgroundQueue by id
              state.backgroundQueue = null;
            }),
          removeAllFromQueue: () =>
            set((state) => {
              // remove an item from state.backgroundQueue by id
              state.backgroundQueue = null;
              state.status = 'idle';
            }),
        }),
        {
          name: 'background-concept-assign', // name of item in the storage (must be unique)
          getStorage: () => localStorage, // (optional) by default the 'localStorage' is used
        }
      )
    ),
    { name: 'background-concept-assign' }
  )
);

type ButtonProps = {
  handleAdd?: () => Promise<void>;
  theme: 'white' | 'blue';
  size?: 'default' | 'large';
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const DownloadButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ handleAdd, theme = 'white', children, size = 'default', disabled, ...rest }, ref) => {
    const status = useBackgroundDownloadState();
    const isWorking = status === 'working';
    const className = cx('bg-transparent disabled:opacity-25 disabled:cursor-not-allowed flex items-center', {
      'text-white': theme === 'white',
      'text-[#3366FF] hover:text-[#1890FF]': theme !== 'white',
    });

    const sizing = size === 'default' ? '20' : '30';

    return (
      <button
        {...rest}
        ref={ref}
        className={className}
        disabled={isWorking || disabled}
        {...(handleAdd ? { onClick: () => handleAdd() } : {})}
      >
        {children}
        <IcDownload fill="currentColor" width={sizing} height={sizing} />
      </button>
    );
  }
);

export const useBackgroundDownloadState = () => useBackgroundConceptAssignStore((store) => store.status);
export const useSetIsWorking = () => useBackgroundConceptAssignStore((store) => store.setIsWorking);
export const useSetToIdle = () => useBackgroundConceptAssignStore((store) => store.setToIdle);
export const useSetToError = () => useBackgroundConceptAssignStore((store) => store.setToError);
export const useSetToSuccess = () => useBackgroundConceptAssignStore((store) => store.setToSuccess);
export const useAddToQueue = () => useBackgroundConceptAssignStore((store) => store.addToQueue);
export const useRemoveFromQueue = () => useBackgroundConceptAssignStore((store) => store.removeFromQueue);
export const useRemoveAllFromQueue = () => useBackgroundConceptAssignStore((store) => store.removeAllFromQueue);
export const useIdsToDownload = () => useBackgroundConceptAssignStore((store) => store.backgroundQueue);
