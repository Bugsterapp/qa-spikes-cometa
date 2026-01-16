import { useCallback, useEffect, useMemo, useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
} from '@cometa/recreo/v2';
import { TabsWrapper } from '/src/components/ui/Tabs';
import { TableVirtualized } from '/src/components/TableInfinityScroll';
import SelectChip from '/src/components/atoms/SelectChip';
import { useSchoolCycleSelector } from '/src/components/organisms/dashboard/SchoolCycleSelector';
import { api } from '/src/utils/api';
import { useGetMembership, useSelectedSchool } from '/src/guards/AuthGuard';
import {
  EvaluationPeriodEntity,
  EvaluationPeriodStatusEnum,
  EvaluationScoresStatsByOriginCriteriaEnum,
} from '@cometa/trpc/src/students/types';
import { useRouter } from 'next/router';
import useAlert from '/src/hooks/useAlert';
import { useSession } from 'next-auth/react';
import { useFlagWithVariableMatching } from '../../flags/FlagsProvider';
import { canManageAcademicActions, downloadFile } from '../utils';
import { SepReportDialog } from './sep-report-preview-dialog';

const columnHelper = createColumnHelper<EvaluationPeriodEntity>();

const statusConfig = {
  [EvaluationPeriodStatusEnum.Completed]: {
    label: 'Cerrado',
    theme: 'default',
  },
  [EvaluationPeriodStatusEnum.InProgress]: {
    label: 'En curso',
    theme: 'green',
  },
  [EvaluationPeriodStatusEnum.NotStarted]: {
    label: 'Aún no inicia',
    theme: 'default',
  },
  [EvaluationPeriodStatusEnum.Undefined]: {
    label: 'Sin definir',
    theme: 'default',
  },
} as const;

function createColumns(
  progressByPeriod: Map<string, number>,
  lastSubmissionByPeriod: Map<string, string>,
  campaignIdByPeriod: Map<string, string>,
  submissionIdByPeriod: Map<string, string>,
  onDownloadReport: (campaignId: string, submissionId: string, periodName: string, schoolId: string) => void,
  isDownloadingReport: boolean,
  schoolId: string
) {
  return [
    columnHelper.accessor('name', {
      cell: (info) => (
        <span className="text-sm font-normal truncate" title={info.getValue()}>
          {info.getValue()}
        </span>
      ),
      header: () => <span>Periodo</span>,
      minSize: 150,
    }),
    columnHelper.accessor('status', {
      cell: (info) => {
        const status = info.getValue();
        const config = statusConfig[status];
        return <SelectChip theme={config.theme}>{config.label}</SelectChip>;
      },
      header: () => <span>Estado</span>,
      minSize: 130,
    }),
    columnHelper.display({
      id: 'progress',
      cell: (info) => {
        const period = info.row.original;
        const progress = progressByPeriod.get(period.id) ?? 0;
        const progressText = `${parseFloat((progress * 100).toFixed(0))}%`;
        return <span className="text-sm font-normal w-full">{progressText}</span>;
      },
      header: () => <span>Avance</span>,
      minSize: 150,
    }),
    columnHelper.accessor('end_date', {
      cell: (info) => {
        const dateStr = info.getValue();
        if (!dateStr) return <span className="text-sm font-normal text-gray-500">-</span>;

        const date = parse(dateStr, 'yyyy-MM-dd', new Date());
        return <span className="text-sm font-normal text-gray-500">{format(date, 'd MMM yyyy', { locale: es })}</span>;
      },
      header: () => <span>Fecha límite</span>,
      minSize: 130,
    }),
    columnHelper.display({
      id: 'last_sent',
      cell: (info) => {
        const period = info.row.original;
        const lastSent = lastSubmissionByPeriod.get(period.id);

        if (!lastSent) {
          return <span className="text-sm font-normal text-gray-500">-</span>;
        }

        const date = new Date(lastSent);
        return <span className="text-sm font-normal text-gray-500">{format(date, 'd MMM yyyy', { locale: es })}</span>;
      },
      header: () => <span>Último envío</span>,
      minSize: 150,
    }),
    columnHelper.display({
      id: 'download_report',
      cell: (info) => {
        const period = info.row.original;
        const campaignId = campaignIdByPeriod.get(period.id);
        const submissionId = submissionIdByPeriod.get(period.id);

        if (!campaignId || !submissionId) {
          return <span className="text-sm font-normal text-gray-500">-</span>;
        }

        return (
          <button
            onClick={() => onDownloadReport(campaignId, submissionId, period.name, schoolId)}
            disabled={isDownloadingReport}
            className="text-sm text-primary-neutral hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:no-underline"
          >
            Ver reporte
          </button>
        );
      },
      header: () => <span>Reporte</span>,
      minSize: 120,
    }),
  ];
}

function useScoreCardsTab({ defaultLevelId }: { defaultLevelId: string }) {
  const router = useRouter();

  const tabQuery = router.query.tab as string;
  const tab = tabQuery || defaultLevelId;

  function handleTabChange(newTab: string) {
    return router.push(`/academic/score-cards?tab=${newTab}`);
  }

  useEffect(() => {
    if (!tabQuery && defaultLevelId) {
      router.push(`/academic/score-cards?tab=${defaultLevelId}`, undefined, { shallow: true });
    }
  }, [tabQuery, defaultLevelId, router]);

  return { tab, handleTabChange };
}

export function ScoreCardList() {
  const { setAlertState } = useAlert();
  const { data: session } = useSession();
  const selectedSchool = useSelectedSchool();
  const { activeCycle } = useSchoolCycleSelector();
  const [showSendAlert, setShowSendAlert] = useState(false);
  const [showSEPReportAlert, setShowSEPReportAlert] = useState(false);
  const utils = api.useUtils();
  const { isEnabled: enableScoreCardSubmission } = useFlagWithVariableMatching('enable_score_card_submission');
  const membership = useGetMembership();
  const canManageReports = canManageAcademicActions(membership);

  const { data: levels, isPending: isLoadingLevels } = api.students.getLevelsGroupsGrades.useQuery(
    { schoolId: selectedSchool?.id ?? '' },
    { enabled: !!selectedSchool?.id }
  );

  const levelTabs =
    levels?.map((level) => ({
      value: level.id ?? '',
      label: level.name ?? '',
    })) ?? [];

  const defaultLevelId = levelTabs[0]?.value ?? '';
  const { tab: selectedLevelId, handleTabChange } = useScoreCardsTab({ defaultLevelId });

  const { data: evaluationPeriods, isPending: isLoadingPeriods } = api.students.listEvaluationPeriods.useQuery(
    {
      level_id: selectedLevelId,
      school_cycle_id: activeCycle?.id ?? '',
    },
    { enabled: !!selectedLevelId && !!activeCycle?.id }
  );

  const { data: evaluationStats } = api.students.getEvaluationScoresStatsByOrigin.useQuery(
    {
      level_id: selectedLevelId,
      school_cycle_id: activeCycle?.id ?? '',
      criteria: EvaluationScoresStatsByOriginCriteriaEnum.LevelAndSchoolCycle,
    },
    {
      enabled: !!selectedLevelId && !!activeCycle?.id,
    }
  );

  const { data: scoreCardSubmissions } = api.students.listScoreCardSubmissions.useQuery(
    {
      level_id: selectedLevelId,
      school_cycle_id: activeCycle?.id ?? '',
    },
    { enabled: !!selectedLevelId && !!activeCycle?.id }
  );

  const progressByPeriod = useMemo(() => {
    if (!evaluationStats) return new Map<string, number>();

    const progressMap = new Map<string, number>();
    evaluationStats.forEach((stat) => {
      progressMap.set(stat.origin_id, stat.progress);
    });

    return progressMap;
  }, [evaluationStats]);

  const lastSubmissionByPeriod = useMemo(() => {
    if (!scoreCardSubmissions || !Array.isArray(scoreCardSubmissions)) return new Map<string, string>();

    const submissionMap = new Map<string, string>();
    scoreCardSubmissions.forEach((submission) => {
      const periodId = submission.evaluation_period_id;
      if (periodId && submission.finished_at && !submissionMap.has(periodId)) {
        submissionMap.set(periodId, submission.finished_at);
      }
    });

    return submissionMap;
  }, [scoreCardSubmissions]);

  const campaignIdByPeriod = useMemo(() => {
    if (!scoreCardSubmissions || !Array.isArray(scoreCardSubmissions)) return new Map<string, string>();

    const campaignMap = new Map<string, string>();
    scoreCardSubmissions.forEach((submission) => {
      const periodId = submission.evaluation_period_id;
      if (periodId && submission.campaign_id && submission.finished_at && !campaignMap.has(periodId)) {
        campaignMap.set(periodId, submission.campaign_id);
      }
    });

    return campaignMap;
  }, [scoreCardSubmissions]);

  const submissionIdByPeriod = useMemo(() => {
    if (!scoreCardSubmissions || !Array.isArray(scoreCardSubmissions)) return new Map<string, string>();

    const submissionMap = new Map<string, string>();
    scoreCardSubmissions.forEach((submission) => {
      const periodId = submission.evaluation_period_id;
      if (periodId && submission.id && submission.finished_at && !submissionMap.has(periodId)) {
        submissionMap.set(periodId, submission.id);
      }
    });

    return submissionMap;
  }, [scoreCardSubmissions]);

  const { mutateAsync: downloadReportMutation, isPending: isDownloadingReport } =
    api.students.downloadScoreCardSubmissionReport.useMutation();

  const handleDownloadReport = useCallback(
    async (campaignId: string, submissionId: string, periodName: string, schoolId: string) => {
      try {
        const result = await downloadReportMutation({
          campaign_id: campaignId,
          score_card_submission_id: submissionId,
          school_id: schoolId,
        });

        if (!result?.data) {
          throw new Error('No data received from server');
        }

        downloadFile(result.data, `reporte-boletas-${periodName}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);

        setAlertState({
          severity: 'success',
          message: 'El reporte ha sido descargado exitosamente.',
          open: true,
        });
      } catch (error) {
        setAlertState({
          severity: 'error',
          message: 'Error al descargar el reporte. Por favor intenta de nuevo.',
          open: true,
        });
      }
    },
    [downloadReportMutation, setAlertState]
  );

  const columns = useMemo(
    () =>
      createColumns(
        progressByPeriod,
        lastSubmissionByPeriod,
        campaignIdByPeriod,
        submissionIdByPeriod,
        handleDownloadReport,
        isDownloadingReport,
        selectedSchool?.id ?? ''
      ),
    [
      progressByPeriod,
      lastSubmissionByPeriod,
      campaignIdByPeriod,
      submissionIdByPeriod,
      handleDownloadReport,
      isDownloadingReport,
      selectedSchool?.id,
    ]
  );

  const sendScoreCardsMutation = api.students.sendScoreCards.useMutation({
    onSuccess: () => {
      setShowSendAlert(false);
      setAlertState({
        severity: 'success',
        message: 'El envío de boletas ha sido iniciado exitosamente.',
        open: true,
      });
      utils.students.listScoreCardSubmissions.invalidate();
    },
    onError: () => {
      setShowSendAlert(false);
      setAlertState({
        severity: 'error',
        message: 'Error al enviar las boletas. Por favor intenta de nuevo.',
        open: true,
      });
    },
  });

  const activePeriod = useMemo(
    () => evaluationPeriods?.find((p) => p.status === EvaluationPeriodStatusEnum.InProgress),
    [evaluationPeriods]
  );

  const activeModalCase = useMemo(() => {
    if (!activePeriod) return null;

    const progress = progressByPeriod.get(activePeriod.id) ?? 0;
    const lastSent = lastSubmissionByPeriod.get(activePeriod.id);

    if (lastSent) {
      return {
        type: 'resend' as const,
        title: 'Reenviar boletas',
        description: `Estas boletas ya fueron enviadas el ${format(new Date(lastSent), 'd MMM yyyy', {
          locale: es,
        })}. Si confirmas, volverán a enviarse a los tutores. ¿Quieres continuar?.`,
      };
    }

    if (progress < 1) {
      return {
        type: 'incomplete' as const,
        title: 'Enviar boletas incompletas',
        description:
          'El avance de captura de calificaciones no está completo (puede que falte alguna nota). Si continúas, los tutores recibirán las boletas con la información registrada hasta ahora. ¿Deseas continuar?',
      };
    }

    return {
      type: 'complete' as const,
      title: 'Confirmar envío de boletas',
      description: '¿Quieres enviar las boletas de los estudiantes de este nivel a sus tutores?',
    };
  }, [activePeriod, progressByPeriod, lastSubmissionByPeriod]);

  const handleSendScoreCards = () => {
    if (!activePeriod?.id || !session?.user?.id) {
      setAlertState({
        severity: 'error',
        message: 'No se puede enviar boletas. Verifica que exista un período activo.',
        open: true,
      });
      setShowSendAlert(false);
      return;
    }

    sendScoreCardsMutation.mutate({
      evaluation_period_id: activePeriod.id,
      requested_by_id: session.user.id,
      filters_json: {
        level_id: selectedLevelId,
        school_cycle_id: activeCycle?.id,
      },
    });
  };

  function ScoreCardSubmissionConfirmationContent() {
    return (
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{activeModalCase?.title ?? 'Confirmar envío de boletas'}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>{activeModalCase?.description ?? 'Las boletas serán enviadas a los tutores.'}</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleSendScoreCards}>Enviar ahora</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    );
  }

  function ScoreCardSubmissionNotAllowedContent() {
    return (
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>El envio de boletas esta deshabilitado</AlertDialogTitle>
          <AlertDialogDescription>
            <p>Ponte en contacto con nuestro equipo de soporte para habilitarlo.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cerrar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="w-full px-8 pt-6 pb-4 bg-white">
        <h1 className="text-[#212B36] text-2xl font-bold">Boletas</h1>
        {activeCycle && <span className="text-gray-500 text-sm">{activeCycle.name}</span>}
      </div>
      <TabsWrapper
        tabs={levelTabs}
        tab={selectedLevelId}
        handleChangeTab={handleTabChange}
        defaultValue={levelTabs[0]?.value ?? ''}
        showShadow={false}
        tabsListClassName="pl-0 px-8 border-b border-b-[#D5DEED]"
        tabsTriggerClassName="text-sm text-[#8B93A0] py-3 data-state-active:text-primary-neutral"
        tabUnderlineClassName="bg-primary-neutral"
      />

      <div className="px-8 py-6">
        {isLoadingLevels ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-gray-500">Cargando niveles...</span>
          </div>
        ) : levelTabs.length > 0 ? (
          <div>
            <div className="mb-6 mt-2">
              <h2 className="text-lg font-semibold text-[#212B36] mb-2">Estado de los períodos de evaluación</h2>
              <p className="text-sm text-gray-600 mb-4">
                Revisa el avance de captura de calificaciones, la fecha límite de entrega y el historial de envíos de
                boletas por período.
              </p>
              {canManageReports ? (
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowSendAlert(true)}
                    disabled={!activePeriod || sendScoreCardsMutation.isPending}
                  >
                    {sendScoreCardsMutation.isPending ? 'Enviando...' : 'Enviar boletas a familias'}
                  </Button>
                  <Button variant="neutral" onClick={() => setShowSEPReportAlert(true)}>
                    Generar archivo SEP
                  </Button>
                </div>
              ) : null}
            </div>

            {isLoadingPeriods ? (
              <div className="flex items-center justify-center py-12">
                <span className="text-gray-500">Cargando períodos...</span>
              </div>
            ) : evaluationPeriods && evaluationPeriods.length > 0 ? (
              <div className="bg-white rounded-lg border border-gray-300">
                <TableVirtualized
                  data={evaluationPeriods}
                  columns={columns}
                  maxHeight={600}
                  totalCount={evaluationPeriods.length}
                  isLoading={false}
                  isFetching={false}
                  fetchNextPage={() => void 0}
                  totalFetched={evaluationPeriods.length}
                  hasNextPage={false}
                  rowClassName="hover:bg-accent/50"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-lg border border-gray-300">
                <p className="text-lg font-semibold text-gray-900 mb-2">No hay períodos de evaluación</p>
                <p className="text-gray-600 text-sm max-w-sm text-center">
                  No se encontraron períodos de evaluación para el nivel y ciclo seleccionados.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <p className="text-lg font-semibold text-gray-900 mb-2">No hay niveles educativos disponibles</p>
            <p className="text-gray-600 text-sm max-w-sm text-center">
              Configure los niveles educativos en la sección de administración.
            </p>
          </div>
        )}
      </div>

      <AlertDialog open={showSendAlert} onOpenChange={setShowSendAlert}>
        {enableScoreCardSubmission ? (
          <ScoreCardSubmissionConfirmationContent />
        ) : (
          <ScoreCardSubmissionNotAllowedContent />
        )}
      </AlertDialog>

      <SepReportDialog
        open={showSEPReportAlert}
        onOpenChange={setShowSEPReportAlert}
        levelId={selectedLevelId}
        schoolCycleId={activeCycle?.id ?? ''}
      />
    </div>
  );
}
