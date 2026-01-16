import { getServerSession } from 'next-auth';
import { authOptions } from '~/server/auth';
import OnboardingForm from './components/OnboardingForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Onboarding',
};

export default async function Onboarding() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return 'Loading';
  }

  return (
    <div>
      <OnboardingForm session={session} />
    </div>
  );
}
