import { styled } from '@mui/material/styles';
import { AccordionDetails, AccordionSummary } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MuiAccordion, { AccordionProps as MuiAccordionProps } from '@mui/material/Accordion';
import { ReactNode } from 'react';

const AccordionStyled = styled((props: MuiAccordionProps) => <MuiAccordion {...props} />)(() => ({
  '&:before': {
    display: 'none',
  },
  '.MuiAccordionSummary-content': { margin: 0 },
  '.MuiAccordionSummary-root': { minHeight: 0 },
}));

interface AccordionProps extends MuiAccordionProps {
  header: ReactNode;
}

const Accordion = ({ header, children, ...otherProps }: AccordionProps) => (
  <AccordionStyled {...otherProps} disableGutters elevation={0} sx={{ boxShadow: 0 }}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />} className="hover:bg-gray-200 p-2 shadow-none rounded-lg">
      {header}
    </AccordionSummary>
    <AccordionDetails sx={{ px: 0, pb: 0, pt: 2.5, boxShadow: 0 }}>{children}</AccordionDetails>
  </AccordionStyled>
);

export default Accordion;
