import { ReactNode, createContext, useState } from 'react';
import { changeSpecificErrors } from '~/utils/errorsMessages';

const initialState = {
  text: '',
  type: '',
  open: false,
  handleClose: () => void 0,
  setAlert: () => void 0,
};

export type AlertType = 'error' | 'success' | 'warn' | 'info' | 'warning';

interface AlertContext {
  text: string;
  type: string;
  open: boolean;
  handleClose: () => void;
  setAlert: (text: string, type?: AlertType, open?: boolean, handleClose?: () => void) => void;
}

const AlertContext = createContext<AlertContext>({
  ...initialState,
});

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [text, setText] = useState('');
  const [type, setType] = useState('');
  const [open, setOpen] = useState(false);
  const [handleClose, setHandleClose] = useState<any>();
  const setAlert = (text: string, type = 'error', open = true, handleClose: () => void = () => void 0) => {
    if (type === 'error') text = changeSpecificErrors(text);
    setText(text);
    setType(type);
    setOpen(open);
    setHandleClose(handleClose);
  };

  return (
    <AlertContext.Provider
      value={{
        text,
        type,
        open,
        handleClose,
        setAlert,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export default AlertContext;
