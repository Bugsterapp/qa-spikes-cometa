import * as Portal from '@radix-ui/react-portal';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import ApiClient from '../../services/ApiClient';
import { useSession } from 'next-auth/react';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ButtonHTMLAttributes, forwardRef, PropsWithChildren, useEffect } from 'react';
import cx from 'classnames';
import IcClose from '/public/assets/icons/ic_close.svg';
import IcDownload from '/public/assets/icons/ic_download.svg';
import * as Sentry from '@sentry/nextjs';
import { ExcelReport } from '@cometa/trpc/src/types';
import { cn } from '/src/utils/cn';

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export default function BackgroundDownload({ className }: { className?: string }) {
  const status = useBackgroundDownloadState();
  const setToIdle = useSetToIdle();
  const setToSuccess = useSetToSuccess();
  const setToStartingPoint = useRemoveAllFromQueue();
  const queryClient = useQueryClient();
  const removeFromQueue = useRemoveFromQueue();
  const setToError = useSetToError();
  const { data: session } = useSession();
  const isWorking = status === 'working';
  const isSuccess = status === 'success';
  const isError = status === 'error';
  const isIdle = status === 'idle';
  const store = useBackgroundStore;
  const items = useIdsToDownload();
  const getReportById = (id: string, typeFile: string): ExcelReport =>
    ApiClient.getReportById(session?.token, id, typeFile);

  type SetToFunction = () => void;

  const onDownloadSuccess = async (
    data: ExcelReport,
    removeFromQueue: (id: string) => void,
    setToSuccess: SetToFunction,
    setToIdle: SetToFunction
  ): Promise<boolean> => {
    const { id, url: reportURL } = data;
    if (!reportURL) return false;

    await downloadReport(reportURL);

    removeFromQueue(id);

    const idState = store.getState().backgroundQueue;
    if (idState.length === 0) {
      setToSuccess();
      setTimeout(() => {
        setToIdle();
      }, 2000);
    }

    return true;
  };

  const downloadReport = async (reportURL: string): Promise<void> => {
    const link = document.createElement('a');
    link.href = reportURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useQueries({
    queries: items.map((item) => ({
      queryKey: ['report-id', item.id, items] as const,
      queryFn: () => getReportById(item.id, item.typeFile),
      retries: 100,
      onSuccess: async (data: ExcelReport) => {
        if (isIdle) return;

        if (data.status === 'failed') {
          removeFromQueue(data.id);
          setToError();
          setTimeout(() => {
            setToIdle();
          }, 12000);
          return;
        }
        const downloadSucceeded = await onDownloadSuccess(data, removeFromQueue, setToSuccess, setToIdle);
        if (!downloadSucceeded) {
          // this delay is to keep trying to download the report until it succeeds
          await sleep(1500);
          queryClient.invalidateQueries(['report-id', data.id]);
        }
      },
      onError: (err: Error) => {
        Sentry.captureException(err, (scope) => {
          scope.setContext('state', {
            session,
            status,
            items,
          });
          return scope;
        });
      },
    })),
  });

  useEffect(() => {
    if (!session) {
      setToStartingPoint();
    }
    return () => {
      setToStartingPoint();
    };
  }, [session, setToStartingPoint]);
  return (
    <Portal.Root>
      <Sentry.ErrorBoundary
        beforeCapture={(scope) => {
          scope.setContext('state', {
            session,
            status,
            items,
          });
        }}
      >
        <div
          className={cn(
            'fixed bottom-0 right-0 w-full h-20 transition-transform duration-300 bg-white shadow-backgroundDownload background-element z-[2001]',
            className
          )}
          data-state={!isIdle ? 'open' : 'idle'}
        >
          <div className="flex justify-between h-full">
            <div className="flex">
              <div className="py-2 px-4 h-full grid place-items-center xl:ml-[300px]">
                <img
                  src="/assets/loading.svg"
                  alt="loading"
                  data-state={isWorking ? 'show' : 'hide'}
                  className="grid-area"
                />
                {!isError && (
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 30 30"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    data-state={isSuccess ? 'show' : 'hide'}
                    className="grid-area"
                  >
                    <path
                      d="M9.13672 15L13.2289 20.0016C13.4356 20.2542 13.825 20.2443 14.0185 19.9814L20.999 10.5"
                      stroke="#00AB55"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="fPvpbRVO_0"
                      data-state={isSuccess ? 'running' : 'paused'}
                    />
                    <path
                      d="M28.75 15C28.75 22.5939 22.5939 28.75 15 28.75C7.40608 28.75 1.25 22.5939 1.25 15C1.25 7.40608 7.40608 1.25 15 1.25C22.5939 1.25 28.75 7.40608 28.75 15Z"
                      stroke="#00AB55"
                      strokeWidth="2.5"
                      className="fPvpbRVO_1"
                      data-state={isSuccess ? 'running' : 'paused'}
                    />
                  </svg>
                )}
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-lg font-bold">
                  {isWorking && 'Preparando archivos'}
                  {isSuccess && 'La descarga de tus archivos ha iniciado'}
                  {isError && 'Hemos tenido problemas para la descarga de tus archivos'}
                </p>
                <p>
                  {isWorking &&
                    ' Este proceso puede tardar algunos minutos. Puedes seguir usando la plataforma mientras preparamos tus archivos. '}
                  {isSuccess && 'Revisa la carpeta de descargas de tu navegador para encontrar tus archivos.'}
                </p>
              </div>
            </div>
            <div className="flex items-center px-4">
              <button
                className={`${isWorking ? 'text-[#FF4842]' : 'text-gray-400'} bg-transparent font-bold`}
                onClick={() => setToStartingPoint()}
              >
                {isWorking ? 'Cancelar' : <IcClose fill="#212B36" />}
              </button>
            </div>
          </div>
        </div>
      </Sentry.ErrorBoundary>
    </Portal.Root>
  );
}
export enum ETypeFile {
  ZIP = 'zip',
  EXCEL = 'excel',
}
interface IBackgroundQueue {
  id: string;
  typeFile: ETypeFile;
}
interface MyState {
  status: 'idle' | 'working' | 'success' | 'error';
  backgroundQueue: IBackgroundQueue[];
  setIsWorking: () => void;
  setToIdle: () => void;
  setToSuccess: () => void;
  setToError: () => void;
  addToQueue: (id: string, typeFile?: ETypeFile) => void;
  removeFromQueue: (id: string) => void;
  removeAllFromQueue: () => void;
}

export const useBackgroundStore = create<MyState>()(
  devtools(
    immer(
      persist(
        (set) => ({
          status: 'idle',
          backgroundQueue: [],
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
          addToQueue: (id: string, typeFile = ETypeFile.EXCEL) =>
            set((state) => {
              state.backgroundQueue.push({ id, typeFile });
            }),
          removeFromQueue: (id: string) =>
            set((state) => {
              // remove an item from state.backgroundQueue by id
              state.backgroundQueue = state.backgroundQueue.filter((item) => item.id !== id);
            }),
          removeAllFromQueue: () =>
            set((state) => {
              // remove an item from state.backgroundQueue by id
              state.backgroundQueue = [];
              state.status = 'idle';
            }),
        }),
        {
          name: 'background-download', // name of item in the storage (must be unique)
          getStorage: () => sessionStorage, // (optional) by default the 'localStorage' is used
        }
      )
    ),
    { name: 'background-download' }
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

type DownloadMenuProps = PropsWithChildren<{
  items: { children: React.ReactNode; onClick: () => unknown; key: string; disabled?: boolean }[];
  disabled?: boolean;
}>;

export const DownloadMenu = ({ children, items = [], disabled }: DownloadMenuProps) => {
  const status = useBackgroundDownloadState();
  const isWorking = status === 'working';

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger disabled={isWorking || disabled} asChild>
        {children}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="z-[2001] px-6 py-5 space-y-5 bg-white shadow-lg rounded-xl" align="start">
          {items.map(({ children, onClick, key, disabled: disabledItem }) => (
            <DropdownMenu.Item
              key={key}
              data-testid={`${key}-button`}
              className={cn(
                'flex items-center space-x-3 text-base text-[#637381] hover:text-[#3366FF] cursor-pointer focus-visible:outline-none hover:outline-none',
                { 'opacity-25 cursor-not-allowed hover:text-[#637381]': disabledItem }
              )}
              onClick={disabledItem ? undefined : onClick}
              disabled={disabledItem}
            >
              {children}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export const useBackgroundDownloadState = () => useBackgroundStore((store) => store.status);
export const useSetIsWorking = () => useBackgroundStore((store) => store.setIsWorking);
export const useSetToIdle = () => useBackgroundStore((store) => store.setToIdle);
export const useSetToError = () => useBackgroundStore((store) => store.setToError);
export const useSetToSuccess = () => useBackgroundStore((store) => store.setToSuccess);
export const useAddToQueue = () => useBackgroundStore((store) => store.addToQueue);
export const useRemoveFromQueue = () => useBackgroundStore((store) => store.removeFromQueue);
export const useRemoveAllFromQueue = () => useBackgroundStore((store) => store.removeAllFromQueue);
export const useIdsToDownload = () => useBackgroundStore((store) => store.backgroundQueue);
