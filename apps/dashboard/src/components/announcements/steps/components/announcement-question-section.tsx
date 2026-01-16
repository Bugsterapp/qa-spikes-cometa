import OptionsInputGroup from './options-input-group';
import { Trash2 } from 'lucide-react';
import { Control, FieldArrayWithId, useFormContext, Controller } from 'react-hook-form';
import { FieldErrors } from 'react-hook-form';
import { TypeSchema as TypeSchemaForm } from '/src/components/announcements/announcement-creation-drawer';
import { RadioCard, RadioGroup } from '@cometa/recreo/v2';
import { useSendEvent } from '/src/hooks/useSendEvent';
import { TrackEvents } from '/src/constants/events';
import { useEffect } from 'react';

export interface QuestionItem {
  question_type: 'options' | 'text';
  statement: string;
  options?: { value: string }[];
  open?: string;
}

export interface TypeSchema {
  title: string;
  description: string;
  cover_image?: any;
  question?: QuestionItem[];
  files_list?: File[];
}

interface AnnouncementQuestionSectionProps {
  fields: FieldArrayWithId<TypeSchema>[];
  append: (value: Partial<QuestionItem>) => void;
  remove: (index: number) => void;
  control: Control;
  formErrors: FieldErrors<TypeSchemaForm>;
}
const AnnouncementQuestionSection = ({
  fields,
  control,
  formErrors,
  append,
  remove,
}: AnnouncementQuestionSectionProps) => {
  const { register, watch } = useFormContext<TypeSchema>();
  const sendEvent = useSendEvent();

  useEffect(() => {
    sendEvent(TrackEvents.announcements.questionBuilderViewed);
  }, []);

  return (
    <>
      {fields.length >= 1 && (
        <div className="border border-neutral-200 rounded-xl  py-5 space-y-6 bg-white relative">
          <div>
            {fields.map((field, index) => {
              const typeField = `question.${index}.question_type` as const;
              const statementField = `question.${index}.statement` as const;

              const selectedType = watch(typeField);

              return (
                <div key={field.id}>
                  <div className="border-b border-neutral-200 pb-5">
                    <div className=" flex items-center justify-between px-6">
                      <h3 className="font-semibold text-sm text-gray-800">Pregunta</h3>

                      <button
                        onClick={() => {
                          remove(index);
                        }}
                        className="text-gray-400 hover:text-red-500 transition"
                        aria-label="Eliminar pregunta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="px-6 mt-4 mb-4">
                    <label className="block text-sm text-[#535765] font-medium mb-1">Enunciado</label>
                    <input
                      {...register(statementField, {
                        onChange: () => sendEvent(TrackEvents.announcements.questionStatementEdited),
                      })}
                      type="text"
                      placeholder=""
                      className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-galaxy-500 focus:border-galaxy-500"
                      onClick={() => sendEvent(TrackEvents.announcements.questionStatementClicked)}
                    />
                    {formErrors?.question?.[index]?.statement && (
                      <p className="mt-2 text-xs text-red-500">{formErrors?.question?.[index]?.statement?.message}</p>
                    )}
                  </div>

                  <div className="px-6 mt-4 mb-6">
                    <label className="block text-sm font-medium mb-2">Tipo de respuesta</label>
                    <Controller
                      name={typeField}
                      control={control}
                      render={({ field }) => (
                        <RadioGroup
                          value={field.value}
                          onValueChange={(v) => {
                            sendEvent(TrackEvents.announcements.responseTypeSelected, {
                              responseType: v,
                            });
                            field.onChange(v);
                          }}
                          className="flex gap-4"
                        >
                          <RadioCard value="options" title="Con opciones" cardClassName="flex-1" />
                          <RadioCard value="text" title="Respuesta abierta" cardClassName="flex-1" />
                        </RadioGroup>
                      )}
                    />
                  </div>

                  <div className="px-6">
                    {selectedType === 'options' && (
                      <OptionsInputGroup
                        nestIndex={index}
                        register={register}
                        control={control}
                        errors={formErrors?.question?.[index]?.options}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="w-full bg-gray-50 border-t border-gray-200 py-4 text-center rounded-lg">
        {fields.length < 5 && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              sendEvent(TrackEvents.announcements.questionAddClicked);
              append({ question_type: 'options', statement: '', options: [{ value: '' }, { value: '' }] });
            }}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-800 hover:underline"
          >
            <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-xs">+</span>
            Agregar pregunta
          </button>
        )}
      </div>
    </>
  );
};

export default AnnouncementQuestionSection;
