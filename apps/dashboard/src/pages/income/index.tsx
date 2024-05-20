import { useState } from 'react';
import { Alert, Grid, Typography } from '@mui/material';
import Layout from '../../components/layouts';
import { useSession } from 'next-auth/react';
import ApiClient from '../../services/ApiClient';
import OrderTableForPayins from '../../components/organisms/dashboard/OrderTableForPayins';
import OrderTableForPayouts from '../../components/organisms/dashboard/OrderTableForPayouts';
import { formatDateNumeric } from '../../utils/general';
import * as Sentry from '@sentry/nextjs';
import useSendPageViewedEvent from '/src/hooks/useSendPageViewedEvent';
import IcClose from '/public/assets/icons/ic_close.svg';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { useGetPermissions } from '/src/guards/AuthGuard';
import { useQuery } from '@tanstack/react-query';
import { StatsCard } from '/src/components/atoms/IncomeCard';
import { getFormattedDate, getMonthAndYear, getPreviousDay, getWeekRange } from '/src/utils/date-utils';

IncomePage.getLayout = function getLayout(page: JSX.Element) {
  return <Layout title="Ingresos">{page}</Layout>;
};

// FIXME: Conciliate with new toaster
export const DeletePayinAlert = ({
  payinDeleted,
  setIsPayinDeletedDone,
}: {
  payinDeleted: { first_name: string; last_name: string; date: string } | null;
  setIsPayinDeletedDone: (state: boolean) => void;
}) => (
  <div className="relative z-10 px-5 top-10">
    <Alert
      severity="success"
      sx={{ px: 3, py: 2 }}
      action={
        <button className="flex items-center h-full bg-transparent" onClick={() => setIsPayinDeletedDone(false)}>
          <IcClose fill="#212B36" />
        </button>
      }
    >
      ¡El pago de{' '}
      <label className="font-semibold">
        {payinDeleted?.first_name} {payinDeleted?.last_name}
      </label>{' '}
      del <label className="font-semibold">{formatDateNumeric(payinDeleted?.date || '')}</label>, se ha eliminado de
      manera exitosa!
    </Alert>
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

  const incomesResumeQuery = async () =>
    ApiClient.fetchIncomesResume(session?.token, selectedSchool?.id).then((res: Record<string, any>) => res.data);

  const { data: incomesResume } = useQuery({
    queryKey: ['incomesResume', selectedSchool?.id],
    queryFn: incomesResumeQuery,
    enabled: !!selectedSchool?.id,
  });

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
        <Typography variant="h2" gutterBottom component="div">
          Ingresos
        </Typography>
        {permissions.can_view_income_stats_cards && (
          <div className="grid gap-5 md:grid-cols-4 py-9 sm:grid-cols-2 ">
            <StatsCard
              title="Hoy"
              number={incomesResume?.deposit_today}
              subtitle={getFormattedDate()}
              tooltipText="Es la suma de los pagos registrados por el colegio más los depósitos recibidos de Cometa desde las 00:00 del día de hoy."
            />
            <StatsCard
              title="Ayer"
              subtitle={getPreviousDay()}
              number={incomesResume?.deposit_yesterday}
              tooltipText="Es la suma de los pagos registrados por el colegio más los depósitos recibidos de Cometa desde las 00:00  hasta las 23:59 del día de ayer."
            />
            <StatsCard
              title="Esta semana"
              subtitle={getWeekRange()}
              number={incomesResume?.deposit_week}
              tooltipText="Es la suma de los pagos registrados por el colegio más los depósitos recibidos de Cometa durante esta semana."
            />
            <StatsCard
              title="Total del mes"
              subtitle={getMonthAndYear()}
              number={incomesResume?.deposit_month}
              tooltipText="Es la suma de los pagos registrados por el colegio más los depósitos recibidos de Cometa desde el inicio del mes actual."
            />
          </div>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12} md={12} lg={12}>
            <>
              {isPayinDeletedDone && (
                <DeletePayinAlert payinDeleted={payinDeleted} setIsPayinDeletedDone={setIsPayinDeletedDone} />
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
          </Grid>
        </Grid>
      </div>
    </Sentry.ErrorBoundary>
  );
}

IncomePage.auth = true;

export default IncomePage;
