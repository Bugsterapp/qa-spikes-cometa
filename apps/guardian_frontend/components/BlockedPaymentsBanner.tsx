import { Banner } from '~/components/Banner';
import { cn } from '@cometa/utils';
import { parseDateWithoutTimezone, addDays, formatMonthTitle, formatRangeDate } from '~/utils/dateFormatting';

export enum BannerType {
  Active = 'active',
  Upcoming = 'upcoming',
}

interface BlockedPaymentsBannerProps {
  startDate: string;
  endDate: string;
  type: BannerType;
  className?: string;
}

const BANNER_COLORS = {
  active: {
    background: 'bg-[#CBE6FF]',
    text: 'text-[#223462]',
  },
  upcoming: {
    background: 'bg-[#FFF4CC]',
    text: 'text-[#223462]',
  },
} as const;

export const getBlockedPaymentsMessage = (startDate: string, endDate: string, type: BannerType = BannerType.Active) => {
  if (type === BannerType.Upcoming) {
    return `Por cierre fiscal, la opción de pagar estará deshabilitada. Te sugerimos anticiparte. El resto del portal seguirá funcionando con normalidad.`;
  }

  return `Por cierre fiscal, no se pueden registrar pagos. El portal sigue activo para otras gestiones.`;
};

interface BannerInfo {
  show: boolean;
  type?: BannerType;
  startDate?: string;
  endDate?: string;
}

interface CheckBlockResponse {
  is_blocked: boolean;
  checked_date: string;
  start_date?: string | null;
  end_date?: string | null;
}

export const getBannerInfo = (response: CheckBlockResponse | undefined): BannerInfo => {
  if (!response) {
    return { show: false };
  }

  const { is_blocked, start_date, end_date } = response;

  // Scenario 1: Active block (is_blocked: true + dates present)
  if (is_blocked && start_date && end_date) {
    return {
      show: true,
      type: BannerType.Active,
      startDate: start_date,
      endDate: end_date,
    };
  }

  // Scenario 2: Upcoming block (is_blocked: false + dates present)
  if (!is_blocked && start_date && end_date) {
    return {
      show: true,
      type: BannerType.Upcoming,
      startDate: start_date,
      endDate: end_date,
    };
  }

  // Scenario 3: No blocks (is_blocked: false without dates)
  return { show: false };
};

export const BlockedPaymentsBanner = ({ startDate, endDate, type, className }: BlockedPaymentsBannerProps) => {
  const blockEndDate = parseDateWithoutTimezone(endDate);
  const resumptionDate = addDays(blockEndDate, 1);
  const formattedResumptionDate = formatMonthTitle(resumptionDate);

  const blockStartDate = parseDateWithoutTimezone(startDate);
  const formattedBlockStart = formatRangeDate(blockStartDate);
  const formattedBlockEnd = formatRangeDate(blockEndDate);

  const isActiveBlock = type === BannerType.Active;
  const bannerTitle = isActiveBlock
    ? `Pagos no disponibles hasta el ${formattedResumptionDate}`
    : `No se podrán realizar pagos del ${formattedBlockStart} al ${formattedBlockEnd}`;

  const bannerMessage = getBlockedPaymentsMessage(startDate, endDate, type);
  const bannerColors = BANNER_COLORS[isActiveBlock ? 'active' : 'upcoming'];

  return (
    <Banner
      size="hero"
      intent="info"
      className={cn(
        bannerColors.background,
        bannerColors.text,
        'flex flex-col gap-1.5 px-5 py-4 rounded-none font-normal',
        className
      )}
    >
      <span className="font-semibold text-base">{bannerTitle}</span>
      <span className="text-sm leading-5">{bannerMessage}</span>
    </Banner>
  );
};

export default BlockedPaymentsBanner;
