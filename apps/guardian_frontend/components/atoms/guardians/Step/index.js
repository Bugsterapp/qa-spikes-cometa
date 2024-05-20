import { Box, Typography } from '@mui/material';

export default function Step({ number, description }) {
  return (
    <Box sx={{ display: 'flex' }}>
      <Box
        sx={{
          backgroundColor: '#D6E4FF',
          borderRadius: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: 40,
          height: 40,
          padding: 2,
          mr: 2,
        }}
      >
        <Typography color="#3366FF" variant="body2">
          {number}
        </Typography>
      </Box>
      <Typography color="#637381" paragraph variant="subtitle2">
        {description}
      </Typography>
    </Box>
  );
}
