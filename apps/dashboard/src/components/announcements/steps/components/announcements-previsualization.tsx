import { useFormContext } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { File } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Question } from '/src/components/announcements/announcement-creation-drawer/index';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

const AnnouncementPrevisualization = () => {
  const { watch } = useFormContext();
  const { data: session } = useSession();

  const formValues = watch();

  const today = new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (formValues.cover_image) {
      const file = formValues.cover_image;
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [formValues.cover_image]);

  return (
    <>
      <div className="relative w-full flex justify-center h-screen">
        {/* Content container */}
        <div className="relative w-[288px] h-[600px]">
          {/* Scrollable content */}
          <div className="absolute inset-0 pt-[0.55rem] pb-[0.59rem] px-[0.59rem]">
            <div className="rounded-[30px] bg-white overflow-hidden h-full">
              <div className="w-full h-[160px] bg-gray-300 overflow-hidden">
                {previewUrl && (
                  <Image
                    src={previewUrl}
                    alt="Cover Image"
                    width={260}
                    height={160}
                    className="object-cover w-full h-full"
                  />
                )}
              </div>

              <div className="p-4 overflow-y-auto overflow-x-hidden h-[420px] bg-white scrollbar-hide pb-10">
                <h2 className="text-base font-semibold text-[#1C1C1D] break-words">{formValues.title || 'Título'}</h2>

                <div className="flex items-center gap-2 text-xs text-[#6B7280] mt-1">
                  <div className="w-5 h-5 rounded-full bg-gray-300" />
                  <span>{session?.user.name}</span>
                  <span>•</span>
                  <span>{today}</span>
                </div>

                <div
                  className="text-base leading-[1.5] text-[#4B5563] mt-4 break-words [&_p]:m-0"
                  dangerouslySetInnerHTML={{
                    __html: (formValues.description || '<p>Descripción/Mensaje</p>').replace(
                      /<p><\/p>/g,
                      '<p><br></p>'
                    ),
                  }}
                />

                {formValues.question?.length > 0 &&
                  formValues.question.map((question: Question) => (
                    <div key={question.statement} className="mt-6">
                      <p className="text-sm font-medium text-[#1C1C1D]">{question.statement}</p>
                      {question.question_type === 'options' ? (
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                          {question?.options &&
                            question?.options?.length > 0 &&
                            question.options?.map((option) => (
                              <label key={option.value} className="flex items-center gap-2">
                                <input type="radio" name="asistencia" />
                                <span>{option.value}</span>
                              </label>
                            ))}
                        </div>
                      ) : (
                        <p>{question.open}</p>
                      )}
                    </div>
                  ))}

                {formValues.files_list &&
                  formValues.files_list.map((file: File) => (
                    <div key={file.name} className="flex items-center gap-3 bg-[#F9FAFB] p-3 rounded-md mt-6">
                      <File className="w-6 h-6 text-red-500" />
                      <div>
                        <p className="text-sm font-medium text-[#1C1C1D]">{file.name}</p>
                        <p className="text-xs text-[#6B7280]">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Mobile device overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <Image
              src="/assets/mobile_device.svg"
              alt="Mobile Device Frame"
              width={288}
              height={600}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default AnnouncementPrevisualization;
