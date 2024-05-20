import { Box, Typography, Stack } from '@mui/material';

interface TransferDetailsProps {
  duration: string;
  guardianName: string;
  clabe: string;
  bankName: string;
  beneficiaryName: string;
  paymentExpiryFormatted: string;
  referenceId: string;
}

const TransferDetails = ({
  duration,
  guardianName,
  clabe,
  bankName,
  beneficiaryName,
  paymentExpiryFormatted,
  referenceId,
}: TransferDetailsProps) => (
  <Box display="flex" flexDirection="column">
    <Stack spacing={0.75} mb={2}>
      <Typography color="neutralDark.main" variant="body3">
        {`Creado hace ${duration}`}
      </Typography>
      <Typography color="neutralDark.main" variant="body3">
        Creado por: {guardianName}
      </Typography>
    </Stack>
    <Stack spacing={0.75}>
      <Typography color="primary" variant="body3" fontWeight={600}>
        {`CLABE: ${clabe || referenceId}`}
      </Typography>
      <Typography color="neutralDark.main" variant="body3" fontWeight={600}>
        Esta CLABE expira el: {paymentExpiryFormatted}
      </Typography>
      <Typography color="neutralDark.main" variant="body3" fontWeight={600}>
        Banco de destino: {bankName}
      </Typography>
      <Typography color="neutralDark.main" variant="body3" fontWeight={600}>
        Beneficiario: {beneficiaryName || 'KUSHKI'}
      </Typography>
    </Stack>
  </Box>
);

export default TransferDetails;
