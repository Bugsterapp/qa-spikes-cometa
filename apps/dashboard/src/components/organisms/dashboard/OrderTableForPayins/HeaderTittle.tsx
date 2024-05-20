import Header from '../../../molecules/dashboard/Header';
import { useGetPermissions } from '/src/guards/AuthGuard';

interface HeaderTableProps {
  title: string;
  clickOnButton: () => void;
  subtitle?: string;
}

export default function HeaderTable(headerProps: HeaderTableProps) {
  const { title, clickOnButton, subtitle } = headerProps;
  const permissions = useGetPermissions();
  return (
    <div className="px-12">
      {permissions?.can_add_payment ? (
        <Header title={title} button="Registrar pago" clickOnButton={clickOnButton} subtitle={subtitle} />
      ) : (
        <Header title={title} subtitle={subtitle} />
      )}
    </div>
  );
}
