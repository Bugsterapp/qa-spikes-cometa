import type { Editor } from '@tiptap/react';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { TextEditorButton } from './text-editor-button';

type TextEditorToolbarProps = {
  editor: Editor;
};

export function TextEditorToolbar({ editor }: TextEditorToolbarProps) {
  return (
    <div className="h-[42px] relative shrink-0 w-full border-b border-[#bac1d8]">
      <div className="h-[42px] overflow-clip relative w-full">
        <div className="absolute box-border content-stretch flex flex-row gap-4 h-[43px] items-center justify-start left-[21px] p-0 -top-px">
          <div className="box-border content-stretch flex flex-row gap-[10.389px] items-center justify-start p-0 relative shrink-0">
            <TextEditorButton
              icon={Bold}
              isActive={editor.isActive('bold')}
              onClick={() => editor.chain().focus().toggleBold().run()}
            />

            <TextEditorButton
              icon={Italic}
              isActive={editor.isActive('italic')}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            />
          </div>

          <div className="flex h-[0px] items-center justify-center relative shrink-0 w-[0px]">
            <div className="flex-none rotate-[270deg]">
              <div className="h-0 relative w-[49px]">
                <div className="absolute bottom-0 left-0 right-0 top-[-1px] border-b border-[#bac1d8]" />
              </div>
            </div>
          </div>

          <div className="box-border content-stretch flex flex-row gap-[12.302px] items-start justify-start p-0 relative shrink-0">
            <TextEditorButton
              icon={AlignLeft}
              isActive={editor.isActive({ textAlign: 'left' })}
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
            />

            <TextEditorButton
              icon={AlignCenter}
              isActive={editor.isActive({ textAlign: 'center' })}
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
            />

            <TextEditorButton
              icon={AlignRight}
              isActive={editor.isActive({ textAlign: 'right' })}
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
