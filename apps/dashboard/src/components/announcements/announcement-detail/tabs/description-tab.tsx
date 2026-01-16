import React from 'react';
import { QuestionDTO, QuestionOption } from '@cometa/trpc/src/announcements/types';

interface AnnouncementFile {
  id: string;
  name: string;
  size: string;
  type: any;
}

interface DescriptionTabProps {
  dataAnnouncementDetail: any;
  files: AnnouncementFile[];
  handleFileRemove: (fileId: string) => void;
}

export default function DescriptionTab({ dataAnnouncementDetail, files, handleFileRemove }: DescriptionTabProps) {
  const coverImageUrl = dataAnnouncementDetail?.cover_image_detail?.url || dataAnnouncementDetail?.cover_image?.url;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden max-w-[80%] mx-auto">
      {/* Hero Image */}
      <div className="relative bg-gray-300 max-h-[300px] h-[300px]">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={dataAnnouncementDetail.title || 'Imagen del comunicado'}
            className="w-full h-full max-h-[300px] object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">Sin imagen</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h2 className="text-xl font-bold text-[#444C60] mb-4">
          {dataAnnouncementDetail?.title || 'Título del comunicado'}
        </h2>
        <article
          className="text-[#444C60] mb-8 leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: dataAnnouncementDetail?.description || '<p>Contenido del comunicado</p>',
          }}
        />

        {/* Questions */}
        {dataAnnouncementDetail?.form?.questions?.length > 0 &&
          dataAnnouncementDetail?.form?.questions.map((question: QuestionDTO) => (
            <div key={question.statement} className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{question.statement}</h3>
              {question.question_type === 'options' ? (
                <div className="flex space-x-4">
                  {question.options?.map((option: QuestionOption) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name={`question_${question.statement}`}
                        className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option.value}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">{(question as any).open}</p>
              )}
            </div>
          ))}

        {/* Attached Files */}
        {files.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Archivos adjuntos</h3>
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{file.name}</div>
                      <div className="text-xs text-gray-500">{file.size}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleFileRemove(file.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
