import { Api } from '@cometa/trpc/src/announcements/types';

export const AnnouncementsServiceClient = new Api({
  baseUrl: process.env.NEXT_PUBLIC_COMETARDO_API_BASE_URL,
  baseApiParams: {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_ANNOUNCEMENTS_API_TOKEN}`,
    },
  },
}).app;
