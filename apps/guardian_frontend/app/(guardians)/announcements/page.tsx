'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelectedSchool } from '~/stores/globalStore';
import { ActionType } from '@cometa/trpc/src/announcements/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardMainInformation,
  CardImage,
  CardFooter,
  CardStudentName,
  CardSeparator,
  CardDate,
} from './components/card';
import { Tabs, TabsList, TabsTrigger } from './components/tabs';
import { EmptyState } from './components/empty-state';
import Link from 'next/link';
import { cn } from '@cometa/utils';
import { useAnnouncementsQuery } from './queries/announcements';
import { useSendEvent } from '~/hooks/useSendEvent';
import { TrackEvents } from '~/constants/events';
import { useSwipe } from '~/hooks/useSwipe';

type AnnouncementFilter = 'all' | 'unread' | 'pending';

const TABS: AnnouncementFilter[] = ['all', 'unread', 'pending'];

let firstTime = true;

export default function AnnouncementsPage() {
  const { data: session } = useSession();
  const selectedSchool = useSelectedSchool();
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabFromUrl = searchParams?.get('tab') as AnnouncementFilter | null;
  const [activeTab, setActiveTab] = useState<AnnouncementFilter>(
    tabFromUrl && ['all', 'unread', 'pending'].includes(tabFromUrl) ? tabFromUrl : 'all'
  );
  const sendEvent = useSendEvent();

  const userId = session?.user?.id;
  const schoolId = selectedSchool?.id;

  const { data: announcements = [], isLoading, error } = useAnnouncementsQuery(selectedSchool?.id ?? '', userId ?? '');

  const handleSwipeLeft = () => {
    const currentIndex = TABS.indexOf(activeTab);
    if (currentIndex < TABS.length - 1) {
      const newTab = TABS[currentIndex + 1];
      setActiveTab(newTab);
      router.push(`/announcements?tab=${newTab}`, { scroll: false });
      sendEvent(TrackEvents.announcements.announcementTabClicked, { tab: newTab, source: 'swipe' });
    }
  };

  const handleSwipeRight = () => {
    const currentIndex = TABS.indexOf(activeTab);
    if (currentIndex > 0) {
      const newTab = TABS[currentIndex - 1];
      setActiveTab(newTab);
      router.push(`/announcements?tab=${newTab}`, { scroll: false });
      sendEvent(TrackEvents.announcements.announcementTabClicked, { tab: newTab, source: 'swipe' });
    }
  };

  const swipeRef = useSwipe<HTMLDivElement>(
    {
      onSwipeLeft: handleSwipeLeft,
      onSwipeRight: handleSwipeRight,
    },
    {
      minSwipeDistance: 50,
      maxSwipeTime: 500,
    }
  );

  useEffect(() => {
    if (firstTime) {
      sendEvent(TrackEvents.announcements.announcmentsViewed);
      firstTime = false;
    }
  }, []);

  useEffect(() => {
    const validTab = tabFromUrl && ['all', 'unread', 'pending'].includes(tabFromUrl) ? tabFromUrl : 'all';
    setActiveTab(validTab);
  }, [tabFromUrl]);

  const filteredAnnouncements = announcements.filter((notification) => {
    if (activeTab === 'unread') {
      return !notification.history?.some((action) => action.action_type === ActionType.READ);
    }

    if (activeTab === 'pending') {
      return (
        notification.status !== ActionType.ANSWERED &&
        notification.communication?.form?.questions &&
        notification.communication?.form?.questions?.length > 0
      );
    }
    return true;
  });

  const hasNoAnnouncementsAtAll = announcements.length === 0;

  return (
    <div ref={swipeRef} className="flex flex-col gap-6 p-0 pt-4 px-5 pb-6">
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-[22px]">
          <div className="flex-1 flex items-center gap-4">
            <h1 className="text-[24px] font-semibold text-[#2b2d30]">Comunicados</h1>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            const newTab = value as AnnouncementFilter;
            setActiveTab(newTab);
            router.push(`/announcements?tab=${newTab}`, { scroll: false });
            sendEvent(TrackEvents.announcements.announcementTabClicked, { tab: value });
          }}
          className="w-full"
        >
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="unread">No leídos</TabsTrigger>
            <TabsTrigger value="pending">Pendiente de respuesta</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col gap-2.5 mt-5">
          {(isLoading || !schoolId || !userId) && (
            <>
              {[1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className="relative bg-white rounded-[10px] border border-[#edf2fc] p-[14px] animate-pulse"
                >
                  <div className="flex gap-[7px] items-center">
                    <div className="flex-1 flex flex-col justify-between h-[93px]">
                      <div className="flex-1 flex flex-col gap-1.5">
                        <div className="flex gap-1.5 items-start">
                          <div className="bg-[#D0D8E9] rounded h-4 w-16" />
                        </div>

                        <div className="flex flex-col gap-1 justify-center h-12">
                          <div className="bg-[#D0D8E9] rounded h-5 w-3/4" />
                          <div className="bg-[#D0D8E9] rounded h-4 w-1/3" />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-center gap-1.5 h-[17px]">
                          <div className="flex items-center gap-1.5">
                            <div className="size-5 rounded-full bg-[#D0D8E9]" />
                            <div className="bg-[#D0D8E9] rounded h-3 w-24" />
                          </div>
                          <div className="size-1 rounded-full bg-[#D0D8E9]" />
                          <div className="bg-[#D0D8E9] rounded h-3 w-20" />
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <div className="w-[93px] h-[93px] bg-[#D0D8E9] rounded-[7.13px]" />
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {error && (
            <div className="flex items-center justify-center h-64">
              <div className="text-red-500">Error: {error instanceof Error ? error.message : 'An error occurred'}</div>
            </div>
          )}

          {!isLoading && !error && !!schoolId && !!userId && filteredAnnouncements.length === 0 && (
            <div className="flex items-center justify-center min-h-[50vh]">
              {hasNoAnnouncementsAtAll ? (
                <EmptyState
                  imageSrc="/images/empty-announcements-all.png"
                  title="No hay comunicados por ahora"
                  subtitle="Cuando el colegio envíe un comunicado, aparecerá aquí."
                />
              ) : activeTab === 'unread' ? (
                <EmptyState
                  imageSrc="/images/empty-announcements-unread.png"
                  title="Ya leíste todos los comunicados"
                  subtitle="¡Muy bien! Estás al día con los comunicados."
                />
              ) : activeTab === 'pending' ? (
                <EmptyState
                  imageSrc="/images/empty-announcements-pending.png"
                  title="No tienes comunicados por responder"
                  subtitle="¡Muy bien! Ya respondiste todos los comunicados."
                  size="md"
                />
              ) : null}
            </div>
          )}

          {!isLoading && !error && filteredAnnouncements.length > 0 && (
            <>
              {filteredAnnouncements.map((notification) => {
                const isRead = notification.history?.some((action) => action.action_type === ActionType.READ) || false;
                const isNew = !isRead;
                const requiresResponse = notification.communication?.requires_response || false;
                const coverImageSrc =
                  notification.communication?.cover_image_feed ||
                  notification.communication?.cover_image ||
                  '/images/placeholder.png';

                return (
                  <Link href={`/announcements/${notification.id}?tab=${activeTab}`} key={notification.id}>
                    <Card
                      className="w-full p-[14px]"
                      padding="none"
                      roundness="xl"
                      onClick={() =>
                        sendEvent(TrackEvents.announcements.announcementCardClicked, {
                          id: notification.id,
                          is_new: isNew,
                          is_required_response: requiresResponse,
                        })
                      }
                    >
                      <CardContent padding="none" gap="default">
                        <CardMainInformation>
                          {(isNew || requiresResponse) && (
                            <div className="flex items-center gap-2 justify-self-start min-h-[16px]">
                              {isNew && (
                                <span className="bg-galaxy-100 rounded-[4px] px-[4px] py-0 text-[11px] text-galaxy-500 font-semibold leading-[16px] tracking-[0.11px] text-nowrap">
                                  Nuevo
                                </span>
                              )}
                              {requiresResponse && (
                                <span className="bg-[#fff9e6] rounded-[4px] px-[4px] py-0 text-[11px] text-[#8c6a04] font-semibold leading-[16px] tracking-[0.11px] text-nowrap">
                                  Respuesta obligatoria
                                </span>
                              )}
                            </div>
                          )}

                          <CardHeader className={cn('flex flex-col gap-1 justify-center')}>
                            <CardTitle
                              truncate={false}
                              className={cn(requiresResponse && isNew ? 'line-clamp-1' : 'line-clamp-2')}
                            >
                              {notification.communication?.title || '–'}
                            </CardTitle>
                          </CardHeader>
                          <CardFooter>
                            <CardStudentName className="max-w-[150px]">
                              {notification.guardian?.student?.first_name}
                            </CardStudentName>
                            <CardSeparator />
                            <CardDate>
                              {notification.communication?.execution_time
                                ? new Date(notification.communication.execution_time).toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : 'Sin fecha'}
                            </CardDate>
                          </CardFooter>
                        </CardMainInformation>

                        <CardImage src={coverImageSrc} alt="Cover" size="default" roundness="lg" />
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
