import { getSession } from 'next-auth/react';
import Head from 'next/head';
import Navbar from '~/components/organisms/guardians/Navbar';
import OrderList from '~/components/OrderList';
import OrderCard from '~/components/molecules/guardians/OrderCard';
import { GetServerSideProps } from 'next';
import { Session } from 'next-auth';
import useSendPageViewedEvent from '~/hooks/useSendPageViewedEvent';
import { api } from '~/utils/api';
import { StatusDc1Enum } from '@cometa/trpc/src/types';
import EmptyPageHistory from '~/public/images/empty-page-history.svg';
import Link from 'next/link';
import { cn } from '~/lib/cn';
import { useSelectedSchoolId } from '~/components/molecules/common/AuthGlobal';

interface HistoryProps {
  session: Session;
}

function History({ session }: HistoryProps) {
  const selectedSchoolId = useSelectedSchoolId();

  const { data: fulfillments, isLoading } = api.orders.getSchoolOrders.useQuery({
    schoolId: selectedSchoolId || session?.user.schools[0]?.id || '',
    status: [StatusDc1Enum.PAID],
  });

  useSendPageViewedEvent('Historial de pagos');

  return (
    <>
      <Head>
        <title>Historial de Pagos</title>
      </Head>
      <div className="sticky top-0 z-20">
        <Navbar />
      </div>
      <div className="max-w-[600px] px-5 py-6 mx-auto space-y-4">
        <OrderList title="Historial de pago" loading={isLoading}>
          {fulfillments?.map((order, index) => (
            <OrderCard key={order.id} data={order} session={session} openDetails={index === 0} isPaid />
          ))}
        </OrderList>
        {!fulfillments?.length && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <EmptyPageHistory className="mb-6 w-60" />
            <p className="text-2xl text-center text-[#57537A] mb-3">
              Aún no has realizado <br /> <span className="font-bold">ningún pago.</span>
            </p>
            <span className="text-[#57537A] text-center max-w-[17rem] text-base mb-7">
              Tus pagos aparecerán aquí una vez que los hayas realizado.
            </span>
            <Link
              href={`/guardians/${session?.user?.hash}`}
              className={cn(
                'py-4 px-6 appearance-none bg-blue-100 rounded-full text-white text-base font-normal outline-none shadow-[6px_6px_20px_rgba(85,112,255,0.3)] cursor-pointer hover:bg-[#364AFD] transition-colors hover:shadow-[6px_6px_35px_rgba(85, 112, 255, 0.42)] active:bg-blue-100',
                'disabled:shadow-none disabled:bg-[#EBEBEB] disabled:text-[#A6A6A6]',
                'w-full max-w-[17.3rem] text-center'
              )}
            >
              Ver pagos pendientes
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  return {
    props: {
      session,
    },
  };
};
History.auth = true;
export default History;
