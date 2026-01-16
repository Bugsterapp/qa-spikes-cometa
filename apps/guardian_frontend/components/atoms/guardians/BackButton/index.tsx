import { useUTMRouter as useRouter } from '~/components/UtmNavigation';
import { cn } from '~/lib/cn';

interface BackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  onClick?: () => void;
}

const BackButton = ({ href, onClick, className, ...otherProps }: BackButtonProps) => {
  const _router = useRouter();

  return (
    <button
      type="button"
      className={cn(
        'min-w-[38px] h-[38px] shadow-none rounded-full p-1.5 bg-white flex items-center justify-center',
        className
      )}
      onClick={() => {
        if (onClick) {
          onClick();
        } else if (href) {
          _router.push(href);
        } else _router.back();
      }}
      {...otherProps}
    >
      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
      </svg>
    </button>
  );
};

export default BackButton;
