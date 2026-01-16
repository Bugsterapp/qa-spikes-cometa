import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import { AnimatedCounter } from '../atoms/AnimatedCounter';
import { buildStyles } from 'react-circular-progressbar';
import { Tooltip } from '../atoms/Tooltip';
import { api } from '/src/utils/api';

export function SummaryCards({ schoolCycleId }: { schoolCycleId: string | undefined }) {
  const { data: summary } = api.students.getInscriptionsSummary.useQuery(
    { schoolCycleId: schoolCycleId as string },
    { enabled: !!schoolCycleId }
  );

  const currentReinscriptedStudents = summary?.total_current_reinscripted ?? 0;
  const reinscriptedStudents = summary?.total_should_be_reinscripted ?? 0;
  const remainingReinscriptedStudents = reinscriptedStudents - currentReinscriptedStudents;
  const reinscriptedPercentage =
    currentReinscriptedStudents > 0 ? (currentReinscriptedStudents / reinscriptedStudents) * 100 : 0;

  const newInscriptions = summary?.total_new_inscriptions ?? 0;
  const pendingInscriptions = summary?.total_pending_inscriptions ?? 0;

  const totalInscriptions = summary?.total ?? 0;
  const totalPending = remainingReinscriptedStudents + pendingInscriptions;

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-2 flex items-center justify-between gap-4 border border-[#DBE3F0] rounded-xl px-6 py-4">
        <div className="flex flex-col gap-4">
          <h4 className="flex items-center gap-1 font-bold text-base text-neutral-600">
            Estudiantes reinscritos
            <Tooltip message="Estudiantes que cursaron el ciclo anterior y han realizado al menos un pago de reinscripción para el ciclo seleccionado.">
              <InfoIcon />
            </Tooltip>
          </h4>
          <div>
            <p className="font-bold">
              <span className="text-neutral-600 text-5xl">{currentReinscriptedStudents}</span>{' '}
              <span className="text-neutral-500 text-2xl">de {reinscriptedStudents}</span>
            </p>
            <p className="text-neutral-400 text-sm font-bold">{remainingReinscriptedStudents} estudiantes restantes</p>
          </div>
        </div>
        <div className="w-20 h-20">
          <CircularProgressbarWithChildren
            value={reinscriptedPercentage}
            styles={buildStyles({
              pathColor: '#00AB55',
              textColor: '#637381',
              trailColor: '#919EAB3D',
              textSize: '14px',
              pathTransitionDuration: 2,
              strokeLinecap: 'round',
            })}
            strokeWidth={11}
          >
            <span className="flex items-center justify-center text-sm text-[#637381]">Total</span>
            <div className="flex flex-col text-[#637381] items-center justify-center">
              <h4 className="text-lg font-bold">
                <AnimatedCounter from={0} to={reinscriptedPercentage} />%
              </h4>
            </div>
          </CircularProgressbarWithChildren>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border border-[#DBE3F0] rounded-xl px-6 py-4">
        <div className="flex flex-col gap-4">
          <h4 className="flex items-center gap-1 font-bold text-base text-neutral-600">
            Nuevos ingresos y retornos
            <Tooltip message="Estudiantes que han sido dados de alta en el colegio y estudiantes antiguos que, luego de haber dejado el colegio, se vuelven a inscribir.">
              <InfoIcon />
            </Tooltip>
          </h4>
          <div>
            <p className="text-neutral-600 text-5xl font-bold">
              {newInscriptions} <span className="text-sm">inscritos</span>
            </p>
            <p className="text-neutral-400 text-sm font-bold">{pendingInscriptions} pendientes de pago</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border border-[#DBE3F0] rounded-xl px-6 py-4">
        <div className="flex flex-col gap-4">
          <h4 className="flex items-center gap-1 font-bold text-base text-neutral-600">
            Total
            <Tooltip message="Total de estudiantes que han pagado su reinscripción o inscripción para el ciclo seleccionado.">
              <InfoIcon />
            </Tooltip>
          </h4>
          <div>
            <p className="text-neutral-600 text-5xl font-bold">{totalInscriptions}</p>
            <p className="text-neutral-400 text-sm font-bold">{totalPending} pendientes</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 4C10.4178 4 8.87103 4.46919 7.55544 5.34824C6.23985 6.22729 5.21447 7.47672 4.60897 8.93853C4.00347 10.4003 3.84504 12.0089 4.15372 13.5607C4.4624 15.1126 5.22433 16.538 6.34315 17.6569C7.46197 18.7757 8.88743 19.5376 10.4393 19.8463C11.9911 20.155 13.5997 19.9965 15.0615 19.391C16.5233 18.7855 17.7727 17.7602 18.6518 16.4446C19.5308 15.129 20 13.5822 20 12C19.9977 9.87897 19.1541 7.84547 17.6543 6.34568C16.1545 4.84589 14.121 4.00229 12 4ZM12 18.6667C10.6815 18.6667 9.39253 18.2757 8.2962 17.5431C7.19987 16.8106 6.34539 15.7694 5.84081 14.5512C5.33622 13.333 5.2042 11.9926 5.46143 10.6994C5.71867 9.40619 6.35361 8.2183 7.28596 7.28595C8.21831 6.3536 9.40619 5.71867 10.6994 5.46143C11.9926 5.2042 13.3331 5.33622 14.5512 5.8408C15.7694 6.34539 16.8106 7.19987 17.5431 8.2962C18.2757 9.39253 18.6667 10.6815 18.6667 12C18.6647 13.7675 17.9617 15.4621 16.7119 16.7119C15.4621 17.9617 13.7675 18.6647 12 18.6667Z"
        fill="#374957"
      />
      <path
        d="M11.9998 10.6667H11.3332C11.1564 10.6667 10.9868 10.7369 10.8618 10.8619C10.7367 10.987 10.6665 11.1565 10.6665 11.3333C10.6665 11.5101 10.7367 11.6797 10.8618 11.8047C10.9868 11.9298 11.1564 12 11.3332 12H11.9998V16C11.9998 16.1768 12.0701 16.3464 12.1951 16.4714C12.3201 16.5964 12.4897 16.6667 12.6665 16.6667C12.8433 16.6667 13.0129 16.5964 13.1379 16.4714C13.2629 16.3464 13.3332 16.1768 13.3332 16V12C13.3332 11.6464 13.1927 11.3072 12.9426 11.0572C12.6926 10.8071 12.3535 10.6667 11.9998 10.6667Z"
        fill="#374957"
      />
      <path
        d="M12 9.33333C12.5523 9.33333 13 8.88562 13 8.33333C13 7.78105 12.5523 7.33333 12 7.33333C11.4477 7.33333 11 7.78105 11 8.33333C11 8.88562 11.4477 9.33333 12 9.33333Z"
        fill="#374957"
      />
    </svg>
  );
}
