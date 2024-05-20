import dayjs from '~/lib/dayjs';
import { isMobile } from 'react-device-detect';
import AccordionOrderDetails from '~/components/atoms/guardians/AccordionOrderDetails';
import { MouseEvent, useState } from 'react';
import BoxColorText from '~/components/atoms/guardians/BoxColorText';
import { PriceModifiers } from '~/types/OrdersApi';
import type { Session } from 'next-auth';
import { useAlert } from '~/hooks';
import ApiClient from '~/services/ApiClient';
import * as Sentry from '@sentry/nextjs';
import { cn } from '~/lib/cn';
import Button from '~/components/atoms/Button';
import { Tooltip } from '~/components/atoms/guardians/Tooltips';
import Box from '~/components/atoms/common/Box';
import useSendTrackEvent from '~/hooks/useSendEvent';
import { GuardianDependentFulfillment, StatusDc1Enum } from '@cometa/trpc/src/types';
import currency from 'currency.js';
import { formatPrice } from '~/utils/orders';

interface Props {
  data: GuardianDependentFulfillment;
  onChange?: () => void;
  openDetails: boolean;
  session: Session;
  selected?: boolean;
  disabled?: boolean;
  isPaid?: boolean;
  sponsored?: boolean;
}
const composePriceForOrder = (fulfillment: GuardianDependentFulfillment) => {
  const orderPrice = currency(fulfillment.amount);
  const finalAmount = currency(
    (fulfillment.has_partial_payins ? fulfillment.pending_amount : fulfillment.final_amount) || ''
  ).value;
  const discountsToApply = fulfillment.discount_breakdown?.total || 0;
  const interest =
    fulfillment.interest && currency(fulfillment.interest).value
      ? formatPrice(fulfillment.interest, fulfillment.currency)
      : null;
  const specialOvercharges = fulfillment.special_over_charges
    .filter((o) => o.is_visible === true)
    .map(({ name, value }) => ({
      name,
      amount: formatPrice(value ?? '0', fulfillment.currency),
    }));

  const {
    scholarships,
    special,
    early_bird: earlyBird,
  } = fulfillment.discount_breakdown?.details || { scholarships: null, special: null, early_bird: null };

  const scholarshipsResume = [...(scholarships?.details ?? [])].map(({ discount, name, active }) => ({
    name,
    amount: formatPrice(discount, fulfillment.currency),
    active,
  }));

  // Accumulate common discounts and only save the amount and name for reference
  const otherDiscounts = [...(special?.details ?? [])].map(({ discount, name }) => ({
    amount: formatPrice(discount, fulfillment.currency),
    name,
    active: true,
  }));

  const normalizedDiscounts = [...scholarshipsResume, ...otherDiscounts];
  const calculation = orderPrice.subtract(discountsToApply).add(interest || '').value;
  const total = formatPrice(finalAmount || calculation, fulfillment.currency);

  // Backend doesn't return percentages 😅
  const earlyBirdPercent = currency(earlyBird?.total)
    .multiply(100)
    .divide(orderPrice.add(interest || '').value).value;

  const normalizedEarlyBird = earlyBird
    ? {
        percent: `-${earlyBirdPercent}%`,
        untilDate: earlyBird?.details[0]?.until_date ? dayjs(earlyBird.details[0].until_date).format('DD.MM') : null,
      }
    : null;

  return {
    subtotal: formatPrice(orderPrice.value, fulfillment.currency),
    modifiers: {
      earlyBird: normalizedEarlyBird,
      discounts: normalizedDiscounts,
      interest,
      specialOvercharges,
    },
    total,
    currency: fulfillment.currency,
  };
};
const OrderCard = ({ data, onChange, openDetails = false, session, selected, disabled, isPaid, sponsored }: Props) => {
  const [open, setOpen] = useState(openDetails);

  const formatDate = dayjs(data.status === StatusDc1Enum.PAID ? data.payins[0]?.created : data.due).format(
    'D [de] MMMM YYYY'
  );

  const getDateText = () => {
    if (data.status === StatusDc1Enum.PAID) return 'Pagado el';

    if (data.is_due) return 'Venció';

    return 'Vence';
  };

  const dependentColor = session.user?.dependents?.find((dependent) => dependent.id === data.student.id)?.color;
  const {
    has_partial_payins,
    pending,
    concept: { payment_only_in_dashboard },
  } = data;
  const orderBlocked = has_partial_payins || pending || payment_only_in_dashboard;
  const price = composePriceForOrder(data);
  return (
    <Box
      className={cn({
        'border-2 border-blue-100': selected,
        'cursor-pointer': !isMobile && !disabled && !orderBlocked,
      })}
    >
      <button
        className={cn('flex flex-col w-full h-full text-left bg-transparent appearance-none', {
          'cursor-default': isMobile || disabled || orderBlocked,
        })}
        onMouseEnter={() => {
          if (!isMobile) setOpen(true);
        }}
        onMouseLeave={() => {
          if (!isMobile) setOpen(false);
        }}
        onClick={() => {
          if (!isMobile && !disabled && !isPaid && !orderBlocked && onChange) onChange();
        }}
      >
        <div
          className="flex flex-col"
          onClick={() => {
            if (isMobile) setOpen(!open);
          }}
        >
          <div className="flex flex-row items-start mb-4">
            <p className="mr-2 text-lg font-semibold text-blue-800">{data.name.replaceAll('_', ' ')}</p>
            {session.user?.dependents?.length ? (
              <div className="mt-0.5">
                <BoxColorText
                  bgcolor={dependentColor ? dependentColor.background : ''}
                  color={dependentColor ? dependentColor.text : ''}
                  text={data.student.first_name.toUpperCase()}
                />
              </div>
            ) : null}
          </div>
          {formatDate !== 'Invalid Date' && (
            <div className="inline-flex items-center mb-1">
              <span
                className={cn('text-sm text-gray-300', {
                  'text-[#F46F6F] font-semibold': data.is_due,
                })}
              >
                {`${getDateText()}:`}&nbsp;
              </span>

              <span className="text-sm text-gray-300">{formatDate}</span>
            </div>
          )}
          {data.status === StatusDc1Enum.PAID && (
            <AccordionOrderDetails divider="bottom" open={open}>
              <div className="flex flex-col mb-1 space-y-1 text-sm text-gray-300">
                <span>
                  {data?.payins[0]?.guardian?.id === session.user.id
                    ? 'Pagado por ti'
                    : `Pagado por ${data?.payins[0]?.guardian?.first_name} ${data?.payins[0]?.guardian?.last_name}`}
                </span>
                {!data.has_partial_payins && (
                  <>
                    {data.payins[0]?.type && <span>{`Medio de pago: ${data.payins[0].type}`.replace('_', ' ')}</span>}
                    {data.payins[0]?.method && (
                      <span>{`Tipo de pago: ${data.payins[0].method.replace('_', ' ')}`}</span>
                    )}
                    {data.payins[0]?.transaction?.identifier && (
                      <span>{`Nº de pago: ${data.payins[0].transaction.identifier}`}</span>
                    )}
                  </>
                )}
              </div>
            </AccordionOrderDetails>
          )}
          {(!!price.modifiers.discounts.length || price.modifiers.interest) && (
            <AccordionOrderDetails divider="bottom" open={open}>
              {price.modifiers.discounts.some((value) => value.active === false) && (
                <div className="py-3 px-4 bg-[#FFF3D9] border-[#FFB612] border-2 rounded-lg font-bold text-[#57537A] w-fit text-sm my-4">
                  Las becas ya no aplican a esta orden porque está vencida.
                </div>
              )}
              <div className="inline-flex mb-1 text-sm text-gray-300">
                <span>{price.subtotal}</span>&nbsp;<span>monto original</span>
              </div>

              {!!price.modifiers.discounts.length &&
                price.modifiers.discounts.map((detail) => (
                  <span
                    className={cn('mb-0.5 text-sm text-green-700 inline-flex', { 'line-through': !detail.active })}
                    key={detail.name}
                  >
                    <span>-{detail.amount}</span>&nbsp;
                    <span>{detail.name}</span>
                  </span>
                ))}
              {price.modifiers.interest && (
                <div className="inline-flex mb-1 text-sm text-[#F46F6F]">
                  <span>+{price.modifiers.interest}</span>&nbsp;
                  <span>recargo por tardanza</span>
                </div>
              )}
              {price.modifiers.specialOvercharges.length
                ? price.modifiers.specialOvercharges.map(({ name, amount }) => (
                    <div key={`${name}-${amount}`} className="inline-flex mb-1 text-sm text-[#F46F6F]">
                      <span>+{amount}</span>&nbsp;
                      <span>{name}</span>
                    </div>
                  ))
                : null}
            </AccordionOrderDetails>
          )}
          {((payment_only_in_dashboard && !pending) || has_partial_payins) && data.status !== StatusDc1Enum.PAID && (
            <AccordionOrderDetails divider="none" open={open}>
              <div className="border-2 border-solid border-[#FFB612] bg-[#FFF3D9] px-4 py-3.5 rounded-1.5xl text-[#57537A] font-semibold text-sm">
                {has_partial_payins
                  ? 'Para terminar de completar este pago debes comunicarte con la escuela.'
                  : 'Este item debe ser pagado directamente con el colegio.'}
              </div>
            </AccordionOrderDetails>
          )}
          {sponsored && (
            <AccordionOrderDetails divider="none" open={open}>
              <div className="border-2 border-solid border-[#FFB612] bg-[#FFF3D9] px-4 py-3.5 rounded-1.5xl text-[#57537A] font-semibold text-sm">
                Este item pasará automáticamente a estado "Pagado" un día antes de la fecha de vencimiento.
              </div>
            </AccordionOrderDetails>
          )}
        </div>
        {!data.is_due && price.modifiers.earlyBird && (
          <EarlyBirdBox earlyBird={price.modifiers.earlyBird} finalPrice={price.subtotal} />
        )}
        <div className="flex flex-row items-center justify-between w-full mt-1">
          <span className="text-lg font-medium text-gray-300">{price.total}</span>
          {data.status === StatusDc1Enum.PAID ? (
            <InvoiceButton
              disabled={!data.invoices.some((invoice) => invoice?.is_paid_invoice)}
              orderData={{
                dependentId: data.student.id,
                orderId: data.order_id,
                token: session.token,
                name: data.name,
              }}
            />
          ) : (
            <ButtonSelectOrder
              disabled={disabled || orderBlocked}
              selected={!!selected}
              onClick={() => {
                if (isMobile && onChange) onChange();
              }}
              disabledTooltip={orderBlocked}
            >
              {sponsored
                ? 'NO REQUIERE PAGO'
                : has_partial_payins
                ? 'PARCIALMENTE PAGADO'
                : pending
                ? 'EN PROCESO DE PAGO'
                : payment_only_in_dashboard
                ? 'PAGAR EN EL COLEGIO'
                : (disabled && selected) || selected
                ? 'SELECCIONADO'
                : 'SELECCIONAR'}
            </ButtonSelectOrder>
          )}
        </div>
      </button>
    </Box>
  );
};

export default OrderCard;

/**
 * Temporal components, they should be refactored for scalability
 */

interface InvoiceButtonProps {
  disabled: boolean;
  orderData: {
    dependentId: string;
    orderId: string;
    token: string;
    name: string;
  };
}

const InvoiceButton = ({ disabled, orderData }: InvoiceButtonProps) => {
  const { setAlert } = useAlert();
  const sendTrackEvent = useSendTrackEvent();

  const addHttps = (url: string) => {
    if (url.includes('https://')) return url;
    else if (!url.includes('https://')) return `${process.env.NEXT_PUBLIC_CLIENT_API_BASE_URL}${url}`;
    else throw Error('Error al abrir factura');
  };

  const getUrl = async () => {
    const res = await ApiClient.getInvoicePDF(orderData.dependentId, orderData.orderId, orderData.token);
    const data = res.data;
    const pdf = data?.pdfs.map((x: string) => addHttps(x));
    const xml = data?.xmls.map((x: string) => addHttps(x));
    return [...pdf, ...xml];
  };

  const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

  async function download(url: string, filename: string) {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        link.remove();
      })
      .catch((err) => {
        Sentry.captureException(err);
        setAlert('Error al abrir factura');
      });
    await wait(1000);
  }

  const showInvoice = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      sendTrackEvent('portal: Invoice opened', {});
      const urls = await getUrl();
      for (const url of urls) {
        const fileName = `${orderData?.name.replaceAll(' ', '_')}.${url.split('.').pop()}`;
        await download(url, fileName);
      }
    } catch (err) {
      Sentry.captureException(err);
      setAlert('Error al abrir factura');
    }
  };
  return (
    <Button
      disabled={disabled}
      onClick={showInvoice}
      type="button"
      className="bg-[#ffb612] px-[18px] py-2 rounded-xl text-xs font-semibold active:bg-[#ffb612] hover:bg-yellow-500 shadow-none hover:shadow-none"
    >
      VER FACTURA
    </Button>
  );
};

interface ButtonSelectOrderProps
  extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  selected: boolean;
  disabledTooltip?: boolean;
}

export const ButtonSelectOrder = ({
  disabled,
  selected,
  disabledTooltip,
  children,
  ...buttonProps
}: ButtonSelectOrderProps) => (
  <Tooltip
    message="Selecciona las colegiaturas más antiguas primero."
    disableClick={disabled}
    disableHover={!disabled || disabledTooltip || selected}
  >
    <span tabIndex={0}>
      <Button
        id={selected ? 'select-order-button-selected' : 'select-order-button-unselected'}
        disabled={disabled}
        className={cn('px-[18px] py-2 rounded-xl text-xs font-semibold shadow-none', {
          'disabled:text-white disabled:bg-[#4A5CFF]/70': selected && disabled,
          'pointer-events-none': disabled && !selected && !disabledTooltip,
          'bg-white text-blue-100 border border-blue-100 hover:bg-blue-100/5 active:bg-blue-100/20':
            !selected && !disabled,
        })}
        type="button"
        {...buttonProps}
      >
        {children}
      </Button>
    </span>
  </Tooltip>
);

interface EarlyBirdBoxProps {
  finalPrice: string;
  earlyBird: PriceModifiers['earlyBird'];
}

export const EarlyBirdBox = ({ finalPrice, earlyBird }: EarlyBirdBoxProps) => (
  <div className="inline-flex items-center mb-2">
    <span className="text-sm text-gray-300 line-through">{finalPrice}</span>
    <div className="p-1 ml-2 rounded-md bg-[#E0EBFF] text-sm font-semibold text-blue-100">
      {`${earlyBird.percent} Hasta el ${earlyBird.untilDate}`}
    </div>
  </div>
);
