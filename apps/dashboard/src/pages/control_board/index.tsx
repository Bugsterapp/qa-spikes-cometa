import { cn } from '@cometa/utils';
import { keepPreviousData } from '@tanstack/react-query';
import * as Sentry from '@sentry/nextjs';
import type { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import IcAlert from '/public/assets/icons/navigation/delinquency_warning.svg';
import LoadingIcon from '/public/assets/loading.svg';
import Layout from '/src/components/layouts';
import { TabsWrapper } from '/src/components/ui/Tabs';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import useAlert from '/src/hooks/useAlert';
import { api } from '/src/utils/api';
import { useEffect } from 'react';

export const getServerSideProps: GetServerSideProps = async (ctx) => ({
  props: {
    tab: ctx.query.tab ?? 'payments',
  },
});

const tabsData = [
  {
    label: 'Pagos',
    value: 'payments',
  },
  {
    label: 'Morosidad',
    value: 'delinquency',
  },
  {
    label: 'Ingresos',
    value: 'income',
  },
  {
    label: 'Facturas Plataforma',
    value: 'platform_invoices',
  },
];

const dashboardIds = {
  payments: '563',
  delinquency: '564',
  income: '794',
  platform_invoices: '2906',
};

const MINUTES10 = 1000 * 60 * 10;

function ControlBoardPage({ tab = 'payments' }) {
  const router = useRouter();
  const { data: session } = useSession();
  const selectedSchool = useSelectedSchool();
  const { setAlertState } = useAlert();
  const {
    data,
    isPending: isInitialLoading,
    error,
  } = api.metabase.getDashboard.useQuery(
    {
      school_id: selectedSchool ? selectedSchool.id : '',
      dashboard_id: dashboardIds[tab as keyof typeof dashboardIds],
    },
    {
      enabled: !!selectedSchool && !!session,
      placeholderData: keepPreviousData,
      staleTime: MINUTES10,
    }
  );

  useEffect(() => {
    if (error) {
      setAlertState({
        severity: 'error',
        message: 'No se pudo cargar el tablero de control',
        open: true,
      });
    }
  }, [error]);

  const handleChangeTabs = (tab: string) => router.replace({ query: { ...router.query, tab: tab } });

  return (
    <Sentry.ErrorBoundary
      beforeCapture={(scope) => {
        scope.setContext('state', {
          session,
          selectedSchool,
        });
      }}
    >
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="justify-center text-neutral-800 text-2xl font-bold font-lota leading-[30px] pt-9 pl-9 pb-6 w-full">
          Tablero de control
        </div>
        <TabsWrapper
          tabs={tabsData}
          tab={tab}
          handleChangeTab={handleChangeTabs}
          defaultValue="payments"
          tabsListClassName="pl-10"
        />
      </div>
      {tab === 'payments' && (
        <div className="flex flex-col justify-center w-full gap-2 p-8 font-lota">
          <h3 className="justify-start text-neutral-800 text-2xl font-bold leading-[30px]">Pagos</h3>
          <span className="justify-start text-neutral-800">
            Pagos registrados en el sistema, pero no necesariamente ingresados en las cuentas del colegio. Para más
            detalles, ve a la sección{' '}
            <Link href="/payments" className="underline hover:text-blue-500">
              Pagos y Facturas
            </Link>
            .
          </span>
        </div>
      )}
      {tab === 'delinquency' && (
        <div className="flex flex-col justify-center w-full gap-2 p-8 font-lota">
          <h3 className="justify-start text-neutral-800 text-2xl font-bold leading-[30px]">Morosidad</h3>
          <span className="justify-start text-neutral-800">
            Total de deuda pendiente de los estudiantes. Para más detalles, ve a la sección{' '}
            <Link href="/delinquency" className="underline hover:text-blue-500">
              Morosidad
            </Link>
            .
          </span>
        </div>
      )}
      {tab === 'income' && (
        <div className="flex flex-col justify-center w-full gap-2 p-8 font-lota">
          <h3 className="justify-start text-neutral-800 text-2xl font-bold leading-[30px]">Ingresos</h3>
          <span className="justify-start text-neutral-800">
            Dinero confirmado en las cuentas del colegio, incluyendo pagos recibidos y conciliados. Para más detalles,
            ve a la sección{' '}
            <Link href="/income" className="underline hover:text-blue-500">
              Ingresos
            </Link>
            .
          </span>
        </div>
      )}
      {tab === 'platform_invoices' && (
        <div className="flex flex-col justify-center w-full gap-2 p-8 font-lota">
          <h3 className="justify-start text-neutral-800 text-2xl font-bold leading-[30px]">Facturas Plataforma</h3>
          <span className="justify-start text-neutral-800">
            Facturas generadas por la plataforma Cometa para el colegio.
          </span>
        </div>
      )}
      {isInitialLoading ? (
        <div className="flex items-center justify-center">
          <LoadingIcon className="mx-auto h-14" />
        </div>
      ) : (
        <div
          className={cn('relative w-full h-full overflow-hidden', {
            'pt-[100%]': !!data,
          })}
        >
          {data ? (
            <iframe
              src={data?.url as string}
              width={800}
              height={600}
              className="absolute top-0 bottom-0 left-0 right-0 w-full h-full border-none"
              title={`Metabase Dashboard ${tab}`}
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full gap-2">
              <IcAlert className="w-10 text-red-500" />
            </div>
          )}
        </div>
      )}
    </Sentry.ErrorBoundary>
  );
}

ControlBoardPage.auth = true;

ControlBoardPage.getLayout = function getLayout(page: JSX.Element) {
  return (
    <Layout dashboardVariant="stretch" title="Tablero de control">
      {page}
    </Layout>
  );
};

export default ControlBoardPage;
