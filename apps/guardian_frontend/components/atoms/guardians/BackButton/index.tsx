import { useRouter } from 'next/router';
import { Button } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

interface BackButtonProps extends React.ComponentProps<typeof Button> {
  href?: string;
  onClick?: () => void;
}
const BackButton = ({ href, onClick, ...otherProps }: BackButtonProps) => {
  const _router = useRouter();
  return (
    <Button
      {...otherProps}
      sx={{
        minWidth: 38,
        height: 38,
        boxShadow: 'none',
        borderRadius: '50%',
        padding: 0.75,
      }}
      color="white"
      variant="contained"
      disableElevation
      onClick={() => {
        if (onClick) {
          onClick();
        } else if (href) {
          _router.push(href);
        } else _router.back();
      }}
    >
      <ChevronLeftIcon color="primary" />
    </Button>
  );
};

export default BackButton;
