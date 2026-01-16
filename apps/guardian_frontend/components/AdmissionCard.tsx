import { createContext, useContext, PropsWithChildren } from 'react';
import { StatusEnum } from '@cometa/trpc/src/admissions/types';
import { cn } from '@cometa/utils';

type StatusContextType = {
  status: StatusEnum;
};

const StatusContext = createContext<StatusContextType | undefined>(undefined);

function useStatus() {
  const context = useContext(StatusContext);
  if (!context) {
    throw new Error('useStatus must be used within a StatusProvider');
  }
  return context;
}

type AdmissionCardRootProps = PropsWithChildren<{
  status: StatusEnum;
}>;

function AdmissionCardRoot({ children, status }: AdmissionCardRootProps) {
  return (
    <StatusContext.Provider value={{ status }}>
      <div id="card_root">{children}</div>
    </StatusContext.Provider>
  );
}

function AdmissionCardStatus() {
  const { status } = useStatus();

  if (status === 'initial') return null;

  const statusLabel = {
    admitted: 'ADMITIDO',
    dropped_out: 'ABANDONO',
    not_admitted: 'NO ADMITIDO',
  };

  return (
    <div
      id="student_status"
      className={cn('w-full px-4 py-2 rounded-t-lg flex flex-col border border-[#E4EBF6] bg-[#F3F6FB]', {
        'text-[#FD6262] border-b-[#FD6262]': ['dropped_out', 'not_admitted'].includes(status),
        'text-[#28C441] border-b-[#28C441]': status === 'admitted',
      })}
    >
      <span className="font-bold text-xs">{statusLabel[status]}</span>
    </div>
  );
}

function AdmissionCardBody({ children }: PropsWithChildren) {
  const { status } = useStatus();

  return (
    <div
      id="card_body"
      className={cn('w-full bg-white py-4 border border-[#E4EBF6] rounded-lg flex flex-col mb-4', {
        'rounded-t-none': status !== 'initial',
      })}
    >
      {children}
    </div>
  );
}

type HeaderProps = {
  firstName: string;
  lastName: string;
};

function AdmissionCardHeader({ firstName, lastName }: HeaderProps) {
  return (
    <div id="card_title" className="inline-flex items-center justify-between px-4">
      <span className="font-bold text-[18px] text-[#3E4559]">
        {firstName} {lastName}
      </span>
    </div>
  );
}

function AdmissionCardContent({ children }: PropsWithChildren) {
  return (
    <div id="card_content" className="flex flex-col text-xs text-gray-300 gap-y-2 px-4">
      {children}
    </div>
  );
}

type ItemProps = {
  label: string;
};

function AdmissionCardItem({ label, children }: PropsWithChildren<ItemProps>) {
  return (
    <div id="card_item" className="justify-between flex">
      <span className="mr-1 text-xs">{label}:</span>
      <span className="text-sm text-[#1B181F]">{children}</span>
    </div>
  );
}

type FooterProps = {
  onClick?: () => void;
};

function AdmissionCardFooter({ onClick }: FooterProps) {
  const { status } = useStatus();

  if (status !== 'initial') return null;

  return (
    <button id="card_footer" className="rounded-[100px] mx-4 py-[10px] mt-5 bg-[#F3EBFF]" onClick={onClick}>
      <span className="text-[#7B35E8] font-semibold text-sm">Continuar aplicación</span>
    </button>
  );
}

export const AdmissionCard = {
  Root: AdmissionCardRoot,
  Status: AdmissionCardStatus,
  Body: AdmissionCardBody,
  Header: AdmissionCardHeader,
  Content: AdmissionCardContent,
  Item: AdmissionCardItem,
  Footer: AdmissionCardFooter,
};
