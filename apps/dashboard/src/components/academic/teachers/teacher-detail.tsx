import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button } from '@cometa/recreo/v2';
import { api } from '/src/utils/api';
import { notFound } from 'next/navigation';
import { ArrowLeftIcon, ChevronRightIcon, PencilIcon, PlusIcon } from 'lucide-react';
import { ClassroomEntity, TeacherProfileEntity } from '@cometa/trpc/src/students/types';
import { EditTeacherDrawer } from './teacher-drawer';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { getClassroomNames } from '../utils';
import { UserDTO } from '@cometa/trpc';

function TeacherDetailNav() {
  const router = useRouter();
  const prevPath = router.query.prev as string;

  return (
    <Link href={prevPath || '/academic/teachers'} className="flex items-center gap-1 px-8 py-4 bg-white">
      <ArrowLeftIcon size={14} />
      <span className="text-[#6E7480] font-semibold text-xs uppercase ">Volver</span>
    </Link>
  );
}

type TeacherDetailHeaderProps = {
  teacherProfile?: TeacherProfileEntity;
  user?: UserDTO;
  onEditClick: () => void;
};

function TeacherDetailHeader({ teacherProfile, user, onEditClick }: TeacherDetailHeaderProps) {
  const firstName = user?.first_name ?? '';
  const lastName = user?.last_name ?? '';
  const fullName = `${firstName} ${lastName}`.trim();
  const role = teacherProfile?.role || 'Maestro';

  return (
    <div className="flex justify-between items-start pb-4 px-8 bg-white border-b border-b-[#D5DEED]">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-[#C4CDD5] flex items-center justify-center text-xl text-[#637381] font-semibold">
          {firstName.charAt(0).toUpperCase()}
          {lastName.charAt(0).toUpperCase()}
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-800">{fullName}</h1>
          <p className="text-gray-600">{role}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onEditClick}>
          <PencilIcon size={14} />
          Editar maestro
        </Button>
      </div>
    </div>
  );
}

type TeacherClassroomsListProps = {
  teacherProfile?: TeacherProfileEntity;
};

function TeacherClassroomsList({ teacherProfile }: TeacherClassroomsListProps) {
  const selectedSchool = useSelectedSchool();
  const { data: classroomAssignments = [] } = api.students.listClassroomTeacherAssignments.useQuery(
    {
      membership_id: teacherProfile?.membership_id as string,
    },
    {
      enabled: !!teacherProfile?.membership_id,
    }
  );
  const { data: classroomsResult } = api.students.listClassrooms.useQuery(
    {
      schoolId: selectedSchool?.id as string,
      query: {
        id: classroomAssignments.map((assignment) => assignment.classroom_id),
        limit: classroomAssignments.length,
        include: ['course', 'level', 'grade', 'group', 'student_assignment_count'],
      },
    },
    {
      enabled: classroomAssignments.length > 0,
    }
  );
  const classrooms = classroomsResult?.results || [];

  return (
    <div className="bg-white rounded-xl border min-h-[600px]">
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <h3 className="text-xl font-semibold text-gray-800">Clases del maestro ({classrooms.length})</h3>
        <Link href="/academic/classrooms">
          <Button size="sm" variant="ghost">
            <PlusIcon size={14} />
            Gestionar en Clases
          </Button>
        </Link>
      </div>

      {classrooms.length === 0 ? (
        <div className="flex justify-center items-center h-[400px]">
          <span className="text-gray-500">No hay clases asignadas</span>
        </div>
      ) : (
        <div>
          {classrooms.map((classroom: ClassroomEntity) => {
            const { classroomName, groupName } = getClassroomNames(classroom);

            return (
              <Link
                href={`/academic/classrooms/${classroom.id}`}
                key={classroom.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 group border-b"
              >
                <p className="text-gray-700">
                  {classroomName} {groupName} • {classroom.student_assignment_count || 0} estudiantes
                </p>
                <ChevronRightIcon size={16} className="text-gray-400 group-hover:text-gray-600" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function TeacherDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const selectedSchool = useSelectedSchool();

  const {
    data: teacherProfile,
    isPending: isLoading,
    isError,
    isFetched,
    refetch: refetchTeacher,
  } = api.students.getTeacherProfile.useQuery(
    {
      id: id as string,
    },
    { enabled: !!id }
  );

  const { data: user } = api.schools.getUserByMembershipId.useQuery(
    {
      membership_id: teacherProfile?.membership_id as string,
      school_id: selectedSchool?.id as string,
    },
    {
      enabled: !!selectedSchool?.id && !!teacherProfile?.membership_id,
    }
  );

  function handleEditSuccess() {
    refetchTeacher();
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <img src="/assets/loading.svg" alt="loading" className="mx-auto" />
      </div>
    );
  }

  if (isError || (!teacherProfile && isFetched)) {
    return notFound();
  }

  return (
    <div className="h-screen antialiased font-lota flex flex-col bg-[#8B93A00A]">
      <TeacherDetailNav />
      <TeacherDetailHeader teacherProfile={teacherProfile} user={user} onEditClick={() => setShowEditDrawer(true)} />

      <section className="flex-1 p-8 overflow-y-auto">
        <TeacherClassroomsList teacherProfile={teacherProfile} />
      </section>

      {teacherProfile && (
        <EditTeacherDrawer
          open={showEditDrawer}
          onOpenChange={setShowEditDrawer}
          teacherProfile={teacherProfile}
          user={user}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
