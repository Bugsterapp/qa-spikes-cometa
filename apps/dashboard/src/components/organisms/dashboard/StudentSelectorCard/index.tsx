import { cn } from '/src/utils/cn';
import { BillingStudent } from '@cometa/trpc/src/types';

interface StudentSelectorCardProps {
  students: BillingStudent[];
  selectedStudent: any;
  setSelectedStudent: (student: any) => void;
}

export default function StudentSelectorCard(props: StudentSelectorCardProps) {
  const { students, selectedStudent, setSelectedStudent } = props;

  const selectItem = (student: BillingStudent) => {
    setSelectedStudent(selectedStudent && student.id === selectedStudent.id ? null : student);
  };

  return (
    <div className="flex flex-row flex-wrap gap-2">
      {students?.map((student) => (
        <section
          className={cn(
            'w-[228px] min-h-fit h-[132px] border border-[#919EAB52] mr-6 bg-withe rounded-lg cursor-pointer p-5',
            {
              'border border-[#3366FF] bg-[#3366FF] bg-opacity-5': selectedStudent?.id === student.id,
            }
          )}
          onClick={() => selectItem(student)}
          key={student.id}
        >
          <div className="flex flex-col">
            <label className="text-sm font-semibold">
              {student.first_name} {student.last_name}
            </label>
            <label className="text-xs font-normal mt-[10px]">Matrícula: {student.enrollment_code}</label>
            <label className="mt-1 text-xs font-normal">Sección: {student.section}</label>
          </div>
        </section>
      ))}
    </div>
  );
}
