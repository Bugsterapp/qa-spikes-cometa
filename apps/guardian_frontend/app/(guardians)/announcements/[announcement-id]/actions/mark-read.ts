'use server';

import { ActionType } from '@cometa/trpc/src/announcements/types';
import { AnnouncementsServiceClient } from '../../client';
import * as Sentry from '@sentry/nextjs';

export async function markRead(announcementId: string) {
  try {
    const response = await AnnouncementsServiceClient.updateFeedNotificationAppFeedFeedNotificationIdUpdatePost(
      announcementId,
      {
        new_status: ActionType.READ,
      }
    );

    return response.data;
  } catch (error) {
    Sentry.captureException(error);
  }
}
