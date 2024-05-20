import { useSession } from 'next-auth/react';
import { useFlags } from '/flags/client';
import NewChargePage from '/src/components/ChargeComponent';
import ChargePageOld from '/src/components/ChargeComponentOld';
import Layout from '/src/components/layouts';
import { useSelectedSchool } from '/src/guards/AuthGuard';

ChargePage.getLayout = function getLayout(page: JSX.Element) {
  return <Layout title="Cobranzas">{page}</Layout>;
};

function ChargePage() {
  const { data: session } = useSession();
  const selectedSchool = useSelectedSchool();
  const { flags } = useFlags({ traits: { email: session?.user.email, schoolName: selectedSchool?.name } });

  return <>{flags?.show_charge_efficiency ? <NewChargePage /> : <ChargePageOld />}</>;
}
ChargePage.auth = true;

export default ChargePage;
