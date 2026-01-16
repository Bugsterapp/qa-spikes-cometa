import Copy from '~/public/icons/copy.svg';
import { cn } from '~/lib/cn';
import { useAlert } from '~/hooks';

interface CopyToClipboardProps extends React.HTMLAttributes<HTMLButtonElement> {
  text: string;
  successMessage: string;
  onCopy?: () => void;
}

export const CopyToClipboard = ({ text, successMessage, className, children, onCopy }: CopyToClipboardProps) => {
  const { setAlert } = useAlert();

  const copyToClipboard = () => {
    if (navigator?.clipboard) {
      if (onCopy) onCopy();
      navigator.clipboard.writeText(text).then(() => setAlert(successMessage, 'success'));
    }
  };

  return (
    <button
      className={cn(
        'flex items-center transition-opacity bg-transparent border-none rounded-none gap-x-2 hover:opacity-70',
        className
      )}
      onClick={copyToClipboard}
    >
      {children}
      <Copy />
    </button>
  );
};
