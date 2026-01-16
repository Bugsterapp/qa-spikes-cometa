import { cn } from '~/lib/cn';
import { Button, ButtonProps } from './Button';
import LoadingSpinner from '~/public/icons/loading-spinner.svg';

export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  spinnerClassName?: string;
}

const LoadingButton = ({ loading = false, children, className, spinnerClassName, ...props }: LoadingButtonProps) => (
  <Button {...props} className={cn('flex flex-row items-center justify-center text-white', className)}>
    {loading && <LoadingSpinner className={cn('w-4 h-4 mr-2 text-inherit', spinnerClassName)} />}
    {children}
  </Button>
);

export default LoadingButton;
