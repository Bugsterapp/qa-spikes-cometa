import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@getcometa/recreo/v2';
import { cn } from '/src/utils/cn';

type OnboardingCompletionFloaterProps = {
  isVisible: boolean;
  onFinalize: () => void;
  className?: string;
  containerSelector?: string;
};

export function OnboardingCompletionFloater({
  isVisible,
  onFinalize,
  className,
  containerSelector = 'onboarding-content',
}: OnboardingCompletionFloaterProps) {
  const [position, setPosition] = useState({ left: '50%', transform: 'translateX(-50%)' });
  const updatePositionRef = useRef<(() => void) | null>(null);

  const updatePosition = useCallback(() => {
    const mainContainer = document.getElementById(containerSelector);
    if (mainContainer) {
      const rect = mainContainer.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;

      setPosition({
        left: `${centerX}px`,
        transform: 'translateX(-50%)',
      });
    }
  }, [containerSelector]);

  updatePositionRef.current = updatePosition;

  useEffect(() => {
    if (!isVisible) return;

    const handleUpdate = () => {
      updatePositionRef.current?.();
    };

    handleUpdate();

    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate);

    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate);
    };
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={cn('fixed bottom-6 z-50', className)} style={position}>
      <div className="flex justify-between items-center bg-[#22283a] border border-[#d0d8e9] rounded-2xl shadow-xl w-[454px] px-6 py-5">
        <div className="flex-1">
          <h3 className="font-semibold text-lg leading-7 text-white">Onboarding completado</h3>
        </div>
        <Button
          onClick={onFinalize}
          variant="secondary"
          size="sm"
          className="bg-[#f3ebff] text-[#873aff] hover:bg-[#f3ebff]/80 font-semibold border-0 flex-shrink-0 w-[154px] h-9 px-4 py-2 gap-2 rounded-full shadow-sm"
        >
          Finalizar
        </Button>
      </div>
    </div>
  );
}
