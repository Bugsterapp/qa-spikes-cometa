import { formatPrice, typeOfOrdersInStore } from '~/utils/orders';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import Accordion from '~/components/atoms/guardians/Accordion';
import Barcode from 'react-barcode';
import AccordionKushkiWhereToPay from '~/components/atoms/guardians/AccordionKushkiWhereToPay';
import { useSendEvent } from '~/hooks/useSendEvent';
import { TrackEvents } from '~/constants/events';
import { useSelectionStore } from '~/stores/selectionStorePersisted';

interface CashInPayOrderCardProps {
  currency: string;
  priceTotal: number;
  ticketNumber: string;
  pin: string;
  pdfURL: string;
  pinBarCode: string;
}

const CashInPayOrderCard = ({
  currency,
  priceTotal,
  ticketNumber,
  pin,
  pdfURL,
  pinBarCode,
}: CashInPayOrderCardProps) => {
  const { data: session } = useSession();
  const guardianFirstName = session?.user?.first_name;
  const guardianLastName = session?.user?.last_name;
  const sendEvent = useSendEvent();
  const { selectedItems } = useSelectionStore();
  const { optional, mandatory } = typeOfOrdersInStore(selectedItems);

  return (
    <div className="bg-white rounded-2xl min-w-[321px]">
      <div className="border-gray-300 divide-y divide-[#D6D6D6]">
        <div className="flex flex-col justify-around p-6 space-y-2">
          <h2 className="text-lg font-medium">
            {guardianFirstName} {guardianLastName}
          </h2>
          <p className="mt-1 text-sm font-medium text-gray">N° de Ticket: #{ticketNumber}</p>
          <span className="border-t border-[#D6D6D6] mt-2 pt-2 max-w-[498px] text-[#57537A] text-sm">
            Una vez que realices el pago, podría verse reflejado en un máximo de 48 horas.
          </span>
        </div>
        <div className="flex flex-col justify-around p-6 gap-y-2.5">
          <p className="text-sm font-medium">Total a pagar</p>
          <div className="flex text-[#3366FF] items-end gap-1">
            <span className="inline-block text-xl font-semibold">{formatPrice(priceTotal, currency) + ' '}</span>
            <span className="inline-block text-sm font-semibold">{currency}</span>
          </div>
          <p className="text-xs font-medium tracking-tight text-gray">Tienes tiempo hasta las 23:59 del día de hoy</p>
          <div className="border-b border-[#D0D0D0] h-px w-full" />
          <div className="text-xs font-medium text-gray-300 px-[18px] py-2.5 bg-[#E6E9FF] rounded-lg justify-center items-center flex-row">
            Recuerda <span className="font-semibold">pagar el monto exacto</span>{' '}
            <span>que figura en la orden que generes y hacerlo en un solo pago.</span>
          </div>
        </div>
        <div className="flex flex-col justify-around p-6">
          <h2 className="mb-1 text-lg font-medium text-[#091A7A]">Datos para el pago</h2>
          <p className="mb-1 text-xs font-medium text-gray">
            Recuerda mencionar tu PIN para pagar y el N° de Convenio de la red.
          </p>
          <p className="mt-6 font-medium">Número de PIN de pago:</p>
          <p className="mb-1 text-lg font-medium text-gray">{pin}</p>
          <div className="flex flex-col mt-6">
            <div>
              <Image src="/images/pay-cash-logo.svg" width={74} height={17} alt="Pay Cash" />
            </div>
            <div>
              <Barcode width={1.5} height={50} value={pinBarCode} displayValue={false} margin={0} />
            </div>
          </div>
          <div
            className="flex mt-6"
            onClick={() => sendEvent(TrackEvents.checkout.cash.downloadPayOrder, { optional, mandatory })}
          >
            <a
              target="_blank"
              href={pdfURL}
              rel="noopener noreferrer"
              className="bg-[#4A5CFF] rounded-lg text-white py-2 px-3 inline-flex items-center no-underline hover:bg-[#3d4dd9] transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
              </svg>
              <span className="ml-1 text-sm font-semibold">DESCARGAR ORDEN DE PAGO</span>
            </a>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <AccordionKushkiWhereToPay priceTotal={priceTotal} currency={currency} showAgreements />
          <Accordion
            onClick={() => sendEvent(TrackEvents.checkout.cash.howToPayClicked)}
            title={<h2 className="text-lg text-[#091A7A]">¿Cómo pagar?</h2>}
            className="bg-white"
          >
            <p className="mb-1 text-sm text-gray">
              Acércate a alguna de las sucursales disponibles. En la caja muestra el código de barras, el número de pin,
              convenio. Guarda estos datos en tu celular usando el botón de “Descargar orden de pago”.
            </p>
            <p className="text-sm text-gray">
              Siempre encontrarás el detalle de esta orden de pago en la sección “Pagos en proceso” de este portal.
            </p>
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default CashInPayOrderCard;
