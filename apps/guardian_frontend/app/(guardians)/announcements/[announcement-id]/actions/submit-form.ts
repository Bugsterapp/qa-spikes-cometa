'use server';

import type { AnswerSubmit } from '@cometa/trpc/src/announcements/types';
import { AnnouncementsServiceClient } from '../../client';
import * as Sentry from '@sentry/nextjs';

export async function submitForm(announcementId: string, answers: AnswerSubmit[]) {
  try {
    const response = await AnnouncementsServiceClient.completeFormAppFeedFeedNotificationIdCompletePost(
      announcementId,
      { answers }
    );

    return response.data;
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
}
