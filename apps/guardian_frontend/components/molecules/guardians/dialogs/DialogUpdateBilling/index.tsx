import { Button, Dialog, DialogActions, DialogContent, DialogContentText, Typography } from '@mui/material';

interface DialogUpdateBillingProps {
  open: boolean;
  handleClose: () => void;
  onAgree: () => void;
}

const DialogUpdateBilling = ({ open, handleClose, onAgree }: DialogUpdateBillingProps) => (
  <Dialog
    open={open}
    onClose={handleClose}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogContent>
      <DialogContentText id="alert-dialog-description" color="neutralDark.main">
        ¿Desea aplicar los cambios?
      </DialogContentText>
      <Typography variant="subtitle2" color="neutralDark.main" pt={1}>
        Estos cambios se verán reflejados <br /> en tus siguientes facturas.
      </Typography>
    </DialogContent>
    <DialogActions sx={{ justifyContent: 'space-around' }}>
      <Button id="dialog-update-billing-cancel" onClick={handleClose}>
        Cancelar
      </Button>
      <Button
        id="dialog-update-billing-agree"
        variant="contained"
        onClick={() => {
          onAgree();
          handleClose();
        }}
        autoFocus
      >
        Confirmar
      </Button>
    </DialogActions>
  </Dialog>
);
export default DialogUpdateBilling;
