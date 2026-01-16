/**
 * @see https://github.com/emilkowalski/vaul
 */

import type { ComponentProps, CSSProperties } from 'react';
import { Drawer as Vaul } from 'vaul';
import { cn } from '~/lib/cn';

export type DrawerProps = ComponentProps<typeof Vaul.Root> & { minHeight?: string; className?: string };

export const Drawer = ({ children, minHeight = '45%', className, ...props }: DrawerProps) => (
  <Vaul.Root {...props}>
    <Vaul.Portal>
      <Vaul.Overlay className="fixed inset-0 bg-black/40 z-[3]" />
      <Vaul.Content
        style={
          {
            '--minHeight': minHeight,
          } as CSSProperties
        }
        className={cn(
          'bg-white max-w-md mx-auto flex flex-col rounded-t-[30px] mt-24 min-h-[var(--minHeight)] fixed bottom-0 left-0 right-0 z-10 px-5 pb-8 pt-4',
          className
        )}
      >
        {children}
      </Vaul.Content>
    </Vaul.Portal>
  </Vaul.Root>
);

const Title = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <Vaul.Title className={cn('text-center font-semibold text-[#57537A] text-lg', className)}>{children}</Vaul.Title>
);

Drawer.Title = Title;

const Description = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <Vaul.Description className={cn('text-center text-sm text-[#57537A]', className)}>{children}</Vaul.Description>
);

Drawer.Description = Description;
