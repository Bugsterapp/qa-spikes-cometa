import { cn } from '~/lib/cn';
import KushkiLogo from '~/public/images/kushki-logo.svg';

const PoweredByKushki = ({ className }: { className?: string }) => (
  <div className={cn('flex items-center gap-2', className)}>
    <span className="font-medium text-[#637381] text-xs">Powered by</span>
    <KushkiLogo />
  </div>
);

export default PoweredByKushki;
