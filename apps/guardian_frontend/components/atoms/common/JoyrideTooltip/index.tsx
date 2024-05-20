import { Typography, Box, Button } from '@mui/material';
import { TooltipRenderProps } from 'react-joyride';

const JoyrideTooltip = ({ continuous, step, closeProps, primaryProps, tooltipProps }: TooltipRenderProps) => (
  <Box {...tooltipProps} maxWidth="20rem" bgcolor="white.main" borderRadius={1} p={3} pt={6}>
    {step.title && (
      <Typography variant="h6" fontWeight={600}>
        {step.title}
      </Typography>
    )}
    {step.content && <Typography color="neutralDark.main">{step?.content}</Typography>}
    <Box display="flex" justifyContent="flex-end" mt={1}>
      {continuous && (
        <Button {...primaryProps} sx={{ mr: 1 }} variant="text" disableFocusRipple>
          ENTENDIDO
        </Button>
      )}
      {!continuous && (
        <Button {...closeProps} sx={{ mr: 1 }} variant="text" disableFocusRipple>
          CERRAR
        </Button>
      )}
    </Box>
  </Box>
);

export default JoyrideTooltip;
