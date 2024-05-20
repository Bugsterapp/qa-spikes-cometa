// main tools
import PropTypes from 'prop-types';
import { useSendTrackEvent } from '@cometa/utils';

// ui components
import { Box, Grid, Typography, Backdrop, Stack, Button } from '@mui/material';
import ApiClient from '~/services/ApiClient';
import { useAlert } from '~/hooks';
import { Events } from '~/constants/events';
import { useSession } from 'next-auth/react';
import { useSelectedSchoolId } from '~/components/molecules/common/AuthGlobal';

export const DeletePendingOrderOptions = ({ open = true, onClose, onDeleted, payinId, token }) => {
  const { setAlert } = useAlert();
  const sendTrackEvent = useSendTrackEvent();
  const selectedSchoolId = useSelectedSchoolId();
  const session = useSession();
  const handleDeleted = async () => {
    try {
      const res = await ApiClient.deletePendingPayment(token, selectedSchoolId, payinId);
      if (res.status === 204) {
        sendTrackEvent('portal: Pending Payment Deleted', session, { payinId });
        setAlert('El pago en proceso ha sido eliminado.', 'success');
      }
      sendTrackEvent(Events.payment_deleted);
      onDeleted();
      onClose();
    } catch (error) {
      setAlert('No se puede eliminar en estos momentos.');
      onClose();
    }
  };
  return (
    <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={open}>
      <Box
        bottom={0}
        width="100%"
        maxWidth="sm"
        px={4}
        pt={5}
        pb={5}
        position="fixed"
        bgcolor="white.main"
        sx={{
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
        data-test-id="footer-total-amount"
      >
        <Grid container justifyContent="space-around" alignItems="center" width="100%">
          <Grid item>
            <Typography
              variant="body1"
              fontWeight={700}
              fontSize={20}
              mb={2}
              textAlign="center"
              color="neutralDark.main"
            >
              ¿Estás seguro que deseas eliminar el pago en proceso?
            </Typography>
          </Grid>
          <Grid item>
            <Typography mb={2} fontSize={14} fontWeight={500} color="neutralDark.main">
              Las órdenes volverán al estado{' '}
              <Typography fontWeight={600} component="span">
                Por Pagar{' '}
              </Typography>
              y los montos podrían variar según recargos.
            </Typography>
          </Grid>
          <Grid item width="100%" alignItems="center" direction="column" display="flex">
            <Stack direction="column" alignItems="center" spacing={2} maxWidth={316} width="100%">
              <Button
                fullWidth
                variant="contained"
                sx={{
                  height: 44,
                  borderRadius: 22,
                }}
                onClick={handleDeleted}
              >
                <Typography fontSize={14} color="white.main">
                  Si, eliminar
                </Typography>
              </Button>
              <Button
                fullWidth
                variant="outlined"
                sx={{
                  height: 44,
                  borderRadius: 22,
                }}
                onClick={onClose}
              >
                <Typography fontSize={14} color="primary.main">
                  Cancelar
                </Typography>
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Backdrop>
  );
};

DeletePendingOrderOptions.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onDeleted: PropTypes.func.isRequired,
  payinId: PropTypes.string.isRequired,
  token: PropTypes.string.isRequired,
  guardianId: PropTypes.string.isRequired,
};
