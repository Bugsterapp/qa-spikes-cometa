import { GuardianDependentFulfillment, StatusDc1Enum } from '@cometa/trpc';
import { Session } from 'next-auth';
import Link, { LinkProps } from 'next/link';

import * as OrderCard from '~/components/OrderCard';
import Warning from '~/public/icons/warning.svg';
import { Banner } from '~/components/Banner';
import { Button } from './ui/Button';

const negativeAmountFallback = (amount: string) => (Number(amount) < 0 ? '0.00' : amount);

const useOrder = (order: GuardianDependentFulfillment) => {
  const cannotPayInPortal = (canPayPartial: boolean) =>
    (!canPayPartial && order.has_partial_payins) || order.concept.payment_only_in_dashboard;

  const { scholarships, special } = order.discount_breakdown?.details || {
    scholarships: null,
    special: null,
  };

  const interest = Number(order.interest) ? [{ name: 'Recargo por tardanza', value: order.interest }] : [];

  const hasPriceModifiers =
    order?.discount_breakdown?.details?.scholarships?.total > 0 ||
    order?.discount_breakdown?.details?.special?.total > 0 ||
    Number(order?.interest) > 0 ||
    order.has_partial_payins;

  const early_bird = order?.discount_breakdown?.details?.early_bird;

  const strPendingAmount = negativeAmountFallback(order.pending_amount);

  const discounts = [...(scholarships?.details ?? []), ...(special?.details ?? [])];
  const interests = [...(order.special_over_charges.filter((so) => so.is_visible) as any), ...interest];
  const payments = order.has_partial_payins
    ? order.payins.map((p) => ({ name: p.created, amount: p.total_paid ?? p.total }))
    : [];

  return {
    scholarships,
    special,
    hasPriceModifiers,
    strPendingAmount,
    discounts,
    interests,
    payments,
    early_bird,
    cannotPayInPortal,
  };
};

interface CommonBannersProps {
  final_amount: GuardianDependentFulfillment['final_amount'];
  payment_only_in_dashboard: GuardianDependentFulfillment['concept']['payment_only_in_dashboard'];
  cannotPayInPortal: boolean;
  canPayPartial: boolean;
}

const CommonBanners = ({
  final_amount,
  payment_only_in_dashboard,
  cannotPayInPortal,
  canPayPartial,
}: CommonBannersProps) => {
  const cantPayPartialText = !canPayPartial
    ? 'Para terminar de completar este pago debes comunicarte con la escuela.'
    : '';
  return (
    <>
      {Number(final_amount) <= 0 && (
        <Banner className="mt-3">
          Este item pasará automáticamente a estado "Pagado" un día antes de la fecha de vencimiento.
        </Banner>
      )}
      {cannotPayInPortal && (
        <Banner className="mt-3">
          {payment_only_in_dashboard ? 'Este item debe ser pagado directamente con el colegio.' : cantPayPartialText}
        </Banner>
      )}
    </>
  );
};

export interface OrderCardProps {
  order: GuardianDependentFulfillment;
  onChangeFulfillment: (fulfillment: GuardianDependentFulfillment) => void;
  student?: Session['user']['dependents'][number];
  disabled: boolean;
  canPayPartial: boolean;
  selected: boolean;
}

/**
 * @description Card variant for orders that are not due (excluding inscriptions)
 */
export function OrderCardNotDue({
  order,
  onChangeFulfillment,
  student,
  disabled,
  canPayPartial,
  selected,
}: Readonly<OrderCardProps>) {
  const { hasPriceModifiers, strPendingAmount, discounts, interests, payments, early_bird, cannotPayInPortal } =
    useOrder(order);

  return (
    <OrderCard.Root
      status={order.has_partial_payins ? 'partial' : 'valid'}
      disabled={disabled}
      selected={selected}
      onSelectChange={() => onChangeFulfillment(order)}
    >
      <OrderCard.Content>
        {order.has_partial_payins ? <OrderCard.Header>PAGADO PARCIALMENTE</OrderCard.Header> : null}

        <OrderCard.Info>
          <OrderCard.OrderInfo
            title={order.name}
            dueDate={order.due}
            student={{
              name: student?.first_name as string,
              background: student?.color?.background as string,
              textColor: student?.color?.text as string,
            }}
          />
          {early_bird ? (
            <OrderCard.EarlyBird
              amount={order.amount}
              percentage={early_bird?.total}
              endDate={early_bird?.details[0].until_date}
            />
          ) : null}
          <CommonBanners
            final_amount={order.final_amount}
            payment_only_in_dashboard={order.concept.payment_only_in_dashboard}
            cannotPayInPortal={cannotPayInPortal(canPayPartial)}
            canPayPartial={canPayPartial}
          />
        </OrderCard.Info>
        {hasPriceModifiers && (
          <OrderCard.Details>
            <OrderCard.DetailsTrigger>Ver detalles</OrderCard.DetailsTrigger>
            <OrderCard.DetailsContent>
              <OrderCard.PriceDetails
                subtotal={order.amount}
                discounts={discounts}
                interests={interests}
                payments={payments}
              />
            </OrderCard.DetailsContent>
          </OrderCard.Details>
        )}
        <OrderCard.PayFooter
          orderId={order.id}
          testId={`card-footer-${order.name}`}
          amount={strPendingAmount}
          hideButton={
            cannotPayInPortal(canPayPartial) || Number(order.final_amount) <= 0 || Number(order.pending_amount) <= 0
          }
          pending={order.status === StatusDc1Enum.WAITING_PAID}
        />
      </OrderCard.Content>
    </OrderCard.Root>
  );
}

/**
 * @description Card variant only for orders that are of type inscription
 */
export function OrderCardInscription({
  order,
  onChangeFulfillment,
  student,
  disabled,
  canPayPartial,
  selected,
}: Readonly<OrderCardProps>) {
  const { hasPriceModifiers, strPendingAmount, discounts, interests, payments, early_bird, cannotPayInPortal } =
    useOrder(order);

  const statusHasPartialPayins = order.has_partial_payins ? 'partial' : 'valid';
  const statusOrder = order.is_due ? 'due' : statusHasPartialPayins;

  return (
    <OrderCard.Root
      key={order.id}
      status={statusOrder}
      disabled={disabled}
      selected={selected}
      onSelectChange={() => onChangeFulfillment(order)}
    >
      <OrderCard.Content>
        {order.has_partial_payins || order.is_due ? (
          <OrderCard.Header>{!order.is_due ? 'PAGADO PARCIALMENTE' : 'VENCIDA'}</OrderCard.Header>
        ) : null}
        <OrderCard.Info>
          <OrderCard.OrderInfo
            title={order.name}
            dueDate={order.due}
            student={{
              name: student?.first_name as string,
              background: student?.color?.background as string,
              textColor: student?.color?.text as string,
            }}
          />
          {early_bird ? (
            <OrderCard.EarlyBird
              amount={order.amount}
              percentage={early_bird?.total}
              endDate={early_bird?.details[0].until_date}
            />
          ) : null}
          <CommonBanners
            final_amount={order.final_amount}
            payment_only_in_dashboard={order.concept.payment_only_in_dashboard}
            cannotPayInPortal={cannotPayInPortal(canPayPartial)}
            canPayPartial={canPayPartial}
          />
        </OrderCard.Info>
        {hasPriceModifiers && (
          <OrderCard.Details>
            <OrderCard.DetailsTrigger>Ver detalles</OrderCard.DetailsTrigger>
            <OrderCard.DetailsContent>
              <OrderCard.PriceDetails
                subtotal={order.amount}
                discounts={discounts}
                interests={interests}
                payments={payments}
              />
            </OrderCard.DetailsContent>
          </OrderCard.Details>
        )}
        <OrderCard.PayFooter
          orderId={order.id}
          testId={`card-footer-${order.name}`}
          amount={strPendingAmount}
          hideButton={
            cannotPayInPortal(canPayPartial) || Number(order.final_amount) <= 0 || Number(order.pending_amount) <= 0
          }
          pending={order.status === StatusDc1Enum.WAITING_PAID}
        />
      </OrderCard.Content>
    </OrderCard.Root>
  );
}

/**
 * @description Card variant only for orders that are due
 */
export function OrderCardDue({
  order,
  onChangeFulfillment,
  student,
  disabled,
  canPayPartial,
  selected,
}: Readonly<OrderCardProps>) {
  const { scholarships, special, hasPriceModifiers, strPendingAmount, interests, payments, cannotPayInPortal } =
    useOrder(order);

  //FIXME: Fix types of GuardianDependentFulfillment so it matches GuardianDependentOrder schema in discounts
  const hasDisabledScholarships = scholarships?.details?.some((s: any) => !s.active);

  const isPartialDue = order.has_partial_payins;

  return (
    <OrderCard.Root
      key={order.id}
      status={isPartialDue ? 'partial-due' : 'due'}
      disabled={disabled}
      selected={selected}
      onSelectChange={() => onChangeFulfillment(order)}
    >
      <OrderCard.Content>
        <OrderCard.Header>
          VENCIDA{' '}
          {isPartialDue ? (
            <>
              - <span className="text-[#FE62B0]">PAGADA PARCIALMENTE</span>{' '}
            </>
          ) : null}
        </OrderCard.Header>
        <OrderCard.Info>
          <OrderCard.OrderInfo
            title={order.name}
            dueDate={order.due}
            student={{
              name: student?.first_name as string,
              background: student?.color?.background as string,
              textColor: student?.color?.text as string,
            }}
          />
          <CommonBanners
            final_amount={order.final_amount}
            payment_only_in_dashboard={order.concept.payment_only_in_dashboard}
            cannotPayInPortal={cannotPayInPortal(canPayPartial)}
            canPayPartial={canPayPartial}
          />
          {hasDisabledScholarships && !hasPriceModifiers ? (
            <Banner className="mt-3">Las becas ya no aplican a esta orden porque está vencida.</Banner>
          ) : null}
        </OrderCard.Info>
        {hasPriceModifiers && (
          <OrderCard.Details>
            <OrderCard.DetailsTrigger>Ver detalles</OrderCard.DetailsTrigger>
            <OrderCard.DetailsContent>
              {hasDisabledScholarships ? (
                <Banner className="mb-3">Las becas ya no aplican a esta orden porque está vencida.</Banner>
              ) : null}
              <OrderCard.PriceDetails
                subtotal={order.amount}
                discounts={[...(scholarships?.details.filter((s: any) => s.active) ?? []), ...(special?.details ?? [])]}
                interests={interests}
                payments={payments}
              />
            </OrderCard.DetailsContent>
          </OrderCard.Details>
        )}

        <OrderCard.PayFooter
          orderId={order.id}
          testId={`card-footer-${order.name}`}
          amount={strPendingAmount}
          hideButton={
            cannotPayInPortal(canPayPartial) || Number(order.final_amount) <= 0 || Number(order.pending_amount) <= 0
          }
          pending={order.status === StatusDc1Enum.WAITING_PAID}
        />
      </OrderCard.Content>
    </OrderCard.Root>
  );
}

export interface SubscriptionOrderCardProps {
  order: GuardianDependentFulfillment;
  onChangeFulfillment: (fulfillment: GuardianDependentFulfillment) => void;
  student?: Session['user']['dependents'][number];
  disabled: boolean;
  selected: boolean;
  hrefInfo: LinkProps['href'];
  onClickInfo: () => void;
  onPaymentFailInfo: () => void;
}

/**
 * @description Card variant for orders with subscription
 */
export function OrderCardSubscription({
  order,
  onChangeFulfillment,
  student,
  disabled,
  selected,
  hrefInfo,
  onClickInfo,
  onPaymentFailInfo,
}: Readonly<SubscriptionOrderCardProps>) {
  const canPayManually = order.subscription.payment_has_failed === true;

  const { hasPriceModifiers, strPendingAmount, discounts, interests, payments } = useOrder(order);

  return (
    <OrderCard.Root
      status="subscription"
      disabled={disabled && !canPayManually}
      selected={selected}
      onSelectChange={() => onChangeFulfillment(order)}
    >
      <OrderCard.Content>
        <OrderCard.Header>
          <div className="flex justify-between ">
            <span>COBRO AUTOMÁTICO</span>
            <Link href={hrefInfo} onClick={onClickInfo} className="text-[#4A5CFF]">
              Ver información
            </Link>
          </div>
        </OrderCard.Header>
        {canPayManually ? (
          <Banner size="hero" intent="warning">
            <div className="flex items-start gap-2">
              <Warning className="text-[#F1BD35] w-[14px] mt-1" />
              <div className="font-normal">
                <strong className="block font-semibold">No se pudo realizar el cobro.</strong>
                <p>Debes abonar manualmente esta orden.</p>
                <Button variant="transparent" onClick={onPaymentFailInfo}>
                  Ver más
                </Button>
              </div>
            </div>
          </Banner>
        ) : null}

        <OrderCard.Info>
          <OrderCard.OrderInfo
            title={order.name}
            dueDate={order.subscription.next_payment_date}
            dueDateLabel="Fecha de cobro"
            student={{
              name: student?.first_name as string,
              background: student?.color?.background as string,
              textColor: student?.color?.text as string,
            }}
          />
        </OrderCard.Info>

        {hasPriceModifiers ? (
          <OrderCard.Details>
            <OrderCard.DetailsTrigger>Ver detalles</OrderCard.DetailsTrigger>
            <OrderCard.DetailsContent>
              <OrderCard.PriceDetails
                subtotal={order.amount}
                discounts={discounts}
                interests={interests}
                payments={payments}
              />
            </OrderCard.DetailsContent>
          </OrderCard.Details>
        ) : null}

        <OrderCard.PayFooter
          orderId={order.id}
          testId={`card-footer-${order.name}`}
          amount={strPendingAmount}
          hideButton={!canPayManually}
          pending={order.status === StatusDc1Enum.WAITING_PAID}
        />
      </OrderCard.Content>
    </OrderCard.Root>
  );
}
