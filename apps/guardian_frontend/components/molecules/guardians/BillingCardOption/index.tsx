import React from 'react';
import Link, { LinkProps } from 'next/link';

interface BillingCardOptionProps {
  href: LinkProps['href'];
  title: string;
  subtitle?: string;
}

const BillingCardOption = ({ href, title, subtitle }: BillingCardOptionProps) => (
  <Link href={href}>
    <div className="cursor-pointer bg-white rounded px-3 py-2 flex justify-between min-w-[321px] h-[83px]">
      <div className="text-start flex flex-col justify-around">
        <p className="text-gray-700 font-medium">{title}</p>
        <p className="text-gray-700 text-[10px]">{subtitle}</p>
      </div>
      <div className="ml-1 flex items-center justify-center">
        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </svg>
      </div>
    </div>
  </Link>
);

export default BillingCardOption;
