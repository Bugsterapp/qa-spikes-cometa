import { getSession } from 'next-auth/react';
import Head from 'next/head';
import { useUTMRouter as useRouter } from '~/components/UtmNavigation';
import { useEffect } from 'react';
import KushkiCashInPayOrderCard from '~/components/molecules/guardians/KushkiCashInPayOrderCard';
import PoweredByKushki from '~/components/atoms/guardians/PoweredByKushki';
import useCheckoutStore from '~/stores/checkoutStore';
import { GetServerSideProps } from 'next';

function CashInPayOrder() {
  const _router = useRouter();
  const { guardianHash } = _router.query;

  const { cashIn } = useCheckoutStore();

  const goToHome = () => {
    _router.push(`/guardians/${guardianHash}`);
  };

  const goBack = () => _router.back();

  useEffect(() => {
    const storedCashInData = Object.keys(cashIn).keys;
    if (!storedCashInData) goToHome();
  }, []);

  return (
    <>
      <Head>
        <title>Orden de pago</title>
      </Head>
      <hr className="border-gray-200" />
      <div className="max-w-sm mx-auto px-0">
        <div className="flex items-center mt-2 mb-2">
          <button onClick={goBack} className="bg-white m-2 p-2 rounded-full hover:bg-gray-50 transition-colors">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>
          <h1 className="text-2xl font-semibold text-[#091A7A]">Orden de pago</h1>
        </div>
        <hr className="border-gray-200 mb-4" />
        <div className="mb-4 ml-2 mr-2">
          <p className="text-[#57537A] font-semibold mb-1">Orden de pago creada.</p>
          <p className="text-[#57537A]">
            Ya puedes acercarte a pagar a la sucursal de tu preferencia usando estos datos.
          </p>
        </div>
        <div className="ml-2 mr-2">
          {cashIn && (
            <KushkiCashInPayOrderCard
              currency={cashIn.currency ?? ''}
              priceTotal={cashIn.total ?? 0}
              ticketNumber={cashIn.ticket_number ?? ''}
              pin={cashIn.pin ?? ''}
              pdfURL={cashIn.pdf_url ?? ''}
              pinBarCode={cashIn.pin_barcode ?? ''}
            />
          )}
        </div>
        <div className="mt-6 mb-6">
          <PoweredByKushki />
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => ({
  props: {
    session: await getSession(context),
    remoteAddress: context.req.socket.remoteAddress,
  },
});

CashInPayOrder.auth = true;
export default CashInPayOrder;
