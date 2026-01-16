import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import { Status2B3Enum } from '@cometa/trpc/src/types';
import { appendUtmParameters } from '~/lib/destinationWithUTM';
import Cometa from '/public/cometa-logo.svg';

interface SchoolUnavailableProps {
  schoolName: string;
}

function SchoolUnavailable({ schoolName }: SchoolUnavailableProps) {
  return (
    <div className="bg-[#873AFF] relative min-h-[100dvh] overflow-hidden">
      <div
        className="absolute animate-float-diagonal"
        style={{
          width: '544px',
          height: '544px',
          right: '-140px',
          bottom: '-140px',
          background: '#AF7BFF',
          filter: 'blur(90px)',
          borderRadius: '50%',
        }}
      />
      <div className="absolute left-6 top-6 w-[93px]">
        <Cometa className="text-white [&_path]:!fill-white [&_stop]:!stop-color-white" />
      </div>
      <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 max-w-[272px]">
        <div className="flex flex-col gap-4 text-white">
          <p className="font-semibold text-xs uppercase tracking-wide leading-[1.5]">{schoolName}</p>
          <div className="flex flex-col gap-2">
            <h1 className="font-semibold text-2xl leading-normal">Pronto podrás usar este espacio para tutores</h1>
            <div className="text-sm leading-[1.5]">
              <p className="mb-0">Donde podrás realizar pagos, revisar adeudos, leer comunicados y mucho más.</p>
              <p className="mb-0">&nbsp;</p>
              <p>Te avisaremos cuando esté listo.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

SchoolUnavailable.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Colegio no disponible</title>
        <style>
          {`
            @keyframes float-diagonal-mobile {
              0%, 100% {
                transform: translate(45vw, 23vh);
                opacity: 1;
              }
              50% {
                transform: translate(-80vw, -90vh);
                opacity: 0.8;
              }
            }

            @keyframes float-diagonal-desktop {
              0%, 100% {
                transform: translate(50px, 50px);
                opacity: 1;
              }
              50% {
                transform: translate(-220px, -85vh);
                opacity: 0.8;
              }
            }
            
            .animate-float-diagonal {
              animation: float-diagonal-mobile 8s ease-in-out infinite;
            }

            @media (min-width: 768px) {
              .animate-float-diagonal {
                animation-name: float-diagonal-desktop;
              }
            }
          `}
        </style>
      </Head>
      <div className="max-w-md mx-auto">{page}</div>
    </>
  );
};

export default SchoolUnavailable;

SchoolUnavailable.auth = true;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const { guardianHash } = context?.query || { guardianHash: '' };

  const onboardingSchool = session?.user.schools?.find((school) => school.status === Status2B3Enum.Onboarding);

  if (!onboardingSchool) {
    if (session?.user.onboarding_stage !== 'COMPLETED') {
      return {
        redirect: {
          destination: appendUtmParameters(`/guardians/${guardianHash}/onboarding`, context.query),
          permanent: false,
        },
      };
    }

    return {
      redirect: {
        destination: appendUtmParameters(`/guardians/${guardianHash}`, context.query),
        permanent: false,
      },
    };
  }

  const schoolName = onboardingSchool?.name || 'El colegio';

  return {
    props: {
      schoolName,
    },
  };
};
