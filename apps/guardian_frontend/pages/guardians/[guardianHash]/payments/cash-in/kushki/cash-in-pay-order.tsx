/* eslint-disable react-hooks/exhaustive-deps */
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import KushkiCashInPayOrderCard from '~/components/molecules/guardians/KushkiCashInPayOrderCard';
import PoweredByKushki from '~/components/atoms/guardians/PoweredByKushki';
import useCheckoutStore from '~/stores/checkoutStore';
import useSendPageViewedEvent from '~/hooks/useSendPageViewedEvent';
import { GetServerSideProps } from 'next';
import { useSelectionStore } from '@cometa/hooks';
import ClockIcon from '~/public/icons/clock.svg';
import { Button } from '~/components/atoms/Button';

function CashInPayOrder() {
  const _router = useRouter();
  const { guardianHash, back = '' } = _router.query;
  const { selectedItems, totalToPay, clear: clearSelected } = useSelectionStore();
  const currency = selectedItems?.[0]?.currency || 'MXN';

  const [cashIn, clear] = useCheckoutStore((state) => [state.cashIn, state.clear]);

  useEffect(() => {
    if (!cashIn) _router.push(`/guardians/${guardianHash}/${back}`);
  }, [cashIn]);

  const goToHome = (withoutQuery = false) => {
    clearSelected();
    clear();
    if (withoutQuery) {
      _router.push(`/guardians/${guardianHash}/${back}`);
    } else {
      _router.push({
        pathname: `/guardians/${guardianHash}/${back}`,
        query: { tour: 'pending', status: 'pending', type: 'cash' },
      });
    }
  };

  useSendPageViewedEvent('Efectivo - Orden de pago');

  useEffect(() => {
    const storedCashInData = Object.keys(cashIn).length;
    if (!storedCashInData) goToHome(true);
  }, []);

  return (
    <>
      <Head>
        <title>Orden de pago</title>
      </Head>
      <div className="max-w-[600px] mx-auto">
        <div className="flex items-center justify-center pb-4 mt-4 mb-8 border-b-2 border-[#d8d7dc] ">
          <h2 className="text-xl font-bold text-[#091A7A]">Orden de pago</h2>
        </div>
        <div className="flex flex-col justify-start mx-4 mb-8 ">
          <span className="mb-2 font-semibold text-gray-300">Orden de pago creada.</span>
          <span className="text-gray-300">
            Ya puedes acercarte a pagar a la sucursal de tu preferencia usando estos datos.
          </span>
        </div>
        <div className="inline-flex flex-col items-center justify-center p-6 mx-6 mb-8 bg-white border-2 border-blue-600 rounded-2xl">
          <div className="self-stretch justify-start items-start gap-1.5 inline-flex ">
            <ClockIcon className="w-[18px] h-[18px]" />
            <div className="grow shrink basis-0">
              <span className="text-sm font-medium tracking-tight text-gray-800">
                Recuerda que debes pagar esta orden de pago antes de las 23:59 del día de hoy.{' '}
              </span>
            </div>
          </div>
        </div>
        <div className="mx-6">
          {!!Object.keys(cashIn).length && (
            <KushkiCashInPayOrderCard
              currency={cashIn.currency ?? currency ?? ''}
              priceTotal={cashIn.total ?? totalToPay ?? 0}
              ticketNumber={cashIn.ticket_number ?? ''}
              pin={cashIn.pin ?? ''}
              pdfURL={cashIn.pdf_url ?? ''}
              pinBarCode={cashIn.pin_barcode ?? ''}
            />
          )}
        </div>
        <div className="mt-12">
          <PoweredByKushki />
        </div>
        <div className="flex flex-col justify-center p-8">
          <Button
            className="self-stretch px-12 py-4 font-medium"
            onClick={() => {
              goToHome();
            }}
          >
            Listo
          </Button>
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
