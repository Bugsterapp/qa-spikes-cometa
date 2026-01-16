import * as Sentry from '@sentry/nextjs';
import { useMemo } from 'react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
} from '@cometa/recreo/v2';
import { api } from '/src/utils/api';
import { downloadFile } from '/src/components/academic/utils';
import useAlert from '/src/hooks/useAlert';

interface SepReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  levelId: string;
  schoolCycleId: string;
}

export function SepReportDialog({ open, onOpenChange, levelId, schoolCycleId }: SepReportDialogProps) {
  const downloadMutation = api.students.downloadSepReport.useMutation();
  const { setAlertState } = useAlert();

  async function handleDownload() {
    try {
      const result = await downloadMutation.mutateAsync({
        level_id: levelId,
        school_cycle_id: schoolCycleId,
      });

      if (!result?.data) {
        setAlertState({
          severity: 'error',
          message: 'No se pudo generar el reporte SEP.',
          open: true,
        });
        return;
      }

      const filename = `boleta-sep-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      downloadFile(result.data, filename);

      setAlertState({
        severity: 'success',
        message: 'Reporte SEP generado exitosamente.',
        open: true,
      });
      onOpenChange(false);
    } catch (error) {
      Sentry.captureException(error);
      setAlertState({
        severity: 'error',
        message: 'Error al generar el reporte SEP.',
        open: true,
      });
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="flex flex-col">
        {/*TODO: uncomment preview when the design is defined*/}
        {/*<AlertDialogContent className="!max-w-4xl max-h-[90vh] flex flex-col">*/}
        <AlertDialogHeader className="flex-shrink-0">
          <AlertDialogTitle>Generar archivo SEP</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            Se creará un archivo con las calificaciones de este nivel convertidas al formato oficial de la SEP. ¿Quieres
            continuar?
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/*<div className="flex-1 overflow-hidden">
          <SepReportPreview levelId={levelId} schoolCycleId={schoolCycleId} />
        </div>*/}

        <AlertDialogFooter className="flex-shrink-0">
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <Button onClick={handleDownload} disabled={downloadMutation.isPending}>
            {downloadMutation.isPending ? 'Generando...' : 'Generar archivo'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function SepReportPreview({ levelId, schoolCycleId }: { levelId: string; schoolCycleId: string }) {
  const {
    data: sepReportPreview,
    isLoading,
    error,
  } = api.students.getSepReportPreview.useQuery(
    {
      level_id: levelId,
      school_cycle_id: schoolCycleId,
    },
    { enabled: !!levelId && !!schoolCycleId }
  );

  const tableStructure = useMemo(() => {
    if (!sepReportPreview) return null;

    if (
      !sepReportPreview.students ||
      !Array.isArray(sepReportPreview.students) ||
      !sepReportPreview.course_groups ||
      !sepReportPreview.periods
    ) {
      return null;
    }

    return {
      students: sepReportPreview.students,
      courseGroups: sepReportPreview.course_groups,
      periods: sepReportPreview.periods,
    };
  }, [sepReportPreview]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="text-gray-500 text-sm">Cargando vista previa...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="text-red-500 text-sm">Error al cargar la vista previa</span>
      </div>
    );
  }

  if (!tableStructure || !tableStructure.students.length) {
    return (
      <div className="flex items-center justify-center py-8 border border-neutral-200 rounded-lg bg-neutral-50">
        <span className="text-neutral-600 text-sm">No hay datos disponibles para este nivel</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-2 flex-shrink-0">
        <span className="text-xs text-neutral-600">
          Vista previa ({tableStructure.students.length} estudiante
          {tableStructure.students.length !== 1 ? 's' : ''})
        </span>
      </div>
      <div className="border border-neutral-200 rounded-lg overflow-auto flex-1">
        <table className="border-collapse text-xs w-max min-w-full [&_th]:border [&_th]:border-neutral-300 [&_th]:px-2 [&_th]:py-1.5 [&_th]:font-semibold [&_th]:text-neutral-700 [&_td]:border [&_td]:border-neutral-300 [&_td]:px-2 [&_td]:py-1.5 [&_td]:text-neutral-700">
          <thead className="sticky top-0 bg-neutral-50 z-10">
            {/* First header row - Boleta SEP title and course groups */}
            <tr className="[&_th]:bg-neutral-100 [&_th]:text-center [&_th]:text-neutral-900">
              <th colSpan={5}>Boleta SEP</th>
              {tableStructure.courseGroups.map((courseGroup) => {
                const numPeriods = tableStructure.periods.length;
                return (
                  <th key={courseGroup.id} colSpan={numPeriods + 1}>
                    {courseGroup.name}
                  </th>
                );
              })}
              <th rowSpan={2} className="!bg-orange-100">
                Final
              </th>
            </tr>
            {/* Second header row - column details */}
            <tr className="[&_th]:bg-neutral-50 [&_th]:text-left [&_th:nth-child(n+6)]:text-center [&_th:nth-child(n+6)]:min-w-[80px]">
              <th>Nivel</th>
              <th>Grado</th>
              <th>Grupo</th>
              <th>CURP</th>
              <th className="min-w-[160px]">Estudiante</th>
              {tableStructure.courseGroups.map((courseGroup) => (
                <>
                  {tableStructure.periods.map((period) => (
                    <th key={`${courseGroup.id}-${period.id}`}>{period.name}</th>
                  ))}
                  <th key={`${courseGroup.id}-avg`} className="!bg-neutral-100">
                    Promedio
                  </th>
                </>
              ))}
            </tr>
          </thead>
          <tbody className="[&_tr:hover]:bg-neutral-50">
            {tableStructure.students.map((studentData, index) => {
              const student = studentData.student;
              const inscription = studentData.inscription;
              const courseGroupScores = studentData.course_group_scores || [];

              return (
                <tr key={student?.id || index}>
                  <td>{inscription?.level?.name || '-'}</td>
                  <td>{inscription?.section?.grade || '-'}</td>
                  <td>{inscription?.section?.group || '-'}</td>
                  <td className="font-mono">{student?.identifier || '-'}</td>
                  <td>{`${student?.first_name || ''} ${student?.last_name || ''}`.trim() || '-'}</td>
                  {tableStructure.courseGroups.map((courseGroup) => {
                    const groupScore = courseGroupScores.find((cg) => cg.course_group_id === courseGroup.id);

                    return (
                      <>
                        {tableStructure.periods.map((period) => {
                          const periodScore = groupScore?.period_scores?.find((ps) => ps.period_id === period.id);
                          const score = periodScore?.score;

                          return (
                            <td key={`${courseGroup.id}-${period.id}`} className="text-center">
                              {score !== null && score !== undefined ? score : '-'}
                            </td>
                          );
                        })}
                        <td key={`${courseGroup.id}-avg`} className="text-center bg-neutral-50 font-medium">
                          {groupScore?.course_group_average !== null && groupScore?.course_group_average !== undefined
                            ? groupScore.course_group_average
                            : '-'}
                        </td>
                      </>
                    );
                  })}
                  <td className="text-center bg-orange-50 font-semibold">
                    {studentData.final_average !== null && studentData.final_average !== undefined
                      ? studentData.final_average
                      : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
