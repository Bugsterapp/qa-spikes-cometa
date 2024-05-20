import { Button, Dialog, DialogActions, DialogContent, DialogContentText } from '@mui/material';

const DialogRemoveBilling = ({ open, handleClose, onAgree }) => (
  <Dialog
    open={open}
    onClose={handleClose}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogContent>
      <DialogContentText id="alert-dialog-description" color="neutralDark.main">
        ¿Estás seguro que deseas eliminar tus datos de facturación?
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button id="remove-billing-cancel" onClick={handleClose}>
        Cancelar
      </Button>
      <Button
        id="remove-billing-agree"
        color="error"
        onClick={() => {
          onAgree();
          handleClose();
        }}
        autoFocus
      >
        Eliminar
      </Button>
    </DialogActions>
  </Dialog>
);
export default DialogRemoveBilling;
