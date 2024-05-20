import { useSession } from 'next-auth/react';
import ApiClient from '~/services/ApiClient';
import { api } from '~/utils/api';

export const useTour = () => {
  const { data: session } = useSession();

  const { data: user } = api.guardian.get.useQuery({ id: session?.user.id ?? '' }, { enabled: !!session });

  const handleShowTour = (tourId: string) => {
    const newTourCompleted = { ...showTour, [tourId]: true };
    // TODO fix types of endpoint for apply trpc
    ApiClient.patchGuardian(
      {
        tour_completed: newTourCompleted,
      },
      session?.user.id ?? '',
      session?.token ?? '',
      true
    );
  };

  const showTour = (user?.tour_completed || session?.user?.tour_completed) ?? null;

  return {
    showTour,
    handleShowTour,
  };
};
