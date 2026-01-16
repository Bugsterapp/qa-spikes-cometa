import type { ColumnDefinition, TreeNode, TreeNodeWarning } from './shared/audience-selector';
import { IncompleteInfoBadge } from './shared/audience-selector/incomplete-info-badge';
import { DEFAULT_ENTITY_LABELS, type EntityLabels } from './shared/audience-selector/entity-labels';
import { shouldShowWarning } from './shared/audience-selector/tree-utils';

type StudentData = {
  id: string;
  firstName: string;
  lastName: string;
  enrollment: string;
  section: string;
  level: string;
  grade: string;
  isActive: boolean;
  inscriptionStatus: 'enrolled' | 'not_enrolled';
};

export function getCredentialColumns(selectedIds: string[]): ColumnDefinition<StudentData>[] {
  return [
    {
      key: 'student',
      label: 'Estudiante',
      render: (node, _level) => {
        if (!node.data.firstName) return null;
        const showWarning = shouldShowWarning(node, selectedIds);
        const warning = showWarning ? node.metadata?.warning : undefined;
        return (
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <p className="text-[14px] leading-[22px] text-[#212b36] truncate">
                {node.data.firstName} {node.data.lastName}
              </p>
              {warning ? <IncompleteInfoBadge warning={warning} /> : null}
            </div>
            <p className="text-[12px] leading-[18px] text-[#454d64] truncate">
              {node.data.enrollment} | {node.data.level} - {node.data.grade}
            </p>
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Estado actual',
      width: '150px',
      render: (node, _level) => {
        // Render if it's a student node (has student data)
        if (!node.data.firstName) return null;
        if (node.data.isActive) {
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-[rgba(75,199,102,0.12)] text-[#44b55d]">
              Activo
            </span>
          );
        }
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-red-100 text-red-600">
            Inactivo
          </span>
        );
      },
    },
    {
      key: 'inscription',
      label: 'Estado de inscripción',
      width: '180px',
      render: (node, _level) => {
        // Render if it's a student node (has student data)
        if (!node.data.firstName) return null;
        if (node.data.inscriptionStatus === 'enrolled') {
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-[rgba(75,199,102,0.12)] text-[#44b55d]">
              Inscrito
            </span>
          );
        }
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-red-100 text-red-600">
            No inscrito
          </span>
        );
      },
    },
  ];
}

function createIncompleteInfoWarning(
  incompleteCount?: number,
  hasCompletedInfo?: boolean,
  nodeType?: 'level' | 'section' | 'student',
  entityLabels?: EntityLabels
): TreeNodeWarning | undefined {
  const labels = entityLabels ?? DEFAULT_ENTITY_LABELS;

  if (nodeType === 'student' && hasCompletedInfo === false) {
    return {
      show: true,
      tooltip: `Este ${labels.singular} tiene información incompleta`,
    };
  }

  if ((nodeType === 'level' || nodeType === 'section') && incompleteCount && incompleteCount > 0) {
    const entityName = nodeType === 'level' ? 'nivel' : 'sección';
    const label = incompleteCount === 1 ? labels.singular : labels.plural;
    const verb = incompleteCount === 1 ? 'tiene' : 'tienen';
    return {
      show: true,
      text: 'Info. incompleta',
      tooltip: `${incompleteCount} ${label} ${verb} información incompleta en este ${entityName}`,
    };
  }

  return undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformStudentsToTree(data: any, entityLabels?: EntityLabels): TreeNode<StudentData>[] {
  if (!data || !data.children) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.children.map((node: any) => {
    // Check if node has level_id to determine structure
    // If it has level_id: it's a level → children are sections → children are students
    // If it doesn't have level_id: it's a special node (e.g., "Sin sección") → children are students directly

    if (node.level_id) {
      // Standard hierarchy: level → sections → students
      return {
        id: node.id || `level-${node.name}`,
        name: node.name,
        data: {} as StudentData,
        metadata: {
          nodeType: 'level',
          count: node.total_student_by_level,
          warning: createIncompleteInfoWarning(
            node.total_student_by_level_without_completed_info,
            undefined,
            'level',
            entityLabels
          ),
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        children: node.children?.map((section: any) => ({
          id: section.id || `section-${node.id}-${section.name}`,
          name: section.name,
          data: {} as StudentData,
          metadata: {
            nodeType: 'section',
            count: section.total_student_by_section,
            warning: createIncompleteInfoWarning(
              section.total_student_by_section_without_completed_info,
              undefined,
              'section',
              entityLabels
            ),
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          children: section.children?.map((student: any) => ({
            id: student.id || `student-${student.enrollment_code}`,
            name: `${student.name} ${student.last_name}`,
            data: {
              id: student.id,
              firstName: student.name,
              lastName: student.last_name,
              enrollment: student.enrollment_code,
              section: student.section || '',
              level: node.name,
              grade: section.name,
              isActive: student.state === 'active',
              inscriptionStatus: student.inscription_status === 'inscribed' ? 'enrolled' : 'not_enrolled',
            },
            metadata: {
              nodeType: 'item',
              warning: createIncompleteInfoWarning(undefined, student.has_completed_info, 'student', entityLabels),
            },
          })),
        })),
      };
    } else {
      // Special node without level_id: children are students directly
      return {
        id: node.id || `special-${node.name}`,
        name: node.name,
        data: {} as StudentData,
        metadata: {
          nodeType: 'level',
          count: node.total_student_by_level || node.children?.length || 0,
          warning: createIncompleteInfoWarning(
            node.total_student_by_level_without_completed_info,
            undefined,
            'section',
            entityLabels
          ),
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        children: node.children?.map((student: any) => ({
          id: student.id || `student-${student.enrollment_code}`,
          name: `${student.name} ${student.last_name}`,
          data: {
            id: student.id,
            firstName: student.name,
            lastName: student.last_name,
            enrollment: student.enrollment_code,
            section: student.section || 'Sin sección',
            level: student.level || 'Sin nivel',
            grade: student.grade || 'Sin grado',
            isActive: student.state === 'active',
            inscriptionStatus: student.inscription_status === 'inscribed' ? 'enrolled' : 'not_enrolled',
          },
          metadata: {
            nodeType: 'item',
            warning: createIncompleteInfoWarning(undefined, student.has_completed_info, 'student', entityLabels),
          },
        })),
      };
    }
  });
}

export function extractStudentsFromTree(
  tree: TreeNode<StudentData>[],
  studentIds: string[]
): Array<{
  id: string;
  firstName: string;
  lastName: string;
  hasCompletedInfo: boolean;
  level: string;
  grade: string;
}> {
  const students: Array<{
    id: string;
    firstName: string;
    lastName: string;
    hasCompletedInfo: boolean;
    level: string;
    grade: string;
  }> = [];

  const traverse = (node: TreeNode<StudentData>) => {
    if (node.data.firstName && studentIds.includes(node.id)) {
      students.push({
        id: node.data.id,
        firstName: node.data.firstName,
        lastName: node.data.lastName,
        hasCompletedInfo: node.metadata?.warning ? !node.metadata.warning.show : true,
        level: node.data.level || 'Sin asignar',
        grade: node.data.grade || 'Sin asignar',
      });
    }

    if (node.children) {
      node.children.forEach((child) => traverse(child));
    }
  };

  tree.forEach((node) => traverse(node));
  return students;
}

export type { StudentData };
