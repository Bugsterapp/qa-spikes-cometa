import { buildStyles, CircularProgressbarWithChildren } from 'react-circular-progressbar';

import { useSelectedSchool } from '/src/guards/AuthGuard';
import { api } from '/src/utils/api';

import { AnimatedCounter } from '../atoms/AnimatedCounter';
import BoxTooltip from '../atoms/BoxTooltip';
import InvoiceChip from '../atoms/Chip';
import type { SchoolCycleEntity } from '@cometa/trpc/src/students/types-mapping';

interface StudentInscriptionsSummaryProps {
  selectedSchoolCycle: SchoolCycleEntity | null;
}

function StudentInscriptionsSummary({ selectedSchoolCycle }: StudentInscriptionsSummaryProps) {
  const selectedSchool = useSelectedSchool();

  const { data: inscriptionsSummary } = api.students.studentsInscriptionsSummary.useQuery(
    {
      schoolId: selectedSchool?.id as string,
      schoolCycleId: selectedSchoolCycle?.id ?? '',
    },
    { enabled: !!selectedSchool?.id && !!selectedSchoolCycle }
  );

  const pendingStudents =
    (inscriptionsSummary?.new_registered_denominator ?? 0) - (inscriptionsSummary?.new_registered ?? 0);

  const remainingStudents =
    (inscriptionsSummary?.re_registered_students_denominator ?? 0) -
    (inscriptionsSummary?.re_registered_students_count ?? 0);
  const enrolledPercent = (() => {
    const count = inscriptionsSummary?.re_registered_students_count ?? 0;
    const denominator = inscriptionsSummary?.re_registered_students_denominator;
    if (typeof denominator !== 'number' || denominator === 0) return 0;
    const percentage = (count / denominator) * 100;
    return Number.isFinite(percentage) ? percentage : 0;
  })();

  const parseBigPercentage = enrolledPercent > 95 && enrolledPercent !== 100 ? 95 : enrolledPercent;

  return (
    <>
      <div className="flex items-center gap-2">
        <h4 className="font-bold text-[24px]">Inscripciones</h4>
        {inscriptionsSummary?.school_cycle != '' && (
          <div>
            <InvoiceChip intent="darkInfo">{inscriptionsSummary?.school_cycle}</InvoiceChip>
          </div>
        )}
      </div>
      <div className="grid grid-cols-4 gap-8 mt-8 max-h-[199px] min-w-[1000px]">
        <div className="col-span-2">
          <BoxTooltip
            title="Estudiantes reinscritos"
            tooltipText="Son los estudiantes “Activos” que han pagado la inscripción."
          >
            <div className="relative">
              <div className="flex items-center gap-8 flex-nowrap">
                <div className="text-[#919EAB] font-bold text-[24px] items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-[#637381] text-[48px]">
                      <AnimatedCounter from={0} to={inscriptionsSummary?.re_registered_students_count || 0} />
                    </span>
                    <span className="text-[24px] mt-3">de</span>
                    <span className="mt-3">{inscriptionsSummary?.re_registered_students_denominator || 0}</span>
                  </div>
                </div>
                <div className="max-w-[131px] max-h-[131px] absolute -top-[34px] right-6">
                  <CircularProgressbarWithChildren
                    value={parseBigPercentage}
                    styles={buildStyles({
                      pathColor: '#00AB55',
                      textColor: '#637381',
                      trailColor: '#919EAB3D',
                      textSize: '20px',
                      pathTransitionDuration: 2,
                      strokeLinecap: 'round',
                    })}
                    strokeWidth={11}
                  >
                    <span className="flex items-center justify-center text-base font-semibold text-[#637381]">
                      Total
                    </span>
                    <div className="flex flex-col text-[#637381] items-center justify-center">
                      <h4 className="text-[24px] font-bold">
                        <AnimatedCounter from={0} to={enrolledPercent} />%
                      </h4>
                    </div>
                  </CircularProgressbarWithChildren>
                </div>
              </div>
              <span className="pl-1 text-sm font-semibold text-[#919EAB]">
                {remainingStudents} estudiantes restantes
              </span>
            </div>
          </BoxTooltip>
        </div>
        <BoxTooltip title="Nuevos inscritos" tooltipText="Son los nuevos estudiantes que han pagado su inscripción.">
          <div>
            <div className="text-[#919EAB] font-bold text-[24px] flex-nowrap">
              <span className="text-[#637381] text-[48px]">
                <AnimatedCounter from={0} to={inscriptionsSummary?.new_registered || 0} />
              </span>
              de <span>{inscriptionsSummary?.new_registered_denominator || 0}</span>
            </div>
            <span className="pl-1 text-sm font-semibold text-[#919EAB]">{pendingStudents} pendientes</span>
          </div>
        </BoxTooltip>
        <BoxTooltip title="Total" tooltipText="Es el total que estudiantes que han pagado su inscripción." border>
          <div className="text-[#919EAB] font-bold text-[24px] flex-nowrap">
            <span className="text-[#637381] text-[48px] font-bold">
              <AnimatedCounter from={0} to={inscriptionsSummary?.next_cycle_count || 0} />
            </span>
          </div>
          <span className="pl-1 text-sm font-semibold text-[#919EAB]">Estudiantes inscritos</span>
        </BoxTooltip>
      </div>
      <span className="block h-[1px] w-full bg-[#919EAB3D] mt-8" />
    </>
  );
}

export default StudentInscriptionsSummary;
