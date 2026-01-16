import { useEffect, useState, useRef, type FC } from 'react';
import { Pencil, Trash } from 'lucide-react';
import { FieldErrors } from 'react-hook-form';
import { TypeSchema } from '/src/components/announcements/announcement-creation-drawer';
import { useFieldArray, useFormContext } from 'react-hook-form';
import DragAndDrop from '/src/components/ui/DragAndDrop';
import AnnouncementQuestionSection from './components/announcement-question-section';
import MessageDescriptionInput from './MessageDescriptionInput';
import ExtraDataPopup from './extra-data-popup';
import { useAnnouncementAI } from '../../../hooks/useAnnouncementAI';
import { useSendEvent } from '../../../hooks/useSendEvent';
import { TrackEvents } from '/src/constants/events';

interface CreateContentStepProps {
  formErrors: FieldErrors<TypeSchema>;
}

const CreateContentStep: FC<CreateContentStepProps> = ({ formErrors }) => {
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);
  const { control, setValue, register, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'question',
  });

  const watchedTitle = watch('title');
  const watchedDescription = watch('description');
  const watchedCoverImage = watch('cover_image');
  const watchedFilesList = watch('files_list');
  const sendEvent = useSendEvent();

  useEffect(() => {
    if (watchedCoverImage && watchedCoverImage instanceof File) {
      const imageUrl = URL.createObjectURL(watchedCoverImage);
      setBackgroundImageUrl(imageUrl);

      return () => {
        URL.revokeObjectURL(imageUrl);
      };
    } else if (watchedCoverImage) {
      setBackgroundImageUrl(watchedCoverImage as string);
    } else if (!watchedCoverImage) {
      setBackgroundImageUrl(null);
    }
  }, [watchedCoverImage]);

  // Function to save title and description to localStorage
  const saveToLocalStorage = () => {
    const hasTitle = watchedTitle && watchedTitle.trim().length > 0;
    const hasDescription = watchedDescription && watchedDescription.trim().length > 0;

    if (hasTitle || hasDescription) {
      const draftData = {
        title: watchedTitle || '',
        description: watchedDescription || '',
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('announcementDraft', JSON.stringify(draftData));
    }
  };

  // Load saved data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('announcementDraft');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.title && !watchedTitle) {
          setValue('title', parsedData.title);
        }
        if (parsedData.description && !watchedDescription) {
          setValue('description', parsedData.description);
        }
      } catch (error) {
        setValue('title', '');
        setValue('description', '');
      }
    }
  }, [setValue, watchedTitle, watchedDescription]);

  // Save to localStorage when window is about to close
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveToLocalStorage();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [watchedTitle, watchedDescription]);

  // Auto-save to localStorage when title or description changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (watchedTitle || watchedDescription) {
        saveToLocalStorage();
      }
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timeoutId);
  }, [watchedTitle, watchedDescription]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    isImproving,
    isGenerating,
    error,
    isRateLimited,
    showExtraDataPopup,
    extraDataRequest,
    userExtraData,
    summarizeText,
    setUserExtraData,
    improveText,
    generateContent,
    submitExtraData,
    cancelExtraData,
  } = useAnnouncementAI();

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteImage = () => {
    setBackgroundImageUrl(null);
    setValue('cover_image', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleChangeImage = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    sendEvent(TrackEvents.announcements.addCoverClicked);
    const file = event.target.files?.[0];
    if (file) {
      setValue('cover_image', file);
      const imageUrl = URL.createObjectURL(file);
      setBackgroundImageUrl(imageUrl);
    }
  };

  const handleImproveMessage = async () => {
    const improved = await improveText(watchedDescription);
    if (improved) {
      setValue('description', improved);
    }
  };

  const handleGenerateAnnouncement = async () => {
    const result = await generateContent(watchedDescription);
    if (result && !result.needsExtraData) {
      setValue('title', result.title);
      setValue('description', result.message);
    }
  };

  const handleExtraDataSubmit = async () => {
    const result = await submitExtraData(watchedDescription);
    if (result && !result.needsExtraData) {
      setValue('title', result.title);
      setValue('description', result.message);
    }
  };

  const handleSummarizeMessage = async () => {
    const summarized = await summarizeText(watchedDescription);
    if (summarized) {
      setValue('description', summarized);
    }
  };

  const handleRef = (event: HTMLInputElement | null) => {
    fileInputRef.current = event;
  };

  return (
    <main className="xl:px-[8.625rem]">
      <h2 className="text-neutral-950 text-lg font-semibold mb-[1rem]">Crea tu contenido</h2>
      <section className="bg-[#FAFBFB] border border-neutral-100 rounded-[10px]">
        <div
          className="h-[150px] bg-cover bg-center rounded-tl-[10px] rounded-tr-[10px] relative"
          style={{
            backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : undefined,
          }}
        >
          <div className="flex items-center justify-center w-full max-w-xl mx-auto bg-transparent text-center h-[150px]">
            {backgroundImageUrl && (
              <div>
                <div className="absolute inset-0 flex items-center justify-center gap-4">
                  <button
                    onClick={handleChangeImage}
                    className="flex items-center gap-2 px-4 py-[0.375rem] rounded-full bg-white shadow-md text-gray-800 font-semibold text-sm hover:bg-gray-100 transition"
                  >
                    <Pencil className="w-4 h-4" />
                    Cambiar
                  </button>
                  <button
                    onClick={handleDeleteImage}
                    className="flex items-center gap-2 px-4 py-[0.375rem]  rounded-full bg-red-100 shadow-md text-red-600 font-semibold text-sm hover:bg-red-200 transition"
                  >
                    <Trash className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            )}
            <div className={backgroundImageUrl ? 'hidden' : ''}>
              <p className="text-sm text-gray-700 font-semibold">
                Puedes agregar una foto de portada{' '}
                <button type="button" onClick={handleClick} className="text-blue-600 hover:underline">
                  aquí
                </button>
              </p>
              <p className="mt-1 text-xs text-gray-500">Archivos permitidos .jpg, .jpeg, .png (Máximo 3 MB)</p>
            </div>
            {/* Keep file input always accessible, regardless of image state */}
            <input
              type="file"
              ref={handleRef}
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png"
              className="hidden"
            />
          </div>
        </div>
        <div className="bg-white">
          <div>
            <div className="p-[20px] space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  id="title"
                  {...register('title')}
                  type="text"
                  placeholder="Title"
                  value={watchedTitle}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm placeholder-gray-400  focus:outline-none focus:ring-2 focus:ring-galaxy-500 focus:border-galaxy-500"
                  onClick={() => sendEvent(TrackEvents.announcements.editTitleClicked)}
                />
                {formErrors.title && <p className="mt-2 text-xs text-red-500">{formErrors.title.message}</p>}
              </div>

              {/* Message Description */}
              <MessageDescriptionInput
                message={watchedDescription}
                isImproving={isImproving}
                isGenerating={isGenerating}
                isRateLimited={isRateLimited}
                formErrors={formErrors}
                setMessage={(newMessage) => setValue('description', newMessage)}
                handleImproveText={handleImproveMessage}
                handleGenerateText={handleGenerateAnnouncement}
                handleSummarizeText={handleSummarizeMessage}
              />
              {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
              {/* Conditional Section: Button or Form */}
              <AnnouncementQuestionSection
                control={control}
                fields={fields}
                append={append}
                remove={remove}
                formErrors={formErrors}
              />
            </div>
          </div>
        </div>
        <div className="p-[20px]">
          <DragAndDrop
            onFilesChange={(files) => {
              sendEvent(TrackEvents.announcements.formFileUploaded);
              setValue('files_list', files);
            }}
            dataFiles={watchedFilesList}
            error={formErrors.files_list?.message}
          />
        </div>
      </section>
      {/* Extra Data Popup */}
      {showExtraDataPopup && (
        <ExtraDataPopup
          extraDataRequest={extraDataRequest}
          userExtraData={userExtraData}
          onUserExtraDataChange={setUserExtraData}
          onCancel={cancelExtraData}
          onSubmit={handleExtraDataSubmit}
        />
      )}
    </main>
  );
};

export default CreateContentStep;
