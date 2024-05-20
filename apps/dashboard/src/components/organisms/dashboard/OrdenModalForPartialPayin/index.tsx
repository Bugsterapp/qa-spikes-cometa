import { Container, Divider, Grid, Paper, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { formatDateNumeric, formatPrice, paymentTypeLabel } from '../../../../utils/general';

const Item = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  backgroundColor: 'transparent',
  display: 'flex',
  flex: 1,
}));

const LabelInfo = styled(Typography)(({ theme }) => ({
  display: 'flex',
  width: '50%',
  justifyContent: 'flex-end',
  marginRight: theme.spacing(2),
}));

const DetailContainer = styled(Stack)(({ theme }) => ({
  backgroundColor: '#3366FF14',
  margin: theme.spacing(4, 0),
  padding: theme.spacing(3, 0),
  borderRadius: theme.spacing(1),
}));

const LabelAmountInfo = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  display: 'flex',
  width: '60%',
  marginRight: theme.spacing(2),
}));

const LabelAmount = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  display: 'flex',
  width: '25%',
  marginRight: theme.spacing(2),
}));

interface PartialPayinProps {
  key: string;
  payin: any;
  finalAmount: number;
}

export default function OrdenModalForPartialPayin(props: PartialPayinProps) {
  const { key, payin, finalAmount } = props;
  const total = parseFloat(payin?.total);
  return (
    <Container key={key}>
      <DetailContainer>
        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} sx={{ ml: 2 }}>
          <Grid sx={{ borderRight: '1px solid #919eab3d' }} item xs={6}>
            <Item>
              <LabelInfo variant="subtitle2" gutterBottom>
                Fecha de pago:
              </LabelInfo>
              <Typography variant="subtitle2">{formatDateNumeric(payin?.paid_date)}</Typography>
            </Item>
            <Item>
              <LabelInfo variant="subtitle2" gutterBottom>
                Pagador:
              </LabelInfo>
              <Typography variant="subtitle2">{`${payin?.guardian?.first_name || '-'} ${
                payin?.guardian?.last_name || ''
              }`}</Typography>
            </Item>
            <Item>
              <LabelInfo variant="subtitle2" gutterBottom>
                Medio de pago:
              </LabelInfo>
              <Typography variant="subtitle2">{paymentTypeLabel(payin?.type)}</Typography>
            </Item>
          </Grid>
          <Grid item xs={6}>
            <Item>
              <LabelAmountInfo variant="subtitle2" gutterBottom>
                Pagado:
              </LabelAmountInfo>
              <LabelAmount sx={{ justifyContent: 'flex-end' }} variant="body2" gutterBottom>
                {formatPrice(payin?.total || 0, payin?.currency || 'MXN')}
              </LabelAmount>
            </Item>
            <Divider />
            <Item sx={{ paddingBottom: 0 }}>
              <LabelAmountInfo style={{ fontWeight: 800 }} variant="subtitle2" gutterBottom>
                Pendiente de pagar:
              </LabelAmountInfo>
              <LabelAmount sx={{ justifyContent: 'flex-end' }} variant="body2" gutterBottom>
                {formatPrice(finalAmount - total || 0, payin?.currency || 'MXN')}
              </LabelAmount>
            </Item>
          </Grid>
        </Grid>
      </DetailContainer>
    </Container>
  );
}
