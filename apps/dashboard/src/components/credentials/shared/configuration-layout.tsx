import { Button } from '@cometa/recreo/v2';

type ConfigurationLayoutProps = {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  leftColumnWidth?: string;
  rightColumnWidth?: string;
  footer?: {
    buttonLabel: string;
    buttonAction: () => void;
    disabled?: boolean;
    warningMessage?: string;
  };
  showPreviewHeader?: boolean;
  mockupWrapper?: (children: React.ReactNode) => React.ReactNode;
};

export function ConfigurationLayout({
  leftContent,
  rightContent,
  leftColumnWidth = 'min-w-[544px] max-w-[40%]',
  rightColumnWidth,
  footer,
  showPreviewHeader = false,
  mockupWrapper,
}: ConfigurationLayoutProps) {
  const wrappedRightContent = mockupWrapper ? mockupWrapper(rightContent) : rightContent;
  const rightColumnClass = rightColumnWidth || 'flex-1';

  return (
    <div className="flex h-full">
      <div className={`${leftColumnWidth} flex-shrink-0 bg-white flex flex-col h-full`}>
        <div className="flex-1 overflow-y-auto px-14 py-16 space-y-10">{leftContent}</div>

        {footer ? (
          <div className="flex-shrink-0 border-t border-neutral-100 px-8 py-4 bg-white shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_-12px_24px_-4px_rgba(145,158,171,0.12)]">
            <div className="flex items-center justify-between gap-4">
              {footer.warningMessage ? <p className="text-sm text-neutral-700">{footer.warningMessage}</p> : <div />}
              <Button className="w-[154px] h-[36px] bg-black" onClick={footer.buttonAction} disabled={footer.disabled}>
                {footer.buttonLabel}
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <div
        className={`${rightColumnClass} bg-neutral-25 flex flex-col items-center justify-center gap-5 overflow-y-auto`}
      >
        {showPreviewHeader ? (
          <div className="w-full flex items-center justify-end px-7 pt-6">
            <p className="text-lg font-semibold text-neutral-300">Vista previa</p>
          </div>
        ) : null}
        {wrappedRightContent}
      </div>
    </div>
  );
}
