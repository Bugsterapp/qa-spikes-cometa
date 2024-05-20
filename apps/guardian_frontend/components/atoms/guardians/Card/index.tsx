import Paper, { PaperProps } from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

const Card = styled((props: PaperProps) => <Paper elevation={0} {...props} />)({
  borderRadius: 16,
}) as typeof Paper;

export default Card;
