import { AnchorHTMLAttributes, DetailedHTMLProps } from 'react';
import { cn } from '~/lib/cn';
import IcWhatsApp from '~/public/icons/ic_whatsapp.svg';
const HelpLink = ({
  children,
  href,
  className,
}: DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className={cn('font-medium text-center underline cursor-pointer text-blue-100', className)}
  >
    {children ?? (
      <span className="flex flex-row items-center justify-center">
        <IcWhatsApp className="mr-3" />
        ¿Necesitas ayuda?
      </span>
    )}
  </a>
);

export default HelpLink;
