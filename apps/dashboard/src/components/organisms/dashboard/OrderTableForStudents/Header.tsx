import Header from '../../../molecules/dashboard/Header';
import GuardianSelector from '../GuardianSelector';
import StudentSelector from '../StudentSelector';
import { DELINQUENCY_STATUS } from '/src/utils/general';
import IcPlus from '/public/assets/icons/ic_plus.svg';
import { useGetPermissions } from '/src/guards/AuthGuard';
import { Guardian } from '../OrderTableForPayins';
import { Student } from '/types/paid-orders';
import SelectTw from '/src/components/Select';
import { useSendTrackEvent } from '@cometa/utils';
import { useSession } from 'next-auth/react';
import InvoiceChip from '/src/components/atoms/Chip';

interface HeaderTableProps {
  title: string;
  selectedGuardian: Guardian | null;
  setSelectedGuardian: (value: Guardian) => void;
  selectedStudent: Student | null;
  setSelectedStudent: (value: Student) => void;
  selectedLevel: string;
  setSelectedLevel: (value: any) => void;
  selectedSection: string;
  setSelectedSection: (value: any) => void;
  selectedDelinquency: string;
  setSelectedDelinquency: (value: any) => void;
  onOpen: () => void;
  levelsData: any;
  sectionsData: any;
  studentsData: any;
  setSearchStudent: (value: string) => void;
  searchStudent: string;
  getStudentsOnSchool: () => void;
  loadingStudents: boolean;
  selectedSchoolCycle: any;
}

export default function HeaderTable(headerProps: HeaderTableProps) {
  const {
    title,
    selectedGuardian,
    setSelectedGuardian,
    selectedStudent,
    setSelectedStudent,
    selectedLevel,
    setSelectedLevel,
    selectedSection,
    setSelectedSection,
    selectedDelinquency,
    setSelectedDelinquency,
    onOpen,
    levelsData,
    sectionsData,
    studentsData,
    setSearchStudent,
    searchStudent,
    getStudentsOnSchool,
    loadingStudents,
    selectedSchoolCycle,
  } = headerProps;

  const permissions = useGetPermissions();
  const session = useSession();
  const sentTrackEventWithName = useSendTrackEvent();

  const handleNewStudentClick = () => {
    onOpen();
    sentTrackEventWithName('dashboard: New Student Started', session);
  };

  const parseCycle = (cycle: any) => {
    if (cycle === 'Todos') {
      return null;
    }
    if (cycle.includes('/')) {
      const numeric = cycle.split(' ')[1];
      return `${numeric.split('/')[0]}-${numeric.split('/')[1][2]}${numeric.split('/')[1][3]}`;
    } else {
      return cycle;
    }
  };

  return (
    <div className="px-12 pb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Header title={title} />
          {selectedSchoolCycle !== 'Todos' ? (
            <div className="mb-2">
              <InvoiceChip intent="darkInfo">{parseCycle(selectedSchoolCycle?.name)}</InvoiceChip>
            </div>
          ) : null}
        </div>
        {permissions?.can_add_student ? (
          <button
            className="text-white hover:cursor-pointer bg-[#00AB55] font-bold text-sm flex items-center justify-center cursor-pointer whitespace-nowrap outline-none rounded-lg px-4 py-2"
            onClick={handleNewStudentClick}
          >
            <IcPlus fill="currentColor" />
            <label className="ml-3 hover:cursor-pointer">Nuevo estudiante</label>
          </button>
        ) : null}
      </div>
      <div className="grid items-center justify-between grid-cols-3 gap-12 mt-2 mb-5">
        <div>
          <SelectTw
            placeholder="Nivel"
            className="w-full"
            value={selectedLevel}
            onValueChange={(val) => setSelectedLevel(val)}
          >
            <SelectTw.Content className="flex flex-col overflow-hidden rounded-lg min-w-[280px] max-w-[330px]">
              <SelectTw.Item key="sin asignar" value="null">
                Sin asignar
              </SelectTw.Item>
              <SelectTw.Item value="all">Todos</SelectTw.Item>
              {levelsData?.map((option: any) => (
                <SelectTw.Item key={option.id} value={option.id}>
                  {option.name}
                </SelectTw.Item>
              ))}
            </SelectTw.Content>
          </SelectTw>
        </div>
        <div>
          <SelectTw
            placeholder="Sección"
            className="w-full"
            value={selectedSection}
            onValueChange={(val) => setSelectedSection(val)}
          >
            <SelectTw.Content className="flex flex-col overflow-hidden rounded-lg min-w-[280px] max-w-[330px]">
              <SelectTw.Item key="sin asignar" value="null">
                Sin asignar
              </SelectTw.Item>
              <SelectTw.Item value="all">Todos</SelectTw.Item>
              {sectionsData?.map((option: any) => (
                <SelectTw.Item key={option.id} value={option.id}>
                  {option.name}
                </SelectTw.Item>
              ))}
            </SelectTw.Content>
          </SelectTw>
        </div>
        <div>
          <SelectTw
            placeholder="Colegiaturas vencidas"
            className="w-full"
            value={selectedDelinquency}
            onValueChange={(val) => setSelectedDelinquency(val)}
          >
            <SelectTw.Content className="flex flex-col overflow-hidden rounded-lg min-w-[280px] max-w-[330px]">
              <SelectTw.Item value="all">Todos</SelectTw.Item>
              {DELINQUENCY_STATUS?.map((option) => (
                <SelectTw.Item key={option.id} value={option.id}>
                  {option.label}
                </SelectTw.Item>
              ))}
            </SelectTw.Content>
          </SelectTw>
        </div>
      </div>
      <div className="grid items-center justify-between grid-cols-3 gap-12 mt-2 mb-5">
        <div className="w-full">
          <GuardianSelector
            placeholder="Buscar por tutor"
            selectedGuardian={selectedGuardian}
            setSelectedGuardian={setSelectedGuardian}
            width="100%"
          />
        </div>
        <div className="w-full">
          <StudentSelector
            placeholder="Buscar por alumno/matricula"
            selectedStudent={selectedStudent}
            setSelectedStudent={setSelectedStudent}
            width="100%"
            students={studentsData || []}
            setSearchStudent={setSearchStudent}
            searchStudent={searchStudent}
            getStudentsOnSchool={getStudentsOnSchool}
            loading={loadingStudents}
          />
        </div>
      </div>
    </div>
  );
}
