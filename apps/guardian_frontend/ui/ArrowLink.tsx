import React from 'react';
import { cn } from '~/lib/cn';
import { UTMLink as Link } from '~/components/UtmNavigation';

interface Props {
  href: string;
  label: string;
  className?: string;
}

const CustomLink: React.FC<Props> = ({ href, label, className }) => (
  <Link href={href} className={cn('flex items-center gap-4 text-[#4A5CFF]', className)}>
    <span>{label}</span>
    <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14 6.9773C13.9951 6.45119 13.7832 5.9482 13.41 5.5773L9.12 1.2773C8.93264 1.09105 8.67919 0.986511 8.415 0.986511C8.15081 0.986511 7.89736 1.09105 7.71 1.2773C7.61627 1.37027 7.54188 1.48087 7.49111 1.60273C7.44034 1.72459 7.4142 1.85529 7.4142 1.9873C7.4142 2.11931 7.44034 2.25002 7.49111 2.37188C7.54188 2.49374 7.61627 2.60434 7.71 2.6973L11 5.9773H1C0.734784 5.9773 0.48043 6.08266 0.292893 6.27019C0.105357 6.45773 0 6.71208 0 6.9773C0 7.24251 0.105357 7.49687 0.292893 7.6844C0.48043 7.87194 0.734784 7.9773 1 7.9773H11L7.71 11.2673C7.5217 11.4543 7.41538 11.7084 7.41444 11.9738C7.41351 12.2391 7.51802 12.494 7.705 12.6823C7.89198 12.8706 8.1461 12.9769 8.41146 12.9778C8.67683 12.9788 8.9317 12.8743 9.12 12.6873L13.41 8.3873C13.7856 8.01395 13.9978 7.50687 14 6.9773Z"
        fill="#4A5CFF"
      />
    </svg>
  </Link>
);

export default CustomLink;
