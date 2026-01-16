import Layout from '/src/components/layouts';
import HeaderPage from '/src/components/page-header';
import FilterSearch from '../../components/announcements/filter-search';
import { useState, useMemo } from 'react';
import AnnouncementCreationDrawer from '/src/components/announcements/announcement-creation-drawer';
import { AnimatePresence, motion } from 'framer-motion';
import AnnouncementListTable from '../../components/announcements/announcement-list-table';
import { api } from '/src/utils/api';
import { useSelectedSchoolId } from '/src/guards/AuthGuard';
import { useTab } from '/src/components/ui/Tabs';
import { useEffect } from 'react';
import { PageViewedCategory, TrackEvents } from '/src/constants/events';
import { useSendEvent, useSendPageEvent } from '/src/hooks/useSendEvent';

AnnouncementsPage.auth = true;

const backdropMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

const panelMotion = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 },
  transition: { duration: 0.25, ease: 'easeInOut' },
};

export default function AnnouncementsPage() {
  return <Announcements />;
}

AnnouncementsPage.getLayout = function getLayout(page: JSX.Element) {
  return (
    <Layout title="Comunicados" dashboardVariant="stretch">
      {page}
    </Layout>
  );
};

export function Announcements() {
  const [isOpen, setIsOpen] = useState(false);
  const schoolId = useSelectedSchoolId();
  const [search, setSearch] = useState('');
  const { tab, handleChangeTab } = useTab('completed');
  const [announcementSelectedId, setAnnouncementSelectedId] = useState<string | null>(null);

  const { data: schoolCycles, isPending: isLoadingSchoolCycles } = api.schools.schoolsCycles.useQuery({
    school_id: schoolId || '',
  });

  const { data: dataAnnouncementDetailData } = api.announcements.getAnnouncementById.useQuery(
    {
      announcementId: announcementSelectedId || '',
    },
    { enabled: !!announcementSelectedId }
  );

  const sendPageEvent = useSendPageEvent();
  const sendEvent = useSendEvent();

  useEffect(() => {
    if (dataAnnouncementDetailData) {
      setIsOpen(true);
    }
  }, [dataAnnouncementDetailData]);

  useEffect(() => {
    const eventName = {
      sent: TrackEvents.announcements.pageViewedSent,
      draft: TrackEvents.announcements.pageViewedDraft,
      pending: TrackEvents.announcements.pageViewedPending,
    };
    sendPageEvent(eventName[tab as keyof typeof eventName], PageViewedCategory);
  }, [tab]);

  const {
    data,
    isPending: isLoading,
    refetch,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = api.announcements.getAnnouncements.useInfiniteQuery(
    {
      schoolId: schoolId as string,
      query: {
        status: tab,
        search,
        school_cycle: schoolCycles?.find((item) => item.is_active)?.id || '',
      },
    },
    {
      enabled: !!schoolId && !isLoadingSchoolCycles,
      getNextPageParam: (lastPage) => {
        if (!lastPage) return undefined;
        return lastPage.next ? String(lastPage.next) : undefined;
      },
    }
  );

  const flatData = useMemo(() => data?.pages?.flatMap((page) => page?.items ?? []), [data]);

  const handleCloseDrawer = () => {
    setIsOpen(false);
    setAnnouncementSelectedId(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-70px)] overflow-hidden font-['Lota_Grotesque']">
      <div className="flex-shrink-0">
        <HeaderPage
          title="Comunicados"
          action={() => {
            setIsOpen(true);
            sendEvent(TrackEvents.announcements.createAnnouncementClicked);
          }}
          actionTitle="Crear comunicado"
        >
          <div className="flex items-center gap-6 mb-4 w-full">
            <FilterSearch
              withTabs
              search={search}
              onSearch={setSearch}
              onTabChange={(value) => {
                const eventName = {
                  sent: TrackEvents.announcements.sentTabClicked,
                  draft: TrackEvents.announcements.draftTabClicked,
                  pending: TrackEvents.announcements.pendingTabClicked,
                };

                handleChangeTab(value);
                sendEvent(eventName[value as keyof typeof eventName], { tab: value });
              }}
              tab={tab}
            />
          </div>
        </HeaderPage>
      </div>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Fondo oscuro con fade */}
            <motion.div className="fixed inset-0 bg-black/50 z-40" {...backdropMotion} />
            <motion.div className="fixed inset-0 bg-white z-50 p-6 overflow-auto" {...panelMotion}>
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="fixed inset-0 bg-white h-screen">
                  <AnnouncementCreationDrawer
                    action={handleCloseDrawer}
                    announcementDetail={dataAnnouncementDetailData}
                    refetchAnnouncements={refetch}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <div className="flex-1 mt-3 min-h-0 overflow-hidden">
        <AnnouncementListTable
          data={flatData}
          isLoading={isLoading}
          announcementType={tab}
          isFetching={isFetching}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
        />
      </div>
    </div>
  );
}
