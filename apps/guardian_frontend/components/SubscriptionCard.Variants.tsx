import Link, { LinkProps } from 'next/link';
import * as OrderCard from '~/components/OrderCard';
import ArrowSmallLeft from '~/public/icons/arrow-small-left.svg';
import { Banner } from './Banner';
import Warning from '~/public/icons/warning.svg';
import { RetrieveSubscribableConceptsResponseDTO } from '@cometa/trpc';

interface SubscriptionCardActiveProps {
  hasDueOrder?: boolean;
  student: OrderCard.OrderInfoStudent;
  concept: string;
  payDate: string;
  href: LinkProps['href'];
  onClickInfo: () => void;
}

/**
 * @description Card variant for section active subscription in subscription page
 */
export function SubscriptionCardActive({
  student,
  payDate,
  concept,
  href,
  onClickInfo,
}: Readonly<SubscriptionCardActiveProps>) {
  return (
    <OrderCard.Root status="subscription">
      <OrderCard.Content>
        <OrderCard.Header>
          <div className="flex justify-between">
            <span>COBRO AUTOMÁTICO</span>
          </div>
        </OrderCard.Header>

        <OrderCard.Info>
          <OrderCard.SubscriptionInfo
            title={concept}
            payDate={payDate}
            dueDateLabel="Fecha de cobro"
            student={student}
          />
        </OrderCard.Info>
        <OrderCard.Footer className="flex justify-end">
          <Link
            href={href}
            onClick={onClickInfo}
            className="flex flex-row items-center font-semibold text-sm/4 text-[#4A5CFF] gap-x-1.5"
          >
            Ver información
            <ArrowSmallLeft />
          </Link>
        </OrderCard.Footer>
      </OrderCard.Content>
    </OrderCard.Root>
  );
}

interface SubscriptionCardAvailableProps {
  disabled?: boolean;
  hasDueOrder?: boolean;
  selected?: boolean;
  student: OrderCard.OrderInfoStudent;
  onChange: () => void;
  conceptName: RetrieveSubscribableConceptsResponseDTO['concept_name'];
  price: RetrieveSubscribableConceptsResponseDTO['concept_price'];
  nextDue: RetrieveSubscribableConceptsResponseDTO['next_due'];
  hrefToPay: LinkProps['href'];
}

/**
 * @description Card variant for section available subscription in subscription page
 */
export function SubscriptionCardAvailable({
  disabled,
  hasDueOrder,
  selected,
  student,
  onChange,
  conceptName,
  price,
  nextDue,
  hrefToPay,
}: Readonly<SubscriptionCardAvailableProps>) {
  return (
    <OrderCard.Root
      status="subscription"
      disabled={disabled || hasDueOrder}
      selected={selected}
      onSelectChange={onChange}
    >
      <OrderCard.Content>
        {hasDueOrder && (
          <Banner intent="error" size="hero" className="flex flex-row items-start px-4 py-2 text-sm gap-x-2">
            <Warning className="text-[#F46F6F] min-w-[14px] h-3.5 mt-1" />
            <span className="pr-5 font-medium">
              No puedes domiciliarte a este concepto porque tienes una orden vencida pendiente.{' '}
              <Link className="font-semibold text-[#4A5CFF]" href={hrefToPay}>
                Ir a pagar.
              </Link>
            </span>
          </Banner>
        )}

        <OrderCard.Info>
          <OrderCard.SubscriptionInfo
            title={conceptName}
            payDate={nextDue}
            dueDateLabel="Fecha de cobro"
            student={student}
          />
        </OrderCard.Info>

        <OrderCard.PayFooter
          testId="subscription-card-footer-1"
          amount={`${price}`}
          pending={false}
          tooltip={
            !hasDueOrder && disabled
              ? 'Solo puedes domiciliarte a un concepto a la vez. Completa la domiciliación que tienes seleccionada primero.'
              : undefined
          }
        />
      </OrderCard.Content>
    </OrderCard.Root>
  );
}
