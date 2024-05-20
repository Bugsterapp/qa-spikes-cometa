import { CSSProperties } from '@mui/styled-engine';

declare module '@mui/material/styles' {
  interface TypographyVariants {
    heading2?: React.CSSProperties;
    heading3?: React.CSSProperties;
    body3: React.CSSProperties;
    cardTitle: React.CSSProperties;
    menu: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    heading2?: React.CSSProperties;
    heading3?: React.CSSProperties;
    body3: React.CSSProperties;
    cardTitle: React.CSSProperties;
    menu: React.CSSProperties;
  }

  interface Palette {
    neutralDark: { main: string } & CSSProperties;
    buttonYellow: CSSProperties;
    white: CSSProperties;
    selectedDisableOrder: { main: string; contrastText: string } & CSSProperties;
  }

  interface ButtonPropsColor {
    buttonYellow: CSSProperties;
    white: CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    heading2: true;
    heading3: true;
    body3: true;
    cardTitle: true;
    menu: true;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    buttonYellow: true;
    white: true;
  }
}

declare module '@mui/material/AppBar' {
  interface AppBarPropsColorOverrides {
    white: true;
  }
}
declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    white: true;
  }
}
declare module '@mui/material/CircularProgress' {
  interface CircularProgressPropsColorOverrides {
    white: true;
  }
}
declare module '@mui/material/SvgIcon' {
  interface SvgIconPropsColorOverrides {
    white: true;
  }
}
