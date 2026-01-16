import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Typography from '@tiptap/extension-typography';
import Emoji from '@tiptap/extension-emoji';
import AssistantAIButton from './AssistantAIButton';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { EmojiPicker } from './EmojiPicker';
import { FieldErrors, useFormContext } from 'react-hook-form';
import { TypeSchema } from '/src/components/announcements/announcement-creation-drawer';
import { cn } from '/src/utils/cn';
import { useSendEvent } from '/src/hooks/useSendEvent';
import { TrackEvents } from '/src/constants/events';

// Custom styles for the editor
const editorStyles = `
  .ProseMirror {
    outline: none;
    border: none;
    padding: 0;
    margin: 0;
    font-family: 'Lota Grotesque', sans-serif;
    font-size: 16px;
    line-height: 1.5;
    color: #212b36;
    min-height: 65px;
    width: 100%;
  }
  
  .ProseMirror:focus {
    outline: none;
  }
  
  .ProseMirror p {
    margin: 0;
    padding: 0;
  }
  
  .ProseMirror p:first-child {
    margin-top: 0;
  }
  
  .ProseMirror p:last-child {
    margin-bottom: 0;
  }
  
  .ProseMirror [data-placeholder]::before {
    content: '';
    color: #697086;
    opacity: 0.5;
    pointer-events: none;
  }
`;

// Using Lucide React icons instead of SVG assets

interface MessageDescriptionInputProps {
  message?: string;
  isImproving: boolean;
  isGenerating: boolean;
  isRateLimited: boolean;
  formErrors: FieldErrors<TypeSchema>;
  setMessage: (value: string) => void;
  handleImproveText: () => void;
  handleGenerateText: () => void;
  handleSummarizeText: () => void;
}

const MessageDescriptionInput: FC<MessageDescriptionInputProps> = ({
  isImproving,
  isGenerating,
  isRateLimited,
  formErrors,
  message,
  setMessage,
  handleImproveText,
  handleGenerateText,
  handleSummarizeText,
}) => {
  const { register } = useFormContext();
  const sendEvent = useSendEvent();
  const [isTooltipClosed, setIsTooltipClosed] = useState(false);
  const extensions = [
    StarterKit,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Typography,
    Emoji.configure({
      enableEmoticons: true,
    }),
  ];

  const editor = useEditor({
    extensions,
    content: message || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setMessage(html);
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && message) {
      const currentHTML = editor.getHTML();
      if (message !== currentHTML) {
        editor?.commands?.setContent(message || '');
      }
    }
  }, [message]);

  // Reset tooltip closed state when rate limit status changes
  useEffect(() => {
    if (isRateLimited) {
      setIsTooltipClosed(false);
    }
  }, [isRateLimited]);

  const handleEmojiSelect = (emoji: string) => {
    if (editor) {
      editor.chain().focus().insertContent(emoji).run();
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <>
      <style>{editorStyles}</style>
      <div className="box-border content-stretch flex flex-col gap-1 items-start justify-start p-0 relative size-full">
        {/* Labels */}
        <div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start p-0 relative shrink-0 w-full">
          <div className="basis-0 flex flex-col font-lota grow justify-center leading-0 min-h-px min-w-px not-italic relative shrink-0 text-[#444c60] text-[16px] text-left">
            <p className="block leading-normal">Descripción/Mensaje</p>
          </div>
        </div>

        {/* Input field */}
        <div className="box-border content-stretch flex flex-col gap-[13px] items-start justify-start p-0 relative shrink-0 w-full">
          <div
            className={`box-border content-stretch flex flex-col min-h-[120px] items-center justify-start pb-3 pt-0 px-0 relative rounded-md shrink-0 w-full transition-all duration-200 ${
              editor.isFocused ? 'ring-2 ring-galaxy-500' : ''
            }`}
          >
            <div className="absolute border border-[#bac1d8] border-solid inset-0 pointer-events-none rounded-md" />

            {/* Toolbar */}
            <div className="h-10 relative shrink-0 w-full border-b border-[#bac1d8]">
              <div className="h-10 overflow-clip relative w-full">
                <div className="absolute box-border content-stretch flex flex-row gap-4 h-[43px] items-center justify-start left-4 p-0 -top-px">
                  <div className="box-border content-stretch flex flex-row gap-[10.389px] items-center justify-start p-0 relative shrink-0">
                    {/* Bold button */}
                    <button
                      type="button"
                      onClick={() => {
                        sendEvent(TrackEvents.announcements.boldTextClicked);
                        editor.chain().focus().toggleBold().run();
                      }}
                      className={cn(
                        'relative shrink-0 flex items-center justify-center hover:opacity-100 transition-opacity',
                        editor.isActive('bold') ? 'opacity-100' : 'opacity-60'
                      )}
                    >
                      <Bold className="w-3 h-3" />
                    </button>

                    {/* Italic button */}
                    <button
                      type="button"
                      onClick={() => {
                        sendEvent(TrackEvents.announcements.italicTextClicked);
                        editor.chain().focus().toggleItalic().run();
                      }}
                      className={cn(
                        'relative shrink-0 flex items-center justify-center hover:opacity-100 transition-opacity',
                        editor.isActive('italic') ? 'opacity-100' : 'opacity-60'
                      )}
                    >
                      <Italic className="w-3 h-3" />
                    </button>

                    {/* Emoji picker */}
                    <EmojiPicker
                      onEmojiSelect={(emoji) => {
                        sendEvent(TrackEvents.announcements.emojiClicked);
                        handleEmojiSelect(emoji);
                      }}
                    />
                  </div>

                  {/* Separator */}
                  <div className="flex h-[0px] items-center justify-center relative shrink-0 w-[0px]">
                    <div className="flex-none rotate-[270deg]">
                      <div className="h-0 relative w-[49px]">
                        <div className="absolute bottom-0 left-0 right-0 top-[-1px] border-b border-[#bac1d8]" />
                      </div>
                    </div>
                  </div>

                  {/* Alignment buttons */}
                  <div className="box-border content-stretch flex flex-row gap-[12.302px] items-start justify-start p-0 relative shrink-0">
                    {/* Align Left */}
                    <button
                      type="button"
                      onClick={() => {
                        sendEvent(TrackEvents.announcements.leftTextClicked);
                        editor.chain().focus().setTextAlign('left').run();
                      }}
                      className={cn(
                        'relative shrink-0 flex items-center justify-center  hover:opacity-100 transition-opacity',
                        editor.isActive({ textAlign: 'left' }) ? 'opacity-100' : 'opacity-60'
                      )}
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>

                    {/* Align Center */}
                    <button
                      type="button"
                      onClick={() => {
                        sendEvent(TrackEvents.announcements.centerTextClicked);
                        editor.chain().focus().setTextAlign('center').run();
                      }}
                      className={cn(
                        'relative shrink-0 flex items-center justify-center  hover:opacity-100 transition-opacity',
                        editor.isActive({ textAlign: 'center' }) ? 'opacity-100' : 'opacity-60'
                      )}
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                    </button>

                    {/* Align Right */}
                    <button
                      type="button"
                      onClick={() => {
                        sendEvent(TrackEvents.announcements.rightTextClicked);
                        editor.chain().focus().setTextAlign('right').run();
                      }}
                      className={cn(
                        'relative shrink-0 flex items-center justify-center  hover:opacity-100 transition-opacity',
                        editor.isActive({ textAlign: 'right' }) ? 'opacity-100' : 'opacity-60'
                      )}
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Editor Content */}
            <div className="relative flex-1 w-full min-h-[65px]">
              <div className="flex flex-row items-start relative size-full">
                <div className="box-border content-stretch flex flex-row gap-2.5 items-start justify-start pb-0 pt-2.5 px-4 relative w-full h-full">
                  <div className="basis-0 flex flex-col grow h-full min-h-px min-w-px relative shrink-0">
                    <EditorContent
                      editor={editor}
                      className="w-full h-full focus:outline-none pb-9"
                      onClick={() => sendEvent(TrackEvents.announcements.editBodyClicked)}
                    />
                    <input type="hidden" {...register('description')} value={message} />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Assistant Button */}
            <div className="absolute bg-[#f8f9fb] box-border content-stretch flex flex-row gap-2.5 items-center justify-center right-4 bottom-2 overflow-visible px-4 py-1.5 rounded-[100px] w-[34px] h-[34px]">
              <div className="absolute left-[5px] size-6 top-1">
                <div className="relative">
                  <div
                    onClick={() => {
                      if (isRateLimited && !isTooltipClosed) {
                        setIsTooltipClosed(true);
                      }
                    }}
                  >
                    <AssistantAIButton
                      isLoading={isImproving || isGenerating}
                      handleGenerateText={handleGenerateText}
                      handleImproveText={handleImproveText}
                      handleSummarizeText={handleSummarizeText}
                    />
                  </div>
                  {isRateLimited && !isTooltipClosed && (
                    <div className="absolute bottom-full right-0 mb-2 z-50">
                      <div className="w-[230px] rounded-md text-white text-xs text-center bg-[#212B36] px-2 py-1.5">
                        <p>
                          Alcanzaste el límite de usos de IA. Para acceder a mas créditos contáctese con el equipo de
                          soporte.
                        </p>
                        <div className="absolute top-full right-2 h-2 w-2 bg-[#212B36] rotate-45 -translate-y-1 rounded-[2px]" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {formErrors.description && (
          <p className="mt-2 text-xs text-red-500">{String(formErrors.description.message)}</p>
        )}
      </div>
    </>
  );
};

export default MessageDescriptionInput;
