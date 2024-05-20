import { createContext, CSSProperties, Dispatch, FC, ReactNode, SetStateAction, useState } from 'react';
import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

type IAlertState = {
  open: boolean;
  severity: 'success' | 'warning' | 'error' | 'info';
  message: string | ReactNode;
  action?: {
    text: string;
    callback: () => void;
  };
};

type IAlertContext = {
  setAlertState: Dispatch<SetStateAction<IAlertState>>;
};

type AlertProviderProps = {
  children?: ReactNode;
};

const AlertContext = createContext<IAlertContext>({
  setAlertState: () => void 0,
});

const AlertProvider: FC<AlertProviderProps> = ({ children }) => {
  const [alertState, setAlertState] = useState<IAlertState>({
    open: false,
    severity: 'success',
    message: 'Hello, world!',
  });

  const handleClose = () => {
    setAlertState((prev) => ({ ...prev, open: false }));
  };
  const ALERT_TIME = 6000;

  const colorBySeverity = {
    success: '#08660D',
  };

  return (
    <AlertContext.Provider value={{ setAlertState }}>
      {children}
      <Snackbar
        open={alertState.open}
        autoHideDuration={ALERT_TIME}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        sx={{ zIndex: 2002 }}
      >
        <MuiAlert
          id={`alert-${alertState.severity}`}
          onClose={handleClose}
          severity={alertState.severity}
          className="items-center"
        >
          <span>{alertState.message}</span>
          {alertState.action ? (
            <button
              style={
                {
                  '--severity': colorBySeverity[alertState.severity as keyof typeof colorBySeverity] || 'black',
                  borderColor: 'var(--severity)',
                } as CSSProperties
              }
              className="text-sm px-2 p-1 rounded-lg ml-8 border border-solid font-bold text-[--severity]"
              onClick={alertState.action.callback}
            >
              {alertState.action.text}
            </button>
          ) : null}
        </MuiAlert>
      </Snackbar>
    </AlertContext.Provider>
  );
};

export { AlertContext, AlertProvider };
