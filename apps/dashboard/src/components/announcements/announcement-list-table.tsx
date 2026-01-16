import { CampaignStatus, CommunicationListDTO } from '@cometa/trpc/src/announcements/types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { TableVirtualized } from '/src/components/TableInfinityScroll';
import { createColumnHelper, type SortingState } from '@tanstack/react-table';
import { Check, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import AnnouncementCreationDrawer from '/src/components/announcements/announcement-creation-drawer';
import DeleteModal from '/src/components/announcements/DeleteModal';
import useAlert, { defaultAlertTime } from '/src/hooks/useAlert';
import { api } from '/src/utils/api';
import { useRouter } from 'next/router';
import { useSendEvent } from '/src/hooks/useSendEvent';
import { TrackEvents } from '/src/constants/events';
import { useAdjustHeight } from 'src/hooks/useFullScreenHeight';

type SortOrder = 'asc' | 'desc' | null;

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

interface AnnouncementListTableProps {
  data: CommunicationListDTO[] | undefined;
  isLoading: boolean;
  announcementType: string;
  isFetching: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  hasNextPage: boolean | undefined;
}

const columnHelper = createColumnHelper<CommunicationListDTO>();

const formatExecutionTime = (executionTime: string) => {
  try {
    const date = parseISO(executionTime);
    return format(date, 'dd/MM/yyyy', { locale: es });
  } catch (error) {
    return executionTime;
  }
};

const AnnouncementListTable = ({
  data,
  isLoading,
  announcementType,
  isFetching,
  isFetchingNextPage,
  fetchNextPage,
  hasNextPage,
}: AnnouncementListTableProps) => {
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [announcementId, setAnnouncementId] = useState<string | null>(null);
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteAnnouncementId, setDeleteAnnouncementId] = useState<string | null>(null);
  const { setAlertState } = useAlert();
  const sendEvent = useSendEvent();

  const handleCloseDrawer = () => {
    setIsOpen(false);
    setAnnouncementId(null);
  };

  const { data: dataAnnouncementDetail } = api.announcements.getAnnouncementById.useQuery(
    {
      announcementId: String(announcementId) || '',
    },
    { enabled: !!announcementId }
  );

  const deleteMutation = api.announcements.deleteAnnouncement.useMutation();

  const handleOpenDrawer = (announcementId: string) => {
    setAnnouncementId(announcementId);
    setIsOpen(true);
  };

  const handleOpenDeleteModal = (announcementId: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    setDeleteAnnouncementId(announcementId);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteAnnouncementId(null);
  };

  const handleDeleteAnnouncement = async () => {
    if (!deleteAnnouncementId) return;

    try {
      await deleteMutation.mutateAsync({ announcementId: deleteAnnouncementId });
      handleCloseDeleteModal();
      setAlertState({
        open: true,
        severity: 'success',
        message: '¡Comunicado eliminado correctamente!',
        alertTime: defaultAlertTime,
      });
    } catch (error) {
      setAlertState({
        open: true,
        severity: 'error',
        message: `No se pudo eliminar el comunicado ${String(error)}`,
        alertTime: defaultAlertTime,
      });
    }
  };

  const sortedData = useMemo(() => {
    if (!data || sortOrder === null) return data;

    return [...data].sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();

      if (sortOrder === 'asc') {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
  }, [data, sortOrder]);

  const handleSortingChange = (newSorting: SortingState) => {
    // Convertir el SortingState de tanstack-table a nuestro SortOrder personalizado
    if (newSorting.length === 0) {
      setSortOrder(null);
    } else {
      const sortItem = newSorting[0];
      if (sortItem.id === 'name') {
        setSortOrder(sortItem.desc ? 'desc' : 'asc');
      }
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        id: 'name',
        header: 'Nombre',
        enableSorting: true,
        cell: (info) => (
          <Link href={`/announcements/${info.row.original.id}`} passHref legacyBehavior>
            <a className="font-normal text-neutral-900 hover:underline overflow-hidden text-ellipsis block">
              {info.getValue()}
            </a>
          </Link>
        ),
        size: 400,
      }),
      columnHelper.display({
        id: 'created_at',
        header: 'Fecha de creación',
        cell: (info) => (
          <span className="font-normal text-neutral-900">
            {info.row.original.status === CampaignStatus.Draft
              ? '-'
              : formatExecutionTime(info.row.original.created_at)}
          </span>
        ),
      }),
      columnHelper.accessor('execution_time', {
        id: 'execution_time',
        header: 'Fecha de envío',
        cell: (info) => (
          <span className="font-semibold text-neutral-900">
            {info.row.original.status === CampaignStatus.Draft ? '-' : formatExecutionTime(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor('notifications_count', {
        id: 'notifications_count',
        header: 'Destinatarios',
        meta: { numeric: true },
        cell: (info) => <span className="font-normal text-neutral-400">{info.getValue()}</span>,
      }),
      columnHelper.display({
        id: 'mandatory_response',
        header:
          announcementType === 'active' ? 'Respuesta obligatoria' : announcementType === 'draft' ? '' : '% de Lectura',
        meta: { numeric: true },
        cell: (info) =>
          announcementType === 'active' ? (
            <div className="flex justify-center">
              <div className="relative size-5 rounded-full border-[1px] border-[#28c441] flex items-center justify-center">
                <Check className="size-3 text-[#28c441]" />
              </div>
            </div>
          ) : announcementType === 'draft' ? (
            <div className="flex justify-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenDrawer(info.row.original.id);
                }}
                className="bg-[#f3f6fb] hover:bg-[#e6edf7] flex items-center justify-center px-4 py-1.5 rounded-[100px] shrink-0 transition-colors"
              >
                <span className="font-semibold text-[14px] text-neutral-900 leading-[20px] whitespace-nowrap">
                  Completar
                </span>
              </button>
              <button
                onClick={(e) => handleOpenDeleteModal(info.row.original.id, e)}
                className="bg-[#ffefef] hover:bg-[#ffd6d6] flex items-center justify-center p-[9px] rounded-[100px] shrink-0 transition-colors"
              >
                <Trash2 className="size-3.5 text-[#FD6262]" />
              </button>
            </div>
          ) : (
            <span className="font-normal text-neutral-400 flex justify-center items-center">
              {info.row.original.notifications_sent_count
                ? `${Math.round(
                    (info.row.original.notifications_read_count / info.row.original.notifications_count) * 100
                  )}%`
                : '0%'}
            </span>
          ),
      }),
    ],
    [announcementType]
  );

  const { wrapperRef, maxHeight } = useAdjustHeight(550);

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-[calc(100vh-20rem)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent border-galaxy-500" />
      </div>
    );

  return (
    <div className="h-full flex flex-col max-h-[calc(100vh-80px)] min-h-[calc(100vh-70px)]" ref={wrapperRef}>
      <TableVirtualized
        hasNextPage={hasNextPage || false}
        fetchNextPage={fetchNextPage}
        maxHeight={maxHeight - 162}
        data={sortedData}
        totalFetched={sortedData?.length || 0}
        columns={columns as any[]}
        totalCount={sortedData?.length || 0}
        isLoading={isLoading}
        isFetching={isFetching}
        isFetchingNextPage={isFetchingNextPage}
        onSortingChange={handleSortingChange}
        onRowClick={(row) => {
          sendEvent(TrackEvents.announcements.detail.announcementDetailsSelected);
          router.push(`/announcements/${row.id}`);
        }}
        hideSum
        rowClassName="hover:bg-neutral-50"
        emptyStateText="Aún no tienes comunicados creados. Mantén al día a tus familias con tus comunicados y avisos que quieran compartir."
        classNameContainer="[&_tr:hover]:bg-gray-50 max-h-full"
      />
      <AnimatePresence>
        {isOpen && dataAnnouncementDetail && (
          <>
            {/* Fondo oscuro con fade */}
            <motion.div className="fixed inset-0 bg-black/50 z-40" {...backdropMotion} />
            <motion.div className="fixed inset-0 bg-white z-50 p-6 overflow-auto" {...panelMotion}>
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="fixed inset-0 bg-white h-screen">
                  <AnnouncementCreationDrawer action={handleCloseDrawer} announcementDetail={dataAnnouncementDetail} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <DeleteModal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} onDelete={handleDeleteAnnouncement} />
    </div>
  );
};

export default AnnouncementListTable;
