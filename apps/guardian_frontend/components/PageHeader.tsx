import { Button } from '~/components/atoms/Button';
import React from 'react';
import { cn } from '~/lib/cn';
import Chevron from '~/public/icons/chevron.svg';
import BackArrow from '~/public/icons/back-arrow.svg';

type PageHeaderProps = {
  buttonAction: () => void;
  headerText: string;
  className?: string;
};

const LegacyPageHeader = ({ buttonAction, headerText, className }: PageHeaderProps) => (
  <div className={cn('border-b border-b-[#E3E0FF] flex px-5 py-2 min-h-[76px] items-center', className)}>
    <Button variant="icon" className="mr-5" onClick={buttonAction}>
      <Chevron className="w-4 rotate-90 text-[#4A5CFF]" />
    </Button>
    <h2 className="text-lg font-medium leading-6 text-[#283877]">{headerText}</h2>
  </div>
);

export default LegacyPageHeader;

export const PageHeader = ({
  onClickBack,
  title,
  className,
}: {
  onClickBack?: () => void;
  title: string;
  className?: string;
}) => (
  <header
    className={cn('w-full px-6 py-4 border-b border-[#E3E0FF] text-[#283877] flex items-center gap-5', className)}
  >
    {onClickBack ? (
      <button onClick={onClickBack} className="bg-transparent">
        <BackArrow className="w-[18px]" />
      </button>
    ) : null}
    <h3 className="text-lg font-semibold">{title}</h3>
  </header>
);
