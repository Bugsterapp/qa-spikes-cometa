import { ReactNode } from 'react';
import { cn } from '../../utils/cn';

type OnboardingTaskListProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function OnboardingTaskList({ title, description, children, className }: Readonly<OnboardingTaskListProps>) {
  return (
    <div className={cn('flex flex-col gap-8 w-full', className)}>
      {(title || description) && (
        <div className="flex flex-col gap-1">
          {title && <h2 className="font-semibold text-[24px] leading-[32px] text-[#22283a]">{title}</h2>}
          {description && <p className="text-[16px] leading-[24px] text-[#444c60]">{description}</p>}
        </div>
      )}
      <div className="bg-white border border-[#d0d8e9] rounded-xl overflow-hidden">{children}</div>
    </div>
  );
}
