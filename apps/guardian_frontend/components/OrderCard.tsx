import * as RCollapsible from '@radix-ui/react-collapsible';
import { ChevronDown } from 'lucide-react';
import type { LinkProps } from 'next/link';
import * as React from 'react';
import { UTMLink as Link } from '~/components/UtmNavigation';
import { cn } from '~/lib/cn';
import dayjs from '~/lib/dayjs';
import { formatPrice } from '~/utils/orders';
import { Tooltip } from './atoms/guardians/Tooltips';
import Tag from './Tag';
import { Button } from './ui/Button';
import { Counter } from './ui/Counter';

type OrderCardContextType = {
  status: 'due' | 'info' | 'valid' | 'partial' | 'acquired' | 'subscription' | 'partial-due';
  disabled?: boolean;
  selected?: boolean;
  isOptional?: boolean;
  onSelectChange?: (selected: boolean) => void;
};

const initialState = {
  status: 'due',
  disabled: false,
  selected: false,
  isOptional: false,
} as const;

const OrderCardContextState = React.createContext<OrderCardContextType>(initialState);

export const useOrderCardState = () => {
  const state = React.useContext(OrderCardContextState);
  if (state === undefined) {
    throw new Error('useOrderCardState must be used within a OrderCardContextState.Provider');
  }

  return state;
};

export const Root = ({
  children,
  ...props
}: {
  children: React.ReactElement | React.ReactNode;
} & OrderCardContextType) => {
  const state = { ...initialState, ...props };
  return <OrderCardContextState.Provider value={state}>{children}</OrderCardContextState.Provider>;
};

export const Content = ({
  children,
  className,
  ...props
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => {
  const { selected } = useOrderCardState();

  return (
    <div
      className={cn(
        'w-full rounded-[14px] shadow-[0px_2px_24px_0px_#ADBBCC4D] overflow-hidden transition-colors bg-white outline-2 outline outline-transparent',
        {
          'outline-[#22283A]': selected,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const Header = ({ children }: { children: React.ReactElement | React.ReactNode }) => {
  const { status } = useOrderCardState();

  return (
    <header
      className={cn(
        'bg-[#F8F8F8] text-[#3E3E3E] font-bold px-4 py-2 text-[12px] leading-[16px] tracking-[0.6px] uppercase h-[36px] flex items-center',
        {
          'text-[#F46F6F] border-b border-[#F46F6F] border-solid': status === 'due',
          'text-[#00D685] border-b border-[#00D685] border-solid': status === 'acquired',
          'text-[#FE62B0] border-b border-[#FE62B0] border-solid': status === 'partial',
          'text-[#6C61E0] border-b border-[#6C61E0] border-solid': status === 'subscription',
          'relative after:block after:content-[""] after:absolute after:w-full after:h-px after:bg-gradient-to-r after:from-[#F46F6F] after:to-[#FE62B0] after:bottom-0 after:left-0 text-[#F46F6F]':
            status === 'partial-due',
        }
      )}
    >
      {children}
    </header>
  );
};

export const Info = ({
  children,
  className,
  ...props
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => (
  <div
    className={cn('pt-4 px-4 pb-2', 'border-b border-[#E3E0FF] border-solid last:border-none', className)}
    {...props}
  >
    {children}
  </div>
);

export interface OrderInfoStudent {
  background?: string;
  textColor?: string;
  name: string;
}

export const OrderInfo = ({
  title,
  student,
  dueDate,
  dueDateLabel,
  tag,
}: {
  title: string;
  student?: OrderInfoStudent;
  dueDate?: string;
  dueDateLabel?: string;
  tag?: React.ReactElement | React.ReactNode;
}) => {
  const { status } = useOrderCardState();

  const formatDate = dueDate ? dayjs(dueDate).format('D [de] MMMM YYYY') : null;

  return (
    <>
      <div className="flex gap-2 justify-between items-start mb-2">
        <h3
          className="min-w-0 text-[18px] leading-[24px] font-semibold text-[#22283A] break-wods"
          data-testId={`card-title-${title}`}
        >
          {title}
        </h3>
        {student && (
          <Tag
            bgcolor={student?.background}
            color={student?.textColor}
            text={student?.name || ''}
            className="flex-shrink-0 mt-1"
          />
        )}
        {tag && !student && tag}
      </div>
      {dueDate ? (
        <span className="font-medium text-[14px] tracking-[0.1px] text-[#444c60]">
          <span
            className={cn('font-normal', {
              'text-[#F46F6F]': status === 'due',
            })}
          >
            {dueDateLabel ? dueDateLabel : status === 'due' ? 'Venció' : 'Vence'}:
          </span>{' '}
          {formatDate}
        </span>
      ) : null}
    </>
  );
};

export const SubscriptionInfo = ({
  title,
  student,
  payDate,
  dueDateLabel,
}: {
  title: string;
  student: OrderInfoStudent;
  payDate: string;
  dueDateLabel?: string;
}) => {
  const formatDate = dayjs(payDate).format('D [de] MMMM YYYY');

  return (
    <>
      <div className="flex gap-2 justify-between items-start mb-2">
        <h3
          className="font-semibold text-[#22283A] text-[18px] leading-[24px] min-w-0 break-words"
          data-testId={`card-title-${title}`}
        >
          {title}
        </h3>
        <Tag
          bgcolor={student.background}
          color={student.textColor}
          text={student.name}
          className="flex-shrink-0 mt-1"
        />
      </div>
      <span className="font-medium text-[14px] tracking-[0.1px] text-[#444c60]">
        <span className="font-normal">{dueDateLabel}:</span> {formatDate}
      </span>
    </>
  );
};

export const PaymentInfo = ({ paymentDate, paymentId }: { paymentDate: string; paymentId: string }) => (
  <>
    <h3 className="font-semibold text-[#3E3E3E] text-base">{paymentDate}</h3>
    <span className="text-[#817E9A] text-xs font-medium">ID de pago: {paymentId}</span>
  </>
);

export const Details = ({
  children,
  className,
}: {
  children: React.ReactElement | React.ReactNode;
  className?: string;
}) => (
  <RCollapsible.Root
    className={cn(
      'px-4 data-[state="open"]:pb-2 group border-b border-[#E3E0FF] border-solid last:border-none',
      className
    )}
  >
    {children}
  </RCollapsible.Root>
);

export const DetailsTrigger = ({ children, className, ...props }: RCollapsible.CollapsibleTriggerProps) => (
  <RCollapsible.Trigger asChild {...props}>
    <div
      className={cn(
        'py-3 flex items-center justify-between gap-x-2 text-[#444c60] font-medium text-[14px] leading-[16px] tracking-[0.2px] w-full select-none cursor-pointer focus-visible:outline-none ',
        className
      )}
    >
      <div>{children}</div>
      <ChevronDown className='group-data-[state="open"]:rotate-180 transition-transform' />
    </div>
  </RCollapsible.Trigger>
);

export const DetailsContent = (props: RCollapsible.CollapsibleContentProps) => (
  <RCollapsible.Content
    {...props}
    className={cn(
      'transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden',
      props.className
    )}
  />
);

type Amount = Record<string, string>;

function formatPriceModifier(priceModifiers: Amount[], lookup: string) {
  return priceModifiers.map((modifier: Record<string, unknown>) => ({
    name: modifier['name'] as string,
    amount: modifier[lookup] as string,
  }));
}

export const PriceDetails = ({
  subtotal,
  discounts,
  interests,
  payments,
}: {
  subtotal: string;
  discounts: Amount[];
  interests?: Amount[];
  payments?: Amount[];
}) => {
  const formattedDiscounts = formatPriceModifier(discounts, 'discount');
  const formattedInterest = interests ? formatPriceModifier(interests, 'value') : [];

  return (
    <ol className="flex flex-col w-full">
      <li className="inline-flex justify-between text-[#575757] text-sm">
        <span>Monto original:</span>
        <span className="text-right">{formatPrice(subtotal)}</span>
      </li>
      {formattedDiscounts.length
        ? formattedDiscounts.map((detail) => (
            <li className="mb-0.5 text-sm text-[#3A9658] inline-flex justify-between w-full" key={detail.name}>
              <span>{detail.name}</span>
              <span className="text-right">-{formatPrice(detail.amount)}</span>
            </li>
          ))
        : null}
      {formattedInterest.length
        ? formattedInterest.map((detail) => (
            <li className="mb-0.5 text-sm text-[#F46F6F] inline-flex justify-between w-full" key={detail.name}>
              <span>{detail.name}</span>
              <span className="text-right">+{formatPrice(detail.amount)}</span>
            </li>
          ))
        : null}
      {payments?.length
        ? payments.map((detail) => (
            <li className="mb-0.5 text-sm text-[#3E3E3E] inline-flex justify-between w-full" key={detail.name}>
              <span>Pago parcial: {dayjs(detail.name).format('DD/MM/YYYY')}</span>
              <span className="text-right">-{formatPrice(detail.amount)}</span>
            </li>
          ))
        : null}
    </ol>
  );
};

export const Footer = ({
  children,
  className,
  ...props
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>) => (
  <footer className={cn('flex justify-between items-center pt-[17px] pb-4 px-4', className)} {...props}>
    {children}
  </footer>
);

export const TotalAmount = ({ value }: { value: string }) => (
  <span className="text-[#22283A] text-[18px] leading-[24px] tracking-[-0.2px] font-medium">{formatPrice(value)}</span>
);

export const PayFooter = ({
  orderId,
  amount,
  hideButton,
  pending,
  needStock,
  isOutOfStock,
  testId,
  tooltip,
  quantity = 1,
  onClickCounter,
  additionIsDisabled = false,
}: {
  orderId?: string;
  amount: string;
  hideButton?: boolean;
  pending: boolean;
  testId?: string;
  needStock?: boolean;
  isOutOfStock?: boolean;
  tooltip?: string;
  onClickCounter?: (updatedCounter: number) => void;
  quantity?: number;
  additionIsDisabled?: boolean;
}) => {
  const { selected, onSelectChange, disabled, isOptional } = useOrderCardState();
  const [counter, setCounter] = React.useState(quantity);

  const getButtonLabel = () => {
    if (pending) {
      return 'EN PROCESO DE PAGO';
    }
    if (selected) {
      return 'SELECCIONADO';
    }
    if (needStock) {
      if (isOutOfStock) {
        return 'SIN STOCK';
      }
    }
    // default
    return 'SELECCIONAR';
  };

  const handleClickCounter = (counter: number) => {
    setCounter(counter === 0 ? 1 : counter);
    onClickCounter?.(counter);
  };

  return (
    <Footer data-testId={testId}>
      <TotalAmount value={amount} />
      {hideButton ? null : (
        <Tooltip disableHover={!tooltip} message={tooltip}>
          {!isOptional || !selected ? (
            <Button
              id={orderId ? `select-button-${orderId}` : undefined}
              variant="selection"
              selected={selected}
              onClick={() => (isOptional ? handleClickCounter(1) : onSelectChange?.(!selected))}
              className="min-w-[126px]"
              disabled={disabled}
            >
              {getButtonLabel()}
            </Button>
          ) : (
            <Counter
              counter={counter}
              subtractionIsDisabled={counter < 1}
              additionIsDisabled={additionIsDisabled}
              onClickCounter={(counter) => handleClickCounter(counter)}
            />
          )}
        </Tooltip>
      )}
    </Footer>
  );
};

export const HistoricInfo = ({ title, payinId }: { title: string; payinId: string }) => (
  <div className="flex gap-2 justify-between items-start mb-2">
    <h3 className="font-semibold text-[#3E3E3E]">{title}</h3>
    <span className="font-medium text-xs text-[#817E9A]">ID de pago: {payinId}</span>
  </div>
);

export const HistoricFooter = ({
  amount,
  children,
  ...props
}: { amount: string } & React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>) => (
  <Footer {...props}>
    <TotalAmount value={amount} />
    {children}
  </Footer>
);

export const EarlyBird = ({ amount, percentage, endDate }: { amount: string; percentage: string; endDate: string }) => (
  <div className="flex gap-5 items-center py-2">
    <span className="line-through text-sm text-[#57537A]">{formatPrice(amount)}</span>
    <Tag
      bgcolor="#E0EBFF"
      color="#4A5CFF"
      text={`-${formatPrice(percentage)} (Hasta el ${dayjs(endDate).format('DD[.]MM')})`}
      size="medium"
    />
  </div>
);

export const HistoricLink = ({
  children,
  disabled,
  href,
  target,
  ...props
}: LinkProps & {
  children: React.ReactElement | React.ReactNode;
  target?: React.HTMLAttributeAnchorTarget;
  disabled?: boolean;
}) => (
  <Link
    href={href}
    target={target}
    className="flex flex-col justify-center p-0 font-semibold text-blue-100 bg-transparent rounded-none shadow-none hover:text-blue-100/50 hover:bg-transparent active:bg-transparent active:text-blue-100/20 aria-disabled:text-blue-100/50 aria-disabled:cursor-not-allowed aria-disabled:pointer-events-none"
    aria-disabled={disabled}
    {...props}
  >
    {children}
  </Link>
);

export const HistoricButton = ({
  children,
  disabled,
  onClick,
  ...props
}: {
  children: React.ReactElement | React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    className="flex flex-col justify-center p-0 font-semibold text-blue-100 bg-transparent rounded-none shadow-none hover:text-blue-100/50 hover:bg-transparent active:bg-transparent active:text-blue-100/20 aria-disabled:text-blue-100/50 aria-disabled:cursor-not-allowed aria-disabled:pointer-events-none"
    aria-disabled={disabled}
    {...props}
  >
    {children}
  </button>
);
