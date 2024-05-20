// main tools
import PropTypes from 'prop-types';

// ui component
import { Button, Paper, Typography } from '@mui/material';

const PendingInfoBox = ({ referenceId, urlDetails }) => (
  <Paper
    variant="outlined"
    sx={{
      bgcolor: 'infoOrange.light',
      borderColor: 'infoOrange.dark',
      p: 2,
    }}
  >
    <Typography variant="body2" color="neutralDark.main" mb="10px" component="p">
      Información para realizar el pago:
    </Typography>
    <Typography variant="body3" color="neutralDark.main" component="p" mb="4px">
      Código de referencia:
    </Typography>
    <Typography variant="body3" color="neutralDark.main" component="p" mb="4px">
      {referenceId || 'xxxxxxxx'}
    </Typography>
    {/* TODO no se tiene esta data
		<Typography
			variant='body3'
			color='neutralDark.main'
			component='p'
			mb='10px'>
			Dónde pagar: Cajero físico
		</Typography> */}
    {urlDetails && (
      <Button variant="contained" color="infoOrange" sx={{ boxShadow: 'none' }} href={urlDetails} target="_blank">
        VER MÁS DETALLES
      </Button>
    )}
  </Paper>
);

PendingInfoBox.propTypes = {
  referenceId: PropTypes.string.isRequired,
  urlDetails: PropTypes.string.isRequired,
};

export default PendingInfoBox;
