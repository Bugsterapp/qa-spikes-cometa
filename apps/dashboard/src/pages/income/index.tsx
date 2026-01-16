import * as Sentry from '@sentry/nextjs';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import Layout from '../../components/layouts';
import OrderTableForPayins from '../../components/organisms/dashboard/OrderTableForPayins';
import OrderTableForPayouts from '../../components/organisms/dashboard/OrderTableForPayouts';
import { formatDateNumeric } from '../../utils/general';
import IcClose from '/public/assets/icons/ic_close.svg';
import { StatsCard } from '/src/components/atoms/IncomeCard';
import Header from '/src/components/molecules/dashboard/Header';
import { useGetPermissions, useSelectedSchool } from '/src/guards/AuthGuard';
import useSendPageViewedEvent from '/src/hooks/useSendPageViewedEvent';
import { api } from '/src/utils/api';
import { getFormattedDate, getMonthAndYear, getPreviousDay, getWeekRange } from '/src/utils/date-utils';

IncomePage.getLayout = function getLayout(page: JSX.Element) {
  return <Layout title="Ingresos">{page}</Layout>;
};

// FIXME: Conciliate with new toaster
export const DeletePayInAlert = ({
  payinDeleted,
  setIsPayinDeletedDone,
}: {
  payinDeleted: { first_name: string; last_name: string; date: string } | null;
  setIsPayinDeletedDone: (state: boolean) => void;
}) => (
  <div className="relative z-10 px-5 top-10">
    <div
      className="flex items-center rounded font-normal px-4 py-[6px]"
      style={{
        backgroundColor: 'rgb(237, 247, 237)',
        color: 'rgb(30, 70, 32)',
        fontSize: '0.875rem',
        lineHeight: '1.43',
        boxShadow:
          '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
      }}
      role="alert"
    >
      {/* Success Icon */}
      <div className="flex-shrink-0 mr-3 py-[7px] opacity-90 flex items-center">
        <svg
          className="w-5 h-5 flex-shrink-0"
          style={{ color: 'rgb(46, 125, 50)' }}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="flex-1 py-2">
        <div className="flex items-center">
          <span>
            ¡El pago de{' '}
            <label className="font-semibold">
              {payinDeleted?.first_name} {payinDeleted?.last_name}
            </label>{' '}
            del <label className="font-semibold">{formatDateNumeric(payinDeleted?.date || '')}</label>, se ha eliminado
            de manera exitosa!
          </span>
        </div>
      </div>

      {/* Close button */}
      <button
        type="button"
        className="ml-auto pl-3 -mr-1 flex-shrink-0 inline-flex items-center justify-center py-[7px] opacity-90 hover:opacity-100 transition-opacity"
        style={{ color: 'rgb(30, 70, 32)' }}
        onClick={() => setIsPayinDeletedDone(false)}
      >
        <span className="sr-only">Close</span>
        <IcClose fill="currentColor" />
      </button>
    </div>
  </div>
);

function IncomePage() {
  const permissions = useGetPermissions();
  const { data: session } = useSession();
  const selectedSchool = useSelectedSchool();
  const [isPayinDeletedDone, setIsPayinDeletedDone] = useState(false);
  const [payinDeleted, setPayinDeleted] = useState<{ first_name: string; last_name: string; date: string } | null>(
    null
  );

  useSendPageViewedEvent('Ingresos', selectedSchool);

  const { data: incomesResume } = api.schools.payoutsResume.useQuery(
    {
      schoolId: selectedSchool?.id || '',
    },
    {
      enabled: !!selectedSchool?.id,
    }
  );

  return (
    <Sentry.ErrorBoundary
      beforeCapture={(scope) => {
        scope.setContext('state', {
          permissions,
          session,
          selectedSchool,
          incomesResume,
          isPayinDeletedDone,
          payinDeleted,
        });
      }}
    >
      <div>
        <Header title="Ingresos" />
        {permissions.can_view_income_stats_cards && (
          <div className="grid gap-5 md:grid-cols-4 pb-9 sm:grid-cols-2 ">
            <StatsCard
              title="Hoy"
              number={incomesResume?.deposit_today || 0}
              subtitle={getFormattedDate()}
              tooltipText="Es la suma de los pagos registrados por el colegio más los depósitos recibidos de Cometa desde las 00:00 del día de hoy."
            />
            <StatsCard
              title="Ayer"
              subtitle={getPreviousDay()}
              number={incomesResume?.deposit_yesterday || 0}
              tooltipText="Es la suma de los pagos registrados por el colegio más los depósitos recibidos de Cometa desde las 00:00  hasta las 23:59 del día de ayer."
            />
            <StatsCard
              title="Esta semana"
              subtitle={getWeekRange()}
              number={incomesResume?.deposit_week || 0}
              tooltipText="Es la suma de los pagos registrados por el colegio más los depósitos recibidos de Cometa durante esta semana."
            />
            <StatsCard
              title="Total del mes"
              subtitle={getMonthAndYear()}
              number={incomesResume?.deposit_month || 0}
              tooltipText="Es la suma de los pagos registrados por el colegio más los depósitos recibidos de Cometa desde el inicio del mes actual."
            />
          </div>
        )}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12">
            <>
              {isPayinDeletedDone && (
                <DeletePayInAlert payinDeleted={payinDeleted} setIsPayinDeletedDone={setIsPayinDeletedDone} />
              )}
              {permissions.can_view_registered_payments_table && (
                <div className="mt-4 rounded-3xl shadow-card">
                  <OrderTableForPayins
                    setIsPayinDeletedDone={setIsPayinDeletedDone}
                    setPayinDeleted={setPayinDeleted}
                  />
                </div>
              )}
            </>
            {permissions.can_view_payouts_table && (
              <div className="mt-4 rounded-3xl shadow-card">
                <OrderTableForPayouts />
              </div>
            )}
          </div>
        </div>
      </div>
    </Sentry.ErrorBoundary>
  );
}

IncomePage.auth = true;

export default IncomePage;
