import { NextRequest, NextResponse } from 'next/server';
import { AnnouncementsServiceClient } from '../client';
import * as Sentry from '@sentry/nextjs';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolId = searchParams.get('schoolId');
    const userId = searchParams.get('userId');

    if (!schoolId || !userId) {
      return NextResponse.json({ error: 'Missing required parameters: schoolId and userId' }, { status: 400 });
    }

    const response = await AnnouncementsServiceClient.getUserFeedAppFeedSchoolIdUserIdGet(schoolId, userId, {
      limit: 10000,
    });

    return NextResponse.json(response.data);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}
