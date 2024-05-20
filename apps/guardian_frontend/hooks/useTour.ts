import { useSession } from 'next-auth/react';
import { api } from '~/utils/api';

export const useTour = () => {
  const { data: session } = useSession();

  const { data: user } = api.guardian.get.useQuery({ id: session?.user.id ?? '' }, { enabled: !!session });
  const { mutate } = api.guardian.update.useMutation();
  const handleShowTour = (tourId: string) => {
    const newTourCompleted = { ...showTour, [tourId]: true };
    mutate({ id: session?.user.id ?? '', data: { tour_completed: newTourCompleted }, query: { force: true } });
  };

  const showTour = (user?.tour_completed || session?.user?.tour_completed) ?? null;

  return {
    showTour,
    handleShowTour,
  };
};
