import { getSession, useSession } from 'next-auth/react';
import Head from 'next/head';
import Navbar from '~/components/Navbar';
import { GetServerSideProps } from 'next';
import { Session } from 'next-auth';
import useSendPageViewedEvent from '~/hooks/useSendPageViewedEvent';
import { api } from '~/utils/api';
import EmptyPageHistory from '~/public/images/empty-page-history.svg';
import Link from 'next/link';
import { cn } from '~/lib/cn';
import { useSelectedSchoolId } from '~/components/molecules/common/AuthGlobal';
import Box from '~/components/atoms/common/Box';
import dayjs from '~/lib/dayjs';
import { useEffect } from 'react';
import { CustomStudentPayinSerializerV2, GuardianListPayinSerializerV2 } from '@cometa/trpc';
import ExpandMore from '/public/icons/ic_expand_more.svg';
import Tag from '~/components/Tag';
import { useRouter } from 'next/router';
import ResponsivePagination from 'react-responsive-pagination';
import * as OrderCard from '~/components/OrderCard';
import { getDependentColor } from '~/utils/colors';

interface HistoryProps {
  session: Session;
}

const PaidOrderRowByStudent = ({ student }: { student: CustomStudentPayinSerializerV2 }) => {
  const { data: session } = useSession();
  const dependents = session?.user?.dependents ?? [];
  const dependentColor = getDependentColor(dependents, student.student_id);

  return (
    <div className="flex flex-col gap-y-3 text-sm font-normal text-[#3E3E3E]">
      <div>
        <span className="mr-1.5">Estudiante:</span>
        <Tag
          bgcolor={dependentColor.background}
          color={dependentColor.text}
          text={student.first_name.toUpperCase()}
          className="flex-shrink-0 mt-1"
        />
      </div>
      <ul className="flex flex-col pl-5 ml-2 leading-6 list-disc">
        {student.orders.map((order) => (
          <li className="min-w-0 break-words" data-testid={`orderName-${order}`} key={order}>
            {order}
          </li>
        ))}
      </ul>
    </div>
  );
};

const PaidOrderRowUnique = ({ student }: { student: CustomStudentPayinSerializerV2 }) => {
  const { data: session } = useSession();
  const dependents = session?.user?.dependents ?? [];
  const dependentColor = getDependentColor(dependents, student.student_id);

  return (
    <div className="flex items-start justify-between p-4 gap-y-3 text-sm font-normal text-[#3E3E3E] border-b border-[#E3E0FF] gap-2">
      <span className="min-w-0 break-words">{student.orders[0]}</span>
      <Tag bgcolor={dependentColor.background} color={dependentColor.text} text={student.first_name.toUpperCase()} />
    </div>
  );
};

const Card = ({ payin }: { payin: GuardianListPayinSerializerV2 }) => {
  const _router = useRouter();
  const guardianHash = _router.query.guardianHash as string;
  const selectedSchoolId = useSelectedSchoolId();
  const paidDate = dayjs(payin.paid_date).tz('America/Mexico_City');
  const timePaid = paidDate.format('H:mm');
  const countTotalOrders = payin.students.reduce((acc, student) => acc + student.orders.length, 0);
  return (
    <OrderCard.Root status="info">
      <OrderCard.Content data-testid={`payinFulfillmentId-${payin.correlative_id}-card`} id={`card-${payin.id}`}>
        <OrderCard.Info>
          <div className="flex items-center justify-between gap-x-2">
            <h3 className="text-[#3E3E3E] font-semibold text-base" data-testid="payinDate-text">
              {paidDate.format('dddd, D [de] MMMM YYYY')}
            </h3>
            {timePaid != '0:00' && <span className="text-[#817E9A] text-xs">{timePaid}</span>}
          </div>
          <span className="text-[#817E9A] font-medium text-xs" data-testid="payinId-text">
            ID de pago: {payin.correlative_id}
          </span>
        </OrderCard.Info>
        {countTotalOrders > 1 ? (
          <OrderCard.Details>
            <OrderCard.DetailsTrigger data-testid="payinCollapsable-Btn">
              <div className="flex w-full gap-x-2.5 items-center text-sm font-medium text-[#3E3E3E]">
                <span>Órdenes pagadas</span>
                <span
                  className=" flex justify-center items-center rounded-full bg-[#57537A] h-5 w-5 text-white text-sm font-medium"
                  data-testid="payedOrders-count"
                >
                  {countTotalOrders}
                </span>
              </div>
            </OrderCard.DetailsTrigger>
            <OrderCard.DetailsContent>
              <div className="flex flex-col gap-y-3 mt-3 mb-3.5">
                {payin.students.map((student) => (
                  <PaidOrderRowByStudent student={student} key={student.student_id} />
                ))}
              </div>
            </OrderCard.DetailsContent>
          </OrderCard.Details>
        ) : (
          <PaidOrderRowUnique student={payin.students[0]} />
        )}

        <OrderCard.HistoricFooter data-testid="payinTotalPaid-text" amount={payin.total_paid}>
          <OrderCard.HistoricLink
            href={{
              pathname: `/guardians/${guardianHash}/payin/${payin.id}`,
              query: { schoolId: selectedSchoolId, page: _router.query.page },
            }}
            data-testid="seeDetails-btn"
          >
            Ver detalles
          </OrderCard.HistoricLink>
        </OrderCard.HistoricFooter>
      </OrderCard.Content>
    </OrderCard.Root>
  );
};

const CardSkeleton = () => (
  <Box className="flex flex-col p-12 gap-y-4 animate-pulse">
    <div className="w-2/3 h-4 rounded-full bg-slate-200" />
    <div className="w-2/4 h-3 rounded-full bg-slate-200" />
    <div className="w-1/3 h-4 rounded-full bg-slate-200" />
  </Box>
);

function History({ session }: Readonly<HistoryProps>) {
  const selectedSchoolId = useSelectedSchoolId();
  const _router = useRouter();
  const query = _router.query;
  const setPage = (newPage: number) => {
    _router.push(
      {
        query: {
          ...query,
          page: newPage,
        },
      },
      undefined,
      { shallow: true }
    );
  };

  const page = Number(query.page) || 1;

  const pageSize = 20;
  const { data, isLoading } = api.payin.history.useQuery({
    schoolId: selectedSchoolId ?? session?.user.schools[0]?.id ?? '',
    pageSize,
    page,
  });

  useEffect(() => {
    if (data && query.payinId) {
      _router.push(
        {
          query: { guardianHash: query.guardianHash, page: query.page },
          hash: `card-${query.payinId}`,
        },
        undefined,
        { shallow: true }
      );
    }
  }, [data]);

  const totalPages = Math.ceil(data?.count ? data.count / pageSize : 0);
  const payins = data?.results;
  useSendPageViewedEvent('Historial de pagos');
  return (
    <>
      {(!!payins?.length || isLoading) && (
        <section className="w-full">
          <div className="mb-4 gap-y-2">
            <h3 className="text-[#14208C] text-xl font-bold mb-1">Historial de pago</h3>
            <span className="text-[#57537A] text-sm">Aquí encontrarás los detalles de tus pagos.</span>
          </div>
          <div className="flex flex-col gap-y-3.5">
            {isLoading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : (
              payins?.map((payin) => <Card key={payin.id} payin={payin} />)
            )}
          </div>
          {totalPages > 1 && (
            <div className="w-full px-2 mt-8">
              <ResponsivePagination
                className="flex items-center justify-center leading-4 tracking-wide text-center list-none gap-x-1"
                pageItemClassName="flex justify-center items-center w-7 h-7 text-sm font-medium text-[#57537A] border border-[#D6D5D9] rounded-md hover:border-blue-100 aria-[current=page]:text-[#3E3E3E]"
                pageLinkClassName="w-7 h-7 display-block flex items-center justify-center aria-[label=Next]:bg-transparent aria-[label=Previous]:bg-transparent rounded-md"
                activeItemClassName="border-blue-100 border-2 text-base font-semibold pointer-events-none"
                disabledItemClassName="opacity-50 bg-opacity-0 cursor-not-allowed"
                navClassName="border-none hover:text-[#3E3E3E]/70"
                previousClassName="mr-[7px] border-none hover:text-[#3E3E3E]/70"
                nextClassName="ml-[7px] border-none hover:text-[#3E3E3E]/70"
                nextLabel={<ExpandMore className="-rotate-90 text-[#3E3E3E]" />}
                previousLabel={<ExpandMore className="rotate-90 text-[#3E3E3E]" />}
                total={totalPages}
                current={page}
                onPageChange={(selectedPage) => setPage(selectedPage)}
              />
            </div>
          )}
        </section>
      )}

      {!payins?.length && !isLoading && (
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
    </>
  );
}

History.getLayout = function getLayout(page: React.ReactNode) {
  return (
    <>
      <Head>
        <title>Historial de Pagos</title>
      </Head>
      <div className="sticky top-0 z-10">
        <Navbar />
      </div>
      <div className="w-full max-w-md px-5 py-6 mx-auto">{page}</div>
    </>
  );
};

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
