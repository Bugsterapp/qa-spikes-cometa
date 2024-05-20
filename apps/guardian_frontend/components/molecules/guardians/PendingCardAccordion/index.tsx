import dayjs from '~/lib/dayjs';
import { formatPrice, getFinalPricePending } from '~/utils/orders';
import StepsToPay from '../StepsToPay';
import { TRANSFER_IN_KUSHKI } from '~/utils/stepsToPay';
import TransferDetails from '~/components/atoms/guardians/TransferDetails';
import Trash from '../../../../public/icons/trash.svg';
import _currency from 'currency.js';
import { Order } from '~/types/OrdersApi';
import { GuardianDependentPayin, GuardianStudent, Type787Enum } from '@cometa/trpc';
import { Color } from '~/utils/colors';
import BoxColorText from '~/components/Tag';
import { Button } from '~/components/atoms/Button';
import {
  Accordion as AccordionPrimitive,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/Accordion';
import { useState } from 'react';
import ExpandMore from '/public/icons/ic_expand_more.svg';
import { useSelectedSchoolId } from '../../common/AuthGlobal';
import { api } from '~/utils/api';
import { useAlert } from '~/hooks';

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
  disabled?: boolean;
  payment: GuardianDependentPayin;
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
  disabled,
  payment,
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
  const selectedSchoolId = useSelectedSchoolId();
  const { setAlert } = useAlert();
  const utils = api.useUtils();

  const { mutateAsync, isLoading: isLoadingReportAsPaid } = api.payin.reportAsPaid.useMutation({
    async onSuccess() {
      await utils.payin.getGuardianPayins.invalidate({ schoolId: selectedSchoolId ?? '' });
    },
  });
  const title = isKushkiTransfer ? `Transferencia ${paymentCreatedFormatted}` : method;

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
    return null;
  };

  const stepsToPay = method === 'kushki' || method === 'KUSHKI' ? TRANSFER_IN_KUSHKI : undefined;

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

  const details = getDetails();
  const howToPay = getHowToPay();
  const ordersItemByStudent = getOrdersItemByStudent();
  const priceFormatted = formatPrice(totalAmount, currency);
  const reportAsPaid = (payment?.user_reports_as_paid as any)?.is_paid ?? false;

  return (
    <div className="inline-flex flex-col items-center justify-start bg-white rounded-2xl">
      <div className="flex flex-col w-full [&>div]:py-5 divide-y divide-zinc-300">
        <div className="px-[26px]">
          <div className="flex items-center justify-between">
            <span className="font-semibold tracking-tight text-blue-800 capitalize">{title}</span>

            <Button
              data-test-id="button-delete-pending"
              className="p-2 bg-transparent rounded-full shadow-none hover:bg-error/5 disabled:bg-transparent disabled:cursor-not-allowed"
              onClick={onSelected}
              disabled={isLoadingReportAsPaid || disabled}
            >
              <Trash />
            </Button>
          </div>
        </div>
        {ordersItemByStudent}

        {/* Don't judge me for this, we need to tweak Frontend & Backend contracts 👇 */}
        <div className="flex flex-col items-start px-[26px] space-y-2">
          {commission && !!parseInt(commission) && (
            <>
              <span className="flex justify-between w-full text-sm">
                <p className="m-0 font-bold text-gray">Subtotal:</p>
                <p className="m-0 font-bold text-gray">
                  {formatPrice(_currency(priceFormatted).subtract(commission).value, currency)}
                </p>
              </span>
              <span className="flex justify-between w-full text-sm">
                <p className="m-0 font-bold text-gray">Fee administrativo:</p>
                <p className="m-0 font-bold text-gray">{formatPrice(commission, currency)}</p>
              </span>
            </>
          )}
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
        <div className="flex flex-col justify-center items-center py-5 px-[26px] gap-y-1.5">
          {reportAsPaid ? (
            <>
              <div className="self-stretch justify-start items-center gap-x-2.5 inline-flex">
                <div className="flex items-center justify-center w-5 h-5 rounded-full shadow bg-[#00D685]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="9" height="8" viewBox="0 0 9 8" fill="none">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M7.86953 1.17502C8.20451 1.47361 8.234 1.98723 7.93541 2.32222L3.25204 7.57627L0.472322 5.0621C0.139512 4.76108 0.113738 4.24727 0.414755 3.91445C0.715772 3.58164 1.22959 3.55587 1.5624 3.85689L3.12814 5.27305L6.72233 1.2409C7.02092 0.905915 7.53454 0.876419 7.86953 1.17502Z"
                      fill="white"
                    />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-300">Gracias por confirmar el pago.</span>
              </div>
              <div className="inline-flex items-start self-stretch justify-start pl-[30px]">
                <span className="text-sm font-medium text-gray-300">
                  Recibirás un correo de confirmación una vez se acredite la transferencia.
                </span>
              </div>
            </>
          ) : (
            <Button
              className="w-full px-8 py-3 text-sm font-medium"
              disabled={isLoadingReportAsPaid || disabled}
              onClick={() => {
                mutateAsync({
                  payinId: payment.id,
                  schoolId: selectedSchoolId ?? '',
                  data: {
                    is_paid: true,
                  },
                }).catch(() => {
                  setAlert('No es posible realizar esta acción en este momento');
                });
              }}
            >
              Ya pagué
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingCardAccordion;
