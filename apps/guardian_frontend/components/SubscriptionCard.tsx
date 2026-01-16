import * as React from 'react';
import { cn } from '~/lib/cn';
import { creditCardIcon } from '~/utils/kushkiCreditCard';

export const Content = ({
  children,
  ...props
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => (
  <div
    className=" mt-6 w-full divide-y divide-[#E3E0FF] rounded-[9px] shadow-[0px_2px_24px_0px_#ADBBCC4D] overflow-hidden transition-colors bg-white outline-2 outline outline-transparent"
    {...props}
  >
    {children}
  </div>
);

export const Header = ({ children }: { children: React.ReactElement | React.ReactNode }) => (
  <div className=" text-[#575383] font-medium  text-sm pb-[6px] tracking-wide	">{children}</div>
);

export const Info = ({ title, value }: { title: string; value: string }) => (
  <div className="text-[#57537A] font-normal text-sm flex items-center justify-between py-1">
    <span>{title}</span>
    <span className="text-[#32455E] font-medium">{value}</span>
  </div>
);

const CreditCardIcon = ({ brand }: { brand: keyof typeof creditCardIcon }) => {
  const Icon = creditCardIcon[brand] ?? React.Fragment;
  return <Icon />;
};

export const CreditCard = ({ credit_card, number }: { credit_card: keyof typeof creditCardIcon; number: string }) => (
  <div className="text-[#32455E] font-normal text-base flex items-center py-1 gap-1">
    <CreditCardIcon brand={credit_card} />
    <span>**** **** {number}</span>
  </div>
);

export const Row = ({
  children,
  className,
}: {
  children: React.ReactElement | React.ReactNode;
  className?: string;
}) => <div className={cn('flex justify-between py-4 px-6  ', className)}>{children}</div>;

export const InfoDetail = ({
  children,
  className,
}: {
  children: React.ReactElement | React.ReactNode;
  className?: string;
}) => <div className={cn('flex flex-col', className)}>{children}</div>;
