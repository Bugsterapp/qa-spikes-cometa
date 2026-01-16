import { useSession } from 'next-auth/react';
import { api } from '~/utils/api';

export const useTour = () => {
  const { data: session } = useSession();
  const utils = api.useUtils();

  const { data: user } = api.guardian.get.useQuery({ id: session?.user.id ?? '' }, { enabled: !!session });
  const { mutate } = api.guardian.update.useMutation({
    onSuccess() {
      utils.guardian.get.invalidate();
    },
  });
  const handleShowTour = (tourIds: string | string[]) => {
    const newTourCompleted: Record<string, boolean> = { ...showTour };

    if (Array.isArray(tourIds)) {
      tourIds.forEach((id) => {
        newTourCompleted[id] = true;
      });
    } else {
      newTourCompleted[tourIds] = true;
    }

    mutate({ id: session?.user.id ?? '', data: { tour_completed: newTourCompleted }, query: { force: true } });
  };

  const showTour = (user?.tour_completed || session?.user?.tour_completed) ?? null;

  return {
    showTour,
    handleShowTour,
  };
};
