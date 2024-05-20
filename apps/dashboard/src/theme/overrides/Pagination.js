import { alpha } from '@mui/material/styles';
import { esES } from '@mui/material/locale';

// ----------------------------------------------------------------------

export default function Pagination(theme) {
  const defaultProps = esES.components.MuiPagination.defaultProps;
  return {
    defaultProps,
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            fontWeight: theme.typography.fontWeightBold,
          },
        },
        textPrimary: {
          '&.Mui-selected': {
            color: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            '&:hover, &.Mui-focusVisible': {
              backgroundColor: `${alpha(theme.palette.primary.main, 0.24)} !important`,
            },
          },
        },
        outlined: {
          border: `1px solid ${theme.palette.grey[500_32]}`,
        },
        outlinedPrimary: {
          '&.Mui-selected': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.24)}`,
          },
        },
      },
    },
  };
}
