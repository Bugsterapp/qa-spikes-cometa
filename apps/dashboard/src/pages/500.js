import { m } from 'framer-motion';
// next
import NextLink from 'next/link';
import { styled } from '@mui/material/styles';
// @mui
import { Button, Typography, Container } from '@mui/material';
// layouts
import Layout from '../components/layouts';
// components
import { MotionContainer, varBounce } from '../components/animate';
// assets
import SeverErrorIllustration from '/public/assets/icons/illustration_500.svg';

// ----------------------------------------------------------------------

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

const getLayout = (page) => (
  <Layout variant="logoOnly" title="Error 500">
    {page}
  </Layout>
);

// ----------------------------------------------------------------------

export default function Page500() {
  return (
    <Container component={MotionContainer}>
      <ContentStyle sx={{ textAlign: 'center', alignItems: 'center' }}>
        <m.div variants={varBounce().in}>
          <Typography variant="h3" paragraph>
            Error 500, hubo un error en nuestros servidores
          </Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <Typography sx={{ color: 'text.secondary' }}>Por favor, intentalo mas tarde</Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <SeverErrorIllustration />
        </m.div>

        <NextLink href="/" passHref>
          <Button size="large" variant="contained">
            Inico
          </Button>
        </NextLink>
      </ContentStyle>
    </Container>
  );
}
Page500.getLayout = getLayout;
