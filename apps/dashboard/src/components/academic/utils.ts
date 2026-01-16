import { ClassroomEntity } from '@cometa/trpc/src/students/types';

export function getClassroomNames(classroom?: ClassroomEntity) {
  if (!classroom) return { classroomName: '', groupName: '' };

  const levelText = classroom.level?.name ?? '';

  let groupName = `${levelText} (por nivel)`;
  if (classroom.group_id) {
    const grade = classroom.grade?.name ?? '';
    const group = classroom.group?.name ?? '';
    groupName = `${levelText} - ${grade} ${group}`;
  }

  const classroomName = `${classroom.course?.name} ${classroom?.variant}`;

  return { classroomName, groupName };
}

// @TODO: in the future, this will change to a specific permission set
export const allowedRolesToManageAcademicActions = ['OWNER', 'GENERAL_DIRECTOR', 'ADMINISTRATIVE_DIRECTOR'];
export const canManageAcademicActions = (membership: string) =>
  allowedRolesToManageAcademicActions.includes(membership);

export function downloadFile(
  data: Uint8Array | Blob,
  filename: string,
  mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
): void {
  const blob = data instanceof Blob ? data : new Blob([data as any], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
