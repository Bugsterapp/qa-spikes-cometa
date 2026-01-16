import { ReactNode } from 'react';
import SidebarHeader from '../../../molecules/dashboard/SidebarHeader';
import { InfoAlert } from './InfoAlert';
import { LoadingSpinner } from './LoadingSpinner';
import { FormActions } from './FormActions';
import { FORM_STYLES } from '../../../../constants/legalDocuments';

type BaseLegalDocumentFormProps = {
  title: string;
  onClose: () => void;
  isLoading?: boolean;
  onSubmit: (e: React.FormEvent) => void;
  children: ReactNode;
  info?: string;
  cancelText?: string;
  submitText?: string;
  loadingText?: string;
};

export function BaseLegalDocumentForm({
  title,
  onClose,
  isLoading = false,
  onSubmit,
  children,
  info,
  cancelText,
  submitText,
  loadingText,
}: Readonly<BaseLegalDocumentFormProps>) {
  return (
    <div className="flex flex-col h-full">
      <SidebarHeader
        title={title}
        onClose={onClose}
        boxClassName="border-b border-[#d0d8e9] px-8 py-4 rounded-tl-[8px] rounded-tr-[8px] shrink-0"
        titleClassName="text-[#22283a] text-[18px] font-semibold mr-2"
      />

      <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto px-8">
          <div className="flex flex-col gap-8 mb-6 pt-8">
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <div className={FORM_STYLES.formContainer}>
                {info && <InfoAlert>{info}</InfoAlert>}
                {children}
              </div>
            )}
          </div>
        </div>

        <FormActions
          onCancel={onClose}
          isLoading={isLoading}
          cancelText={cancelText}
          submitText={submitText}
          loadingText={loadingText}
        />
      </form>
    </div>
  );
}
