import Header from '../../../molecules/dashboard/Header';
import { useGetPermissions, useSelectedSchoolId } from '/src/guards/AuthGuard';
import { api } from '/src/utils/api';
import { getBlockedPaymentTooltipMessage } from '/src/utils/payments';

interface HeaderTableProps {
  title: string;
  clickOnButton: () => void;
  subtitle?: string;
}

const getButtonTooltipMessage = (
  isBlocked: boolean,
  data?: { start_date?: string | null; end_date?: string | null }
): string | undefined => {
  if (!isBlocked) return undefined;

  if (data?.start_date && data?.end_date) {
    return getBlockedPaymentTooltipMessage(data.start_date, data.end_date);
  }

  return 'Los pagos están bloqueados actualmente debido a un período de bloqueo activo.';
};

export default function HeaderTable(headerProps: HeaderTableProps) {
  const { title, clickOnButton, subtitle } = headerProps;
  const permissions = useGetPermissions();
  const selectedSchoolId = useSelectedSchoolId();

  const { data: blockedPeriodData } = api.payments.checkBlockedPeriods.useQuery(
    { schoolId: selectedSchoolId || '' },
    { enabled: Boolean(selectedSchoolId) }
  );

  const isBlockedPeriod = blockedPeriodData?.is_blocked || false;

  return (
    <div className="px-12">
      {permissions?.can_add_payment ? (
        <Header
          title={title}
          button="Registrar pago"
          clickOnButton={clickOnButton}
          subtitle={subtitle}
          disabled={isBlockedPeriod}
          buttonTooltipMessage={getButtonTooltipMessage(isBlockedPeriod, blockedPeriodData)}
        />
      ) : (
        <Header title={title} subtitle={subtitle} />
      )}
    </div>
  );
}
