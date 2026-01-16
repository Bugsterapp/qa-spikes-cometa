import { Label } from '@cometa/recreo';
import { cn } from '@cometa/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode, useState } from 'react';

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('bg-white border border-[#E6EBF5] rounded-xl', className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn('font-bold text-[#1B181F] text-lg px-8 py-6 border-b border-[#E6EBF5]', className)}>
      {children}
    </h3>
  );
}

export function CardContent({ children, singleColumn }: { children: ReactNode; singleColumn?: boolean }) {
  return <div className={cn('grid grid-cols-2 gap-4 px-8 pt-4 pb-6', { 'grid-cols-1': singleColumn })}>{children}</div>;
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
    <div>
      <Label className="text-xs text-[#535765]">{label}</Label>
      <p className="text-[#212B36]">{value ?? '-'}</p>
      {extraValue ? <p className="text-[#212B36]">{extraValue}</p> : null}
    </div>
  );
}

export function ChipItems({ items }: { items?: string[] }) {
  if (!items || items.length === 0) return '-';

  if (items.length === 1 && items[0] === 'Ninguno') {
    return <p className="text-[#212B36] italic">{items[0]}</p>;
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
  singleColumnContent = false,
}: {
  children: ReactNode;
  title: string;
  defaultOpen?: boolean;
  singleColumnContent?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen ?? false);

  return (
    <Card>
      <div onClick={() => setIsOpen(!isOpen)}>
        <CardTitle
          className={cn('text-lg flex items-center justify-between hover:cursor-pointer py-4', {
            'border-none': !isOpen,
          })}
        >
          {title}
          <ArrowDownIcon />
        </CardTitle>
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
            <CardContent singleColumn={singleColumnContent}>{children}</CardContent>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Card>
  );
}

export function ArrowDownIcon() {
  return (
    <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.99994 7.01582C6.61667 7.01651 6.23701 6.94164 5.88268 6.79551C5.52836 6.64937 5.20631 6.43484 4.93495 6.16416L0.169112 1.39832C0.0592682 1.28848 -0.00244141 1.1395 -0.00244141 0.984158C-0.00244141 0.828815 0.0592682 0.679835 0.169112 0.569991C0.278956 0.460147 0.427936 0.398438 0.583279 0.398438C0.738621 0.398438 0.887602 0.460147 0.997445 0.569991L5.76328 5.33583C6.0914 5.66354 6.53619 5.84762 6.99994 5.84762C7.4637 5.84762 7.90849 5.66354 8.23661 5.33583L13.0024 0.569991C13.1123 0.460147 13.2613 0.398438 13.4166 0.398438C13.572 0.398438 13.7209 0.460147 13.8308 0.569991C13.9406 0.679835 14.0023 0.828815 14.0023 0.984158C14.0023 1.1395 13.9406 1.28848 13.8308 1.39832L9.06494 6.16416C8.79358 6.43484 8.47153 6.64937 8.11721 6.79551C7.76288 6.94164 7.38322 7.01651 6.99994 7.01582Z"
        fill="#1C1C1D"
      />
    </svg>
  );
}

export function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_812_3234)">
        <path
          d="M10.8827 0.541728L3.77073 7.65373C3.4991 7.9239 3.28375 8.24526 3.13716 8.59922C2.99057 8.95318 2.91565 9.3327 2.91673 9.71581V10.4992C2.91673 10.6539 2.97819 10.8023 3.08758 10.9117C3.19698 11.0211 3.34535 11.0826 3.50006 11.0826H4.28348C4.66659 11.0836 5.04611 11.0087 5.40007 10.8621C5.75403 10.7155 6.07539 10.5002 6.34556 10.2286L13.4576 3.11656C13.7985 2.77483 13.9899 2.31184 13.9899 1.82914C13.9899 1.34645 13.7985 0.883462 13.4576 0.541728C13.1109 0.210333 12.6497 0.0253906 12.1701 0.0253906C11.6905 0.0253906 11.2294 0.210333 10.8827 0.541728V0.541728ZM12.6327 2.29173L5.52073 9.40373C5.1918 9.73065 4.74723 9.91468 4.28348 9.91589H4.0834V9.71581C4.08461 9.25206 4.26864 8.80749 4.59556 8.47856L11.7076 1.36656C11.8322 1.24754 11.9978 1.18112 12.1701 1.18112C12.3425 1.18112 12.5081 1.24754 12.6327 1.36656C12.7552 1.48936 12.824 1.65571 12.824 1.82914C12.824 2.00258 12.7552 2.16893 12.6327 2.29173V2.29173Z"
          fill="#1C1C1D"
        />
        <path
          d="M13.4167 5.23775C13.262 5.23775 13.1136 5.29921 13.0042 5.4086C12.8948 5.518 12.8333 5.66637 12.8333 5.82108V8.75H10.5C10.0359 8.75 9.59075 8.93437 9.26256 9.26256C8.93437 9.59075 8.75 10.0359 8.75 10.5V12.8333H2.91667C2.45254 12.8333 2.00742 12.649 1.67923 12.3208C1.35104 11.9926 1.16667 11.5475 1.16667 11.0833V2.91667C1.16667 2.45254 1.35104 2.00742 1.67923 1.67923C2.00742 1.35104 2.45254 1.16667 2.91667 1.16667H8.19117C8.34588 1.16667 8.49425 1.10521 8.60365 0.995812C8.71304 0.886416 8.7745 0.738043 8.7745 0.583333C8.7745 0.428624 8.71304 0.280251 8.60365 0.170854C8.49425 0.0614582 8.34588 0 8.19117 0L2.91667 0C2.1434 0.00092625 1.40208 0.308515 0.855295 0.855295C0.308515 1.40208 0.00092625 2.1434 0 2.91667L0 11.0833C0.00092625 11.8566 0.308515 12.5979 0.855295 13.1447C1.40208 13.6915 2.1434 13.9991 2.91667 14H9.53342C9.91662 14.0011 10.2962 13.9262 10.6503 13.7796C11.0043 13.633 11.3258 13.4177 11.5961 13.146L13.1454 11.5955C13.4171 11.3253 13.6325 11.004 13.7792 10.65C13.9259 10.2961 14.0009 9.91656 14 9.53342V5.82108C14 5.66637 13.9385 5.518 13.8291 5.4086C13.7198 5.29921 13.5714 5.23775 13.4167 5.23775ZM10.7713 12.3212C10.5368 12.5551 10.2402 12.717 9.91667 12.7878V10.5C9.91667 10.3453 9.97813 10.1969 10.0875 10.0875C10.1969 9.97813 10.3453 9.91667 10.5 9.91667H12.7896C12.7174 10.2396 12.5557 10.5355 12.3229 10.7707L10.7713 12.3212Z"
          fill="#1C1C1D"
        />
      </g>
      <defs>
        <clipPath id="clip0_812_3234">
          <rect width="14" height="14" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
