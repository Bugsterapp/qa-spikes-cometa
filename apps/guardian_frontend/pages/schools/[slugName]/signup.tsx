import { OnboardingStageEnum, School } from '@cometa/trpc/src/types';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSendTrackEvent from '~/hooks/useSendEvent';
import { createSchoolsCaller } from '~/server/api/routers/schools';
import { createInnerTRPCContext } from '~/server/api/trpc';
import { api } from '~/utils/api';
import dynamic from 'next/dynamic';
const OnboardingGuardianInfo = dynamic(
  import('~/components/OnboardingSteps').then((mod) => mod.OnboardingGuardianInfo),
  { ssr: false }
);

interface SignUpProps {
  school?: School;
}

function SignUp({ school }: Readonly<SignUpProps>) {
  const sendTrackEvent = useSendTrackEvent();
  const router = useRouter();

  sendTrackEvent('Sign up school Page', { school });
  const guardianMutation = api.schools.signUpGuardian.useMutation();

  return (
    <OnboardingGuardianInfo
      isLoading={false}
      disabled={guardianMutation.isLoading}
      school={school}
      onSubmit={async (values) => {
        try {
          if (!school) return;
          const res = await guardianMutation.mutateAsync({
            school_id: school.id,
            data: {
              email: values.email,
              last_name: values.last_name,
              first_name: values.name,
              phone: values.phone,
              onboarding_stage: OnboardingStageEnum.COMPLETED,
            },
          });
          if (res.data?.url) router.push('/' + res.data.url);
          if (res.error) {
            return { data: res.data, status: res.status };
          }
        } catch {
          throw new Error('Failed to update guardian');
        }
      }}
      initialData={{
        phone: undefined,
        email: undefined,
        last_name: undefined,
        name: undefined,
      }}
    />
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const ctx = createInnerTRPCContext({ session: null });
  const schoolsCaller = createSchoolsCaller(ctx);
  const { slugName } = context.query;
  const school = await schoolsCaller.getBySlugName({ slug: slugName as string });

  if (!school?.is_provider) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      school,
    },
  };
};

SignUp.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Sign Up</title>
      </Head>
      <div className="bg-gradient-to-t from-[#BEBDFF66]/40 to-[#D3EFFF66]/40 pb-10 pt-6 px-5 min-h-screen">
        <div className="flex flex-col max-w-sm mx-auto">{page}</div>
      </div>
    </>
  );
};

export default SignUp;
