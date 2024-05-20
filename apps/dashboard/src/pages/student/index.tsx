import Layout from '../../components/layouts';
import TripleCard from '../../components/TripleCard';
import TripleCardWithStadistics from '../../components/TripleCardWithStadistics';
import OrderTableForStudents from '../../components/organisms/dashboard/OrderTableForStudents';
import ApiClient from '../../services/ApiClient';
import { useSession } from 'next-auth/react';
import * as Sentry from '@sentry/nextjs';
import useSendPageViewedEvent from '/src/hooks/useSendPageViewedEvent';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { useQuery } from '@tanstack/react-query';
import Box from '/src/components/organisms/dashboard/Box';
import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import { api } from '/src/utils/api';
import BoxTooltip from '/src/components/atoms/BoxTooltip';
import InvoiceChip from '/src/components/atoms/Chip';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useSessionStorage } from 'usehooks-ts';
import { useFlags } from '/flags/client';
import { AnimatedCounter } from '/src/components/atoms/AnimatedCounter';
import { StudentFilter } from '/src/components/organisms/dashboard/StudentsFilter';

StudentPage.getLayout = function getLayout(page: JSX.Element) {
  return <Layout title="Estudiantes">{page}</Layout>;
};
function StudentPage() {
  const { data: session } = useSession();
  const selectedSchool = useSelectedSchool();
  const [selectedSchoolCycle, setSelectedSchoolCycle] = useSessionStorage<any>('studentSelectedSchoolCycle', null);
  const [selectedSchoolId, setSelectedSchoolId] = useSessionStorage<any>('studentSelectedSchoolId', null);
  const [percentage, setPercentage] = useState(0);
  const flags = useFlags({ traits: { schoolName: selectedSchool?.name || '' } }).flags;
  const getStudentsHeaderDueOrders = async () => {
    const res = await ApiClient.getStudentsHeaderDueOrders(session?.token, selectedSchool?.id, selectedSchoolCycle?.id);
    return res?.data;
  };

  const { data: studentsHeader, isLoading: dueOrdersLoading } = useQuery({
    queryFn: getStudentsHeaderDueOrders,
    queryKey: ['studentsHeader', selectedSchool?.id, selectedSchoolCycle?.id],
    onError(err) {
      Sentry.captureException(err);
    },
    enabled: !!selectedSchool?.id && !!selectedSchoolCycle,
    staleTime: 60 * 1000 * 60,
    refetchOnWindowFocus: false,
  });

  const { data: studentsHeaderActives, isLoading } = api.schools.schoolsResume.useQuery(
    {
      school_id: selectedSchool?.id as string,
      school_cycle: selectedSchoolCycle?.id as string,
    },
    {
      enabled: Boolean(selectedSchool?.id) && !!selectedSchoolCycle,
      staleTime: 60 * 1000 * 60,
      refetchOnWindowFocus: false,
    }
  );

  useSendPageViewedEvent('Estudiantes', selectedSchool);

  const { data: schoolCycles } = api.schools.schoolsCycles.useQuery(
    {
      school_id: selectedSchool?.id as string,
    },
    {
      enabled: Boolean(selectedSchool?.id),
      staleTime: 60 * 1000 * 60,
    }
  );

  const getStudentsInscriptionsDetail = async () => {
    const res = await ApiClient.getIncriptionsDetail(session?.token, selectedSchool?.id);
    return res?.data;
  };

  const { data: inscriptionsSummary } = useQuery({
    queryFn: getStudentsInscriptionsDetail,
    queryKey: ['inscriptionsSummary', selectedSchool?.id],
    onError(err) {
      Sentry.captureException(err);
    },
    enabled: Boolean(selectedSchool?.id) && !!selectedSchoolCycle,
  });

  useEffect(() => {
    if (selectedSchool && selectedSchool.id !== selectedSchoolId) {
      setSelectedSchoolId(selectedSchool.id);
      setSelectedSchoolCycle(null);
    }
  }, [selectedSchool?.id]);

  useEffect(() => {
    const initializeSchoolCycle = () => {
      if (schoolCycles && !selectedSchoolCycle) {
        const cycleActive = schoolCycles.find((cycle) => cycle.is_active);
        setSelectedSchoolCycle(cycleActive || 'Todos');
      }
    };

    initializeSchoolCycle();
  }, [schoolCycles, setSelectedSchoolCycle, selectedSchoolCycle]);

  const nextYeartFormatted = () => {
    const activeCycle = schoolCycles?.find((cycle) => cycle.is_active);
    let cicloSiguienteFormato = null;
    if (activeCycle) {
      const cicloSiguiente = schoolCycles?.find((ciclo) => ciclo.year_start === activeCycle.year_end);
      if (cicloSiguiente) {
        const yearStartFormato = String(cicloSiguiente.year_start);
        const yearEndFormato = String(cicloSiguiente.year_end).slice(-2);
        cicloSiguienteFormato = `${yearStartFormato}-${yearEndFormato}`;
      }
    }
    return cicloSiguienteFormato;
  };

  const nextCycle = nextYeartFormatted();

  useEffect(() => {
    if (inscriptionsSummary) {
      setPercentage(inscriptionsSummary?.reinscripted_and_paid_over_total_reinscripted);
    }
  }, [inscriptionsSummary]);
  const parseBigPercentage = percentage > 95 && percentage !== 100 ? 95 : percentage;

  return (
    <Sentry.ErrorBoundary
      beforeCapture={(scope) => {
        scope.setContext('state', {
          studentsHeader,
          session,
          selectedSchool,
        });
      }}
    >
      <div>
        <h3 className="font-bold text-[32px] mt-[32px]">Estudiantes</h3>
        <span className="block h-[1px] w-full bg-[#919EAB3D] my-8" />
        {selectedSchool?.config_dashboard?.display_inscriptions_status && flags?.show_inscription ? (
          <>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-[24px]">Inscripciones</h4>
              {selectedSchoolCycle !== 'Todos' ? (
                <div>
                  <InvoiceChip intent="darkInfo" hidden={!nextCycle}>
                    {nextCycle}
                  </InvoiceChip>
                </div>
              ) : null}
            </div>
            <div className="grid grid-cols-4 gap-8 mt-8 max-h-[199px] min-w-[1000px]">
              <div className="col-span-2">
                <BoxTooltip
                  title="Estudiantes reinscritos"
                  tooltipText="Son los estudiantes “Activos” que han pagado la inscripción del siguiente ciclo escolar."
                >
                  <div className="relative">
                    <div className="flex items-center gap-8 flex-nowrap">
                      <div className="text-[#919EAB] font-bold text-[24px] items-center">
                        <div className="flex items-center gap-1">
                          <span className="text-[#637381] text-[48px]">
                            <AnimatedCounter from={0} to={inscriptionsSummary?.reinscripted_and_paid} />
                          </span>{' '}
                          <span className="text-[24px] mt-3">de</span>{' '}
                          <span className="mt-3">{inscriptionsSummary?.reinscripted_total}</span>
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
                              <AnimatedCounter
                                from={0}
                                to={inscriptionsSummary?.reinscripted_and_paid_over_total_reinscripted}
                              />
                              %
                            </h4>
                          </div>
                        </CircularProgressbarWithChildren>
                      </div>
                    </div>
                    <span className="pl-1 text-sm font-semibold text-[#919EAB]">
                      {inscriptionsSummary?.reinscripted_and_pending} estudiantes restantes
                    </span>
                  </div>
                </BoxTooltip>
              </div>
              <BoxTooltip
                title="Nuevos inscritos"
                tooltipText="Son los nuevos estudiantes que han pagado su inscripción del siguiente ciclo escolar"
              >
                <div>
                  <div className="text-[#919EAB] font-bold text-[24px] flex-nowrap">
                    <span className="text-[#637381] text-[48px]">
                      <AnimatedCounter from={0} to={inscriptionsSummary?.new_inscripted_and_paid} />
                    </span>{' '}
                    de <span>{inscriptionsSummary?.new_inscripted_total}</span>
                  </div>
                  <span className="pl-1 text-sm font-semibold text-[#919EAB]">
                    {inscriptionsSummary?.new_inscripted_and_pending} pendientes
                  </span>
                </div>
              </BoxTooltip>
              <BoxTooltip
                title="Total próximo ciclo"
                tooltipText="Es el total que alumnos que han pagado su inscripción para el siguiente ciclo escolar."
                border
              >
                <div className="text-[#919EAB] font-bold text-[24px] flex-nowrap">
                  <span className="text-[#637381] text-[48px] font-bold">
                    <AnimatedCounter from={0} to={inscriptionsSummary?.total_paid_inscriptions} />
                  </span>
                </div>
                <span className="pl-1 text-sm font-semibold text-[#919EAB]">Estudiantes inscritos</span>
              </BoxTooltip>
            </div>
            <span className="block h-[1px] w-full bg-[#919EAB3D] mt-8" />
          </>
        ) : null}
        <div className="flex items-center gap-8 my-8">
          <h4 className="font-bold text-[24px]">Resumen de estudiantes</h4>
          {schoolCycles?.length ? (
            <StudentFilter
              selectedSchoolCycle={selectedSchoolCycle}
              setSelectedSchoolCycle={setSelectedSchoolCycle}
              schoolCycles={schoolCycles}
            />
          ) : null}
        </div>
        <TripleCard studentsHeader={studentsHeaderActives} loading={isLoading} />
        <span className="block h-[1px] w-full bg-[#919EAB3D] my-8" />
        <TripleCardWithStadistics studentsHeader={studentsHeader} loading={dueOrdersLoading} />
        <Box className="mt-6">
          <OrderTableForStudents
            selectedSchoolCycle={selectedSchoolCycle}
            setSelectedSchoolCycle={setSelectedSchoolCycle}
            schoolCycles={schoolCycles}
            nextCycle={nextCycle}
          />
        </Box>
      </div>
    </Sentry.ErrorBoundary>
  );
}

StudentPage.auth = true;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const UA = context.req.headers['user-agent'];
  const isMobile = Boolean(UA?.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i));
  try {
    if (isMobile) {
      return {
        redirect: {
          permanent: false,
          destination: '/only-desktop',
        },
      };
    }
    return {
      props: {},
    };
  } catch (e: any) {
    Sentry.captureException(e);
    throw new Error(e);
  }
};

export default StudentPage;
