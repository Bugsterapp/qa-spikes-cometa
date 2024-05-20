import PropTypes from 'prop-types';
// @mui
import { alpha, styled } from '@mui/material/styles';
import { Box } from '@mui/material';

// ----------------------------------------------------------------------

const RootStyle = styled('span')(({ theme, ownerState }) => {
  const isLight = theme.palette.mode === 'light';
  const { color, variant, styledColor, styledBackground, backgroundColor } = ownerState;

  const styleFilled = (color, styledColor, styledBackground, backgroundColor) => ({
    color: styledColor ? color : theme.palette[color]?.contrastText,
    backgroundColor: styledBackground ? backgroundColor : theme.palette[color]?.main,
  });

  const styleOutlined = (color) => ({
    color: theme.palette[color].main,
    backgroundColor: 'transparent',
    border: `1px solid ${theme.palette[color].main}`,
  });

  const styleGhost = (color) => ({
    color: theme.palette[color]['dark'],
    backgroundColor: alpha(theme.palette[color].main, 0.16),
  });

  return {
    height: 22,
    lineHeight: 0,
    borderRadius: 6,
    cursor: 'default',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    display: 'inline-flex',
    justifyContent: 'center',
    padding: theme.spacing(0, 1),
    color: theme.palette.grey[800],
    fontSize: theme.typography.pxToRem(12),
    fontFamily: theme.typography.fontFamily,
    backgroundColor: theme.palette.grey[300],
    fontWeight: theme.typography.fontWeightBold,

    ...(color !== 'default'
      ? {
          ...(variant === 'filled' && { ...styleFilled(color, styledColor, styledBackground, backgroundColor) }),
          ...(variant === 'outlined' && { ...styleOutlined(color, styledColor, styledBackground, backgroundColor) }),
          ...(variant === 'ghost' && { ...styleGhost(color, styledColor, styledBackground, backgroundColor) }),
        }
      : color === 'morosidad'
      ? {
          backgroundColor: backgroundColor,
        }
      : {
          ...(variant === 'outlined' && {
            backgroundColor: 'transparent',
            color: theme.palette.text.primary,
            border: `1px solid ${theme.palette.grey[500_32]}`,
          }),
          ...(variant === 'ghost' && {
            color: isLight ? theme.palette.text.secondary : theme.palette.common.white,
            backgroundColor: theme.palette.grey[500_16],
          }),
        }),
  };
});

// ----------------------------------------------------------------------

Label.propTypes = {
  children: PropTypes.node,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  color: PropTypes.oneOf(['default', 'primary', 'secondary', 'info', 'success', 'warning', 'error', 'medium']),
  variant: PropTypes.oneOf(['filled', 'outlined', 'ghost']),
  sx: PropTypes.object,
  styledColor: PropTypes.bool,
  styledBackground: PropTypes.bool,
  backgroundColor: PropTypes.string,
};

export default function Label({
  children,
  color = 'default',
  variant = 'ghost',
  startIcon = undefined,
  endIcon = undefined,
  sx = {},
  styledColor = false,
  styledBackground = false,
  backgroundColor = '',
}) {
  const style = {
    width: 16,
    height: 16,
    '& svg, img': { width: 1, height: 1, objectFit: 'cover' },
  };

  return (
    <RootStyle
      ownerState={{ color, variant, styledColor, styledBackground, backgroundColor }}
      sx={{
        ...(startIcon && { pl: 0.75 }),
        ...(endIcon && { pr: 0.75 }),
        ...sx,
      }}
    >
      {startIcon && <Box sx={{ mr: 0.75, ...style }}>{startIcon}</Box>}

      {children}

      {endIcon && <Box sx={{ ml: 0.75, ...style }}>{endIcon}</Box>}
    </RootStyle>
  );
}
