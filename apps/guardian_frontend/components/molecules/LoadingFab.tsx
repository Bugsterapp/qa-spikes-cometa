import { Fab, CircularProgress, FabProps } from '@mui/material';

type LoadingFabProps = FabProps & {
  loading: boolean;
  label: string;
};

export default function LoadingFab({ loading, label, sx, type = 'button', ...others }: LoadingFabProps) {
  return (
    <Fab {...others} color="primary" variant="extended" sx={{ width: '100%', margin: 'auto', ...sx }} type={type}>
      {loading && <CircularProgress color="inherit" size={16} sx={{ marginRight: 1 }} />}
      {label}
    </Fab>
  );
}
