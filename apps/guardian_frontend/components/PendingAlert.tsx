import { UTMLink as Link } from '~/components/UtmNavigation';
import { TrackEvents } from '~/constants/events';
import { useSendEvent } from '~/hooks/useSendEvent';
import { cn } from '~/lib/cn';

const PendingAlert = ({ hash, pendings = 0, className }: { hash: string; pendings: number; className?: string }) => {
  const sendEvent = useSendEvent();

  if (!pendings) return null;

  return (
    <div
      className={cn(
        'bg-[#FFE29F] text-[#946A0B] flex items-center justify-between p-4 rounded-[0.875rem] text-sm pending-alert w-full',
        className
      )}
    >
      Tienes {pendings} pago{pendings === 1 ? '' : 's'} en proceso
      <Link
        href={`${hash}/pendings`}
        onClick={() => sendEvent(TrackEvents.pending.viewPendingsClicked)}
        className="text-xs font-semibold"
      >
        VER DETALLE
      </Link>
    </div>
  );
};

export default PendingAlert;
