import * as Portal from '@radix-ui/react-portal';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import IcClose from '/public/assets/icons/ic_close.svg';
import * as Sentry from '@sentry/nextjs';
import { MassiveConceptDissasignmentStatusEnum } from '@cometa/trpc/src/types';
import { cn } from '/src/utils/cn';
import { api } from '/src/utils/api';
import { useSelectedSchoolId } from '/src/guards/AuthGuard';
import { AnimatedCounter } from '../atoms/AnimatedCounter';

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export default function BackgroundDeassignConcepts({
  className,
  isCollapse,
}: {
  className?: string;
  isCollapse?: boolean;
}) {
  const { status, setToIdle, setToSuccess, removeFromQueue, setToError } = useBackgroundConceptDeassignStore();
  const setToStartingPoint = useRemoveAllFromQueue();

  const { data: session } = useSession();
  const isWorking = status === 'working';
  const isSuccess = status === 'success';
  const isError = status === 'error';
  const item = useIdsToDownload();
  const utils = api.useUtils();

  const selectedSchoolId = useSelectedSchoolId();

  const { data: assignStatus } = api.concepts.conceptsGetDeassignStatus.useQuery(
    { id: item as string, schoolId: selectedSchoolId as string },
    {
      enabled: !!item,
    }
  );

  useEffect(() => {
    const handleDeassignStatus = async () => {
      if (!assignStatus) return;

      if (assignStatus.status === MassiveConceptDissasignmentStatusEnum.FINISHED) {
        setToSuccess();
        await utils.schools.schoolsConceptsStudentsAssignedList.invalidate();
        await utils.schools.schoolsConceptsStudentsAssignedIdsList.invalidate();
        setTimeout(() => {
          setToIdle();
          removeFromQueue();
        }, 5000);
      }
      if (assignStatus.status === MassiveConceptDissasignmentStatusEnum.PENDING) {
        await sleep(2000);
        await utils.concepts.conceptsGetDeassignStatus.invalidate();
      }

      if (assignStatus.status === MassiveConceptDissasignmentStatusEnum.ERROR) {
        Sentry.captureException(new Error('failed to assign concepts'), (scope) => {
          scope.setContext('state', {
            session,
            status,
            assignStatus,
          });
          return scope;
        });
        setToError();
      }
    };

    handleDeassignStatus();
  }, [assignStatus]);

  useEffect(() => {
    if (!session) {
      setToStartingPoint();
    }
    return () => {
      setToStartingPoint();
    };
  }, [session, setToStartingPoint]);

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
          });
        }}
      >
        <StatusWrapper className={className} status={status}>
          <div className="flex justify-between h-full">
            <div className="flex">
              <StatusIndicator isWorking={isWorking} isSuccess={isSuccess} isError={isError} isCollapse={isCollapse} />
              <div className="flex flex-col justify-center">
                <div className="text-lg font-bold">
                  {isWorking && (
                    <>
                      Desasignando estudiantes{' '}
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
                  {isSuccess && 'Desasignación completada exitosamente.'}
                  {isError && 'Ha ocurrido un problema con la desasignación'}
                </div>
                <p>
                  {isWorking &&
                    'Este proceso puede tardar algunos minutos. Puedes seguir usando la plataforma mientras terminamos la desasignación.'}
                  {isError && 'Intenta nuevamente o solicita ayuda al equipo de soporte de Cometa.'}
                </p>
              </div>
            </div>
            <div className="flex items-center px-4 gap-4">
              {(isError || isSuccess) && (
                <button className="text-gray-400 bg-transparent font-bold" onClick={handleClose}>
                  <IcClose fill="#212B36" />
                </button>
              )}
            </div>
          </div>
        </StatusWrapper>
      </Sentry.ErrorBoundary>
    </Portal.Root>
  );
}
interface StatusWrapperProps {
  className?: string;
  status: BackgroundConceptDeassignStore['status'];
  children: React.ReactNode;
}

const StatusWrapper = ({ className, status, children }: StatusWrapperProps) => (
  <div
    className={cn(
      'fixed bottom-0 right-0 w-full h-20 transition-transform bg-white shadow-backgroundDownload background-element z-[11]',
      className
    )}
    key={`${status}`}
    data-state={status !== 'idle' ? 'open' : 'idle'}
  >
    {children}
  </div>
);

interface StatusIndicatorProps {
  isWorking: boolean;
  isSuccess: boolean;
  isError: boolean;
  isCollapse?: boolean;
}

const StatusIndicator = ({ isWorking, isSuccess, isError, isCollapse }: StatusIndicatorProps) => (
  <div
    className={cn('py-2 px-4 h-full grid place-items-center ml-36 xl:ml-[300px]', {
      'ml-32 xl:ml-[150px]': isCollapse,
    })}
  >
    <img src="/assets/loading.svg" alt="loading" data-state={isWorking ? 'show' : 'hide'} className="grid-area" />
    <SuccessIcon dataState={isSuccess ? 'show' : 'hide'} className="grid-area" />
    <ErrorIcon dataState={isError ? 'show' : 'hide'} className="grid-area" />
    {/* Placeholder for transition */}
    <div className="grid-area w-[40px] h-[40px]" />
  </div>
);

interface IconProps {
  dataState: 'show' | 'hide';
  className: string;
}

const SuccessIcon = ({ dataState, className }: IconProps) => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    data-state={dataState}
    className={className}
  >
    <path
      d="M9.13672 15L13.2289 20.0016C13.4356 20.2542 13.825 20.2443 14.0185 19.9814L20.999 10.5"
      stroke="#00AB55"
      strokeWidth="3"
      strokeLinecap="round"
      className="fPvpbRVO_0"
      data-state={dataState === 'show' ? 'running' : 'paused'}
    />
    <path
      d="M28.75 15C28.75 22.5939 22.5939 28.75 15 28.75C7.40608 28.75 1.25 22.5939 1.25 15C1.25 7.40608 7.40608 1.25 15 1.25C22.5939 1.25 28.75 7.40608 28.75 15Z"
      stroke="#00AB55"
      strokeWidth="2.5"
      className="fPvpbRVO_1"
      data-state={dataState === 'show' ? 'running' : 'paused'}
    />
  </svg>
);

const ErrorIcon = ({ dataState, className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="35"
    height="35"
    fill="none"
    className={className}
    data-state={dataState}
  >
    <path
      stroke="red"
      strokeWidth="3.5"
      d="M2.6000000000000014,17.6A15,15 0,1,1 32.6,17.6A15,15 0,1,1 2.6000000000000014,17.6"
      className="FHGIIeCe_2"
      data-state={dataState === 'show' ? 'running' : 'paused'}
    />
    <path
      stroke="red"
      strokeLinecap="round"
      strokeWidth="2.8"
      d="M11.5 11.5 24 24"
      className="FHGIIeCe_3"
      data-state={dataState === 'show' ? 'running' : 'paused'}
    />
    <path
      stroke="red"
      strokeLinecap="round"
      strokeWidth="2.8"
      d="M11.5 24 24 11.5"
      className="FHGIIeCe_4"
      data-state={dataState === 'show' ? 'running' : 'paused'}
    />
  </svg>
);
interface BackgroundConceptDeassignStore {
  status: 'idle' | 'working' | 'success' | 'error';
  backgroundQueue: string | null;
  setIsWorking: () => void;
  setToIdle: () => void;
  setToSuccess: () => void;
  setToError: () => void;
  addToQueue: (id: string) => void;
  removeFromQueue: () => void;
  removeAllFromQueue: () => void;
}

export const useBackgroundConceptDeassignStore = create<BackgroundConceptDeassignStore>()(
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
          setToError: () =>
            set((state) => {
              state.status = 'error';
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
          name: 'background-concept-deassign', // name of item in the storage (must be unique)
          storage: createJSONStorage(() => localStorage),
        }
      )
    ),
    { name: 'background-concept-deassign' }
  )
);

export const useBackgroundDownloadState = () => useBackgroundConceptDeassignStore((store) => store.status);
export const useSetIsWorking = () => useBackgroundConceptDeassignStore((store) => store.setIsWorking);
export const useSetToIdle = () => useBackgroundConceptDeassignStore((store) => store.setToIdle);
export const useSetToError = () => useBackgroundConceptDeassignStore((store) => store.setToError);
export const useSetToSuccess = () => useBackgroundConceptDeassignStore((store) => store.setToSuccess);
export const useAddToQueue = () => useBackgroundConceptDeassignStore((store) => store.addToQueue);
export const useRemoveFromQueue = () => useBackgroundConceptDeassignStore((store) => store.removeFromQueue);
export const useRemoveAllFromQueue = () => useBackgroundConceptDeassignStore((store) => store.removeAllFromQueue);
export const useIdsToDownload = () => useBackgroundConceptDeassignStore((store) => store.backgroundQueue);
