import type { Editor } from '@tiptap/react';
import { EditorContent } from '@tiptap/react';

type TextEditorContentProps = {
  editor: Editor;
};

export function TextEditorContent({ editor }: TextEditorContentProps) {
  return (
    <div className="box-border content-stretch flex flex-row gap-[10px] items-start justify-start pb-0 pt-[10px] px-[16px] relative shrink-0 w-full">
      <div className="basis-0 flex flex-col grow min-h-[65px] min-w-px relative shrink-0">
        <EditorContent editor={editor} className="w-full h-full focus:outline-none" />
      </div>
    </div>
  );
}
