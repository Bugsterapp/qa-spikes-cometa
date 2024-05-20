import { createTheme } from '@mui/material/styles';
import palette from './styles/palette.module.scss';

export const theme = createTheme({
  palette: {
    type: 'light',
    primary: {
      light: '#E0EBFF',
      main: palette.primary,
    },
    selectedDisableOrder: {
      main: 'rgba(74, 92, 255, 0.7)',
      contrastText: '#ffffff',
    },
    secondary: {
      main: palette.secondary,
    },
    buttonYellow: {
      main: '#ffb612',
      contrastText: '#ffffff',
    },
    background: {
      light: palette.light,
      main: palette.background,
      dark: '#b0afba',
      contrastText: palette.dark,
    },
    white: {
      main: palette.light,
      contrastText: palette.dark,
    },
    whiteButton: {
      main: palette.light,
      contrastText: palette.primary,
    },
    neutral: {
      main: '#90a4ae',
      contrastText: palette.light,
    },
    brownLight: {
      main: palette.brownLight,
    },
    neutralDark: {
      main: '#57537A',
    },
    neutralBlue: {
      main: palette.neutralBlue,
    },
    dividerLight: {
      main: palette.dividerLight,
    },
    success: {
      light: '#c1ffd5',
      main: '#26C48B',
      dark: '#00D685',
    },
    error: {
      main: '#F46F6F',
      dark: '#FF4842',
    },
    warning: {
      main: '#FFE29F',
      dark: '#946A0B',
    },
    mediumDelinquency: {
      main: '#F3821A',
      dark: '#946A0B',
    },
    infoOrange: {
      light: '#FFF3D9',
      dark: '#FFB612',
      main: '#FFB612',
      contrastText: palette.light,
    },
    textCopy: {
      main: '#919EAB',
    },
  },
  typography: {
    fontFamily: ['sans-serif', 'Poppins'],
    heading1: {
      fontFamily: 'Poppins',
      fontSize: '26px',
      fontWeight: 700,
      letterSpacing: '0.5px',
      lineHeight: '41px',
      display: 'block',
    },
    heading2: {
      fontFamily: 'Poppins',
      fontSize: '20px',
      fontWeight: 700,
      letterSpacing: '0.2px',
      lineHeight: '28px',
      display: 'block',
    },
    body2: {
      fontFamily: 'Poppins',
      fontSize: '14px',
      fontWeight: 600,
    },
    body3: {
      fontFamily: 'Poppins',
      fontSize: '14px',
      fontWeight: 400,
    },
    menu: {
      fontFamily: 'Poppins',
      fontSize: '16px',
      fontWeight: 400,
    },
    link: {
      fontFamily: 'Poppins',
      fontSize: '16px',
      fontWeight: 400,
      marginRight: '4px',
      cursor: 'pointer',
    },
    caption: {
      fontFamily: 'Poppins',
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: 600,
    },
    cardSubheaderTitle: {
      fontSize: '14px',
      fontWeight: 400,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  components: {
    MuiFab: {
      styleOverrides: {
        root: {
          height: '56px',
          fontSize: '16px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          width: '100%',
          marginBottom: '12px',
          borderRadius: '10px',

          '& .MuiInputLabel-root': {
            borderColor: 'transparent',
            backgroundColor: palette.white,
            borderRadius: '10px',

            '& .Mui-focused': {
              top: '14px',
              fontSize: '13px',
            },
          },
          '& .MuiInputLabel-shrink': {
            top: '14px',
            fontSize: '13px',
          },
          '& .MuiInputLabel-outlined': {},

          '& .MuiOutlinedInput-root': {
            backgroundColor: 'white',
            borderRadius: '10px',

            '& fieldset': {
              borderColor: 'transparent',
              borderRadius: '10px',
              '& legend': {
                '& span': {
                  display: 'none',
                },
              },
            },
            '&:hover fieldset': {
              borderRadius: '10px',
            },
            '&.Mui-focused fieldset': {
              backgroundColor: 'transparent',
              borderColor: 'transparent',
              borderRadius: '10px',
            },
          },
          '& .Mui-disabled': {
            '&:hover fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.28)',
              borderRadius: '10px',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          boxShadow: 'none',
          '&.Mui-disabled': {
            backgroundColor: '#D9D9D9',
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          width: '100%',
          marginBottom: '12px',
          borderRadius: '10px',

          '& .MuiInputLabel-root': {
            backgroundColor: palette.white,
            borderRadius: '10px',

            '& .Mui-focused': {
              top: '14px',
              fontSize: '13px',
            },
          },
          '& .MuiInputLabel-shrink': {
            top: '14px',
            fontSize: '13px',
          },

          '& .MuiOutlinedInput-root': {
            backgroundColor: 'white',
            '& fieldset': {
              borderColor: 'transparent',
              backgroundColor: 'transparent',
              borderRadius: '10px',
            },
            '&:hover fieldset': {
              borderRadius: '10px',
            },
            '&.Mui-focused fieldset': {
              backgroundColor: 'transparent',
              borderColor: 'transparent',
              borderRadius: '10px',
            },
          },
          '& .Mui-disabled': {
            '&:hover fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.28)',
              borderRadius: '10px',
            },
          },
        },
      },
    },
  },
  shape: {
    borderRadius: 12,
  },
});
