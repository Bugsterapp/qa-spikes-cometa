import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------

export default function cssStyles(theme) {
  return {
    bgBlur: (props) => {
      const color = props?.color || theme?.palette.background.default || '#000000';

      const blur = props?.blur || 6;
      const opacity = props?.opacity || 1;

      return {
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`, // Fix on Mobile
        backgroundColor: alpha(color, opacity),
      };
    },
  };
}
