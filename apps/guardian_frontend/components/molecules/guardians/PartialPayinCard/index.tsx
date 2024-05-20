import { useState } from 'react';
import dayjs from '~/lib/dayjs';
import { formatPrice } from '~/utils/orders';
import AccordionOrderDetails from '~/components/atoms/guardians/AccordionOrderDetails';
import Box from '~/components/atoms/common/Box';
import { Payin } from '@cometa/trpc/src/types';

interface PartialPayinCardProps {
  title: string;
  totalAmount: string;
  pendingAmount?: string;
  currency: string;
  partialPayins?: Payin[];
}

const PartialPayinCard = ({
  title,
  totalAmount,
  currency,
  partialPayins = [],
  pendingAmount,
}: PartialPayinCardProps) => {
  const [openAccordion, setOpenAccordion] = useState(false);

  const parsePartialPayinDate = (date: string) => {
    const dateParsed = dayjs(date);
    return dateParsed.format('DD/MM/YY');
  };

  const pendingForPayment = (orders: Payin[]) => {
    const total = orders.reduce((acc, order) => +acc + +order.total, 0);
    return parseFloat(totalAmount) - total;
  };

  return (
    <Box
      className="flex flex-col p-6 cursor-pointer"
      onClick={() => {
        setOpenAccordion(!openAccordion);
      }}
    >
      <div className="mb-4">
        <h6 className="mr-2 text-lg font-semibold text-blue-800 capitalize">{title}</h6>
      </div>
      <div className="mb-4 text-gray-300">
        <p className="mb-2 text-sm">Pagado parcialmente: Directo con la escuela.</p>
        <div className="flex flex-row justify-between">
          <span className="text-sm font-semibold">Total a pagar</span>
          <span className="text-sm font-semibold">{formatPrice(totalAmount, currency)}</span>
        </div>
      </div>
      <AccordionOrderDetails open={openAccordion}>
        {partialPayins.map((partialPayin) => (
          <div className="flex flex-row justify-between my-2 text-sm text-gray-300" key={partialPayin.id}>
            <span>{parsePartialPayinDate(partialPayin.paid_date ?? '')} se pagó:</span>
            <span>{formatPrice(partialPayin.total, currency)}</span>
          </div>
        ))}
      </AccordionOrderDetails>
      <div className="flex flex-row justify-between text-gray-300">
        <span className="text-sm">Pendiente de pago:</span>
        <span className="text-lg font-semibold">
          {formatPrice(pendingAmount || pendingForPayment(partialPayins), currency)}
        </span>
      </div>
      <div className="mt-5 p-4 border-2 border-warning rounded-1.5xl">
        <span className="text-sm font-semibold text-gray-300">
          Para terminar de completar este pago debes comunicarte con la escuela.
        </span>
      </div>
    </Box>
  );
};

export default PartialPayinCard;
