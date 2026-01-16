import { useState, useEffect } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import Layout from '/src/components/layouts';
import { Button } from '@cometa/recreo';
import { api } from '/src/utils/api';
import { AnimatePresence, motion } from 'framer-motion';
import AnnouncementCreationDrawer from '/src/components/announcements/announcement-creation-drawer';
import DeleteModal from '/src/components/announcements/DeleteModal';
import { cn } from '/src/utils/cn';
import useAlert, { defaultAlertTime } from '/src/hooks/useAlert';
import DescriptionTab from '/src/components/announcements/announcement-detail/tabs/description-tab';
import DestinationsTab from '/src/components/announcements/announcement-detail/tabs/destinations-tab';
import ResponsesTab from '/src/components/announcements/announcement-detail/tabs/responses-tab';
import { CommunicationDetail, CampaignStatus } from '@cometa/trpc/src/announcements/types';
import { useSendEvent, useSendPageEvent } from '/src/hooks/useSendEvent';
import { PageViewedCategory, TrackEvents } from '/src/constants/events';
import { Hourglass } from 'lucide-react';

interface AnnouncementFile {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'doc' | 'image';
}

interface AnnouncementFilters {
  student_ids?: string[];
}

interface AnnouncementDetail {
  id: string;
  title: string;
  status: string;
  creator_name: string;
  created_at: string;
  files_list?: any[];
  notifications_answered_count: number;
  notifications_count?: number | null;
  notifications_read_count?: number | null;
  form?: {
    questions: any[];
  };
  filters?: AnnouncementFilters;
  execution_time?: string;
  response_deadline?: string | null;
}

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

AnnouncementDetailPage.getLayout = function getLayout(page: JSX.Element) {
  return (
    <Layout dashboardVariant="stretch" title="Detalle de Admisión">
      {page}
    </Layout>
  );
};

function AnnouncementDetailPage() {
  const router = useRouter();
  const { announcementId } = router.query;
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'description' | 'destinations' | 'responses'>('description');
  const [files, setFiles] = useState<AnnouncementFile[]>([]);
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [responsesSearchTerm, setResponsesSearchTerm] = useState('');
  const { setAlertState } = useAlert();
  const sendPageEvent = useSendPageEvent();
  const sendEvent = useSendEvent();

  useEffect(() => {
    sendPageEvent(TrackEvents.announcements.detail.pageViewed, PageViewedCategory);
  }, []);

  const handleCloseDrawer = () => {
    setIsOpen(false);
  };

  const { data: dataAnnouncementDetail } = api.announcements.getAnnouncementById.useQuery(
    {
      announcementId: String(announcementId) || '',
    },
    { enabled: !!announcementId }
  ) as { data: AnnouncementDetail | undefined };

  const deleteMutation = api.announcements.deleteAnnouncement.useMutation();

  useEffect(() => {
    if (dataAnnouncementDetail?.files_list) {
      setFiles(
        dataAnnouncementDetail.files_list.map((attachment: any) => ({
          id: attachment.id || Math.random().toString(),
          name: attachment.filename || attachment.name || 'Archivo',
          size: attachment.size || '0KB',
          type: attachment.type || 'pdf',
        }))
      );
    }
  }, [dataAnnouncementDetail?.files_list]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Enviado',
          bgColor: 'bg-[#4BC7661F]',
          textColor: 'text-[#44B55D] font-semibold',
        };
      case 'executing':
      case 'active':
        return {
          label: 'Programado',
          bgColor: 'bg-[#1890FF1F]',
          textColor: 'text-[#1890FF] font-semibold',
        };
      case 'draft':
        return {
          label: 'Borrador',
          bgColor: 'bg-[#1890FF1F]',
          textColor: 'text-[#1890FF] font-semibold',
        };
      default:
        return {
          label: 'Enviado',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800 font-semibold',
        };
    }
  };

  const handleFileRemove = (fileId: string) => {
    setFiles(files.filter((file) => file.id !== fileId));
  };

  const isEditDisabled =
    dataAnnouncementDetail?.status !== 'active' &&
    dataAnnouncementDetail?.status !== 'active' &&
    dataAnnouncementDetail?.status !== 'draft';

  const handleEditClick = () => {
    setIsOpen(true);
  };

  const handleOpenDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleDeleteAnnouncement = async () => {
    sendEvent(TrackEvents.announcements.detail.announcementDeleteConfirmed, {
      announcement_id: announcementId,
    });
    if (!announcementId) return;

    try {
      await deleteMutation.mutateAsync({ announcementId: String(announcementId) });
      handleCloseDeleteModal();
      router.push('/announcements');
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

  const toggleStudentExpansion = (studentId: string) => {
    const newExpanded = new Set(expandedStudents);
    if (newExpanded.has(studentId)) {
      sendEvent(TrackEvents.announcements.detail.announcementRecipientCollapsed, {
        announcement_id: announcementId,
        student_id: studentId,
      });
      newExpanded.delete(studentId);
    } else {
      sendEvent(TrackEvents.announcements.detail.announcementRecipientExpanded, {
        announcement_id: announcementId,
        student_id: studentId,
      });
      newExpanded.add(studentId);
    }
    setExpandedStudents(newExpanded);
  };

  if (!dataAnnouncementDetail && announcementId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent border-galaxy-500" />
          </div>
          <p className="text-gray-600">Cargando comunicado...</p>
        </div>
      </div>
    );
  }

  const status = dataAnnouncementDetail?.status || 'completed';
  const badge = getStatusBadge(status);

  const executionTimeObject = dataAnnouncementDetail?.execution_time
    ? new Date(dataAnnouncementDetail.execution_time)
    : null;

  const isScheduled = executionTimeObject && executionTimeObject > new Date() && ['active'].includes(status);

  function formatExecutionTime(executionTimeObject: Date) {
    return executionTimeObject
      ?.toLocaleString('es-MX', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZoneName: undefined, // no mostrar GMT
      })
      .replace(', ', ' a las ');
  }

  const timeInfo = formatExecutionTime(executionTimeObject as Date);

  // Response deadline logic
  const responseDeadlineObject = dataAnnouncementDetail?.response_deadline
    ? new Date(dataAnnouncementDetail.response_deadline)
    : null;

  const hasResponseDeadline =
    responseDeadlineObject && [CampaignStatus.Completed, CampaignStatus.Failed].includes(status as CampaignStatus);
  const isResponseDeadlinePassed = responseDeadlineObject && responseDeadlineObject < new Date();

  const responseDeadlineInfo = responseDeadlineObject ? formatExecutionTime(responseDeadlineObject) : '';

  return (
    <div className="min-h-screen white font-lota">
      {/* Header */}
      <div className="bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => {
                sendEvent(TrackEvents.announcements.detail.announcementBackClicked, {
                  announcement_id: announcementId,
                });
                router.back();
              }}
              className="p-2 bg-white hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="#22283A" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Button>
            <h1 className="text-2xl font-semibold text-gray-900">{dataAnnouncementDetail?.title || 'Cargando...'}</h1>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-[6px] text-xs font-medium ${badge.bgColor} ${badge.textColor}`}
            >
              {badge.label}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Creado por: <span className="font-medium">{dataAnnouncementDetail?.creator_name || 'Usuario'}</span> |{' '}
              {dataAnnouncementDetail?.created_at
                ? new Date(dataAnnouncementDetail.created_at).toLocaleDateString('es-ES')
                : 'No hay fecha registrada.'}
            </div>
            <Button
              onClick={() => {
                sendEvent(TrackEvents.announcements.detail.announcementEditClicked, {
                  announcement_id: announcementId,
                });
                handleEditClick();
              }}
              color="galaxy"
              disabled={isEditDisabled}
              className={isEditDisabled ? 'opacity-50 cursor-not-allowed' : ''}
            >
              Editar
            </Button>
            <Button
              onClick={() => {
                sendEvent(TrackEvents.announcements.detail.announcementDeleteClicked, {
                  announcement_id: announcementId,
                });
                handleOpenDeleteModal();
              }}
              className="bg-red-50 text-red-500 hover:bg-red-100"
            >
              Eliminar
            </Button>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      {isScheduled && (
        <div className="px-6 py-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-700">Este comunicado está programado para el día {timeInfo} hora local.</p>
          </div>
        </div>
      )}

      {/* Response Deadline */}
      {hasResponseDeadline && (
        <div className="px-6 py-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              <Hourglass className="w-5 h-5 text-gray-600" />
            </div>
            <p className="text-sm text-gray-700">
              {isResponseDeadlinePassed
                ? `Este comunicado tenía fecha máxima de respuesta el día ${responseDeadlineInfo} hora local.`
                : `Este comunicado tiene fecha máxima de respuesta el día ${responseDeadlineInfo} hora local.`}
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="py-6">
        {/* Tabs */}
        <div className="px-6">
          <div className="flex items-end justify-between border-b-[3px] border-gray-200">
            <nav className="mb-[-3px] flex space-x-8">
              <button
                onClick={() => {
                  sendEvent(TrackEvents.announcements.detail.announcementDetailTabClicked, {
                    page: 'Descripción General',
                    announcement_id: announcementId,
                  });
                  setSelectedTab('description');
                }}
                className={cn(
                  'py-2 px-1 border-b-[3px] font-medium text-sm transition-colors',
                  selectedTab === 'description'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <div className="flex items-start flex-col">
                  <p className="font-bold text-xl text-[#22283A] mb-2">Contenido</p>
                  <p className="text-sm text-[#22283A]">Descripción General</p>
                </div>
              </button>
              <button
                onClick={() => {
                  sendEvent(TrackEvents.announcements.detail.announcementDetailTabClicked, {
                    page: 'Estudiantes',
                    announcement_id: announcementId,
                  });
                  setSelectedTab('destinations');
                }}
                className={`py-2 px-1 border-b-[3px] font-medium text-sm transition-colors ${
                  selectedTab === 'destinations'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start flex-col">
                  <p className="font-bold text-xl text-[#22283A] mb-2">
                    {dataAnnouncementDetail?.filters?.student_ids?.length || 0}
                  </p>
                  <p className="text-sm text-[#22283A]">Estudiantes</p>
                </div>
              </button>
              <button
                onClick={() => {
                  sendEvent(TrackEvents.announcements.detail.announcementDetailTabClicked, {
                    page: 'Respuestas',
                    announcement_id: announcementId,
                  });
                  setSelectedTab('responses');
                }}
                className={`py-2 px-1 border-b-[3px] font-medium text-sm transition-colors ${
                  selectedTab === 'responses'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start flex-col">
                  <p className="font-bold text-xl text-[#22283A] mb-2">
                    {dataAnnouncementDetail?.notifications_answered_count}
                  </p>
                  <p className="text-sm text-[#22283A]">Respuestas</p>
                </div>
              </button>
            </nav>
            <div className="self-center">
              <div className="inline-flex items-center gap-[10px] rounded-[8px] bg-[#F4F6F8] border border-[#E9EEF7] p-[10px] min-w-[352px] w-auto h-[38px] text-[#697086] whitespace-nowrap">
                <svg className="w-4 h-4 text-[#697086]" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7.3333" stroke="currentColor" strokeWidth="1" />
                  <rect x="7.3333" y="3.3333" width="1.3333" height="6.6667" rx="0.6667" fill="currentColor" />
                  <circle cx="8" cy="4.6667" r="0.6667" fill="currentColor" />
                </svg>
                <span className="leading-[18px] whitespace-nowrap">
                  {dataAnnouncementDetail?.notifications_count ?? 0} tutores incluidos en el envío del comunicado
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Tab Content */}
        {selectedTab === 'description' && (
          <div className="flex justify-center w-full  pt-16">
            {/* Main Content */}
            <div className="min-w-[60%]">
              <DescriptionTab
                dataAnnouncementDetail={dataAnnouncementDetail}
                files={files}
                handleFileRemove={handleFileRemove}
              />
            </div>
          </div>
        )}

        {selectedTab === 'destinations' && (
          <DestinationsTab
            expandedStudents={expandedStudents}
            toggleStudentExpansion={toggleStudentExpansion}
            announcementId={announcementId}
          />
        )}

        {selectedTab === 'responses' && (
          <ResponsesTab
            responsesSearchTerm={responsesSearchTerm}
            setResponsesSearchTerm={setResponsesSearchTerm}
            announcementId={announcementId}
            questions={dataAnnouncementDetail?.form?.questions || []}
          />
        )}
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
                    announcementDetail={dataAnnouncementDetail as CommunicationDetail}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <DeleteModal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} onDelete={handleDeleteAnnouncement} />
    </div>
  );
}

AnnouncementDetailPage.auth = true;

export default AnnouncementDetailPage;
