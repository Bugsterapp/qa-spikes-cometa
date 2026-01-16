import { FeedNotification } from '@cometa/trpc/src/announcements/types';
import { useQuery } from '@tanstack/react-query';

export const useAnnouncementsQuery = (schoolId: string, userId: string) =>
  useQuery<FeedNotification[]>({
    queryKey: ['announcements', schoolId, userId],
    queryFn: async () => {
      if (!schoolId || !userId) {
        throw new Error('Missing schoolId or userId');
      }

      const response = await fetch(`/announcements/api?schoolId=${schoolId}&userId=${userId}`, { cache: 'no-store' });

      if (!response.ok) {
        throw new Error('Failed to fetch announcements');
      }

      return response.json();
    },
    enabled: !!schoolId && !!userId,
  });
