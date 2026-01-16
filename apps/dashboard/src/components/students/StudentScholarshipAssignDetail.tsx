import { AvailableScholarshipDetail, DashboardStudent } from '@cometa/trpc/src/types';
import { ScholarshipResumeDetail } from '/src/components/molecules/dashboard/ScholarshipResumeDetail';
import { FormValuesScholarship } from '/src/components/organisms/dashboard/TabsTablesScholarships';
import { useState } from 'react';
import SidebarActions from '/src/components/atoms/SidebarActions';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { Events } from '/src/constants/events';
import SchoolCycleAndDurationDetail from '../organisms/dashboard/SchoolCycleAndDurationDetail';

export function StudentScholarshipAssignDetail({
  scholarship,
  student,
  data,
  onBack,
  onAssign,
  isLoading,
}: {
  scholarship?: AvailableScholarshipDetail;
  onClose: () => void;
  onBack: () => void;
  onAssign: () => void;
  data?: FormValuesScholarship;
  student?: DashboardStudent;
  isLoading: boolean;
}) {
  const [showConceptAffected, setShowConceptAffected] = useState<string | undefined>();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return `${new Intl.DateTimeFormat('es-ES', options).format(date)}`;
  };

  const groupedAffectedConcepts = data?.cycles.map((cycle) => ({
    school_cycle: cycle.school_cycle,
    school_cycle_name: cycle.school_cycle_name,
    date_ranges: cycle.dates,
    need_ranges: cycle.needRanges || false,
    affected_concepts: scholarship?.affected_concepts.filter((concept) => concept.school_cycle === cycle.school_cycle),
  }));

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="mb-3 flex flex-col text-[#454D64]">
          <label className="text-base font-semibold">Resumen</label>
          <label className="text-sm">
            Revisa y verifica que la información ingresada es la correcta antes de continuar.
          </label>
        </div>
        <ScholarshipResumeDetail scholarship={scholarship} student={student} />
        <SchoolCycleAndDurationDetail
          groupedAffectedConcepts={groupedAffectedConcepts}
          showConceptAffected={showConceptAffected}
          setShowConceptAffected={setShowConceptAffected}
          className="my-7"
          isAssignment
          formatDate={formatDate}
        />
      </div>
      <SidebarActions>
        <button
          className="bg-[#FAFBFF] px-20 py-3 text-green-400 hover:text-green-500 text-base font-bold disabled:bg-[#919EAB3D] disabled:text-[#919EABCC] rounded-lg"
          disabled={isLoading}
          onClick={() => {
            sendTrackEventWithUserName(Events.scholarship_click_cancel);
            onBack();
          }}
        >
          Volver
        </button>
        <button
          className="text-white text-base font-bold px-20 py-3 rounded-lg bg-[#00AB55] hover:bg-green-500 disabled:bg-[#919EAB3D] disabled:text-[#919EABCC] whitespace-nowrap"
          disabled={isLoading}
          onClick={() => {
            sendTrackEventWithUserName(Events.scholarship_click_assign);
            onAssign();
          }}
        >
          {isLoading ? 'Asignando...' : 'Asignar'}
        </button>
      </SidebarActions>
    </div>
  );
}
