import { cn } from '../../utils/cn';

interface SelectChipProps {
  theme?: 'blue' | 'default';
  children: React.ReactNode;
}

export default function SelectChip({ theme = 'default', children }: SelectChipProps) {
  const styles = cn(
    'py-1 px-2 rounded-lg font-bold text-xs w-max',
    theme === 'blue' && 'text-[#3366FF] bg-[#3366FF1F]'
  );

  return <div className={styles}>{children}</div>;
}
