import { useFieldArray } from 'react-hook-form';
import { Trash2 } from 'lucide-react';
import { useSendEvent } from '/src/hooks/useSendEvent';
import { TrackEvents } from '/src/constants/events';

const OptionsInputGroup = ({ nestIndex, register, control, errors }: any) => {
  const sendEvent = useSendEvent();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `question.${nestIndex}.options`,
  });

  return (
    <div className="space-y-5 mb-7">
      {fields.map((field, i) => (
        <div key={field.id + i} className="flex items-center gap-2">
          <div className="flex-1 w-full">
            <input
              {...register(`question.${nestIndex}.options.${i}.value`, {
                onChange: () => sendEvent(TrackEvents.announcements.questionOptionEdited),
              })}
              placeholder={`Opción ${i + 1}`}
              className=" w-full border rounded-md px-4 py-3 text-sm  focus:outline-none focus:ring-2 focus:ring-galaxy-500 focus:border-galaxy-500"
              onClick={() => sendEvent(TrackEvents.announcements.questionOptionFieldClicked)}
            />
            {errors?.[i] && <p className="mt-2 text-xs text-red-500">{errors?.[i].value?.message}</p>}
          </div>
          {fields.length > 2 && (
            <button type="button" onClick={() => remove(i)} className="text-gray-400 hover:text-red-500 transition">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}

      {fields.length < 5 && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            sendEvent(TrackEvents.announcements.questionOptionAddClicked);
            append({ value: '' });
          }}
          className="flex items-center gap-2 text-galaxy-500 font-medium text-sm hover:underline"
        >
          <span className="w-4 h-4 rounded-full bg-galaxy-500 text-white flex items-center justify-center text-base font-bold">
            +
          </span>
          Agregar opción
        </button>
      )}
    </div>
  );
};

export default OptionsInputGroup;
