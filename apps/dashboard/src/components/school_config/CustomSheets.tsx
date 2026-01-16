'use client';

import Sheet from '../atoms/Sheet';

type FormDrawerSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

export function FormDrawerSheet({ open, onOpenChange, children }: FormDrawerSheetProps) {
  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (isSpaceKey(event)) {
      const target = event.target as HTMLElement;
      if (!target.matches('input, textarea, [contenteditable]')) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }

  function isSpaceKey(e: Pick<React.KeyboardEvent, 'key' | 'code'>) {
    return e.code === 'Space' || e.key === ' ';
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.Content
        onKeyDown={handleKeyDown}
        className="max-h-[calc(100vh-16px)] h-full max-w-[564px] w-full
        m-2 rounded-2xl font-lota antialiased overflow-hidden
        shadow-[0px_20px_40px_-4px_rgba(145,158,171,0.16)]"
      >
        {children}
      </Sheet.Content>
    </Sheet>
  );
}
