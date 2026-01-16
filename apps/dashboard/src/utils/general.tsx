import InvoiceChip from '../components/atoms/Chip';
import Label from '../components/molecules/dashboard/Label';
import cx from 'classnames';
import dayjs from 'dayjs';
import mx from 'dayjs/locale/es-mx';
import localizedFormat from 'dayjs/plugin/localizedFormat';

import { format, parseISO } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { es } from 'date-fns/locale';
import { StatusFdeEnum, Type11EEnum } from '@cometa/trpc/src/types';

dayjs.extend(localizedFormat).locale(mx);
interface PayMethods {
  id: Type11EEnum;
  label: string;
  color: string;
}

export const payMethods: PayMethods[] = [
  {
    id: Type11EEnum.Credit,
    label: 'Crédito',
    color: 'success',
  },
  {
    id: Type11EEnum.Ticket,
    label: 'En efectivo',
    color: 'warning',
  },
  {
    id: Type11EEnum.BankTransfer,
    label: 'Transferencia bancaria',
    color: 'success',
  },
  {
    id: Type11EEnum.CreditCard,
    label: 'Tarjeta de crédito',
    color: 'primary',
  },
  {
    id: Type11EEnum.DebitCard,
    label: 'Tarjeta de débito',
    color: 'secondary',
  },
  {
    id: Type11EEnum.PrepaidCard,
    label: 'Tarjeta prepaga',
    color: 'info',
  },
  {
    id: Type11EEnum.NominalCheck,
    label: 'Cheque nominativo',
    color: 'info',
  },
  {
    id: Type11EEnum.DepositCheck,
    label: 'Depósito en cheque',
    color: 'info',
  },
  {
    id: Type11EEnum.DepositCash,
    label: 'Depósito en efectivo',
    color: 'info',
  },
  {
    id: Type11EEnum.Multipay,
    label: 'Multipago',
    color: 'info',
  },
  {
    id: Type11EEnum.DirectDebit,
    label: 'Pago Domiciliado',
    color: 'info',
  },
  {
    id: Type11EEnum.CashPayroll,
    label: 'Nomina en Efectivo',
    color: 'info',
  },
  {
    id: Type11EEnum.Compensation,
    label: 'Compensación',
    color: 'info',
  },
  {
    id: Type11EEnum.Giving,
    label: 'Dación en pago',
    color: 'info',
  },
].sort((a, b) => {
  if (a.label < b.label) {
    return -1;
  }
  if (a.label > b.label) {
    return 1;
  }
  return 0;
});

interface CurrencyLocale {
  [key: string]: string;
}

export const currencyLocale: CurrencyLocale = {
  MXN: 'es-MX',
};

export const formatPercentage = (amount: number) => `${Math.round(amount)}%`;

export const formatPrice = (amount: number | string, currency = 'MXN') => {
  const formatter = Intl.NumberFormat(currencyLocale[currency], {
    style: 'currency',
    currency,
  });
  const parsedAmount = typeof amount === 'string' ? Number.parseFloat(amount) : amount;
  return formatter.format(parsedAmount);
};

export const paymentTypeLabel = (paymentType: string | null) => {
  if (paymentType === null) return '-';
  const payMethod = payMethods.find((payMethod) => payMethod.id === paymentType);
  return payMethod ? payMethod.label : '-';
};

interface Status {
  id: string;
  label: string;
  color: string;
  backgroundColor?: string;
}

export const statusArray: Status[] = [
  {
    id: 'pending',
    label: 'En transito',
    color: 'warning',
  },
  {
    id: 'partial',
    label: 'Parcial',
    color: 'warning',
  },
  {
    id: 'received',
    label: 'Recibido',
    color: 'success',
  },
  {
    id: 'SCHEDULED_STATUS',
    label: 'Pago creado',
    color: 'warning',
  },
  {
    id: 'PROCESSING_STATUS',
    label: 'Transferencia en proceso',
    color: 'warning',
    backgroundColor: '#ffc10729',
  },
  {
    id: 'APPROVED_STATUS',
    label: 'Transferencia exitosa',
    color: 'success',
  },
  {
    id: 'DECLINED_STATUS',
    label: 'Transferencia declinada',
    color: '#FF4842',
  },
  {
    id: 'CANCELED_STATUS',
    label: 'Pago cancelado',
    color: 'danger',
  },
  {
    id: 'approved',
    label: 'Completo',
    color: 'success',
  },
  {
    id: 'DUE',
    color: 'error',
    label: 'Vencida',
  },
  {
    id: 'OUTSTANDING',
    color: 'info',
    label: 'Por pagar',
  },
  {
    id: 'transferred',
    color: 'success',
    label: 'Transferencia',
  },
  {
    id: 'credit_card',
    color: 'warning',
    label: 'Tarjeta de crédito',
  },
  {
    id: 'partial_payins',
    color: 'warning',
    label: 'Parcial',
  },
  {
    id: 'ticket',
    label: 'En efectivo (Ticket impreso)',
    color: 'warning',
  },
  {
    id: 'bank_transfer',
    label: 'Transferencia bancaria',
    color: 'success',
  },
  {
    id: 'credit_card',
    label: 'Tarjeta de crédito',
    color: 'primary',
  },
  {
    id: 'debit_card',
    label: 'Tarjeta de débito',
    color: 'secondary',
  },
  {
    id: 'prepaid_card',
    label: 'Tarjeta prepaga',
    color: 'info',
  },
  {
    id: 'nominal_check',
    label: 'Cheque nominativo',
    color: 'info',
  },
  {
    id: 'deposit_check',
    label: 'Depósito en cheque',
    color: 'info',
  },
  {
    id: 'deposit_cash',
    label: 'Depósito en efectivo',
    color: 'info',
  },
  {
    id: 'multipay',
    label: 'Multipago',
    color: 'info',
  },
];
export const formatDate = (textDate: string, formatStr: string) => {
  const formatedDate = dayjs(textDate).format(formatStr);
  return formatedDate;
};

export const formatDateShort = (textDate: string | null, expand?: boolean, twoDigitYear?: boolean) => {
  if (!textDate || textDate === 'None') return '-';
  const timeZone = 'America/Mexico_City';

  let zonedDate: Date;
  if (textDate.includes('Z')) {
    zonedDate = utcToZonedTime(textDate, timeZone);
  } else {
    zonedDate = parseISO(textDate);
  }
  return format(zonedDate, expand ? "d 'de' MMMM 'de' yyyy" : twoDigitYear ? 'dd MMM yy' : 'dd MMM yyyy', {
    locale: es,
  });
};

/**
 * Formats a UTC date string to a localized date string.
 *
 * @param textDate - The UTC date string to format.
 * @param expand - Whether to use long format.
 * @param twoDigitYear - Whether to use two-digit year format.
 * @returns The formatted localized date string.
 */
export const formatDateWithUTCShort = (textDate: string, expand: boolean, twoDigitYear: boolean): string => {
  if (!textDate || textDate === 'None') return '-';
  const timeZone = 'America/Mexico_City';

  let zonedDate: Date;
  if (textDate.includes('Z')) {
    zonedDate = utcToZonedTime(textDate, timeZone);
  } else {
    zonedDate = parseISO(textDate);
  }

  return format(zonedDate, expand ? 'PPPP' : twoDigitYear ? 'dd MMM yy' : 'dd MMM yyyy', { locale: es });
};

export const formatDateHourWithUTCShort = (textDate: string): string => {
  if (!textDate || textDate === 'None') return '-';
  const timeZone = 'America/Mexico_City';

  let zonedDate: Date;
  if (textDate.includes('Z')) {
    zonedDate = utcToZonedTime(textDate, timeZone);
  } else {
    zonedDate = parseISO(textDate);
  }

  return format(zonedDate, 'dd MMM yyyy - HH:mm', { locale: es });
};

export const formatDateShortWithHour = (textDate: string) => {
  if (!textDate || textDate === 'None') return '-';
  const formatedDate = dayjs(textDate).format('DD MMM YYYY - HH:mm');
  return formatedDate;
};

export const formatDateNumeric = (textDate: string) => {
  if (!textDate || textDate === 'None') return '-';
  const timeZone = 'America/Mexico_City';

  const zonedDate = utcToZonedTime(textDate, timeZone);

  const formatedDate = format(zonedDate, 'dd/MM/yyyy', { locale: es });
  return formatedDate;
};

export const formatTime = (textTime: string | null) => {
  if (!textTime || textTime === 'None') return '-';
  const formatedDate = dayjs(textTime).format('HH:mm');
  return formatedDate;
};

export const formatDateWithSpanishFormat = (textDate: string) =>
  dayjs(textDate).locale('es').format('D [de] MMMM [del] YYYY');

export const renderStatusLabel = (statusParam: string, isPartial?: boolean): JSX.Element => {
  if (statusParam.includes('%') || isPartial) {
    const status = statusArray.find((status) => status.id === 'partial_payins');
    if (!status) return <></>;
    const { label, color, backgroundColor } = status;
    return (
      <Label variant="ghost" color={color} backgroundColor={backgroundColor || ''} sx={{ width: 'fit-content', px: 2 }}>
        {`${label}${isPartial ? '' : statusParam}`}
      </Label>
    );
  }
  const status = statusArray.find((status) => status.id === statusParam);
  if (!status) return <></>;
  const { label, color, backgroundColor } = status;
  return (
    <Label variant="ghost" color={color} backgroundColor={backgroundColor || ''} sx={{ width: 'fit-content', px: 1 }}>
      {label}
    </Label>
  );
};

export const renderPayoutStatus = (status?: StatusFdeEnum) => (
  <div
    className={cx('px-2 py-0.5 text-center rounded-md text-xs font-bold', {
      'bg-successBg text-successText': status === StatusFdeEnum.APPROVED_STATUS,
      'bg-info/16 text-info': status === StatusFdeEnum.SCHEDULED_STATUS,
      'bg-warning-500/16 text-processingText': status === StatusFdeEnum.PROCESSING_STATUS,
      'bg-[#FF484214]/16 text-[#FF4842]': status === StatusFdeEnum.DECLINED_STATUS,
    })}
  >
    {status === StatusFdeEnum.APPROVED_STATUS && 'Recibido'}
    {status === StatusFdeEnum.SCHEDULED_STATUS && 'Programado'}
    {status === StatusFdeEnum.PROCESSING_STATUS && 'En proceso'}
    {status === StatusFdeEnum.DECLINED_STATUS && 'Declinado'}
    {status === undefined && 'Sin estado'}
  </div>
);

export const renderStatus = (isInProcess: boolean) =>
  isInProcess ? (
    <InvoiceChip intent="neutral">En proceso</InvoiceChip>
  ) : (
    <InvoiceChip intent="info">Por pagar</InvoiceChip>
  );

interface PaymentChanels {
  id: number;
  label: string;
}

export const paymentChanels: PaymentChanels[] = [
  { id: 0, label: 'Portal de pagos Cometa' },
  { id: 1, label: 'Directo a Colegio' },
];

export const PageSize = 50;

export const DELINQUENCY_STATUS = [
  { id: 'zero', label: '0' },
  { id: 'low', label: '1' },
  { id: 'mid', label: '2' },
  { id: 'high', label: '3 o más' },
];
