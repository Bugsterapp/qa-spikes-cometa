import {
  createContext,
  CSSProperties,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import WarningCircleIcon from 'public/assets/icons/ic_warning_circle.svg';

type IAlertState = {
  open: boolean;
  severity: 'success' | 'warning' | 'error' | 'info';
  message: string | ReactNode;
  action?: {
    text: string;
    callback: () => void;
  };
  hideCross?: boolean;
  alertTime?: number;
  variant?: 'onboarding';
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

const renderTextWithBold = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return <strong key={index}>{boldText}</strong>;
    }
    return part;
  });
};

const AlertProvider: FC<AlertProviderProps> = ({ children }) => {
  const [alertState, setAlertState] = useState<IAlertState>({
    open: false,
    severity: 'success',
    message: 'Hello, world!',
    hideCross: false,
    alertTime: 106000,
    variant: undefined,
  });

  const handleClose = useCallback(() => {
    setAlertState((prev) => ({ ...prev, open: false }));
  }, []);

  const colorBySeverity = {
    success: '#08660D',
  };

  const alertProps = useMemo(() => getAlertProps(alertState.variant, handleClose), [alertState.variant, handleClose]);

  // Auto-hide functionality
  useEffect(() => {
    if (alertState.open && alertState.alertTime) {
      const timer = setTimeout(() => {
        handleClose();
      }, alertState.alertTime);
      return () => clearTimeout(timer);
    }
  }, [alertState.open, alertState.alertTime, handleClose]);

  // Material UI color mappings for standard alerts (matching MUI exactly)
  const severityStyles = {
    success: {
      bg: 'rgb(237, 247, 237)', // MUI success.light with 0.9 lightness
      text: 'rgb(30, 70, 32)', // MUI success.dark
      icon: 'rgb(46, 125, 50)', // MUI success.main
    },
    error: {
      bg: 'rgb(253, 237, 237)', // MUI error.light with 0.9 lightness
      text: 'rgb(95, 33, 32)', // MUI error.dark
      icon: 'rgb(211, 47, 47)', // MUI error.main
    },
    warning: {
      bg: 'rgb(255, 244, 229)', // MUI warning.light with 0.9 lightness
      text: 'rgb(102, 60, 0)', // MUI warning.dark
      icon: 'rgb(237, 108, 2)', // MUI warning.main
    },
    info: {
      bg: 'rgb(229, 246, 253)', // MUI info.light with 0.9 lightness
      text: 'rgb(1, 67, 97)', // MUI info.dark
      icon: 'rgb(2, 136, 209)', // MUI info.main
    },
  };

  const currentSeverityStyle = severityStyles[alertState.severity];

  // Render alert icon based on severity
  const renderIcon = () => {
    if (alertProps.icon) {
      return alertProps.icon;
    }

    const iconClass = `w-5 h-5 flex-shrink-0`;
    const iconStyle = { color: currentSeverityStyle.icon };

    switch (alertState.severity) {
      case 'success':
        return (
          <svg className={iconClass} style={iconStyle} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'error':
        return (
          <svg className={iconClass} style={iconStyle} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'warning':
        return (
          <svg className={iconClass} style={iconStyle} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'info':
        return (
          <svg className={iconClass} style={iconStyle} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <AlertContext.Provider value={{ setAlertState }}>
      {children}
      {/* Snackbar container */}
      <div
        className={`fixed top-4 left-1/2 -translate-x-1/2 transition-all duration-300 ease-in-out ${
          alertState.open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
        style={{ zIndex: 2002, pointerEvents: alertState.open ? 'auto' : 'none' }}
      >
        {/* Alert */}
        <div
          id={`alert-${alertState.severity}`}
          className={`
            flex items-center min-w-[300px] max-w-[600px] rounded font-normal
            ${alertProps.className || 'px-4 py-[6px]'}
          `}
          style={
            alertProps.className
              ? undefined
              : {
                  backgroundColor: currentSeverityStyle.bg,
                  color: currentSeverityStyle.text,
                  fontSize: '0.875rem',
                  lineHeight: '1.43',
                  boxShadow:
                    '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
                }
          }
          role="alert"
        >
          {/* Icon */}
          <div className="flex-shrink-0 mr-3 py-[7px] opacity-90 flex items-center">{renderIcon()}</div>

          {/* Content */}
          <div className={`flex-1 py-2 ${alertProps.contentClassName || ''}`} onClick={alertProps.contentOnClick}>
            <div className="flex items-center">
              {alertProps.showParagraphs && typeof alertState.message === 'string' ? (
                <>
                  {alertState.message.split('\n\n').map((paragraph, index) => (
                    <p key={`${paragraph}-${index}`} className="mb-0">
                      {renderTextWithBold(paragraph)}
                    </p>
                  ))}
                </>
              ) : (
                <span>{alertState.message}</span>
              )}
              {alertState.action ? (
                <button
                  style={
                    {
                      '--severity': colorBySeverity[alertState.severity as keyof typeof colorBySeverity] || 'black',
                      borderColor: 'var(--severity)',
                    } as CSSProperties
                  }
                  className="text-sm px-2 p-1 w-fit rounded-lg ml-8 border border-solid font-bold text-[--severity]"
                  onClick={alertState.action.callback}
                >
                  {alertState.action.text}
                </button>
              ) : null}
            </div>
          </div>

          {/* Close button */}
          {!alertState.hideCross && (
            <button
              type="button"
              className="ml-auto pl-3 -mr-1 flex-shrink-0 inline-flex items-center justify-center py-[7px] opacity-90 hover:opacity-100 transition-opacity"
              style={{ color: currentSeverityStyle.text }}
              onClick={handleClose}
            >
              <span className="sr-only">Close</span>
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </AlertContext.Provider>
  );
};

const getAlertProps = (variant: IAlertState['variant'], handleClose: () => void) => {
  if (variant === 'onboarding') {
    return {
      className: 'px-4 py-3 text-sm leading-5 font-lota font-normal rounded-lg bg-[#FFF9E6] text-[#B58905]',
      icon: <WarningCircleIcon className="w-4 h-4 mr-3 mt-3 shrink-0 text-[#B58905]" />,
      sx: {
        border: '1px solid #B58905',
        color: '#B58905',
        fontWeight: 400,
        paddingRight: '48px',
        '& .MuiAlert-message': {
          padding: 0,
          width: '100%',
          color: '#B58905',
          fontWeight: 400,
        },
        '& .MuiAlert-action': {
          display: 'none',
        },
        '& .MuiAlert-icon': {
          padding: 0,
          marginRight: 0,
          alignSelf: 'flex-start',
          display: 'flex',
          alignItems: 'flex-start',
        },
        '& p': {
          color: '#B58905',
          fontWeight: 400,
        },
        '& span': {
          color: '#B58905',
          fontWeight: 400,
        },
      },
      contentClassName: 'flex-col gap-1 w-full',
      contentOnClick: handleClose,
      showParagraphs: true,
    };
  }

  return {
    className: undefined,
    icon: undefined,
    sx: undefined,
    contentClassName: undefined,
    contentOnClick: undefined,
    showParagraphs: false,
  };
};

export { AlertContext, AlertProvider };
