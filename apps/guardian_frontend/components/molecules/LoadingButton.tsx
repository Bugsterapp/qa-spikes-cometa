import { cn } from '~/lib/cn';
import { Button, ButtonProps } from '../atoms/Button';
import LoadingSpinner from '~/public/icons/loading-spinner.svg';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
}

export default function LoadingButton({ loading = false, children, className, ...props }: LoadingButtonProps) {
  return (
    <Button {...props} className={cn('flex flex-row items-center justify-center text-white', className)}>
      {loading && <LoadingSpinner className="w-4 h-4 mr-2 text-inherit" />}
      {children}
    </Button>
  );
}
