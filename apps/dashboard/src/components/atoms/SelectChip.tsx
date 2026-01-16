import { cn } from '../../utils/cn';

interface SelectChipProps {
  theme?: 'blue' | 'default' | 'green' | 'yellow';
  children: React.ReactNode;
}

export default function SelectChip({ theme = 'default', children }: SelectChipProps) {
  const styles = cn('py-1 px-2 rounded-lg font-bold text-xs w-max', {
    'text-[#3366FF] bg-[#3366FF1F]': theme === 'blue',
    'text-[#44B55D] bg-[#4BC7661F]': theme === 'green',
    'text-[#B58905] bg-[#FFC1071F]': theme === 'yellow',
    'text-[#1C1C1D] bg-[#F3F6FB]': theme === 'default',
  });

  return <div className={styles}>{children}</div>;
}
