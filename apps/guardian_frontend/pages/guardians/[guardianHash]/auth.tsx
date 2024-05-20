import { useEffect } from 'react';
import { getSession, signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { Box, CircularProgress, Grid, Stack, Typography } from '@mui/material';
import { sendTrackEvent, sendIdentifyEvent } from '~/utils/events';
import { Events } from '~/constants/events';
import { NextPageContext } from 'next';

interface AuthProps {
  guardianHash: string;
  magicToken: string;
  next?: string;
}

export default function Auth({ guardianHash, magicToken, next }: AuthProps) {
  const _router = useRouter();

  const goToHomeOrNext = (hash: string, next?: string) => {
    _router.push(`/guardians/${hash}/${next || ''}`);
  };

  const loginUser = async (magicToken: string) => {
    const res = await signIn('credentials', {
      redirect: false,
      magicToken,
    });

    sendTrackEvent('portal: User Login', {
      authenticated: !res?.error,
    });

    if (res?.error) {
      res.error === 'Link inválido o vencido.' ? sendTrackEvent(Events.expired_link, { error: res.error }) : null;
      _router.push({
        pathname: `/guardians/${guardianHash}/login`,
        query: { error: res.error || 'Usuario no autorizado' },
      });
    } else goToHomeOrNext(guardianHash, next);
  };

  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      loginUser(magicToken);
    },
  });

  useEffect(() => {
    if (session && status === 'authenticated') {
      // identify user in segment
      sendIdentifyEvent(session?.user?.id || '', session?.user);
      goToHomeOrNext(guardianHash, next);
    }
  }, [session, _router]);

  return (
    <Box
      sx={{ backgroundColor: 'primary.main' }}
      display="flex"
      height="100vh"
      alignItems="center"
      justifyContent="center"
    >
      <Grid>
        {status !== 'authenticated' ? (
          <Stack direction="column" spacing={1} alignItems="center">
            <CircularProgress sx={{ color: 'white.main' }} size={80} />
            <Typography variant="h5" color="white.main">
              Autenticando...
            </Typography>
          </Stack>
        ) : (
          <Stack direction="column" spacing={1} alignItems="center">
            <ThumbUpIcon sx={{ color: 'white.main' }} color="inherit" />
            <Typography variant="h5" color="white.main">
              Autenticado
            </Typography>
          </Stack>
        )}
      </Grid>
    </Box>
  );
}

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const { guardianHash, token: magicToken = null, next = null } = context?.query || { guardianHash: '' };
  if (session) {
    return {
      redirect: {
        permanent: false,
        destination: `/guardians/${guardianHash}/${next || ''}`,
      },
    };
  }
  return {
    props: {
      guardianHash,
      magicToken,
      next,
    },
  };
}
