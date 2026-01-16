import { useEffect } from 'react';
import { getSession, signIn, useSession } from 'next-auth/react';
import { useUTMRouter as useRouter } from '~/components/UtmNavigation';
import { sendIdentifyEvent } from '~/utils/events';
import { useSendEvent } from '~/hooks/useSendEvent';
import { TrackEvents } from '~/constants/events';
import { GetServerSideProps } from 'next';
import { appendUtmParameters } from '~/lib/destinationWithUTM';
import { useSelectedSchool } from '~/stores/globalStore';
import { ThumbsUp } from 'lucide-react';

interface AuthProps {
  guardianHash: string;
  magicToken: string;
  next?: string;
}

let firstLoginAttempt = true;

export default function Auth({ guardianHash, magicToken, next }: AuthProps) {
  const _router = useRouter();

  const sendEvent = useSendEvent();
  const selectedSchool = useSelectedSchool();

  const productTourUpdateAug2024 = true;
  const onboardingUpdateAug2024 = true;

  const goToHomeOrNext = (hash: string, next?: string) => {
    _router.push(`/guardians/${hash}/${next || ''}`);
  };

  const loginUser = async (magicToken: string) => {
    const res = await signIn('credentials', {
      redirect: false,
      magicToken,
    });

    if (res?.error) {
      res.error === 'Link inválido o vencido.' ? sendEvent(TrackEvents.auth.expiredLink) : null;
      _router.push({
        pathname: `/guardians/${guardianHash}/login`,
        query: { error: res.error || 'Usuario no autorizado' },
      });
    } else {
      goToHomeOrNext(guardianHash, next);
    }
  };

  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      loginUser(magicToken);
    },
  });

  useEffect(() => {
    if (firstLoginAttempt && session && status === 'authenticated') {
      firstLoginAttempt = false;
      sendEvent(TrackEvents.auth.userLogin);
    }
  }, [session, status]);

  useEffect(() => {
    if (session && status === 'authenticated') {
      // identify user in segment
      sendIdentifyEvent(
        session?.user?.id || '',
        { ...session?.user },
        { productTourUpdateAug2024, onboardingUpdateAug2024, current_school: selectedSchool?.id ?? '' }
      );
      goToHomeOrNext(guardianHash, next);
    }
  }, [session, _router]);

  return (
    <div className="bg-blue-600 flex h-screen items-center justify-center">
      <div>
        {status !== 'authenticated' ? (
          <div className="flex flex-col gap-1 items-center">
            <ThumbsUp className="w-12 h-12 text-white" />
            <h1 className="text-2xl text-white">Autenticando...</h1>
          </div>
        ) : (
          <div className="flex flex-col gap-1 items-center">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14,10H2V12H14V10M14,6H2V8H14V6M2,16H10V14H2V16M21.5,11.5L23,13L16,20L11.5,15.5L13,14L16,17L21.5,11.5Z" />
            </svg>
            <h1 className="text-2xl text-white">Autenticado</h1>
          </div>
        )}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const { guardianHash, token: magicToken = null, next = null } = context?.query || { guardianHash: '' };
  if (session) {
    return {
      redirect: {
        permanent: false,
        destination: appendUtmParameters(`/guardians/${guardianHash}/${next || ''}`, context.query),
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
};
