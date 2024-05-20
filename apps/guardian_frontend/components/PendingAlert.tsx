import Link from 'next/link';

const PendingAlert = ({ hash, pendings = 0 }: { hash: string; pendings: number }) => {
  if (!pendings) return null;

  return (
    <div className="bg-[#FFE29F] text-[#946A0B] flex items-center justify-between p-4 rounded-[0.875rem] text-sm pending-alert w-full">
      Tienes {pendings} pago{pendings === 1 ? '' : 's'} en proceso
      <Link href={`${hash}/pendings`} className="text-xs font-semibold">
        VER DETALLE
      </Link>
    </div>
  );
};

export default PendingAlert;
