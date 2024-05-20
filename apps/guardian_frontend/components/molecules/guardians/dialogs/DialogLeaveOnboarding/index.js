import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

const DialogLeaveOnboarding = ({ open, handleClose, onAgree }) => (
  <Dialog
    open={open}
    onClose={handleClose}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogTitle id="alert-dialog-title" color="neutralDark.main" fontWeight={600}>
      ¿Desea dejar de cargar los datos de contacto?
    </DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description" color="neutralDark.main">
        No podrá volver a cargar sus datos de contacto sin ayuda de Cometa.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleClose}>Cancelar</Button>
      <Button
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
export default DialogLeaveOnboarding;
