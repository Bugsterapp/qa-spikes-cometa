import React from 'react';
import PropTypes from 'prop-types';
import { Button, Dialog, Link, Typography } from '@mui/material';

// events
import useSendTrackEvent from '~/hooks/useSendEvent';
import { EMAIL_LOGIN } from '~/utils/linksEmail';

const DialogButtonsContactUs = ({ sendEmail, ...otherProps }) => {
  const sendTrackEvent = useSendTrackEvent();
  const notifyContactUs = () => {
    sendTrackEvent('portal: Login Contact Help', {});
  };
  return (
    <Dialog
      {...otherProps}
      PaperProps={{
        style: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
        },
      }}
    >
      <Button variant="contained" color="whiteButton" sx={{ mb: '9px', boxShadow: 'none' }} onClick={sendEmail}>
        <Typography variant="body3">Enviar otro correo</Typography>
      </Button>
      <Link href={EMAIL_LOGIN} target="_blank" underline="none" onClick={notifyContactUs}>
        <Button variant="contained" color="whiteButton" sx={{ mt: '9px', boxShadow: 'none' }}>
          <Typography variant="body3">Contáctate con nosotros</Typography>
        </Button>
      </Link>
    </Dialog>
  );
};

DialogButtonsContactUs.propTypes = {
  sendEmail: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default DialogButtonsContactUs;
