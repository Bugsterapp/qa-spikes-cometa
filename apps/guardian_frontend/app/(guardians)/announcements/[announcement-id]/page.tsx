'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useSelectedSchool } from '~/stores/globalStore';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  FeedNotificationDetail,
  QuestionDTO,
  AnswerSubmit,
  QuestionType,
  FileMetadata,
} from '@cometa/trpc/src/announcements/types';
import AnnouncementHeader from './components/announcement-header';
import InformationAlert from './components/information-alert';
import AnsweredAlert from './components/answered-alert';
import DynamicForm from './components/dynamic-form';
import AnnouncementDetailSkeleton from './components/announcement-detail-skeleton';
import FilePreviewModal from '~/components/FilePreviewModal';
import { markRead } from './actions/mark-read';
import { submitForm } from './actions/submit-form';
import { useToast } from '~/components/Toast/useToast';
import { ConfirmationDrawer } from '~/components/Drawer.Variants';
import FileIcon from '~/public/images/file.svg';
import Markdown from 'react-markdown';
import { useSendEvent, useSendPageEvent } from '~/hooks/useSendEvent';
import { PageViewedCategory, TrackEvents } from '~/constants/events';
import rehypeRaw from 'rehype-raw';

export default function AnnouncementDetailPage() {
  const params = useParams();
  const announcementId = params?.['announcement-id'] as string;
  const { data: session } = useSession();
  const selectedSchool = useSelectedSchool();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = session?.user?.id;
  const schoolId = selectedSchool?.id;
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [filePreviewOpen, setFilePreviewOpen] = useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);

  const tab = searchParams?.get('tab');
  const backUrl = tab ? `/announcements?tab=${tab}` : '/announcements';

  const {
    data: announcement,
    isLoading,
    error,
    refetch,
  } = useQuery<FeedNotificationDetail>({
    queryKey: ['announcement', announcementId],
    queryFn: async () => {
      if (!schoolId || !userId || !announcementId) {
        throw new Error('Missing required parameters');
      }

      const response = await fetch(`/announcements/${announcementId}/api/`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch announcement');
      }

      return response.json();
    },
    enabled: !!schoolId && !!userId && !!announcementId,
  });

  const { mutate: markReadMutation } = useMutation({
    mutationKey: ['mark-read', announcementId],
    mutationFn: markRead,
  });

  const { mutateAsync: submitFormMutation } = useMutation({
    mutationKey: ['submit-form', announcementId],
    mutationFn: (variables: { announcementId: string; answers: AnswerSubmit[] }) =>
      submitForm(variables.announcementId, variables.answers),
  });

  const sendPageEvent = useSendPageEvent();
  const sendEvent = useSendEvent();
  const hasMarkedRead = React.useRef(false);

  useEffect(() => {
    if (announcement?.status === 'SENT' && !hasMarkedRead.current) {
      hasMarkedRead.current = true;
      markReadMutation(announcementId);
    }
  }, [announcement?.status, markReadMutation, announcementId]);

  useEffect(() => {
    sendPageEvent(TrackEvents.announcements.detail.pageViewed, PageViewedCategory);
  }, [sendPageEvent]);

  useEffect(() => {
    router.prefetch(backUrl);
  }, [backUrl, router]);

  const handleFormSubmit = async (data: Record<string, string>) => {
    sendEvent(TrackEvents.announcements.detail.responseSubmitted, {
      id: announcementId,
      value: data,
    });
    try {
      const answers = Object.entries(data).map(([questionId, answer]) => {
        const question = questions.find((q) => (q as QuestionDTO).id === questionId);

        if (question?.question_type === QuestionType.Options) {
          return {
            question_id: questionId,
            response: answer,
            response_id: answer,
          };
        } else {
          return {
            question_id: questionId,
            response: answer,
          };
        }
      });

      await submitFormMutation({ announcementId, answers });
      refetch();
      toast({
        title: 'Respuesta enviada',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error al enviar respuesta',
        variant: 'error',
      });
    }
  };

  if (isLoading) {
    return <AnnouncementDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">
          Error: {error instanceof Error ? error.message : 'Error al cargar el comunicado'}
        </div>
      </div>
    );
  }

  if (!announcement) {
    return null;
  }

  const questions = announcement.communication?.form?.questions ?? [];

  const handleBack = () => {
    sendEvent(TrackEvents.announcements.detail.backClicked, { id: announcementId });
    if (questions.length > 0 && announcement?.status !== 'ANSWERED') {
      setShowConfirmation(true);
    } else {
      router.push(backUrl);
    }
  };

  const handleFileClick = (index: number) => {
    setSelectedFileIndex(index);
    setFilePreviewOpen(true);
  };

  const handleFileDownload = (file: FileMetadata) => {
    sendEvent(TrackEvents.announcements.detail.attachmentDownloaded, {
      id: announcementId,
      name: file.name,
      file_type: file.extension,
    });
    // Open file in new tab for download/view
    window.open(file.url, '_blank');
  };

  const allFiles = (announcement.communication?.files_list || []) as unknown as FileMetadata[];

  const getFileIcon = (extension: string) => {
    const lowerExt = extension.toLowerCase();
    if (['.jpeg', '.jpg', '.png', '.webp', '.gif', '.bmp', '.tiff'].includes(lowerExt)) {
      return null;
    }
    return <FileIcon className="w-12 h-12" />;
  };

  const getFileColor = (extension: string): string => {
    const lowerExt = extension.toLowerCase();
    if (['.jpeg', '.jpg', '.png', '.webp', '.gif', '.bmp', '.tiff'].includes(lowerExt)) return '';
    if (lowerExt === '.pdf') return 'bg-red-50';
    if (['.xls', '.xlsx', '.csv'].includes(lowerExt)) return 'bg-green-50';
    if (['.doc', '.docx'].includes(lowerExt)) return 'bg-blue-50';
    if (['.ppt', '.pptx'].includes(lowerExt)) return 'bg-orange-50';
    if (['.mp4', '.webm', '.ogg'].includes(lowerExt)) return 'bg-pink-50';
    return 'bg-gray-50';
  };
  const coverImage =
    announcement.communication?.cover_image_detail?.url || announcement.communication?.cover_image?.url || '';

  const answeredAction = announcement.history?.find((action) => action.action_type === 'ANSWERED');
  const guardianName = `${announcement.guardian.first_name} ${announcement.guardian.last_name}`;

  return (
    <div className="bg-white flex flex-col items-start justify-start relative min-h-screen">
      <AnnouncementHeader
        title={announcement.communication?.title || 'Circular Mayo'}
        studentName={announcement.guardian.student.first_name || 'Mariana'}
        date={announcement.communication?.execution_time}
        schoolLogo={selectedSchool?.logo ?? ''}
        coverImage={coverImage}
        onClickBack={handleBack}
      />

      <div className="relative w-full">
        <div className="flex flex-col overflow-clip relative w-full p-4 pb-0">
          <div className="flex flex-col gap-4 items-start justify-start p-0 relative w-full mb-8">
            {announcement.communication?.response_deadline && announcement?.status !== 'ANSWERED' && (
              <InformationAlert deadline={announcement.communication.response_deadline} />
            )}

            {announcement?.status === 'ANSWERED' && answeredAction && (
              <AnsweredAlert guardianName={guardianName} answeredDate={answeredAction.date} />
            )}

            <article className="flex flex-col items-start justify-start p-0 relative w-full text-[#444c60] prose-p:w-full">
              <Markdown rehypePlugins={[rehypeRaw]}>{announcement.communication?.description}</Markdown>
            </article>

            {questions.length > 0 && (
              <div className="w-full mt-6">
                <DynamicForm
                  questions={questions as QuestionDTO[]}
                  onSubmit={handleFormSubmit}
                  disabled={announcement?.status === 'ANSWERED'}
                  answers={announcement?.answers || []}
                />
              </div>
            )}
          </div>

          {allFiles.length > 0 && (
            <div className="w-full grid grid-cols-4 gap-1.5 mb-8">
              {allFiles.map((file, index) => {
                const isImage = ['.jpeg', '.jpg', '.png', '.webp', '.gif', '.bmp', '.tiff'].includes(
                  file.extension.toLowerCase()
                );

                return (
                  <button
                    key={file.name}
                    onClick={() => handleFileClick(index)}
                    className="relative aspect-square rounded-lg overflow-hidden hover:opacity-90 transition-opacity group"
                  >
                    {isImage ? (
                      <img src={file.url} className="w-full h-full object-cover" alt={file.name} />
                    ) : (
                      <div
                        className={`w-full h-full flex flex-col items-center justify-center ${getFileColor(
                          file.extension
                        )} p-2`}
                      >
                        <div className="scale-75">{getFileIcon(file.extension)}</div>
                        <p className="text-[9px] font-semibold text-neutral-700 mt-1 text-center truncate w-full px-0.5">
                          {file.extension.replace('.', '').toUpperCase()}
                        </p>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                      <p className="text-white text-[10px] font-medium truncate w-full">{file.name}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ConfirmationDrawer
        title="No has respondido al comunicado"
        description="¿Quieres salir de todas formas?"
        onClick={() => {
          router.push(backUrl);
        }}
        onCancel={() => {
          setShowConfirmation(false);
        }}
        onClose={() => {
          setShowConfirmation(false);
        }}
        confirmLabel="Si, salir"
        cancelLabel="Permanecer aquí"
        disabled={false}
        loading={false}
        open={showConfirmation}
        intent="info"
      />
      {allFiles.length > 0 && (
        <FilePreviewModal
          isOpen={filePreviewOpen}
          onClose={() => setFilePreviewOpen(false)}
          files={allFiles}
          initialIndex={selectedFileIndex}
          onDownload={handleFileDownload}
        />
      )}
    </div>
  );
}
