import dayjs from '~/lib/dayjs';
import { isMobile } from 'react-device-detect';
import AccordionOrderDetails from '~/components/atoms/guardians/AccordionOrderDetails';
import { useState } from 'react';
import BoxColorText from '~/components/atoms/guardians/BoxColorText';
import type { Session } from 'next-auth';
import { cn } from '~/lib/cn';
import Box from '~/components/atoms/common/Box';
import { GuardianDependentOrder } from '@cometa/trpc/src/types';
import currency from 'currency.js';
import { formatPrice } from '~/utils/orders';
import { ButtonSelectOrder, EarlyBirdBox } from '../OrderCard';

interface Props {
  data: GuardianDependentOrder;
  onChange?: () => void;
  openDetails: boolean;
  session: Session;
  selected?: boolean;
  disabled?: boolean;
  isPaid?: boolean;
  sponsored?: boolean;
}
const composePriceForOrder = (fulfillment: GuardianDependentOrder) => {
  const orderPrice = currency(fulfillment.price);
  const finalAmount = currency(fulfillment.final_amount || '').value;
  const discountsToApply = fulfillment.discount_breakdown?.total || 0;
  const interest = null;
  const {
    scholarships,
    special,
    early_bird: earlyBird,
  } = fulfillment.discount_breakdown?.details || { scholarships: null, special: null, early_bird: null };

  const scholarshipsResume = [...(scholarships?.details ?? [])].map(({ discount, name, active }) => ({
    name,
    amount: formatPrice(discount || 0, fulfillment.currency),
    active,
  }));

  // Accumulate common discounts and only save the amount and name for reference
  const otherDiscounts = [...(special?.details ?? [])].map(({ discount, name }) => ({
    amount: formatPrice(discount || 0, fulfillment.currency),
    name,
    active: true,
  }));

  const normalizedDiscounts = [...scholarshipsResume, ...otherDiscounts];
  const calculation = orderPrice.subtract(discountsToApply).add(interest || '').value;
  const total = formatPrice(finalAmount || calculation, fulfillment.currency);

  // Backend doesn't return percentages 😅
  const earlyBirdPercent = currency(earlyBird?.total || 0)
    .multiply(100)
    .divide(orderPrice.add(interest || '').value).value;

  const normalizedEarlyBird = earlyBird
    ? {
        percent: `-${earlyBirdPercent}%`,
        untilDate: earlyBird?.details?.[0]?.until_date ? dayjs(earlyBird.details[0].until_date).format('DD.MM') : null,
      }
    : null;

  return {
    subtotal: formatPrice(orderPrice.value, fulfillment.currency),
    modifiers: {
      earlyBird: normalizedEarlyBird,
      discounts: normalizedDiscounts,
      interest,
    },
    total,
    currency: fulfillment.currency,
  };
};
const OrderOptionalCard = ({
  data,
  onChange,
  openDetails = false,
  session,
  selected,
  disabled,
  isPaid,
  sponsored,
}: Props) => {
  const [open, setOpen] = useState(openDetails);

  const dependentColor = session.user?.dependents?.find((dependent) => dependent.id === data.student.id)?.color;
  const {
    concept: { payment_only_in_dashboard: orderBlocked },
  } = data;

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
            </AccordionOrderDetails>
          )}
          {orderBlocked && (
            <AccordionOrderDetails divider="none" open={open}>
              <div className="border-2 border-solid border-[#FFB612] bg-[#FFF3D9] px-4 py-3.5 rounded-1.5xl text-[#57537A] font-semibold text-sm">
                Este item debe ser pagado directamente con el colegio.
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
        {price.modifiers.earlyBird && (
          <EarlyBirdBox earlyBird={price.modifiers.earlyBird} finalPrice={price.subtotal} />
        )}
        <div className="flex flex-row items-center justify-between w-full mt-1">
          <span className="text-lg font-medium text-gray-300">{price.total}</span>

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
              : orderBlocked
              ? 'PAGAR EN EL COLEGIO'
              : (disabled && selected) || selected
              ? 'SELECCIONADO'
              : 'SELECCIONAR'}
          </ButtonSelectOrder>
        </div>
      </button>
    </Box>
  );
};

export default OrderOptionalCard;
