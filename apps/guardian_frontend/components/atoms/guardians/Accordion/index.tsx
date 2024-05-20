import { styled } from '@mui/material/styles';
import { AccordionDetails, AccordionSummary } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';

const AccordionStyled = styled((props: AccordionProps) => <MuiAccordion {...props} />)(() => ({
  '&:before': {
    display: 'none',
  },
  '.MuiAccordionSummary-content': { margin: 0 },
  '.MuiAccordionSummary-root': { minHeight: 0 },
}));

interface AccordionStyledProps {
  tittle: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}
const Accordion = ({ tittle, children, defaultExpanded = false }: AccordionStyledProps) => (
  <AccordionStyled elevation={0} disableGutters defaultExpanded={defaultExpanded}>
    <AccordionSummary sx={{ px: 0 }} expandIcon={<ExpandMoreIcon />}>
      {tittle}
    </AccordionSummary>
    <AccordionDetails sx={{ px: 0, pb: 0, pt: 2.5 }}>{children}</AccordionDetails>
  </AccordionStyled>
);

export default Accordion;
