import { useRouter } from 'next/router';
import Head from 'next/head';
import { Box, Typography, Link, Fab } from '@mui/material';
import Navbar from '~/components/organisms/guardians/Navbar';
import { theme } from '~/theme';
import { EMAIL_TALK_TO_US } from '~/utils/linksEmail';
import { WHAT_TALK_TO_US } from '~/utils/linksWhatsapp';

function TalkToUs() {
  const _router = useRouter();
  const { guardianHash } = _router.query;
  const neutralDark = theme.palette.neutralDark.main;

  const goToHome = () => {
    _router.push(`/guardians/${guardianHash}`);
  };

  return (
    <>
      <Head>
        <title>Habla con nosotros</title>
      </Head>
      <Box top={0} position="sticky" zIndex={1}>
        <Navbar />
      </Box>

      <Box maxWidth="sm" alignContent="center" sx={{ padding: '28px 28px 0px 26px', margin: '0px auto' }}>
        <Box sx={{ flex: '1 1 auto' }}>
          <Typography variant="heading2" align="center" color={neutralDark} sx={{ marginBottom: '32px' }}>
            ¿Necesitas ayuda? Contáctate con nosotros.
          </Typography>

          <Box mb={8}>
            <Box mb={3}>
              <Link href={WHAT_TALK_TO_US} target="_blank">
                <Fab color="primary" variant="extended" sx={{ width: '100%', margin: 'auto' }}>
                  Conversar por Whatsapp
                </Fab>
              </Link>
            </Box>

            <Box>
              <Link href={EMAIL_TALK_TO_US} target="_blank">
                <Fab color="primary" variant="extended" sx={{ width: '100%', margin: 'auto' }}>
                  Comunicarme por correo
                </Fab>
              </Link>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flex: '0 1 124px' }}>
          <Fab color="primary" variant="extended" sx={{ width: '100%', margin: 'auto' }} onClick={goToHome}>
            Volver al home
          </Fab>
        </Box>
      </Box>
    </>
  );
}

TalkToUs.auth = true;
export default TalkToUs;
