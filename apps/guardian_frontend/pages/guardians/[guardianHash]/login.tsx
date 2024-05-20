import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { CircularProgress, Container, Fab, Grid, Link, Stack, Typography } from '@mui/material';
import DialogButtonsContactUs from '~/components/molecules/guardians/dialogs/DialogButtonsContactUs';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import useAlert from '~/hooks/useAlert';
import { sendPageViewedEvent, sendTrackEvent } from '~/utils/events';
import { WHAT_TALK_TO_US } from '~/utils/linksWhatsapp';
import { Events } from '~/constants/events';
import { api } from '~/utils/api';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const _router = useRouter();
  const { guardianHash, error: authError } = _router.query;
  const [open, setOpen] = useState(false);
  const { setAlert } = useAlert();
  const { mutateAsync } = api.guardian.login.useMutation();

  const manageAuthError = useCallback(
    async (authError: string) => {
      if (authError) {
        let errorMessage = authError;
        if (authError === 'Link expirado') {
          errorMessage = `[${authError}] Genere un nuevo link de ingreso con el botón de "Entrar al portal"`;
        }

        setAlert(errorMessage, 'error');
      }
    },
    [setAlert]
  );

  const sendEmail = (guardianHash: string) => {
    setLoading(true);
    mutateAsync({ hash: guardianHash })
      .then((data) => {
        if (data) {
          if (data?.auth_token) {
            localStorage.setItem('TEST_AUTH_TOKEN', data.auth_token);
          }
          const [userName, domainName] = data.email.split('@');
          const hiddenEmail = `${userName.substring(0, 3)}***@${domainName}`;
          setAlert(`Correo enviado a ${hiddenEmail}`, 'success');
          setLoading(false);
          setEmail(hiddenEmail);
          sendPageViewedEvent(Events.login_step_2);
        } else {
          // TODO: Este error debe venir del backend
          throw new Error(`Responsable con hash "${guardianHash}" no existe.`);
        }
      })
      .catch((err) => {
        manageAuthError(err?.response?.data?.error || err?.message || 'Error al enviar email');
        setLoading(false);
      });
  };

  useEffect(() => {
    manageAuthError(authError as string);
  }, [authError, manageAuthError]);

  return (
    <>
      <Head>
        <title>Login</title>
      </Head>

      <Container
        maxWidth={false}
        sx={{
          background:
            'linear-gradient(179.6deg, rgba(211, 239, 255, 0.4) 0.34%, rgba(190, 189, 255, 0.4) 99.68%), #FFFFFF;',
        }}
      >
        {email ? (
          <Grid
            maxWidth="sm"
            container
            px={2}
            gap={6}
            direction="column"
            height="100vh"
            alignItems="center"
            justifyContent="center"
            sx={{ margin: 'auto' }}
          >
            <Typography variant="h6" fontWeight={700} color="neutralDark.main" textAlign="center">
              Te acabamos de enviar tu link de acceso a:
            </Typography>
            <Typography fontWeight={600} color="neutralDark.main" textAlign="center">
              {email}
            </Typography>
            <Typography variant="body3" color="neutralDark.main" textAlign="center" maxWidth="300px">
              Revisa tu correo y tu bandeja de spam. Recuerda que el link expira en 24 horas.
            </Typography>
            <Typography variant="body3" color="neutralDark.main" textAlign="center" maxWidth={300}>
              ¿No lo recibiste?
            </Typography>
            <Grid container px={2} gap={1} direction="column" alignItems="center" justifyContent="center">
              <Link
                href="#"
                onClick={() => {
                  sendEmail(guardianHash as string);
                  sendTrackEvent(Events.re_send_link);
                }}
              >
                Volver a enviar link al correo
              </Link>
              <Typography variant="body2" color="neutralDark.main" textAlign="center" maxWidth={300}>
                ó
              </Typography>
              <Grid item display="flex">
                <Link href={WHAT_TALK_TO_US} target="_blank">
                  Hablar con soporte
                </Link>
                <WhatsAppIcon sx={{ ml: 1 }} color="primary" />
              </Grid>
            </Grid>
          </Grid>
        ) : (
          <Grid container px={2} gap={6} direction="column" height="100vh" alignItems="center" justifyContent="center">
            <Grid item>
              <Typography variant="h6" fontWeight={700} color="secondary" textAlign="center">
                Hola, bienvenido a tu <br /> portal de pagos
              </Typography>
            </Grid>
            <Grid item>
              <Fab
                color="primary"
                variant="extended"
                onClick={() => {
                  sendEmail(guardianHash as string);
                }}
              >
                <Stack direction="row" spacing={3} alignItems="center" px={8} justifyContent="space-around">
                  <Typography>Entrar al portal</Typography>
                  {loading && <CircularProgress color="white" size={20} sx={{ marginLeft: 1 }} />}
                </Stack>
              </Fab>
            </Grid>
          </Grid>
        )}
        <DialogButtonsContactUs
          onClose={() => {
            setOpen(false);
          }}
          open={open}
          sendEmail={() => {
            sendEmail(guardianHash as string);
          }}
        />
      </Container>
    </>
  );
}
