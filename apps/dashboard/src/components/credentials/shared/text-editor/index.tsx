import { useEffect } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { cn } from '@cometa/utils';
import { TextEditorToolbar } from './text-editor-toolbar';
import { TextEditorContent } from './text-editor-content';
import './text-editor.css';

type TextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
};

export function TextEditor({ value, onChange, disabled = false, className = '' }: TextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editable: !disabled,
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value) {
      const currentHTML = editor.getHTML();
      if (value !== currentHTML) {
        editor.commands.setContent(value || '');
      }
    }
  }, [value, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div
      className={cn(
        'credential-text-editor border border-[#bac1d8] border-solid box-border content-stretch flex flex-col h-[120px] items-center justify-start pb-[12px] pt-0 px-0 relative rounded-[6px] shrink-0 w-full',
        className
      )}
    >
      <TextEditorToolbar editor={editor} />
      <TextEditorContent editor={editor} />
    </div>
  );
}
