import { NextRequest, NextResponse } from 'next/server';
import { AnnouncementsServiceClient } from '../../client';
import * as Sentry from '@sentry/nextjs';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

type Params = {
  'announcement-id': string;
};

export async function GET(request: NextRequest, context: { params: Params }) {
  try {
    const id = context.params['announcement-id'];

    const response = await AnnouncementsServiceClient.getUserFeedDetailAppFeedFeedNotificationIdGet(id);

    return NextResponse.json(response.data);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}
