import RemoveBilling from '~/components/molecules/guardians/RemoveBilling';
import BillingCardOption from '~/components/molecules/guardians/BillingCardOption';
import { useEffect, useState } from 'react';
import type { Session } from 'next-auth';
import { useUTMRouter as useRouter } from '~/components/UtmNavigation';

interface BillingOptionViewProps {
  session: Session;
}
function BillingOptionView({ session }: BillingOptionViewProps) {
  const [haveRFC, setHaveRFC] = useState(false);
  const router = useRouter();
  useEffect(() => {
    setHaveRFC(Boolean(session?.user.tax_id) && Boolean(session?.user.taxing_system));
  }, [session]);

  return (
    <div className="max-w-[600px] mx-auto w-full h-full px-4 flex flex-col flex-nowrap justify-between items-center">
      <div className="flex flex-col items-center justify-center">
        <div className="my-8 w-[300px]">
          <h2 className="text-xl font-bold text-gray-300 text-start">Datos de facturación</h2>
        </div>

        <BillingCardOption
          href={{
            pathname: 'billing/edit',
            query: router.query,
          }}
          title={haveRFC ? 'Detalles de mi RFC' : 'Registrar mis datos de RFC'}
          subtitle={
            haveRFC ? 'Aquí puedes revisar o modificar tus datos de RFC' : 'Esto te permitirá emitir facturas a tu RFC'
          }
        />
      </div>
      <div className="mt-10 mb-24">{haveRFC && <RemoveBilling onClick={() => setHaveRFC(false)} />}</div>
    </div>
  );
}

export default BillingOptionView;
