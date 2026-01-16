import * as Sentry from '@sentry/nextjs';
import { Button } from '@cometa/recreo/v2';
import Image from 'next/image';
import IcVideoTutorial from 'public/assets/icons/ic_video_tutorial.svg';

type OnboardingEmptyStateProps = {
  imageSrc: string;
  imageAlt: string;
  title: string;
  description: string;
  primaryButtonText: string;
  onPrimaryAction: () => void;
  onViewTutorial: () => void;
};

export function OnboardingEmptyState({
  imageSrc,
  imageAlt,
  title,
  description,
  primaryButtonText,
  onPrimaryAction,
  onViewTutorial,
}: Readonly<OnboardingEmptyStateProps>) {
  return (
    <Sentry.ErrorBoundary fallback={<div>Error loading onboarding content</div>}>
      <div className="bg-[#f8f9fb] rounded-[16px] p-[24px] flex items-center justify-center w-full max-w-[411px]">
        <div className="flex flex-col gap-[24px] items-center justify-center">
          <div className="flex flex-col gap-[16px] items-center justify-end">
            <div className="w-[60px] h-[60px] shrink-0">
              <Image src={imageSrc} alt={imageAlt} width={60} height={60} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col gap-[8px] items-center justify-center text-center">
              <h3 className="text-[#22283a] text-base font-semibold font-lota leading-6">{title}</h3>
              <p className="text-[#444c60] text-sm font-normal font-lota leading-5 w-[297px]">{description}</p>
            </div>
          </div>
          <div className="flex flex-col gap-[10px] items-center">
            <Button variant="secondary" onClick={onPrimaryAction}>
              {primaryButtonText}
            </Button>
            <Button variant="ghost" onClick={onViewTutorial}>
              <IcVideoTutorial className="w-4 h-4" />
              Ver tutorial
            </Button>
          </div>
        </div>
      </div>
    </Sentry.ErrorBoundary>
  );
}
