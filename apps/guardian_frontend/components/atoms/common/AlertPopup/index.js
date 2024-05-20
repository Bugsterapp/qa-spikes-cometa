import { CheckCircle } from '@mui/icons-material';
import { Alert, Snackbar } from '@mui/material';
import useAlert from '../../../../hooks/useAlert';

const AlertCustomStyles = {
  success: {
    backgroundColor: '#E9FCD4',
    color: '#08660D',
    border: '1px solid #AAF27F',
    borderRadius: '8px',
    width: '100%',
    '& .MuiAlert-icon': {
      color: '#54D62C',
    },
  },
  error: {
    backgroundColor: '#FDE8E8',
    borderRadius: '8px',
    width: '100%',
  },
  info: {
    borderRadius: '8px',
    width: '100%',
  },
  warning: {
    borderRadius: '8px',
    width: '100%',
  },
};

const AlertCustomIcons = {
  success: <CheckCircle />,
};

const AlertPopup = () => {
  const { text, type, open, handleClose: handler, setAlert } = useAlert();
  const handleClose = () => {
    setAlert('', '', false);
    if (handler) handler();
  };
  const ALERT_TIME = 6000;

  if (text && type) {
    return (
      <Snackbar
        open={open}
        autoHideDuration={ALERT_TIME}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Alert
          id={`alert-${type}`}
          severity={type}
          elevation={6}
          variant="outlined"
          sx={AlertCustomStyles[type]}
          icon={AlertCustomIcons[type]}
        >
          {text}
        </Alert>
      </Snackbar>
    );
  } else {
    return <></>;
  }
};

export default AlertPopup;
