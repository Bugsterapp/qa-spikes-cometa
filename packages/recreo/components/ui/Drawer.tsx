import type { ComponentProps, CSSProperties } from 'react';
import { Drawer as Vaul } from 'vaul';
import { cn } from '@cometa/utils';

type DrawerProps = ComponentProps<typeof Vaul.Root> & {
  minHeight?: string;
  className?: string;
};

function Root({ children, minHeight = '45%', className, ...props }: DrawerProps) {
  return (
    <Vaul.Root {...props}>
      <Vaul.Portal>
        <Vaul.Overlay className="fixed inset-0 bg-black/40 z-10" />
        <Vaul.Content
          style={
            {
              '--minHeight': minHeight,
            } as CSSProperties
          }
          className={cn(
            'bg-white max-w-md mx-auto flex flex-col rounded-t-3xl mt-24 min-h-[var(--minHeight)] fixed bottom-0 left-0 right-0 z-20 px-6 py-7',
            className
          )}
        >
          {children}
        </Vaul.Content>
      </Vaul.Portal>
    </Vaul.Root>
  );
}

function Title({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <Vaul.Title className={cn('mb-4 text-lg font-semibold leading-6 text-center', className)}>{children}</Vaul.Title>
  );
}

function Description({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <Vaul.Description className={cn('font-normal text-sm text-[#637381] mb-6', className)}>{children}</Vaul.Description>
  );
}

const Close = Vaul.Close;

const Drawer = { Root, Title, Description, Close };

export { Drawer };
