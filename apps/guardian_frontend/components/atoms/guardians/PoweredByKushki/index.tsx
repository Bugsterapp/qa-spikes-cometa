import { Box, Typography } from '@mui/material';
import Image from 'next/image';

const PoweredByKushki = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Typography color="#637381" sx={{ mr: 1 }}>
      Powered by
    </Typography>
    <Image src="/images/kushki-logo.svg" alt="kushki-logo" height={25} width={100} />
  </Box>
);

export default PoweredByKushki;
