import ScholarshipDataTable from '/src/components/atoms/ScholarshipDataTable';
import { formatPrice } from '/src/utils/general';
import { AvailableScholarshipDetail } from '@cometa/trpc/src/types';
import CAutocomplete from '../NCometaSingleSelect';
import SidebarActions from '/src/components/atoms/SidebarActions';

interface ScholarshipDataProps {
  disabled?: boolean;
  isAssign?: boolean;
  scholarshipDetail?: AvailableScholarshipDetail;
  isLoading?: boolean;
  currentScholarship?: any;
  setCurrentScholarship?: (arg0: string | null) => void;
  scholarships?: any;
  isMutating?: boolean;
  onClose?: () => void;
  onSave?: () => void;
}

const ScholarshipData = ({
  scholarshipDetail,
  disabled = false,
  isAssign = false,
  isLoading,
  currentScholarship,
  setCurrentScholarship,
  scholarships,
  isMutating,
  onClose,
  onSave,
}: ScholarshipDataProps) => {
  const statusPercent = ['BRILLAMONT', 'PERCENT'];

  const isPercent = scholarshipDetail && statusPercent.includes(scholarshipDetail?.type);

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex flex-col w-full py-6 gap-6">
        <div>
          {!isLoading && (
            <CAutocomplete
              setSelected={(value) => {
                setCurrentScholarship?.(value);
              }}
              data={scholarships || []}
              placeholder="Selecciona una beca"
              currentValue={currentScholarship}
              disabled={isMutating}
            />
          )}
        </div>
        {!isLoading && scholarshipDetail && (
          <div
            className={`${
              disabled ? 'text-gray-600 bg-gray-500/8' : 'text-green-800 bg-green/8'
            } flex flex-row items-center justify-between px-6 py-4 rounded-lg`}
          >
            <span className="text-sm font-semibold">Descuento aplicado:</span>
            <div className="font-bold text-lg">
              {scholarshipDetail?.value && scholarshipDetail?.type ? (
                isPercent ? (
                  <span className="text-2xl">{scholarshipDetail.value}%</span>
                ) : (
                  <>
                    $ <span className="text-2xl">{formatPrice(scholarshipDetail.value, 'MXN').replace('$', '')}</span>{' '}
                    MXN
                  </>
                )
              ) : (
                <span className="text-2xl">-</span>
              )}
            </div>
          </div>
        )}

        {isLoading && (
          <div
            className={`${
              disabled ? 'text-gray-600 bg-gray-500/8' : 'text-green-800 bg-green/8'
            } flex flex-row items-center justify-between px-6 py-4 rounded-lg`}
          >
            <div className="h-5 rounded-full bg-green/8 dark:bg-green-800 w-full animate-pulse" />
          </div>
        )}
        {scholarshipDetail && !scholarshipDetail?.affected_concepts && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 border border-blue-200">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm text-blue-800">
              Este estudiante aún no tiene conceptos que se vean afectados por esta beca
            </span>
          </div>
        )}
        {scholarshipDetail?.affected_concepts && (
          <div className="mt-4">
            <p className="text-sm mb-4">
              {disabled
                ? 'Conceptos a los que aplicó esta beca:'
                : 'La beca aplicaría a los siguientes conceptos asignados al estudiante:'}
            </p>
            <div>
              <ScholarshipDataTable
                concepts={scholarshipDetail.affected_concepts}
                disabled={disabled}
                isAssign={isAssign}
              />
            </div>
          </div>
        )}
      </div>
      <SidebarActions>
        <button
          className="bg-[#FAFBFF] px-20 py-3 text-green-400 hover:text-green-500 text-base font-bold disabled:bg-[#919EAB3D] disabled:text-[#919EABCC] rounded-lg"
          onClick={() => {
            onClose?.();
          }}
        >
          Cancelar
        </button>
        <button
          className="text-white text-base font-bold px-20 py-3 rounded-lg bg-[#00AB55] hover:bg-green-500 disabled:bg-[#919EAB3D] disabled:text-[#919EABCC] whitespace-nowrap"
          onClick={onSave}
        >
          Asignar
        </button>
      </SidebarActions>
    </div>
  );
};

export default ScholarshipData;
