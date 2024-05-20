import { cn } from '~/lib/cn';
import Button from '../atoms/Button';
import LoadingSpinner from '~/public/icons/loading-spinner.svg';

interface LoadingButtonProps
  extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  loading?: boolean;
}

export default function LoadingButton({ loading = false, children, ...others }: LoadingButtonProps) {
  return (
    <Button {...others} className={cn('flex flex-row items-center justify-center text-white', others.className)}>
      {loading && <LoadingSpinner className="w-4 h-4 mr-2 text-inherit" />}
      {children}
    </Button>
  );
}
