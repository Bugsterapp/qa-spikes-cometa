import { cn } from '@cometa/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDownIcon } from 'lucide-react';
import { ReactNode, useState } from 'react';

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('bg-white border border-[#EBEDF0] rounded-xl', className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3
      className={cn(
        'flex flex-col gap-2 font-semibold text-[#22222A] text-base p-4 border-b border-[#EBEDF0]',
        className
      )}
    >
      {children}
    </h3>
  );
}

export function CardContent({
  children,
  className,
  singleColumn,
}: {
  children: ReactNode;
  className?: string;
  singleColumn?: boolean;
}) {
  return (
    <div
      className={cn('flex flex-col gap-3 px-4 py-3 text-[#535765] text-sm', className, { 'grid-cols-1': singleColumn })}
    >
      {children}
    </div>
  );
}

export function CardItem({
  label,
  value,
  extraValue,
}: {
  label: string;
  value?: string | ReactNode;
  extraValue?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm not-italic font-normal text-[#6E7480]">{label}</p>
      <p className="text-base not-italic font-normal text-[#22222A]">{value || '-'}</p>
      {extraValue ? <p className="text-base text-[#22222A]">{extraValue}</p> : null}
    </div>
  );
}

export function ChipItems({ items }: { items?: string[] }) {
  if (!items || items.length === 0) return '-';

  if (items.length === 1 && items[0] === 'Ninguno') {
    return <p className="text-base text-[#212B36] italic">{items[0]}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {items.map((item) => (
        <div key={item} className="border border-[#00AB55] text-[#00AB55] text-sm rounded-full px-2.5 py-1.5">
          {item}
        </div>
      ))}
    </div>
  );
}

export function CollapsibleCard({
  children,
  title,
  defaultOpen,
}: {
  children: ReactNode;
  title: ReactNode | string;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen ?? false);

  return (
    <Card>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn('border-b border-[#EBEDF0] flex items-center justify-between hover:cursor-pointer', {
          'border-none': !isOpen,
        })}
      >
        <div>{title}</div>
        <motion.div className="p-4" animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDownIcon />
        </motion.div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: 'auto' },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <CardContent>{children}</CardContent>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Card>
  );
}
