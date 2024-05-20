import dayjs from '~/lib/dayjs';
import { FEATURE_CANCEL_PAYIN_PENDING } from '~/utils/featuresKeys';
import { formatPrice, getFinalPricePending } from '~/utils/orders';
import ToggleFeature from '../../common/ToggleFeature';
import StepsToPay from '../StepsToPay';
import { TRANSFER_IN_KUSHKI } from '~/utils/stepsToPay';
import TransferDetails from '~/components/atoms/guardians/TransferDetails';
import CashDetails from '~/components/atoms/guardians/CashDetails';
import Trash from '../../../../public/icons/trash.svg';
import _currency from 'currency.js';
import { Order } from '~/types/OrdersApi';
import { GuardianStudent, Type787Enum } from '@cometa/trpc';
import { Color } from '~/utils/colors';
import BoxColorText from '~/components/atoms/guardians/BoxColorText';
import Button from '~/components/atoms/Button';
import {
  Accordion as AccordionPrimitive,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/Accordion';
import { useState } from 'react';
import ExpandMore from '/public/icons/ic_expand_more.svg';

interface PendingCardAccordionProps {
  method: string;
  totalAmount: number;
  currency: string;
  orders: Order[];
  dependents: (GuardianStudent & Color)[];
  guardianName: string;
  created: string;
  onSelected: () => void;
  type: Type787Enum | null;
  transactionDetails: any;
  commission: string;
  payinExpirationDate: string;
}

interface AccordionStyledProps {
  tittle: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}
const Accordion = ({ tittle, children, defaultExpanded = false }: AccordionStyledProps) => {
  const [openAccordion, setOpenAccordion] = useState(defaultExpanded);
  return (
    <AccordionPrimitive type="single" value={openAccordion ? 'detail' : ''} className="self-stretch">
      <AccordionItem value="detail" className="w-full">
        <AccordionTrigger
          className="w-full"
          onClick={() => {
            setOpenAccordion(!openAccordion);
          }}
        >
          <div className="inline-flex items-center self-stretch justify-between">
            {tittle}
            <ExpandMore className="group-data-[state=open]:rotate-180 transition-transform ease-[cubic-bezier(0.87,_0,_0.13,_1)] text-gray-300" />
          </div>
        </AccordionTrigger>
        <AccordionContent>{children}</AccordionContent>
      </AccordionItem>
    </AccordionPrimitive>
  );
};

const PendingCardAccordion = ({
  method,
  totalAmount,
  currency,
  orders = [],
  dependents = [],
  guardianName,
  created,
  payinExpirationDate,
  onSelected,
  type,
  transactionDetails,
  commission,
}: PendingCardAccordionProps) => {
  const urlDetails = transactionDetails?.external_resource_url;
  const referenceId = transactionDetails?.payment_method_reference_id;
  const paymentExpiry = payinExpirationDate;
  const bankName = transactionDetails?.bank_name;
  const beneficiaryName = transactionDetails?.beneficiary_name;
  const duration = dayjs.duration(dayjs().diff(dayjs(created))).humanize();
  const paymentExpiryFormatted = dayjs(paymentExpiry).format('DD MMMM, HH:mm a');
  const paymentCreatedFormatted = dayjs(created).format('DD/MM');
  const isKushkiTransfer = method === 'KUSHKI' && type === 'bank_transfer';
  const isKushkiCash = method === 'KUSHKI' && type === 'ticket';

  const getTitle = () => {
    if (isKushkiTransfer) return `Transferencia ${paymentCreatedFormatted}`;
    if (isKushkiCash) return `Efectivo ${paymentCreatedFormatted}`;
    return method;
  };

  const getDetails = () => {
    if (isKushkiTransfer)
      return (
        <TransferDetails
          duration={duration}
          clabe={transactionDetails?.clabe}
          referenceId={referenceId}
          guardianName={guardianName}
          bankName={bankName}
          beneficiaryName={beneficiaryName}
          paymentExpiryFormatted={paymentExpiryFormatted}
        />
      );
    if (isKushkiCash) {
      return (
        <CashDetails
          duration={duration}
          guardianName={guardianName}
          paymentExpiryFormatted={paymentExpiryFormatted}
          transactionDetails={transactionDetails}
          currency={currency}
          totalAmount={totalAmount}
        />
      );
    }
    return null;
  };

  const getStepsToPay = () => {
    if (method === 'kushki' || method === 'KUSHKI') return TRANSFER_IN_KUSHKI;
  };

  const getHowToPay = () => {
    if (urlDetails)
      return (
        <div className="px-[26px]">
          <a href={urlDetails} target="_blank" rel="noreferrer">
            <Button className="w-full bg-transparent rounded-lg shadow-none hover:bg-gray-50/10 active:bg-gray-50/20 ">
              <span className="my-5 text-sm font-semibold text-gray-300">¿Cómo pagar?</span>
            </Button>
          </a>
        </div>
      );
    if (isKushkiTransfer)
      return (
        <div className="px-[26px]">
          <Accordion tittle={<span className="my-2 text-sm font-semibold text-gray-300">¿Cómo pagar?</span>}>
            <StepsToPay className="pt-5" steps={stepsToPay} />
          </Accordion>
        </div>
      );
    return null;
  };

  const getOrdersItemByStudent = () =>
    dependents.map((dependent) => {
      const listOrders = orders
        .filter((order) => Boolean(order?.dependent.id === dependent.id))
        .map((order) => {
          const finalPrice = getFinalPricePending(order);
          return (
            <div key={order.id} className="inline-flex justify-between w-full my-2">
              <span className="text-sm tracking-tight text-gray-300">{order.name}</span>
              <span className="text-sm text-right text-blue-700">{formatPrice(finalPrice, currency)}</span>
            </div>
          );
        });
      if (!listOrders.length) return null;

      const tittle = (
        <div className="flex w-full my-2">
          <span className="mr-3 text-sm font-semibold tracking-tight text-gray-300">Órdenes por pagar</span>
          <div className="flex items-center justify-center">
            <BoxColorText
              text={dependent.first_name}
              bgcolor={dependent.color?.background}
              color={dependent.color?.text}
            />
          </div>
        </div>
      );

      return (
        <div className="px-6" key={dependent.id}>
          <Accordion tittle={tittle}>
            <div className="flex flex-col pt-5">{listOrders}</div>
          </Accordion>
        </div>
      );
    });

  const stepsToPay = getStepsToPay();
  const details = getDetails();
  const howToPay = getHowToPay();
  const ordersItemByStudent = getOrdersItemByStudent();
  const title = getTitle();
  const priceFormatted = formatPrice(totalAmount, currency);
  return (
    <div className="inline-flex flex-col items-center justify-start bg-white rounded-2xl">
      <div className="flex flex-col w-full [&>div]:py-5 divide-y divide-zinc-300">
        <div className="px-[26px]">
          <div className="flex items-center justify-between">
            <span className="font-semibold tracking-tight text-blue-800 capitalize">{title}</span>
            <div>
              <ToggleFeature
                featureName={FEATURE_CANCEL_PAYIN_PENDING}
                allowComponent={
                  <Button
                    data-test-id="button-delete-pending"
                    className="p-2 bg-transparent rounded-full shadow-none hover:bg-error/5 disabled:bg-transparent disabled:cursor-not-allowed"
                    onClick={onSelected}
                  >
                    <Trash />
                  </Button>
                }
              />
            </div>
          </div>
        </div>
        {ordersItemByStudent}

        {/* Don't judge me for this, we need to tweak Frontend & Backend contracts 👇 */}
        <div className="flex flex-col items-start px-[26px] space-y-2">
          <span className="flex justify-between w-full text-sm">
            <p className="m-0 font-bold text-gray">Subtotal:</p>
            <p className="m-0 font-bold text-gray">
              {formatPrice(_currency(priceFormatted).subtract(commission).value, currency)}
            </p>
          </span>
          {parseInt(orders[0].guardian_commission) > 0 ? (
            <span className="flex justify-between w-full text-sm">
              <p className="m-0 font-bold text-gray">Fee administrativo:</p>
              <p className="m-0 font-bold text-gray">{formatPrice(commission, currency)}</p>
            </span>
          ) : null}
          <span className="flex justify-between w-full text-base">
            <p className="m-0 font-bold text-gray-300">Total a Pagar:</p>
            <p className="m-0 font-bold text-blue-700">{priceFormatted}</p>
          </span>
        </div>

        {details ? (
          <div className="px-[26px]">
            <Accordion tittle={<span className="text-sm font-semibold text-gray-300">Detalles:</span>}>
              <div className="pt-5">{details}</div>
            </Accordion>
          </div>
        ) : null}
        {howToPay}
      </div>
    </div>
  );
};

export default PendingCardAccordion;
