import { Typography, Box } from '@mui/material';
import Image from 'next/image';

function OnlyDesktop() {
  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        textAlign: 'center',
        backgroundImage: 'url(/assets/background-only-desktop.svg)',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Box sx={{ textAlign: 'center', height: '70vh', pt: '25vh' }}>
        <Image src="/assets/computer.svg" width={160} height={112} alt="computer" />
        <Typography color="#091A7A" variant="h5" marginTop={1}>
          Por favor abre esta página
        </Typography>
        <Typography color="#091A7A" variant="h5">
          desde tu laptop o PC.
        </Typography>
        <br />
        <Typography color="#57537A" variant="subtitle1">
          Aún estamos trabajando en la versión
        </Typography>
        <Typography color="#57537A" variant="subtitle1">
          del Dashboard para celular.
        </Typography>
      </Box>
      <Box sx={{ height: '30vh', pt: '10vh' }}>
        <Typography color="#57537A" variant="subtitle1">
          ¡Gracias por entender!
        </Typography>
      </Box>
    </Box>
  );
}

export default OnlyDesktop;
