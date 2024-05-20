import { m } from 'framer-motion';
// next
import NextLink from 'next/link';
// @mui
import { styled } from '@mui/material/styles';
import { Button, Typography, Container } from '@mui/material';
// layouts
import Layout from '../components/layouts';
// components
import { MotionContainer, varBounce } from '../components/animate';
// assets
import PageNotFoundIllustration from '/public/assets/icons/illustration_404.svg';

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
  <Layout variant="logoOnly" title="404 Page Not Found">
    {page}
  </Layout>
);
export default function Page404() {
  return (
    <Container component={MotionContainer}>
      <ContentStyle sx={{ textAlign: 'center', alignItems: 'center' }}>
        <m.div variants={varBounce().in}>
          <Typography variant="h3" paragraph>
            ¡Disculpa, página no encontrada!
          </Typography>
        </m.div>
        <m.div variants={varBounce().in}>
          <Typography sx={{ color: 'text.secondary' }}>
            Es posible que el enlace esté roto o que se haya eliminado la página. Comprueba que el enlace que quieres
            abrir es correcto.
          </Typography>
        </m.div>
        <m.div variants={varBounce().in}>
          <PageNotFoundIllustration sx={{ height: 260, my: { xs: 5, sm: 10 } }} />
        </m.div>

        <NextLink href="/" passHref>
          <Button size="large" variant="contained">
            Inicio
          </Button>
        </NextLink>
      </ContentStyle>
    </Container>
  );
}
Page404.getLayout = getLayout;
