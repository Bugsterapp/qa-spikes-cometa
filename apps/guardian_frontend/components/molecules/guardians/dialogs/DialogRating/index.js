import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  Rating,
  styled,
  TextField,
  Typography,
} from '@mui/material';
import { RATED_CSAT_PAYMENT } from '~/utils/storesKeys';
import ToggleFeature from '~/components/molecules/common/ToggleFeature';
import { FEATURE_RATING_CSAT_PAYMENT } from '~/utils/featuresKeys';
import { useAlert } from '~/hooks';
import useSendTrackEvent from '~/hooks/useSendEvent';
import { useRouter } from 'next/router';

const CustomTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#BCBCBC',
    },
    '&:hover fieldset': {
      borderColor: '#BCBCBC',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#BCBCBC',
    },
  },
});

const DialogRating = ({ open, onClose, text, segmentName, statusPayment }) => {
  const _router = useRouter();
  const { type = null, method = null } = _router.query;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const sendTrackEvent = useSendTrackEvent();
  const { setAlert } = useAlert();
  const handleClose = (skip = true) => {
    onClose();
    sendTrackEvent(`portal: ${segmentName}`, {
      score: skip ? null : rating,
      comment,
      status: statusPayment,
      type,
      method,
    });
    localStorage.setItem(RATED_CSAT_PAYMENT, skip ? null : '1');
    if (!skip) setAlert('¡Gracias por calificar!', 'success');
  };

  return (
    <ToggleFeature
      allowComponent={
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle
            id="alert-dialog-title"
            color="neutralDark.main"
            fontWeight={600}
            textAlign="center"
            sx={{ pt: 2.5 }}
          >
            {text}
          </DialogTitle>
          <DialogContent sx={{ py: 0 }}>
            <Box textAlign="center" display="flex" flexDirection="column" alignItems="center">
              <Box>
                <Rating
                  size="large"
                  onChange={(_, score) => {
                    setRating(score);
                  }}
                  value={rating}
                />
              </Box>
              {!!rating && (
                <Box mt={2}>
                  <CustomTextField
                    variant="outlined"
                    value={comment}
                    onChange={(e) => {
                      const newComent = e.target.value;
                      setComment(newComent);
                    }}
                    placeholder={rating ? `¿Cuéntanos por qué marcaste ${rating}? (opcional)` : ''}
                    multiline
                    rows={4}
                  />
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions
            sx={{
              justifyContent: 'center',
              display: 'flex',
              flexDirection: 'column',
              pb: 2.5,
            }}
          >
            {!!rating && (
              <Fab
                variant="extended"
                color="primary"
                onClick={() => {
                  handleClose(false);
                }}
                disabled={!rating}
              >
                <Typography mx={8} fontSize={16}>
                  Enviar
                </Typography>
              </Fab>
            )}
            <Button onClick={handleClose}>
              <Typography fontSize={16}>Omitir</Typography>
            </Button>
          </DialogActions>
        </Dialog>
      }
      featureName={FEATURE_RATING_CSAT_PAYMENT}
    />
  );
};

DialogRating.propTypes = {
  text: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  segmentName: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  statusPayment: PropTypes.string,
};

export default DialogRating;
