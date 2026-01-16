import { DashboardStudentDetail } from '@cometa/trpc';
import { useSession } from 'next-auth/react';
import OrderTableForAssignments from '../OrderTableForAssignments';
import TabsTablesScholarships from '../TabsTablesScholarships';
import StudentScholarshipsTable from '/src/components/students/StudentScholarshipsTable';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { useFlagWithVariableMatching } from '/src/components/flags/FlagsProvider';
import { api } from '/src/utils/api';

export function ConceptAndScholarshipSection({ student }: { student?: DashboardStudentDetail }) {
  const studentId = student?.id as string;

  const { data: session } = useSession();
  const { isEnabled: scholarshipsFlag } = useFlagWithVariableMatching('hk_scholarships');
  const selectedSchool = useSelectedSchool();

  const { data: studentMoreInfoData } = api.manualPayments.studentDetails.useQuery(
    { studentId },
    { enabled: !!studentId && !!session }
  );

  const { data: schoolCycles } = api.schools.schoolsCycles.useQuery(
    { school_id: selectedSchool?.id as string },
    {
      enabled: !!selectedSchool?.id,
      staleTime: 60 * 1000 * 60,
    }
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-2xl border border-[#E4EBF6]">
        <OrderTableForAssignments studentId={studentId} student={student} />
      </div>
      <div className="bg-white rounded-2xl border border-[#E4EBF6]">
        {scholarshipsFlag ? (
          <StudentScholarshipsTable student={studentMoreInfoData} schoolCycles={schoolCycles ?? []} />
        ) : (
          <TabsTablesScholarships student={studentMoreInfoData} />
        )}
      </div>
    </div>
  );
}
