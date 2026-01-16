import { useToggle } from '@cometa/hooks';
import { cn } from '@cometa/utils';
import { ChevronRightIcon, XIcon } from 'lucide-react';
import Sheet from '/src/components/atoms/Sheet';
import { useContentScroll } from '../DynamicForms';
import { Admission, AdmissionCheckList, AdmissionInfo } from './InfoSection';
import { api } from '/src/utils/api';

export function AdmissionSection({ studentLeadId }: { studentLeadId: string }) {
  const { toggle: isOpen, onOpen, onClose } = useToggle();
  const { showShadow, targetRef } = useContentScroll();

  const { data: studentLead } = api.admissions.getAdmissionDetail.useQuery({ admissionId: studentLeadId });

  return (
    <>
      <div
        className="bg-white border border-[#E4EBF6] rounded-xl px-8 py-6 flex justify-between items-center hover:cursor-pointer"
        onClick={onOpen}
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-[#1C1C1D] font-bold text-lg">Historial de admisión</h2>
          <p className="text-#3E4559 text-sm">Consulta los detalles de salud registrados para el estudiante.</p>
        </div>

        <span className="text-[#00AB55] flex items-center gap-3 text-sm font-bold">
          Ver información <ChevronRightIcon className="w-5" />
        </span>
      </div>

      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <Sheet.Content className="max-h-[calc(100vh-16px)] h-full max-w-4xl w-full m-2 rounded-2xl font-lota antialiased overflow-hidden shadow-[0px_20px_40px_-4px_rgba(145,158,171,0.16)]">
          <div
            className={cn(
              'flex items-center justify-between bg-white border-b border-[#D5DEED] px-8 py-5 sticky top-0',
              { 'shadow-[0px_20px_40px_-4px_rgba(145,158,171,0.16)]': showShadow }
            )}
          >
            <h3 className="text-[#454D64] font-bold text-lg">Historial de admisión</h3>

            <span onClick={onClose} className="px-1.5 py-1 hover:cursor-pointer hover:bg-[#F0F0F0] rounded-full">
              <XIcon className="text-[#98A2B3] w-5" />
            </span>
          </div>

          <div className="bg-[#FBFCFD] overflow-y-auto">
            <div className="h-1" ref={targetRef} />
            <div className="grid grid-cols-5 gap-6 px-8 py-7">
              <div className="flex flex-col gap-6 col-span-3">
                <Admission studentLead={studentLead} />
                <AdmissionInfo studentLead={studentLead} />
              </div>
              <div className="col-span-2">
                <AdmissionCheckList studentLead={studentLead} />
              </div>
            </div>
          </div>
        </Sheet.Content>
      </Sheet>
    </>
  );
}
