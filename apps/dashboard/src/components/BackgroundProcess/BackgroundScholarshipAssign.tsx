import * as Portal from '@radix-ui/react-portal';
import { useSession } from 'next-auth/react';
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { cn } from '/src/utils/cn';
import { api } from '/src/utils/api';
import { useSelectedSchoolId } from '/src/guards/AuthGuard';
import { AnimatedCounter } from '../atoms/AnimatedCounter';
import {
  useBackgroundProcessStatus,
  useSetBackgroundProcessStatus,
  useProcessQueueId,
  useRemoveFromProcessQueue,
  useRemoveAllFromProcessQueue,
} from '/src/store/backgroundProcessStore';
import IcClose from '/public/assets/icons/ic_close.svg';

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export default function BackgroundScholarshipAssign({
  className,
  isCollapse,
}: {
  className?: string;
  isCollapse?: boolean;
}) {
  const status = useBackgroundProcessStatus();
  const setStatus = useSetBackgroundProcessStatus();
  const removeFromQueue = useRemoveFromProcessQueue();
  const setToStartingPoint = useRemoveAllFromProcessQueue();

  const { data: session } = useSession();
  const isWorking = status === 'working';
  const isSuccess = status === 'success';
  const isCancelling = status === 'cancelling';
  const isCancelled = status === 'cancelled';
  const isError = status === 'error';
  const isIdle = status === 'idle';
  const assignmentId = useProcessQueueId();
  const selectedSchoolId = useSelectedSchoolId();

  const utils = api.useUtils();
  const { data: assignStatus } = api.scholarships.getAssignmentStatus.useQuery(
    { assignment_id: assignmentId as string, school_id: selectedSchoolId as string },
    {
      enabled: !!assignmentId,
    }
  );

  useEffect(() => {
    const handleAssignmentStatus = async () => {
      if (!assignStatus) return;

      if (assignStatus?.status === 'SUCCESS') {
        setStatus('success');
        await utils.schools.invalidate();
        await utils.students.invalidate();
        await utils.scholarships.scholarshipDetails.invalidate();
        await utils.scholarships.scholarships.invalidate();
      }
      if (assignStatus?.status === 'RUNNING' || assignStatus?.status === 'READY_TO_RUN') {
        await sleep(2000);
        await utils.scholarships.getAssignmentStatus.invalidate();
      }
      if (assignStatus?.status === 'FAILED') {
        Sentry.captureException(new Error('failed to assign scholarships'), (scope) => {
          scope.setContext('state', {
            session,
            status,
            data: assignStatus,
          });
          return scope;
        });
        setStatus('error');
      }
      if (assignStatus?.status === 'CANCELING') {
        setStatus('cancelling');
      }
      if (assignStatus?.status === 'CANCELED') {
        setStatus('cancelled');
        setTimeout(() => {
          setStatus('idle');
          removeFromQueue();
        }, 5000);
      }
      if (assignStatus?.status === 'CANCELATION_FAILED') {
        Sentry.captureException(new Error('failed to cancel scholarship assignment'), (scope) => {
          scope.setContext('state', {
            session,
            status,
            data: assignStatus,
          });
          return scope;
        });
        setStatus('error');
      }
    };

    handleAssignmentStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignStatus]);

  const cancelAssignmentMutation = api.scholarships.cancelAssignment.useMutation({
    onSuccess: async () => {
      setStatus('cancelled');
      setTimeout(async () => {
        setStatus('idle');
        removeFromQueue();
      }, 10000);
      await utils.schools.invalidate();
      await utils.students.invalidate();
      await utils.scholarships.scholarshipDetails.invalidate();
      await utils.scholarships.scholarships.invalidate();
    },
    onError: (error) => {
      Sentry.captureException(new Error('failed to cancel scholarship assignment'), (scope) => {
        scope.setContext('state', {
          session,
          status,
          error,
        });
        return scope;
      });
      setStatus('error');
    },
  });

  //   useEffect(() => {
  //     if (!session) {
  //       setToStartingPoint();
  //     }
  //     return () => {
  //       setToStartingPoint();
  //     };
  //   }, [session, setToStartingPoint]);

  const handleCancelAssign = async () => {
    if (assignmentId && selectedSchoolId) {
      setStatus('cancelling');
      await cancelAssignmentMutation.mutate({
        assignment_id: assignmentId,
        school_id: selectedSchoolId,
      });
    }
  };

  const handleClose = async () => {
    setToStartingPoint();
    setStatus('idle');
    removeFromQueue();
    await utils.schools.invalidate();
    await utils.students.invalidate();
    await utils.scholarships.scholarshipDetails.invalidate();
    await utils.scholarships.scholarships.invalidate();
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
                  data-state={isWorking || isCancelling ? 'show' : 'hide'}
                  className="grid-area"
                />
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 30 30"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  data-state={isSuccess || isCancelled ? 'show' : 'hide'}
                  className="grid-area"
                >
                  <path
                    d="M9.13672 15L13.2289 20.0016C13.4356 20.2542 13.825 20.2443 14.0185 19.9814L20.999 10.5"
                    stroke="#00AB55"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="fPvpbRVO_0"
                    data-state={isSuccess || isCancelled ? 'running' : 'paused'}
                  />
                  <path
                    d="M28.75 15C28.75 22.5939 22.5939 28.75 15 28.75C7.40608 28.75 1.25 22.5939 1.25 15C1.25 7.40608 7.40608 1.25 15 1.25C22.5939 1.25 28.75 7.40608 28.75 15Z"
                    stroke="#00AB55"
                    strokeWidth="2.5"
                    className="fPvpbRVO_1"
                    data-state={isSuccess || isCancelled ? 'running' : 'paused'}
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
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-lg font-bold">
                  {isWorking && (
                    <>
                      Asignando beca{' '}
                      {assignStatus &&
                      typeof assignStatus.assigned_students === 'number' &&
                      assignStatus.assigned_students > 1 ? (
                        <div className="w-42 h-6 px-2 py-px bg-gray-400 bg-opacity-20 rounded-3xl justify-start items-center inline-flex">
                          <div className="text-center text-gray-800 text-sm font-bold">
                            <AnimatedCounter duration={2500} from={0} to={assignStatus.assigned_students} /> de{' '}
                            {assignStatus.total_students} estudiantes{' '}
                          </div>
                        </div>
                      ) : null}
                    </>
                  )}
                  {isSuccess && `Se asignó la  beca a ${assignStatus?.assigned_students} estudiantes exitosamente`}
                  {isError && 'Ha ocurrido un problema con la asignación'}
                  {isCancelling && 'Cancelando asignación'}
                  {isCancelled && `Se canceló la asignación de ${assignStatus?.assigned_students} estudiantes`}
                </div>
                <p>
                  {isWorking &&
                    'Este proceso puede tardar algunos minutos. Puedes seguir usando la plataforma mientras terminamos la asignación.'}
                  {isSuccess && 'Las becas han sido asignadas correctamente a los estudiantes seleccionados.'}
                  {isError && 'Intenta nuevamente o solicita ayuda al equipo de soporte de Cometa.'}
                  {isCancelling &&
                    'Este proceso puede tardar algunos minutos. Puedes seguir usando la plataforma mientras terminamos la asignación.'}
                </p>
              </div>
            </div>
            <div className="flex items-center px-4 gap-4">
              {isSuccess && (
                <button className="text-[#FF4842] bg-transparent font-bold" onClick={handleCancelAssign}>
                  Deshacer asignación
                </button>
              )}
              {(isError || isCancelled || isSuccess) && (
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
